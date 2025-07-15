// Edge Function for OpenRouter API proxy
export const config = {
  runtime: 'edge'
};

export default async function handler(req) {
  // Enable CORS for GitHub Pages
  const headers = {
    'Access-Control-Allow-Origin': 'https://sunlandmusic.github.io',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers
    });
  }

  try {
    const { prompt, attachments, model, isPremiumMode } = await req.json();

    // Get API key from environment variable (server-side only)
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers
      });
    }

    // Determine models based on mode
    const models = isPremiumMode ? [
      'google/gemini-2.5-pro',
      'deepseek/deepseek-r1-0528-qwen3-8b:free',
      'anthropic/claude-opus-4',
      'x-ai/grok-4'
    ] : [
      'deepseek/deepseek-r1-0528-qwen3-8b:free'
    ];

    // Process with all models
    const responses = await Promise.all(models.map(async (modelName) => {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://sunlandmusic.github.io',
          'X-Title': 'DEVTEAM'
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            {
              role: 'system',
              content: 'Process the following request with expertise and precision.'
            },
            {
              role: 'user',
              content: prompt + (attachments ? `\n\nAttachments:\n${attachments.map(a => `- ${a.name} (${a.status})${a.content ? `\nContent: ${a.content.slice(0, 1000)}` : ''}`).join('\n')}` : '')
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API call failed (${response.status}): ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      let modelDisplayName = modelName.split('/')[1].toUpperCase();
      if (modelDisplayName.startsWith('DEEPSEEK')) modelDisplayName = 'DEEPSEEK R1';
      
      return {
        model: modelDisplayName,
        content: data.choices[0].message.content
      };
    }));

    // Format responses
    const formattedResponses = responses.map(r => 
      `\n\n\n\n<span style="color: #a855f7; font-weight: bold;">${r.model}</span>\n\n\n\n${r.content}`
    );

    return new Response(JSON.stringify({
      success: true,
      responses: formattedResponses,
      combined: formattedResponses.join('\n\n')
    }), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers
    });
  }
} 