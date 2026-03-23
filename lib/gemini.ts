import { GoogleGenerativeAI } from '@google/generative-ai';

const keys = (process.env.GEMINI_API_KEYS || '')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

function getClient(index: number) {
  return new GoogleGenerativeAI(keys[index % keys.length]);
}

export async function runGeminiStream(parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>) {
  if (!keys.length) throw new Error('GEMINI_API_KEYS belum diisi');

  let lastError: unknown;
  for (let i = 0; i < keys.length; i += 1) {
    try {
      const client = getClient(i);
      const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
      return await model.generateContentStream({ contents: [{ role: 'user', parts }] });
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Semua API key Gemini gagal dipakai.');
}
