import { NextResponse } from 'next/server';
import { db } from '@/db';
import { uploads } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { env } from '@/lib/env';
import { extractFileContent, validateUpload } from '@/lib/files';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const chatId = String(formData.get('chatId') || '') || null;
    if (!files.length) return NextResponse.json({ error: 'Tidak ada file.' }, { status: 400 });

    const maxMb = Number(env.MAX_UPLOAD_SIZE_MB);
    const created = [];
    for (const file of files) {
      validateUpload(file, maxMb);
      const extracted = await extractFileContent(file);
      const [row] = await db.insert(uploads).values({
        userId: user.id,
        chatId,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        extractedText: extracted.extractedText,
        base64Data: extracted.base64Data,
      }).returning({ id: uploads.id, originalName: uploads.originalName, mimeType: uploads.mimeType });
      created.push(row);
    }

    return NextResponse.json({ uploads: created });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Upload gagal' }, { status: 400 });
  }
}
