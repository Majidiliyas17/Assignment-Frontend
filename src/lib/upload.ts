import type { ResourceType } from '@/types/api';

const LARGE_FILE_THRESHOLD_BYTES = 10 * 1024 * 1024;
const CHUNK_SIZE_BYTES = 20 * 1024 * 1024;

export type UploadProgressCallback = (percent: number) => void;

export interface UploadParams {
  cloudName: string;
  resourceType: ResourceType;
  publicId: string;
  timestamp: string;
  apiKey: string;
  signature: string;
}

export interface CloudinaryUploadResult {
  public_id: string;
  bytes: number;
}

export function uploadToCloudinary(
  params: UploadParams,
  file: File,
  onProgress: UploadProgressCallback,
): Promise<CloudinaryUploadResult> {
  const url = `https://api.cloudinary.com/v1_1/${params.cloudName}/${params.resourceType}/upload`;

  const body = new FormData();
  body.append('file', file);
  body.append('public_id', params.publicId);
  body.append('timestamp', params.timestamp);
  body.append('api_key', params.apiKey);
  body.append('signature', params.signature);
  body.append('resource_type', params.resourceType);
  if (file.size >= LARGE_FILE_THRESHOLD_BYTES) {
    body.append('chunk_size', String(CHUNK_SIZE_BYTES));
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as CloudinaryUploadResult);
        } catch {
          reject(new Error('Invalid Cloudinary response'));
        }
      } else {
        let message = `Upload failed (${xhr.status})`;
        try {
          const err = JSON.parse(xhr.responseText) as { error?: { message?: string } };
          if (err?.error?.message) message = err.error.message;
        } catch {
          /* ignore */
        }
        reject(new Error(message));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(body);
  });
}