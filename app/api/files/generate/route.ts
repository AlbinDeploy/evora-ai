import { NextResponse } from 'next/server';
import { db } from '@/db';
import { generatedFiles } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { inferMimeType, makePdfFromText } from '@/lib/files';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { type, content } = await request.json();
  const safeType = ['txt', 'md', 'json', 'pdf'].includes(type) ? type : 'txt';
  const normalized = String(content || '').slice(0, 50000);
  const fileName = `evora-output.${safeType}`;
  const mimeType = safeType === 'pdf' ? 'application/pdf' : inferMimeType(fileName);
  const payload = safeType === 'pdf' ? makePdfFromText(normalized) : safeType === 'json' ? JSON.stringify({ content: normalized }, null, 2) : normalized;

  await db.insert(generatedFiles).values({ userId: user.id, fileName, mimeType, content: payload });

  return new NextResponse(payload, {
    headers: {
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  });
}
