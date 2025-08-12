export type Brand = 'yinsh' | 'prometheus';

export interface ApiResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

