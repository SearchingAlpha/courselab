// lib/streaming.js

/**
 * Creates a streaming response from the Claude API
 * @param {Object} params - Parameters for the streaming request
 * @returns {Promise<string>} The complete response content
 */
export async function createStreamingResponse(params) {
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
        system: params.messages.find(msg => msg.role === "system")?.content || "",
        messages: params.messages.filter(msg => msg.role !== "system"),
        max_tokens: params.max_tokens,
        temperature: params.temperature,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let content = '';

    while (true) {
      const { value, done } = await reader.read();
      
      if (done) {
        break;
      }
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== '');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            return content;
          }
          
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              content += parsed.delta.text;
            }
          } catch (error) {
            console.error('Error parsing streaming response:', error);
          }
        }
      }
    }

    return content;
  } catch (error) {
    console.error('Error in streaming response:', error);
    throw error;
  }
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
      
      const chunk = decoder.decode(value);
      if (onToken) {
        onToken(chunk);
      }
    }

    if (onComplete) {
      onComplete();
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