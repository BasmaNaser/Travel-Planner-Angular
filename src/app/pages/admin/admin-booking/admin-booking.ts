import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../../components/navbar/navbar';
import { Footer } from '../../../components/footer/footer';

@Component({
  imports: [RouterLink, Navbar, Footer, DatePipe],
  selector: 'app-admin-booking',
  styleUrl: './admin-booking.css',
  templateUrl: './admin-booking.html',
})
export class AdminBooking implements OnInit {

  bookings: any[] = [];
  totalBookings = 0;

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.dashboardService.getBookings().subscribe({
      next: (response) => {
        console.log('BOOKINGS RESPONSE:', response);

        this.bookings = response.data;
        this.totalBookings = response.count;

        this.cdr.detectChanges();

        console.log('BOOKINGS ARRAY:', this.bookings);
        console.log('UPDATED STATUS:', this.bookings[0].Status);
      },

      error: (error) => {
        console.log('Error loading bookings:', error);
      },
    });
  }

  updateStatus(id: string, status: string): void {
    this.dashboardService.updateBookingStatus(id, status).subscribe({
      next: (response) => {
        console.log('BOOKING STATUS UPDATED:', response);
        this.loadBookings();
      },

      error: (error) => {
        console.log('Error updating booking status:', error);
      }
    });
  }
}
