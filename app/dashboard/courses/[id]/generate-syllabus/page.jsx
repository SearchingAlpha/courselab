import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import SyllabusGenerator from '@/components/syllabus/SyllabusGenerator';

export default async function GenerateSyllabusPage({ params }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Generate Course Syllabus</h1>
        <SyllabusGenerator courseId={params.id} />
      </div>
    </div>
  );
} 