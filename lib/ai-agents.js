// // lib/ai-agents.js
// import { Configuration, OpenAIApi } from 'openai';

// const configuration = new Configuration({
//   apiKey: process.env.CLAUDE_API_KEY,
// });

// const api = new OpenAIApi(configuration);

// /**
//  * Base AI agent class that handles communication with Claude API
//  */
// export class BaseAgent {
//   constructor() {
//     this.model = "claude-3-opus-20240229"; // Default model
//   }

//   async generate(prompt, options = {}) {
//     try {
//       const response = await api.createCompletion({
//         model: options.model || this.model,
//         prompt: prompt,
//         max_tokens: options.max_tokens || 4000,
//         temperature: options.temperature || 0.7,
//       });

//       return response.data.choices[0].text.trim();
//     } catch (error) {
//       console.error('Error generating content:', error);
//       throw new Error('Failed to generate content');
//     }
//   }
// }

// /**
//  * SyllabusAgent - Generates course syllabi based on course information
//  */
// export class SyllabusAgent extends BaseAgent {
//   async generateSyllabus(course) {
//     const prompt = `
//       Generate a detailed syllabus for a 120-hour course on "${course.title}".
      
//       Course Details:
//       - Topic: ${course.topic}
//       - End Goal: ${course.endGoal}
//       - Knowledge Level: ${course.knowledgeLevel}
//       - Focus (Math vs Code): ${course.focus}
//       - Approach (Theory vs Practice): ${course.approach}
      
//       The syllabus should:
//       - Be divided into 6-8 modules with estimated time per module
//       - Include detailed chapters for each module
//       - Have a total of 120 hours
//       - Include a capstone project component
//       - Build concepts progressively toward the end goal
//       - Be structured like a university course
      
//       Return the syllabus in JSON format with the following structure:
//       {
//         "title": "Course Title",
//         "description": "Course Description",
//         "totalHours": 120,
//         "modules": [
//           {
//             "id": 1,
//             "title": "Module Title",
//             "description": "Module description",
//             "hours": 20,
//             "chapters": [
//               { "title": "Chapter 1 Title", "hours": 4 },
//               ...
//             ]
//           },
//           ...
//         ]
//       }
//     `;

//     const syllabusText = await this.generate(prompt, { 
//       temperature: 0.7,
//       max_tokens: 3000
//     });
    
//     // Parse JSON response
//     try {
//       return JSON.parse(syllabusText);
//     } catch (error) {
//       console.error('Error parsing syllabus JSON:', error);
//       throw new Error('Failed to generate valid syllabus format');
//     }
//   }
// }

// /**
//  * TextbookAgent - Generates textbook chapters based on syllabus information
//  */
// export class TextbookAgent extends BaseAgent {
//   async generateChapter(course, module, chapter) {
//     const prompt = `
//       Generate a detailed textbook chapter on "${chapter.title}" for a course on "${course.title}".
      
//       Course Details:
//       - Topic: ${course.topic}
//       - Knowledge Level: ${course.knowledgeLevel}
//       - Focus: ${course.focus}
//       - Approach: ${course.approach}
      
//       Module Context:
//       - Module: ${module.title}
//       - Module Description: ${module.description}
      
//       The chapter should:
//       - Explain concepts deeply and clearly
//       - Include real-life examples and case studies
//       - Include visual aids described in markdown format
//       - Be structured with clear headings and subheadings
//       - Be comprehensive but concise (maximum 10 pages)
//       - Be written in university-level language while remaining approachable
      
//       Return the chapter in Markdown format with proper headings, sections, and formatting.
//     `;

//     return await this.generate(prompt, { 
//       temperature: 0.8,
//       max_tokens: 4000
//     });
//   }
// }

// /**
//  * ExerciseAgent - Generates exercises for chapters
//  */
// export class ExerciseAgent extends BaseAgent {
//   async generateExercises(course, module, chapter) {
//     const prompt = `
//       Generate a set of exercises for the chapter "${chapter.title}" in the course "${course.title}".
      
//       Course Details:
//       - Topic: ${course.topic}
//       - Knowledge Level: ${course.knowledgeLevel}
//       - Focus: ${course.focus}
//       - Approach: ${course.approach}
      
//       The exercises should:
//       - Include one exercise fully solved and explained step by step
//       - Include one exercise for the user to solve
//       - Involve real-world scenarios when possible
//       - Focus on ${course.focus === 'code-heavy' ? 'programming implementations' : 
//                 course.focus === 'math-heavy' ? 'mathematical problems and proofs' : 
//                 'both theoretical understanding and practical application'}
//       - Be appropriate for ${course.knowledgeLevel} level students
      
//       If coding exercises are involved, provide Python-based implementations with clear outputs.
      
//       Return the exercises in Markdown format structured like a Jupyter notebook with clear separation
//       between explanations and code cells.
//     `;

//     return await this.generate(prompt, { 
//       temperature: 0.7,
//       max_tokens: 4000
//     });
//   }
// }

// /**
//  * ProjectAgent - Generates projects based on course content
//  */
// export class ProjectAgent extends BaseAgent {
//   async generateProject(course, modules) {
//     const modulesList = modules.map(m => `- ${m.title}: ${m.description}`).join('\n');
    
//     const prompt = `
//       Design a comprehensive project for the course "${course.title}".
      
//       Course Details:
//       - Topic: ${course.topic}
//       - End Goal: ${course.endGoal}
//       - Knowledge Level: ${course.knowledgeLevel}
//       - Focus: ${course.focus}
//       - Approach: ${course.approach}
      
//       Course Modules:
//       ${modulesList}
      
//       The project should:
//       - Apply knowledge from all modules in the course
//       - Include mini-projects for each chapter that build toward the final project
//       - Emphasize ${course.focus === 'code-heavy' ? 'programming implementation and code quality' : 
//                    course.focus === 'math-heavy' ? 'mathematical rigor and theoretical foundations' : 
//                    'both theoretical understanding and practical implementation'}
//       - Be challenging but achievable for ${course.knowledgeLevel} level students
//       - Include clear requirements, milestones, and evaluation criteria
//       - Be structured like a real-world project
      
//       Return the project in Markdown format with clear structure, requirements, and implementation guidelines.
//     `;

//     return await this.generate(prompt, { 
//       temperature: 0.7,
//       max_tokens: 4000
//     });
//   }
// }

// // Export agent instances
// export const syllabusAgent = new SyllabusAgent();
// export const textbookAgent = new TextbookAgent();
// export const exerciseAgent = new ExerciseAgent();
// export const projectAgent = new ProjectAgent();