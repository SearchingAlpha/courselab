import { createStreamingResponse } from '@/lib/streaming';

const SYLLABUS_SYSTEM_PROMPT = `You are an expert curriculum designer and educational content creator, specialized in creating comprehensive course syllabi. Your expertise includes:

1. Curriculum Development
- Creating logical learning progressions
- Balancing theoretical and practical content
- Designing effective assessment methods
- Structuring content for optimal learning outcomes

2. Time Management
- Accurately estimating time requirements for topics
- Balancing different learning activities
- Creating realistic schedules that prevent cognitive overload

3. Educational Best Practices
- Implementing active learning strategies
- Incorporating project-based learning
- Designing effective hands-on exercises
- Creating engaging capstone projects

4. Industry Standards
- Following modern educational frameworks
- Incorporating industry-relevant skills
- Aligning with professional certification requirements

Your task is to create a detailed, well-structured syllabus that:
- Follows a clear progression from fundamentals to advanced concepts
- Includes specific time allocations for each component
- Balances theory with hands-on practice
- Incorporates modern learning methodologies
- Ends with a meaningful capstone project`;

const SYLLABUS_TEMPLATE = `# {courseTitle} - Course Syllabus

## Course Overview
{courseDescription}

## Course Details
- Total Duration: 120 hours
- Knowledge Level: {knowledgeLevel}
- Focus: {focus}
- Learning Approach: {approach}

## Learning Objectives
By the end of this course, students will be able to:
{learningObjectives}

## Course Structure

{modulesList}

## Assessment Methods
{assessmentMethods}

## Final Project
{capstoneProject}

## Prerequisites
{prerequisites}

## Required Materials
{materials}`;

export async function generateSyllabus(course) {
  const userPrompt = `Create a comprehensive syllabus for a ${course.knowledge_level} level course.

Course Information:
- Title: ${course.title}
- Topic: ${course.topic}
- End Goal: ${course.end_goal}
- Knowledge Level: ${course.knowledge_level}
- Focus: ${course.focus}
- Teaching Approach: ${course.approach}

Requirements:
1. Structure the syllabus exactly according to the provided template
2. Break down the 120 hours into:
   - Lectures and Theory (30-40%)
   - Hands-on Practice (40-50%)
   - Projects and Assessments (20-30%)
3. For each module:
   - Specify exact time allocation
   - List key topics and subtopics
   - Include learning objectives
   - Detail practical exercises
4. Design a challenging but achievable capstone project that:
   - Integrates major course concepts
   - Has real-world applicability
   - Can be completed in 15-20 hours
5. Include specific assessment methods and grading criteria

Format the output in clean Markdown with proper headings, lists, and sections.`;

  return createStreamingResponse({
    model: "claude-3-opus-20240229",
    messages: [
      {
        role: "system",
        content: SYLLABUS_SYSTEM_PROMPT
      },
      {
        role: "user",
        content: userPrompt
      }
    ],
    max_tokens: 4000,
    temperature: 0.7,
    stream: true
  });
}

export async function reviseSyllabus(existingSyllabus, revisionPrompt) {
  return createStreamingResponse({
    model: "claude-3-opus-20240229",
    messages: [
      {
        role: "system",
        content: SYLLABUS_SYSTEM_PROMPT
      },
      {
        role: "user",
        content: "Here is an existing syllabus to revise:\n\n" + existingSyllabus
      },
      {
        role: "user",
        content: revisionPrompt
      }
    ],
    max_tokens: 4000,
    temperature: 0.7,
    stream: true
  });
}

export async function analyzeSyllabus(syllabus) {
  return createStreamingResponse({
    model: "claude-3-opus-20240229",
    messages: [
      {
        role: "system",
        content: SYLLABUS_SYSTEM_PROMPT
      },
      {
        role: "user",
        content: "Analyze this syllabus and provide feedback on:\n1. Content coverage and progression\n2. Time allocation\n3. Learning objectives clarity\n4. Assessment methods\n5. Areas for improvement\n\nSyllabus:\n\n" + syllabus
      }
    ],
    max_tokens: 2000,
    temperature: 0.7,
    stream: true
  });
} 