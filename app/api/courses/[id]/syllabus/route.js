// // app/api/courses/[id]/syllabus/route.js
// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth/next';
// import prisma from '@/lib/prisma';
// import { authOptions } from '../../../auth/[...nextauth]/route';
// //import { syllabusAgent } from '@/lib/ai-agents';

// export async function POST(request, { params }) {
//   try {
//     const { id } = params;
    
//     // Get the authenticated user's session
//     const session = await getServerSession(authOptions);
    
//     if (!session?.user) {
//       return NextResponse.json(
//         { message: 'Unauthorized' },
//         { status: 401 }
//       );
//     }
    
//     // Fetch the course
//     const course = await prisma.course.findUnique({
//       where: {
//         id,
//       },
//     });
    
//     // Check if course exists
//     if (!course) {
//       return NextResponse.json(
//         { message: 'Course not found' },
//         { status: 404 }
//       );
//     }
    
//     // Check if the user has access to this course
//     if (course.userId !== session.user.id) {
//       return NextResponse.json(
//         { message: 'Unauthorized' },
//         { status: 403 }
//       );
//     }
    
//     // Generate syllabus using AI
//     const syllabus = await syllabusAgent.generateSyllabus(course);
    
//     // In a production app, save the syllabus to the database
//     // For now, we'll just return it
    
//     return NextResponse.json(syllabus);
//   } catch (error) {
//     console.error('Error generating syllabus:', error);
//     return NextResponse.json(
//       { message: 'Failed to generate syllabus. Please try again.' },
//       { status: 500 }
//     );
//   }
// }