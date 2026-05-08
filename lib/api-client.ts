import { addBasePath } from "@/lib/base-path";

export function apiUrl(input: string): string {
  if (input.startsWith("/api/")) {
    return addBasePath(input);
  }

  return input;
}

export function apiFetch(input: string | URL | Request, init?: RequestInit) {
  if (typeof input === "string") {
    return fetch(apiUrl(input), init);
  }

  return fetch(input, init);
}
