-- Create Syllabus table
CREATE TABLE IF NOT EXISTS public.syllabus (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create unique index to ensure one syllabus per course
CREATE UNIQUE INDEX IF NOT EXISTS syllabus_course_id_key ON public.syllabus(course_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.syllabus ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view syllabi for courses they have access to" ON public.syllabus
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.courses
            WHERE courses.id = syllabus.course_id
            AND courses.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create syllabi for their own courses" ON public.syllabus
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.courses
            WHERE courses.id = syllabus.course_id
            AND courses.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update syllabi for their own courses" ON public.syllabus
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.courses
            WHERE courses.id = syllabus.course_id
            AND courses.user_id = auth.uid()
        )
    );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER handle_syllabus_updated_at
    BEFORE UPDATE ON public.syllabus
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();