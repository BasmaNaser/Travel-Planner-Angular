import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../services/chat.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-chat',
  imports: [CommonModule, FormsModule, DatePipe, RouterLink],
  templateUrl: './admin-chat.html',
  styleUrl: './admin-chat.css',
})
export class AdminChat implements OnInit {
  conversations: any[] = [];
  selectedConversation: any = null;
  messages: any[] = [];
  newMessage: string = '';

  constructor(
    private chatService: ChatService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    this.loadConversations();

    this.chatService.onNewMessage((message) => {
      console.log('ADMIN NEW MESSAGE:', message);

      if (
        this.selectedConversation &&
        String(message.conversation) === String(this.selectedConversation._id)
      ) {
        this.messages = [...this.messages, message];
        this.cdr.detectChanges();
      }
    });
  }

  loadConversations(): void {
    this.chatService.getAdminConversations().subscribe({
      next: (response) => {
        console.log('ADMIN CONVERSATIONS:', response);

        this.conversations = response.data;

        this.cdr.detectChanges();
      },
      // error: (error) => {
      //   console.log('Error loading conversations:', error);
      // },
      error: (error) => {
        console.log('STATUS:', error.status);
        console.log('ERROR BODY:', error.error);
        console.log('FULL ERROR:', error);
      },
    });
  }

  selectConversation(conversation: any): void {
    this.selectedConversation = conversation;

    this.chatService.getAdminConversationMessages(conversation._id).subscribe({
      next: (response) => {
        console.log('CONVERSATION MESSAGES:', response);

        this.messages = response.data.messages;

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log('Error loading conversation messages:', error);
      },
    });
  }

  sendReply(): void {
    const text = this.newMessage.trim();

    if (!text || !this.selectedConversation) {
      return;
    }

    this.chatService.replyToConversation(this.selectedConversation._id, text).subscribe({
      next: (response) => {
  console.log('ADMIN REPLY SENT:', response);

  this.newMessage = '';

  this.cdr.detectChanges();
},
      error: (error) => {
        console.log('Error sending admin reply:', error);
      },
    });
  }
}
