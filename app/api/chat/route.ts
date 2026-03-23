import { NextResponse } from 'next/server';
import { and, eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { chats, messages, uploads } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { runGeminiStream } from '@/lib/gemini';

const SYSTEM_PROMPT = `Kamu adalah Evora AI. Gaya bicara santai, gaul seperlunya, ramah, sopan, dan fokus bantu manusia. Kalau user minta coding, kasih jawaban rapi dan production-minded. Kalau user upload file, pakai file itu sebagai konteks. Jangan roleplay aneh-aneh.`;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const chatId = typeof body.chatId === 'string' ? body.chatId : 'new';
  const message = typeof body.message === 'string' ? body.message : '';
  const uploadIds = Array.isArray(body.uploadIds) ? body.uploadIds.filter((id): id is string => typeof id === 'string') : [];

  const cleanMessage = message.trim();

  if (!cleanMessage && uploadIds.length === 0) {
    return NextResponse.json({ error: 'Pesan kosong.' }, { status: 400 });
  }

  let finalChatId = chatId;
  if (!finalChatId || finalChatId === 'new') {
    const [chat] = await db
      .insert(chats)
      .values({
        userId: user.id,
        title: cleanMessage.slice(0, 48) || 'Chat baru',
      })
      .returning();

    finalChatId = chat.id;
  }

  const records =
    uploadIds.length > 0
      ? await db
          .select()
          .from(uploads)
          .where(and(eq(uploads.userId, user.id), inArray(uploads.id, uploadIds)))
      : [];

  let imageBase64: string | undefined;
  let mimeType: string | undefined;

  const fileContext: string[] = [];

  if (records.length > 0) {
    fileContext.push('Konteks file upload dari user:');

    for (const file of records) {
      if (
        !imageBase64 &&
        file.mimeType.startsWith('image/') &&
        file.base64Data
      ) {
        imageBase64 = file.base64Data;
        mimeType = file.mimeType;
        fileContext.push(`Gambar terlampir: ${file.originalName}`);
        continue;
      }

      fileContext.push(
        `File: ${file.originalName}\nIsi ringkas:\n${file.extractedText || '[Kosong atau tidak kebaca]'}`
      );
    }
  }

  const finalPrompt = [
    SYSTEM_PROMPT,
    fileContext.length > 0 ? fileContext.join('\n\n') : '',
    `User: ${cleanMessage || '[Upload file]'}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  await db.insert(messages).values({
    chatId: finalChatId,
    role: 'user',
    content: cleanMessage || '[Upload file]',
    attachmentsJson: JSON.stringify(
      records.map((item) => ({
        id: item.id,
        name: item.originalName,
        mimeType: item.mimeType,
      }))
    ),
  });

  const result = await runGeminiStream({
    prompt: finalPrompt,
    imageBase64,
    mimeType,
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let fullText = '';

      try {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (!text) continue;

          fullText += text;
          controller.enqueue(encoder.encode(text));
        }

        await db.insert(messages).values({
          chatId: finalChatId,
          role: 'assistant',
          content: fullText,
        });

        await db
          .update(chats)
          .set({
            updatedAt: new Date(),
            title: cleanMessage.slice(0, 48) || 'Chat baru',
          })
          .where(eq(chats.id, finalChatId));
      } catch (error) {
        console.error('Chat stream error:', error);

        if (!fullText) {
          controller.enqueue(
            encoder.encode('Maaf, lagi ada kendala waktu generate jawaban.')
          );
        }
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'x-chat-id': finalChatId,
      'Cache-Control': 'no-store',
    },
  });
}
