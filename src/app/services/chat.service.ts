import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private chatUrl = 'http://localhost:5000/chat';
  private socket: Socket;

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('token');

    this.socket = io('http://localhost:5000', {
      auth: {
        token: token,
      },
    });
  }

  sendMessage(text: string) {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post<any>(`${this.chatUrl}/messages`, { text }, { headers });
  }

  getMyConversation() {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<any>(`${this.chatUrl}/my-conversation`, { headers });
  }

  onNewMessage(callback: (message: any) => void): void {
    this.socket.on('message:new', callback);
  }

  onMessageRead(callback: (data: any) => void): void {
    this.socket.on('message:read', callback);
  }

  getAdminConversations() {
  const token = localStorage.getItem('token');

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  return this.http.get<any>(
    `${this.chatUrl}/admin/conversations`,
    { headers }
  );
}

getAdminConversationMessages(id: string) {
  const token = localStorage.getItem('token');

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  return this.http.get<any>(
    `${this.chatUrl}/admin/conversations/${id}`,
    { headers }
  );
}

replyToConversation(id: string, text: string) {
  const token = localStorage.getItem('token');

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  return this.http.post<any>(
    `${this.chatUrl}/admin/conversations/${id}/reply`,
    { text },
    { headers }
  );
}

  disconnect(): void {
    this.socket.disconnect();
  }
}
