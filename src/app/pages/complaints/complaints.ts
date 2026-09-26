import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { UserService } from '../../core/services/user.service';
import { apiMessage } from '../../core/utils/api-error.util';
import { interval, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  imports: [CommonModule, Navbar, Footer],
  selector: 'app-complaints',
  styleUrl: './complaints.css',
  templateUrl: './complaints.html',
})
export class Complaints implements OnInit {
  private readonly userService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);

  complaints: any[] = [];
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadComplaints();

    // Keep My Complaints synchronized without a browser refresh.
    interval(5000)
      .pipe(
        startWith(0),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.loadComplaints(false));
  }

  loadComplaints(showLoader = true): void {
    if (showLoader) {
      this.loading = true;
    }

    this.errorMessage = '';

    this.userService.getMyComplaints().subscribe({
      next: response => {
        this.loading = false;
        this.complaints = response?.data ?? [];
      },
      error: error => {
        this.loading = false;

        if (error.status === 400) {
          this.complaints = [];
          this.errorMessage =
            error.error?.message || 'No complaints found.';
        } else {
          this.errorMessage = apiMessage(
            error,
            'Unable to load complaints.'
          );
        }
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
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
    switch (status?.toLowerCase()) {
      case 'resolved':
        return 'bi-check-circle-fill';

      case 'inprocess':
        return 'bi-hourglass-split';

      case 'pending':
        return 'bi-clock-fill';

      default:
        return 'bi-clock-fill';
    }
  }

  getStatusText(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'inprocess':
        return 'In Process';
      case 'resolved':
        return 'Resolved';
      case 'pending':
      default:
        return 'Pending';
    }
  }
}
