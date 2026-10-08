import { api, APIError } from './api';
const key = 'portfolio:conversation-id';
type ChatResponse = { message: string; conversation_id: string };
export const chatService = {
  async send(message: string): Promise<string> {
    const id = window.localStorage.getItem(key);
    const request = (conversationID?: string) => api<ChatResponse>('/chat', 'POST', { message, ...(conversationID ? { conversation_id: conversationID } : {}) });
    let response: ChatResponse;
    try { response = await request(id || undefined); }
    catch (error) { if (!(error instanceof APIError) || error.status !== 404 || !id) throw error; window.localStorage.removeItem(key); response = await request(); }
    window.localStorage.setItem(key, response.conversation_id);
    return response.message;
  },
  async history(): Promise<{ role: string; content: string }[]> {
    const id = window.localStorage.getItem(key);
    if (!id) return [];
    try { return await api(`/chat/conversations/${id}/messages`); }
    catch (error) { if (error instanceof APIError && error.status === 404) { window.localStorage.removeItem(key); return []; } throw error; }
  }
};
