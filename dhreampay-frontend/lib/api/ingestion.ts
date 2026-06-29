import type { IngestionResult } from '../../types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export async function uploadFile(
  file: File,
  source: 'bank' | 'visa',
  token: string
): Promise<IngestionResult> {
  const url = `${API_BASE_URL}/api/ingestion/upload`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('source', source);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = (await response.json()) as { success: boolean; message?: string; data?: IngestionResult };

  if (!response.ok || !data.success) {
    const errorMessage = data.message ?? response.statusText ?? 'Upload failed';
    throw new Error(errorMessage);
  }

  return data.data!;
}