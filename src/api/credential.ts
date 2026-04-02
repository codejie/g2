import { put } from './http'

export async function setCredential(
  providerId: string,
  apiKey: string,
): Promise<boolean> {
  return put<boolean>(`/auth/${providerId}`, {}, { apiKey })
}
