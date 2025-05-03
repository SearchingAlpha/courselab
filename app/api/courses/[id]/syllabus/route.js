import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateSyllabus, analyzeSyllabus } from '@/lib/agents/syllabusAgent';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Common function to validate authentication
async function validateAuth(req) {
  // First try getting session from cookies
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (session) {
    return { isAuthenticated: true, user: session.user };
  }
  
  // If no session, check for authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const { data, error } = await supabase.auth.getUser(token);
    
    if (!error && data?.user) {
      return { isAuthenticated: true, user: data.user };
    }
  }
  
  // If still no auth, try to parse cookie directly
  const cookies = req.headers.get('cookie');
  if (cookies) {
    const tokenCookie = cookies.split(';')
      .map(c => c.trim())
      .find(c => c.startsWith('sb-wwgcghsoogmsmpeseszw-auth-token='));
    
    if (tokenCookie) {
      try {
        // Extract token and try to verify it
        const tokenValue = decodeURIComponent(tokenCookie.split('=')[1]);
        // Token is stored as JSON array, we need to extract the token string
        const tokenParts = JSON.parse(tokenValue);
        if (tokenParts && tokenParts[0]) {
          const token = tokenParts[0];
          const { data, error } = await supabase.auth.getUser(token);
          if (!error && data?.user) {
            return { isAuthenticated: true, user: data.user };
          }
        }
      } catch (e) {
        console.error('Error parsing auth cookie:', e);
      }
    }
  }
  
  return { isAuthenticated: false, error: 'No valid authentication found' };
}

// Create a direct database client that bypasses RLS
// This is needed because we can't reliably get the session token in API routes
function createAdminClient() {
  // Check if we have the service role key
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
    throw new Error('Missing required service role key for admin access');
  }
  
  // Create a service role client that bypasses RLS
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  );
}

// Get the database user ID associated with the authenticated user's email
async function getDatabaseUserId(authUser) {
  if (!authUser || !authUser.email) {
    console.error('Missing auth user or email');
    return null;
  }

  try {
    const adminClient = createAdminClient();
    
    // Look up the user in the database by email
    const { data, error } = await adminClient
      .from('users')
      .select('id')
      .eq('email', authUser.email)
      .single();
    
    if (error || !data) {
      console.error('Error getting database user ID:', error);
      return null;
    }
    
    console.log('Found database user ID:', data.id, 'for email:', authUser.email);
    return data.id;
  } catch (error) {
    console.error('Exception getting database user ID:', error);
    return null;
  }
}

// Verify user has access to course
async function verifyUserCourseAccess(adminClient, databaseUserId, courseId) {
  if (!databaseUserId || !courseId) {
    return false;
  }

  try {
    // Check if course exists and belongs to user
    const { data, error } = await adminClient
      .from('courses')
      .select('id, user_id')
      .eq('id', courseId)
      .single();

    if (error || !data) {
      console.error('Error verifying course access:', error);
      return false;
    }

    console.log('Course user_id:', data.user_id, 'Database user_id:', databaseUserId);
    
    // Compare the course's user_id with the database user ID
    return data.user_id === databaseUserId;
  } catch (error) {
    console.error('Exception verifying course access:', error);
    return false;
  }
}

// Support HEAD requests for auth testing
export async function HEAD(req, { params }) {
  const auth = await validateAuth(req);
  
  if (!auth.isAuthenticated) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  
  return new NextResponse(null, { status: 200 });
}

export async function GET(req, { params }) {
  try {
    const auth = await validateAuth(req);
    
    if (!auth.isAuthenticated) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the course ID
    const { id: courseId } = params;

    // Get admin client
    const adminClient = createAdminClient();

    // Get database user ID
    const databaseUserId = await getDatabaseUserId(auth.user);
    
    if (!databaseUserId) {
      return new NextResponse('User not found in database', { status: 404 });
    }

    // Verify user has access to this course
    const hasAccess = await verifyUserCourseAccess(adminClient, databaseUserId, courseId);
    
    if (!hasAccess) {
      return new NextResponse('You do not have access to this course', { status: 403 });
    }

    // Fetch syllabus using admin access
    const { data: syllabus, error: syllabusError } = await adminClient
      .from('syllabus')
      .select('*')
      .eq('course_id', courseId)
      .single();

    if (syllabusError && syllabusError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching syllabus:', syllabusError);
      return new NextResponse('Error fetching syllabus', { status: 500 });
    }

    if (!syllabus) {
      return new NextResponse('Syllabus not found', { status: 404 });
    }

    // If analysis is requested, provide feedback on the syllabus
    const searchParams = new URL(req.url).searchParams;
    if (searchParams.get('analyze') === 'true') {
      const analysis = await analyzeSyllabus(syllabus.content);
      return new NextResponse(analysis, {
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    return NextResponse.json(syllabus);
  } catch (error) {
    console.error('Error in GET syllabus:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const auth = await validateAuth(req);
    
    if (!auth.isAuthenticated) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the course ID
    const { id: courseId } = params;
    
    // Get admin client
    const adminClient = createAdminClient();

    // Get database user ID
    const databaseUserId = await getDatabaseUserId(auth.user);
    
    if (!databaseUserId) {
      console.error('User not found in database for email:', auth.user.email);
      return new NextResponse('User not found in database', { status: 404 });
    }
    
    console.log('Auth user ID:', auth.user.id);
    console.log('Database user ID:', databaseUserId);
    console.log('Requested course:', courseId);

    // Verify user has access to this course
    const hasAccess = await verifyUserCourseAccess(adminClient, databaseUserId, courseId);
    
    if (!hasAccess) {
      console.error(`User ${databaseUserId} does not have access to course ${courseId}`);
      return new NextResponse('You do not have access to this course', { status: 403 });
    }

    console.log('Access verified for course:', courseId);
    
    // Check if course exists
    const { data: course, error: courseError } = await adminClient
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      console.error('Error fetching course:', courseError);
      return new NextResponse('Course not found', { status: 404 });
    }

    // Check if syllabus already exists
    const { data: existingSyllabus, error: syllabusError } = await adminClient
      .from('syllabus')
      .select('*')
      .eq('course_id', courseId)
      .single();

    // If syllabus exists and we're not regenerating, return it
    const searchParams = new URL(req.url).searchParams;
    const regenerate = searchParams.get('regenerate') === 'true';
    
    if (existingSyllabus && !regenerate) {
      return NextResponse.json(existingSyllabus);
    }

    // Generate new syllabus content
    const content = await generateSyllabus(course);

    if (existingSyllabus) {
      // Update existing syllabus
      const { data: updatedSyllabus, error: updateError } = await adminClient
        .from('syllabus')
        .update({ 
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSyllabus.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating syllabus:', updateError);
        return new NextResponse('Failed to update syllabus', { status: 500 });
      }

      return NextResponse.json(updatedSyllabus);
    } else {
      // Create a new syllabus
      const { data: newSyllabus, error: createError } = await adminClient
        .from('syllabus')
        .insert([{
          content,
          course_id: courseId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) {
        console.error('Error creating syllabus:', createError);
        return new NextResponse(`Failed to create syllabus: ${JSON.stringify(createError)}`, { status: 500 });
      }

      return NextResponse.json(newSyllabus);
    }
  } catch (error) {
    console.error('Error in POST syllabus:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Helper function to convert stream to string
async function streamToString(stream) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let result = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value);
  }

  return result;
}