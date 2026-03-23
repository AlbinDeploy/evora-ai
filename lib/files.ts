import pdfParse from 'pdf-parse';
import mime from 'mime';

const allowedMimeTypes = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'text/plain',
  'application/pdf',
  'application/json',
  'text/markdown',
];

export function validateUpload(file: File, maxMb: number) {
  if (!allowedMimeTypes.includes(file.type)) {
    throw new Error('Tipe file belum didukung. Pakai gambar, txt, md, json, atau pdf.');
  }

  if (file.size > maxMb * 1024 * 1024) {
    throw new Error(`Ukuran file maksimal ${maxMb}MB.`);
  }
}

export async function extractFileContent(file: File) {
  const bytes = Buffer.from(await file.arrayBuffer());

  if (file.type.startsWith('image/')) {
    return {
      extractedText: null,
      base64Data: bytes.toString('base64'),
    };
  }

  if (file.type === 'application/pdf') {
    const parsed = await pdfParse(bytes);
    return {
      extractedText: parsed.text?.slice(0, 25000) || '',
      base64Data: null,
    };
  }

  return {
    extractedText: bytes.toString('utf-8').slice(0, 25000),
    base64Data: null,
  };
}

export function inferMimeType(fileName: string) {
  return mime.getType(fileName) || 'text/plain';
}

export function makePdfFromText(text: string) {
  return `%PDF-1.1\n1 0 obj<<>>endobj\n2 0 obj<< /Length ${text.length + 64} >>stream\nBT /F1 12 Tf 50 750 Td (${text
    .replace(/[()\\]/g, '')
    .replace(/\n/g, ' ')}) Tj ET\nendstream endobj\n3 0 obj<< /Type /Page /Parent 4 0 R /Contents 2 0 R >>endobj\n4 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n5 0 obj<< /Type /Catalog /Pages 4 0 R >>endobj\nxref\n0 6\n0000000000 65535 f \ntrailer<< /Root 5 0 R /Size 6 >>\nstartxref\n0\n%%EOF`;
}
