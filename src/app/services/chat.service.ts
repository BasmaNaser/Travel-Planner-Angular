// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { io, Socket } from 'socket.io-client';

// @Injectable({
//   providedIn: 'root',
// })
// export class ChatService {
//   private chatUrl = 'http://localhost:5000/chat';
//   private socket: Socket;

//   // constructor(private http: HttpClient) {
//   //   const token = localStorage.getItem('token');

//   //   this.socket = io('http://localhost:5000', {
//   //     auth: {
//   //       token: token,
//   //     },
//   //   });
//   // }


//     constructor(private http: HttpClient) {
//   this.socket = io('http://localhost:5000', {
//     autoConnect: false
//   });

//   const token = localStorage.getItem('token');

//   if (token) {
//     this.socket.auth = { token };
//     this.socket.connect();
//   }
// }


//   sendMessage(text: string) {
//     const token = localStorage.getItem('token');

//     const headers = new HttpHeaders({
//       Authorization: `Bearer ${token}`,
//     });

//     return this.http.post<any>(`${this.chatUrl}/messages`, { text }, { headers });
//   }

//   getMyConversation() {
//     const token = localStorage.getItem('token');

//     const headers = new HttpHeaders({
//       Authorization: `Bearer ${token}`,
//     });

//     return this.http.get<any>(`${this.chatUrl}/my-conversation`, { headers });
//   }

//   // onNewMessage(callback: (message: any) => void): void {
//   //   this.socket.on('message:new', callback);
//   // }

//   onMessageRead(callback: (data: any) => void): void {
//     this.socket.on('message:read', callback);
//   }


//     onNewMessage(callback: (message: any) => void): void {
//   const token = localStorage.getItem('token');

//   if (token) {
//     this.socket.auth = { token };

//     if (!this.socket.connected) {
//       this.socket.connect();
//     }
//   }

//   this.socket.on('message:new', callback);
// }


//   getAdminConversations() {
//   const token = localStorage.getItem('token');

//   const headers = new HttpHeaders({
//     Authorization: `Bearer ${token}`
//   });

//   return this.http.get<any>(
//     `${this.chatUrl}/admin/conversations`,
//     { headers }
//   );
// }

// getAdminConversationMessages(id: string) {
//   const token = localStorage.getItem('token');

//   const headers = new HttpHeaders({
//     Authorization: `Bearer ${token}`
//   });

//   return this.http.get<any>(
//     `${this.chatUrl}/admin/conversations/${id}`,
//     { headers }
//   );
// }

// replyToConversation(id: string, text: string) {
//   const token = localStorage.getItem('token');

//   const headers = new HttpHeaders({
//     Authorization: `Bearer ${token}`
//   });

//   return this.http.post<any>(
//     `${this.chatUrl}/admin/conversations/${id}/reply`,
//     { text },
//     { headers }
//   );
// }

//   disconnect(): void {
//     this.socket.disconnect();
//   }
// }









import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private chatUrl = 'http://localhost:5000/chat';
  private socket: Socket;

  constructor(private http: HttpClient) {
  this.socket = io('http://localhost:5000', {
    autoConnect: false
  });

  this.socket.on('connect', () => {
    console.log('🟢 SOCKET CONNECTED:', this.socket.id);
  });

  this.socket.on('connect_error', (error) => {
    console.log('🔴 SOCKET CONNECTION ERROR:', error.message);
  });
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

  getAdminConversationMessages(conversationId: string) {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<any>(
      `${this.chatUrl}/admin/conversations/${conversationId}`,
      { headers }
    );
  }

  replyToConversation(conversationId: string, text: string) {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.post<any>(
      `${this.chatUrl}/admin/conversations/${conversationId}/reply`,
      { text },
      { headers }
    );
  }

  // onNewMessage(callback: (message: any) => void): void {

  //   const token = localStorage.getItem('token');

  //   if (token) {
  //     this.socket.auth = { token };

  //     if (!this.socket.connected) {
  //       this.socket.connect();
  //     }
  //   }

  //   this.socket.on('message:new', callback);
  // }

  onNewMessage(callback: (message: any) => void): void {
  console.log('🔥 onNewMessage CALLED');

  this.socket.on('message:new', callback);

  const token = localStorage.getItem('accessToken');

  console.log('🔑 SOCKET TOKEN:', token);

  if (token) {
    this.socket.auth = {
      token: token
    };

    if (!this.socket.connected) {
      console.log('🚀 CONNECTING SOCKET...');
      this.socket.connect();
    }
  } else {
    console.log('❌ NO TOKEN FOUND');
  }
}


  onMessageRead(callback: (data: any) => void): void {
    this.socket.on('message:read', callback);
  }

  disconnect(): void {
    this.socket.disconnect();
  }
}
