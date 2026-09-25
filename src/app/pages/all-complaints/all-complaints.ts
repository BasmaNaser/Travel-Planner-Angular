import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { UserService } from '../../core/services/user.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

type ComplaintStatus = 'pending' | 'inProcess' | 'resolved';

@Component({
  selector: 'app-all-complaints',
  standalone: true,
  imports: [CommonModule,RouterLink,FormsModule],
  templateUrl: './all-complaints.html',
  styleUrl: './all-complaints.css'
})
export class AllComplaints implements OnInit {

  private readonly userService = inject(UserService);

  complaints: any[] = [];
  loading = true;
  errorMessage = '';
  updatingId: string | null = null;

  readonly statuses: {
    value: ComplaintStatus;
    label: string;
  }[] = [
    {
      value: 'pending',
      label: 'Pending'
    },
    {
      value: 'inProcess',
      label: 'In Process'
    },
    {
      value: 'resolved',
      label: 'Resolved'
    }
  ];

  ngOnInit(): void {
    this.loadComplaints();
  }

  loadComplaints(): void {

    this.loading = true;
    this.errorMessage = '';

    console.log('➡️ Requesting all complaints...');

    this.userService.getAllComplaints().subscribe({

      next: (response: any) => {

        console.log('✅ ALL COMPLAINTS RESPONSE:', response);

        this.complaints = response?.data ?? [];

        this.loading = false;
      },

      error: (error: any) => {

        console.error('❌ ALL COMPLAINTS ERROR:', error);

        this.complaints = [];

        this.errorMessage =
          error?.error?.message ||
          `Unable to load complaints. Status: ${error?.status || 'Unknown'}`;

        this.loading = false;
      }

    });
  }
getUserImage(complaint: any): string {
  const image = complaint?.userId?.profilePicture;

  if (!image) {
    return '';
  }

  if (image.startsWith('http')) {
    return image;
  }

  return `http://localhost:5000${image.startsWith('/') ? '' : '/'}${image}`;
}
  changeStatus(
    complaint: any,
    event: Event
  ): void {

    const select =
      event.target as HTMLSelectElement;

    const newStatus =
      select.value as ComplaintStatus;

    if (
      !newStatus ||
      newStatus === complaint.status
    ) {
      return;
    }

    const oldStatus =
      complaint.status;

    const id =
      this.getId(complaint);

    if (!id) {
      console.error('Complaint ID not found:', complaint);
      return;
    }

    complaint.status = newStatus;
    this.updatingId = id;

    this.userService
      .updateComplaintStatus(id, newStatus)
      .subscribe({

        next: (response: any) => {

          console.log(
            '✅ STATUS UPDATED:',
            response
          );

          if (response?.data) {

            const index =
              this.complaints.findIndex(
                item =>
                  this.getId(item) === id
              );

            if (index !== -1) {
              this.complaints[index] =
                response.data;
            }
          }

          this.updatingId = null;
        },

        error: (error: any) => {

          console.error(
            '❌ STATUS UPDATE ERROR:',
            error
          );

          complaint.status = oldStatus;

          this.updatingId = null;

          this.errorMessage =
            error?.error?.message ||
            'Unable to update complaint status.';
        }

      });
  }

  getId(complaint: any): string {
    return complaint?._id || complaint?.id || '';
  }

  getUserName(complaint: any): string {
    return (
      complaint?.userId?.fullName ||
      complaint?.fullName ||
      'Unknown user'
    );
  }

  getUserEmail(complaint: any): string {
    return (
      complaint?.userId?.email ||
      complaint?.email ||
      ''
    );
  }

  getStatusClass(status: string): string {

    switch ((status || '').toLowerCase()) {

      case 'resolved':
        return 'status-resolved';

      case 'inprocess':
        return 'status-inprocess';

      case 'pending':
        return 'status-pending';

      default:
        return 'status-pending';
    }
  }

  getStatusIcon(status: string): string {

    switch ((status || '').toLowerCase()) {

      case 'resolved':
        return 'bi-check-circle-fill';

      case 'inprocess':
        return 'bi-hourglass-split';

      default:
        return 'bi-clock-fill';
    }
  }

  getStatusText(status: string): string {

    const found =
      this.statuses.find(
        item => item.value === status
      );

    return found?.label ?? 'Pending';
  }
}