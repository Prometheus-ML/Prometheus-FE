export interface ImageUploadResponse {
  id: string;
  webViewLink?: string | null;
  webContentLink?: string | null;
  thumbnailLink?: string | null;
  resourceKey?: string | null;
  publicCdnUrl?: string | null;
  publicViewUrl?: string | null;
  publicEmbedUrl?: string | null;
  publicEmbedUrlAlt?: string | null;
  publicDownloadUrl?: string | null;
}

export interface ImageInfoResponse {
  id: string;
  name?: string | null;
  mimeType?: string | null;
  size?: string | null;
  webViewLink?: string | null;
  webContentLink?: string | null;
  thumbnailLink?: string | null;
}

export type ImageCategory = 'member' | 'project' | 'post' | 'sponsor' | 'group';


