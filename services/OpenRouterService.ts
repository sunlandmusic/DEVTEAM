import { TeamId } from '../types';
import { FileAttachment } from './store';
import { useState, useEffect, useRef } from 'react';

// Use the secure proxy endpoint instead of direct OpenRouter calls
const PROXY_URL = 'https://devteam-chi.vercel.app/api/openrouter';

export const OpenRouterService = () => {
  const [credits, setCredits] = useState<{ used: number; total: number }>({ used: 0, total: 10 });
  const abortController = useRef<AbortController | null>(null);

  const fetchCredits = async () => {
    // For now, we'll use a mock credits system since the proxy doesn't expose credits
    // In a full implementation, you could add a separate credits endpoint
    console.log('Credits system: Using mock credits for now');
  };

  // Call fetchCredits immediately when the service is initialized
  useEffect(() => {
    fetchCredits();
  }, []);

  const processTeamRequest = async (prompt: string, teamId: TeamId, attachments: FileAttachment[] = [], isPremiumMode: boolean = true) => {
    try {
      const response = await fetch(PROXY_URL, {
        method: 'POST',
        signal: abortController.current?.signal,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          attachments,
          isPremiumMode
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Proxy Error:', {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        });
        throw new Error(`API call failed (${response.status}): ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Unknown error from proxy');
      }

      // Update credits (mock)
      setCredits(prev => ({
        used: prev.used + (isPremiumMode ? 4 : 1),
        total: prev.total
      }));

      return data.responses;
    } catch (error: any) {
      if ((error as Error).name === 'AbortError') {
        throw new Error('Request was cancelled');
      }
      console.error('Request Error:', error);
      throw error;
    }
  };

  const getCredits = () => credits;

  const cancelRequests = () => {
    if (abortController.current) {
      abortController.current.abort();
      abortController.current = null;
    }
  };

  const sendPrompt = async (prompt: string, attachments: FileAttachment[], teamId: TeamId, isPremiumMode: boolean = true): Promise<string> => {
    const response = await processTeamRequest(prompt, teamId, attachments, isPremiumMode);
    return response.join('\n\n');
  };

  return {
    processTeamRequest,
    getCredits,
    cancelRequests,
    sendPrompt
  };
}; 