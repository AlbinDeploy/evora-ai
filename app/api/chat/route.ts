import { NextResponse } from 'next/server';
import { and, eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { chats, messages, uploads } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { runGeminiStream } from '@/lib/gemini';

const SYSTEM_PROMPT = `Kamu adalah Evora AI. Gaya bicara santai, gaul seperlunya, ramah, sopan, dan fokus bantu manusia. Kalau user minta coding, kasih jawaban rapi dan production-minded. Kalau user upload file, pakai file itu sebagai konteks. Jangan roleplay aneh-aneh.`;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { chatId, message, uploadIds } = await request.json();
  const cleanMessage = String(message || '').trim();
  if (!cleanMessage && (!Array.isArray(uploadIds) || uploadIds.length === 0)) {
    return NextResponse.json({ error: 'Pesan kosong.' }, { status: 400 });
  }

  let finalChatId = chatId as string;
  if (!finalChatId || finalChatId === 'new') {
    const [chat] = await db.insert(chats).values({ userId: user.id, title: cleanMessage.slice(0, 48) || 'Chat baru' }).returning();
    finalChatId = chat.id;
  }

  const records = Array.isArray(uploadIds) && uploadIds.length
    ? await db.select().from(uploads).where(and(eq(uploads.userId, user.id), inArray(uploads.id, uploadIds)))
    : [];

  const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [{ text: SYSTEM_PROMPT }];

  if (records.length) {
    parts.push({ text: 'Konteks file upload dari user:' });
    for (const file of records) {
      if (file.mimeType.startsWith('image/') && file.base64Data) {
        parts.push({ inlineData: { mimeType: file.mimeType, data: file.base64Data } });
      } else {
        parts.push({ text: `File: ${file.originalName}\nIsi ringkas:\n${file.extractedText || '[Kosong atau tidak kebaca]'}` });
      }
    }
  }

  parts.push({ text: `User: ${cleanMessage}` });

  await db.insert(messages).values({
    chatId: finalChatId,
    role: 'user',
    content: cleanMessage || '[Upload file]',
    attachmentsJson: JSON.stringify(records.map((item) => ({ id: item.id, name: item.originalName, mimeType: item.mimeType }))),
  });

  const result = await runGeminiStream(parts);
  const stream = new ReadableStream({
    async start(controller) {
      let fullText = '';
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (!text) continue;
        fullText += text;
        controller.enqueue(new TextEncoder().encode(text));
      }
      await db.insert(messages).values({
        chatId: finalChatId,
        role: 'assistant',
        content: fullText,
      });
      await db.update(chats).set({ updatedAt: new Date(), title: cleanMessage.slice(0, 48) || 'Chat baru' }).where(eq(chats.id, finalChatId));
      controller.close();
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'x-chat-id': finalChatId,
    },
  });
}
