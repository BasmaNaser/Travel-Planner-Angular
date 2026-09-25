import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { UserService } from '../../core/services/user.service';
import { apiMessage } from '../../core/utils/api-error.util';

@Component({
  imports: [CommonModule, Navbar, Footer],
  selector: 'app-complaints',
  styleUrl: './complaints.css',
  templateUrl: './complaints.html',
})
export class Complaints implements OnInit {
  private readonly userService = inject(UserService);

  complaints: any[] = [];
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.userService.getMyComplaints().subscribe({
      next: response => {
        this.loading = false;
        this.complaints = response?.data ?? [];
      },
      error: error => {
        this.loading = false;
        if (error.status === 400) {
          this.complaints = [];
          this.errorMessage = error.error?.message || 'No complaints found.';
        } else {
          this.errorMessage = apiMessage(error, 'Unable to load complaints.');
        }
      }
    });
  }
}
