export interface SafeUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResult {
  user: SafeUser;
  accessToken: string;
}

export type FileVisibility = 'private' | 'public';
export type FileStatus = 'pending' | 'completed' | 'failed';
export type ResourceType = 'auto' | 'image' | 'video' | 'raw';

export interface FileView {
  id: string;
  originalName: string;
  mimeType: string;
  extension: string;
  size: number;
  visibility: FileVisibility;
  status: FileStatus;
  resourceType: ResourceType;
  shareToken: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedFiles {
  files: FileView[];
  pagination: PaginationMeta;
}

export interface ShareResult {
  file: FileView;
  shareToken: string;
  shareUrl: string;
}

export interface PublicShareResult {
  file: FileView;
  downloadUrl: string;
}

export interface UploadSignature {
  signature: string;
  timestamp: string;
  apiKey: string;
  cloudName: string;
  folder: string;
  publicId: string;
  resourceType: ResourceType;
  storageId: string;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  error: {
    code: string;
    details?: unknown;
    stack?: string;
  };
}

export interface ApiSuccessBody<T> {
  success: true;
  message: string;
  data: T;
}

export type ApiBody<T> = ApiSuccessBody<T> | ApiErrorBody;