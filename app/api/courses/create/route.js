import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid';

/**
 * API endpoint for course creation
 * Takes a course object with userEmail and creates a course
 * for that user, creating the user if needed
 */
export async function POST(request) {
  try {
    // Get the course data from the request
    const courseData = await request.json()
    
    console.log('POST /api/courses/create - Received request with data:', {
      ...courseData,
      // Don't log full content of large fields
      topic: courseData.topic?.substring(0, 50) + '...',
      end_goal: courseData.end_goal?.substring(0, 50) + '...'
    })
    
    // Check if userEmail is provided
    if (!courseData.userEmail) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing user email', 
          details: 'A valid user email is required to create a course'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
    
    const userEmail = courseData.userEmail;
    console.log('Looking up user with email:', userEmail);
    
    // First check if a user with this email already exists
    const { data: existingUserByEmail, error: emailCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .maybeSingle();
    
    if (emailCheckError) {
      console.error('Error checking user by email:', emailCheckError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to verify user email', 
          details: emailCheckError.message
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
    
    let userId;
    
    // If user exists, use their ID
    if (existingUserByEmail) {
      userId = existingUserByEmail.id;
      console.log('Found existing user with email:', userEmail, 'ID:', userId);
    } else {
      // Create a new user with this email
      userId = uuidv4(); // Generate a new UUID for the user
      console.log('Creating new user with email:', userEmail, 'and ID:', userId);
      
      const { error: createUserError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: userEmail,
          name: userEmail.split('@')[0] // Simple name from email
        });
      
      if (createUserError) {
        console.error('Error creating user:', createUserError)
        return new Response(
          JSON.stringify({ 
            error: 'Failed to create user', 
            details: createUserError.message
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }
      
      console.log('Successfully created user with ID:', userId);
    }
    
    // Remove userEmail from course data and add the user_id
    const { userEmail: _, ...courseDataWithoutEmail } = courseData;
    const finalCourseData = {
      ...courseDataWithoutEmail,
      user_id: userId
    };
    
    console.log('Creating course for user ID:', userId);
    
    // Now create the course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert([finalCourseData])
      .select()
      .single()

    if (courseError) {
      console.error('Error creating course:', courseError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create course', 
          details: courseError.message
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Course created successfully:', course.id)
    return new Response(
      JSON.stringify(course),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Unhandled error in course creation:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Server error', 
        details: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
} 