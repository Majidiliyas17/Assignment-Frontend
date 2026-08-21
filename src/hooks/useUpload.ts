'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/http';
import { uploadToCloudinary } from '@/lib/upload';
import type { FileView, UploadSignature } from '@/types/api';
import type { UploadProgressCallback } from '@/lib/upload';
import { refreshStorageUsage } from '@/hooks/useAuth';

export function useUpload(onProgress: UploadProgressCallback) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File): Promise<FileView> => {
      onProgress(2);

      const signature = await http
        .post<{ data: UploadSignature }>('/files/upload-signature', {
          filename: file.name,
          mimeType: file.type,
          size: file.size,
        })
        .then((r) => r.data.data);

      onProgress(5);

      const uploaded = await uploadToCloudinary(
        {
          cloudName: signature.cloudName,
          resourceType: signature.resourceType,
          publicId: signature.publicId,
          timestamp: signature.timestamp,
          apiKey: signature.apiKey,
          signature: signature.signature,
        },
        file,
        onProgress,
      );

      const created = await http
        .post<{ data: FileView }>('/files/complete', {
          publicId: uploaded.public_id,
          originalName: file.name,
          resourceType: signature.resourceType,
          mimeType: file.type,
          size: uploaded.bytes,
        })
        .then((r) => r.data.data);

      onProgress(100);
      return created;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['file-stats'] });
      refreshStorageUsage(queryClient);
    },
  });
}