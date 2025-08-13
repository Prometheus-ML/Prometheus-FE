import { ApiClient } from './apiClient';
import type { ImageUploadResponse, ImageInfoResponse, ImageCategory } from '@prometheus-fe/types';

export class StorageApi {
  private readonly api: ApiClient;
  private readonly base = '/storage/image';

  constructor(apiClient: ApiClient) {
    this.api = apiClient;
  }

  upload(file: File, category: ImageCategory) {
    const form = new FormData();
    form.append('file', file);
    form.append('category', category);
    return this.api.post<ImageUploadResponse>(`${this.base}/upload`, form);
  }

  getInfo(fileId: string) {
    return this.api.get<ImageInfoResponse>(`${this.base}/${fileId}`);
  }

  delete(fileId: string) {
    return this.api.delete<void>(`${this.base}/${fileId}`);
  }
}


