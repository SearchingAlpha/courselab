// lib/streaming.js

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
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.CLAUDE_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: params.model,
            messages: params.messages,
            max_tokens: params.max_tokens,
            temperature: params.temperature,
            stream: true,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        
        while (true) {
          const { value, done } = await reader.read();
          
          if (done) {
            controller.enqueue(encoder.encode('{"type":"end"}\n'));
            controller.close();
            break;
          }
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim() !== '');
          
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
                const token = parsed.delta?.text || '';
                
                if (token) {
                  controller.enqueue(encoder.encode(`{"type":"token","content":"${escapeJson(token)}"}\n`));
                }
              } catch (error) {
                console.error('Error parsing streaming response:', error);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error in streaming response:', error);
        controller.enqueue(encoder.encode(`{"type":"error","content":"${escapeJson(error.message)}"}\n`));
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
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

/**
 * Helper function to escape JSON strings
 */
function escapeJson(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}