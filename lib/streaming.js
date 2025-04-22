// lib/streaming.js
import { OpenAIApi, Configuration } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.CLAUDE_API_KEY,
});

const api = new OpenAIApi(configuration);

/**
 * Creates a streaming response from the Claude API
 * @param {Request} req - The incoming request
 * @param {Object} params - Parameters for the streaming request
 * @returns {Response} A streaming response
 */
export async function createStreamingResponse(req, params) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      // Send the initial message
      controller.enqueue(encoder.encode('{"type":"start"}\n'));
      
      try {
        const response = await api.createCompletion({
          ...params,
          stream: true,
        }, { responseType: 'stream' });
        
        const reader = response.data;
        
        reader.on('data', (chunk) => {
          const text = decoder.decode(chunk);
          const lines = text.split('\n').filter(line => line.trim() !== '');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              if (data === '[DONE]') {
                controller.enqueue(encoder.encode('{"type":"end"}\n'));
                controller.close();
                return;
              }
              
              try {
                const parsed = JSON.parse(data);
                const token = parsed.choices[0]?.text || '';
                
                if (token) {
                  controller.enqueue(encoder.encode(`{"type":"token","content":"${escapeJson(token)}"}\n`));
                }
              } catch (error) {
                console.error('Error parsing streaming response:', error);
              }
            }
          }
        });
        
        reader.on('end', () => {
          controller.enqueue(encoder.encode('{"type":"end"}\n'));
          controller.close();
        });
        
        reader.on('error', (error) => {
          console.error('Error in stream:', error);
          controller.enqueue(encoder.encode(`{"type":"error","content":"${escapeJson(error.message)}"}\n`));
          controller.close();
        });
      } catch (error) {
        console.error('Error creating streaming response:', error);
        controller.enqueue(encoder.encode(`{"type":"error","content":"${escapeJson(error.message)}"}\n`));
        controller.close();
      }
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}

/**
 * Escape special characters in a string for use in JSON
 * @param {string} str - The string to escape
 * @returns {string} The escaped string
 */
function escapeJson(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * Client-side utility to consume a streaming response
 * @param {string} url - The URL to stream from
 * @param {Object} options - Fetch options
 * @param {Function} onToken - Callback for each token
 * @param {Function} onComplete - Callback when streaming is complete
 * @param {Function} onError - Callback for errors
 * @returns {Promise<void>}
 */
export async function streamContent(url, options, onToken, onComplete, onError) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    
    while (true) {
      const { value, done } = await reader.read();
      
      if (done) {
        break;
      }
      
      buffer += decoder.decode(value, { stream: true });
      
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (!line.trim()) continue;
        
        try {
          const event = JSON.parse(line);
          
          if (event.type === 'token' && onToken) {
            onToken(event.content);
          } else if (event.type === 'end' && onComplete) {
            onComplete();
          } else if (event.type === 'error' && onError) {
            onError(event.content);
          }
        } catch (error) {
          console.error('Error parsing streaming event:', line, error);
        }
      }
    }
  } catch (error) {
    if (onError) {
      onError(error.message);
    } else {
      console.error('Streaming error:', error);
    }
  }
}