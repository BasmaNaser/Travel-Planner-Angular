import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../services/chat.service';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule,RouterLink],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat implements OnInit {
  messages: any[] = [];
  newMessage: string = '';

  constructor(
    private chatService: ChatService,
    private cdr: ChangeDetectorRef,
     private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    // تحميل الرسائل القديمة
    this.loadConversation();

    // استقبال أي رسالة جديدة Real-Time
this.chatService.onNewMessage((message) => {
  console.log('🔥 SOCKET MESSAGE RECEIVED:', message);

  this.messages = [...this.messages, message];

  console.log('🔥 MESSAGES LENGTH:', this.messages.length);

  this.cdr.detectChanges();
});
  }

  loadConversation(): void {
    this.chatService.getMyConversation().subscribe({
      next: (response) => {
        console.log('MY CONVERSATION:', response);

        this.messages = response.data.messages;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.log('Error loading conversation:', error);
      },
    });
  }

  sendMessage(): void {
    const text = this.newMessage.trim();

    if (!text) {
      return;
    }

    this.chatService.sendMessage(text).subscribe({
      next: (response) => {
        console.log('MESSAGE SENT:', response);

        this.messages.push(response.data);

        this.newMessage = '';

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.log('Error sending message:', error);
      },
    });
  }
}
