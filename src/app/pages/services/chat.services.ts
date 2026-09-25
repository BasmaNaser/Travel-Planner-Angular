import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private chatUrl = 'http://localhost:5000/chat';
  private socket: Socket;

  // constructor(private http: HttpClient) {

  //   const token = localStorage.getItem('token');

  //   this.socket = io('http://localhost:5000', {
  //     auth: {
  //       token: token
  //     }
  //   });
  // }

  constructor(private http: HttpClient) {
  this.socket = io('http://localhost:5000', {
    autoConnect: false
  });

  const token = localStorage.getItem('token');

  if (token) {
    this.socket.auth = { token };
    this.socket.connect();
  }
}

  sendMessage(text: string) {

    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.post<any>(
      `${this.chatUrl}/messages`,
      { text },
      { headers }
    );
  }

  getMyConversation() {

    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<any>(
      `${this.chatUrl}/my-conversation`,
      { headers }
    );
  }

  // onNewMessage(callback: (message: any) => void): void {
  //   this.socket.on('message:new', callback);
  // }
  onNewMessage(callback: (message: any) => void): void {
  const token = localStorage.getItem('token');

  if (token) {
    this.socket.auth = { token };

    if (!this.socket.connected) {
      this.socket.connect();
    }
  }

  this.socket.on('message:new', callback);
}

  onMessageRead(callback: (data: any) => void): void {
    this.socket.on('message:read', callback);
  }

  disconnect(): void {
    this.socket.disconnect();
  }
}
