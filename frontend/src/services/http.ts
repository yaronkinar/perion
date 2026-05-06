import axios, {
  AxiosError,
  AxiosResponse,
  type AxiosInstance,
} from 'axios';
import { API_BASE_URL, HTTP_STATUS } from '@/constants/api';
import { ERROR_MESSAGES } from '@/constants/messages';
import type { ApiErrorResponse, ApiResponse } from '@/types/api.types';

interface ToastSink {
  error: (message: string) => void;
}

let toastSink: ToastSink | null = null;
let onUnauthorized: (() => void) | null = null;

export function registerToastSink(sink: ToastSink): void {
  toastSink = sink;
}

export function registerUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

export const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

http.interceptors.response.use(
  <T>(response: AxiosResponse<ApiResponse<T>>): AxiosResponse<ApiResponse<T>> =>
    response,
  (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status;
    const message = error.response?.data?.message ?? error.message;

    if (status === HTTP_STATUS.UNAUTHORIZED) {
      if (onUnauthorized) {
        onUnauthorized();
      }
    } else if (status === HTTP_STATUS.FORBIDDEN) {
      if (toastSink) {
        toastSink.error(message ?? ERROR_MESSAGES.forbidden);
      }
    } else if (status && status >= HTTP_STATUS.SERVER_ERROR) {
      if (toastSink) {
        toastSink.error(message ?? ERROR_MESSAGES.serverError);
      }
    }

    return Promise.reject(error);
  },
);

export function unwrap<T>(response: AxiosResponse<ApiResponse<T>>): T {
  return response.data.data;
}

export function extractMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    if (data?.message) return data.message;
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

/**
 * Maps the backend's `errors: string[]` array (produced by class-validator)
 * to a {field -> first message} record. Falls back to lower-cased first word
 * matching since class-validator messages start with the field name.
 *
 * Limited and best-effort by design; full structured errors would require
 * a dedicated contract.
 */
export function extractFieldErrors(error: unknown): Record<string, string> {
  if (!axios.isAxiosError(error)) return {};
  const data = error.response?.data as ApiErrorResponse | undefined;
  const arr = data?.errors;
  if (!arr || arr.length === 0) return {};

  const out: Record<string, string> = {};
  for (const message of arr) {
    const trimmed = message.trim();
    const firstSpace = trimmed.indexOf(' ');
    if (firstSpace === -1) continue;
    const field = trimmed.slice(0, firstSpace);
    if (!out[field]) {
      out[field] = trimmed;
    }
  }
  return out;
}
