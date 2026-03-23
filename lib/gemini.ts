import { GoogleGenerativeAI, type Content, type Part } from '@google/generative-ai';

function getClient(apiKey: string) {
  return new GoogleGenerativeAI(apiKey);
}

export async function streamGemini(params: {
  prompt: string;
  imageBase64?: string;
  mimeType?: string;
}) {
  const { prompt, imageBase64, mimeType } = params;

  const keys = (process.env.GEMINI_API_KEYS || '')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);

  if (!keys.length) {
    throw new Error('GEMINI_API_KEYS is not configured');
  }

  let lastError: unknown;

  const parts: Part[] = [{ text: prompt }];

  if (imageBase64 && mimeType) {
    parts.push({
      inlineData: {
        data: imageBase64,
        mimeType,
      },
    });
  }

  const contents: Content[] = [
    {
      role: 'user',
      parts,
    },
  ];

  for (const key of keys) {
    try {
      const client = getClient(key);
      const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
      return await model.generateContentStream({ contents });
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error('All Gemini API keys failed');
}

export const runGeminiStream = streamGemini;
