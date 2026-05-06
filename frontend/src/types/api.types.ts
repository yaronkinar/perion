export interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
}

export interface ApiErrorResponse {
  data: null;
  message: string;
  statusCode: number;
  errors?: string[];
}
