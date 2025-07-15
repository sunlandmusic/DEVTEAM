import { VercelRequest, VercelResponse } from '@vercel/node';
import cors from 'cors';

type MiddlewareFunction = (
  req: any,
  res: any,
  next: (result: Error | unknown) => void
) => void;

// Configure CORS middleware
const corsMiddleware = cors({
  origin: ['https://sunlandmusic.github.io', 'http://localhost:5173'],
  methods: ['POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});

// Helper to run middleware
const runMiddleware = (
  req: VercelRequest,
  res: VercelResponse,
  fn: MiddlewareFunction
) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: Error | unknown) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Run CORS middleware
    await runMiddleware(req, res, corsMiddleware);

    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Verify request body
    if (!req.body || !req.body.messages) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Forward the request to OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://sunlandmusic.github.io',
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenRouter API error:', errorData);
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 