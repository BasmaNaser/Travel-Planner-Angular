import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

import { PaymentService } from '../../services/payment.service';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payments.html',
  styleUrls: ['./payments.css']
})
export class PaymentsComponent implements OnInit {

  bookingId: string = '';
  booking: any = null;

  isLoading: boolean = true;
  isPaying: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.bookingId =
      this.route.snapshot.paramMap.get('id') || '';

    const pendingBooking =
      localStorage.getItem('pendingBooking');

    if (pendingBooking) {
      try {
        const parsedBooking =
          JSON.parse(pendingBooking);

        if (
          parsedBooking &&
          parsedBooking._id
        ) {
          this.booking = parsedBooking;
          this.bookingId = parsedBooking._id;
          this.isLoading = false;
          return;
        }
      } catch (error) {
        console.error(error);

        localStorage.removeItem(
          'pendingBooking'
        );
      }
    }

    this.loadBooking();
  }

  loadBooking(): void {
    if (!this.bookingId) {
      this.isLoading = false;

      Swal.fire({
        icon: 'error',
        title: 'Booking Not Found',
        text: 'Booking ID is missing.'
      });

      return;
    }

    this.bookingService
      .getBookingById(this.bookingId)
      .subscribe({
        next: (response: any) => {

          if (response && response.data) {
            this.booking = response.data;

            localStorage.setItem(
              'pendingBooking',
              JSON.stringify(this.booking)
            );
          } else {
            this.booking = null;

            Swal.fire({
              icon: 'error',
              title: 'Booking Not Found',
              text: 'The booking could not be found.'
            });
          }

          this.isLoading = false;
        },

        error: (error: any) => {
          console.error(error);

          this.booking = null;
          this.isLoading = false;

          Swal.fire({
            icon: 'error',
            title: 'Failed to Load Booking',
            text:
              error?.error?.message ||
              error?.message ||
              'Failed to fetch booking details.'
          });
        }
      });
  }

  payNow(): void {
    if (!this.bookingId) {
      Swal.fire({
        icon: 'error',
        title: 'Booking Not Found',
        text: 'Booking ID is missing.'
      });

      return;
    }

    if (!this.booking) {
      Swal.fire({
        icon: 'error',
        title: 'Booking Not Found',
        text: 'Booking information is missing.'
      });

      return;
    }

    if (this.booking.Status !== 'pending') {
      Swal.fire({
        icon: 'info',
        title: 'Booking Already Processed',
        text:
          'Current booking status: ' +
          this.booking.Status
      });

      return;
    }

    this.router.navigate([
      '/payment-method',
      this.bookingId
    ]);
  }

  processPayment(): void {
    if (!this.bookingId) {
      return;
    }

    this.isPaying = true;

    this.paymentService
      .payBooking(this.bookingId)
      .subscribe({
        next: (response: any) => {

          if (
            response &&
            response.data
          ) {
            this.booking =
              response.data;
          } else {
            this.booking.Status =
              'confirmed';
          }

          this.isPaying = false;

          Swal.fire({
            icon: 'success',
            title: 'Payment Successful!',
            text:
              'Your booking has been confirmed.',
            confirmButtonText: 'OK'
          }).then(() => {

            localStorage.removeItem(
              'pendingBooking'
            );

            this.router.navigate(['/']);
          });
        },

        error: (error: any) => {
          console.error(error);

          this.isPaying = false;

          Swal.fire({
            icon: 'error',
            title: 'Payment Failed',
            text:
              error?.error?.message ||
              error?.message ||
              'Payment could not be completed.'
          });
        }
      });
  }

  cancelPayment(): void {
    localStorage.removeItem(
      'pendingBooking'
    );

    let destinationId = '';

    if (
      this.booking &&
      this.booking.DestinationID
    ) {
      if (
        typeof this.booking.DestinationID ===
        'object'
      ) {
        destinationId =
          this.booking.DestinationID._id || '';
      } else {
        destinationId =
          this.booking.DestinationID;
      }
    }

    if (destinationId) {
      this.router.navigate([
        '/book',
        destinationId
      ]);
    } else {
      this.router.navigate(['/']);
    }
  }
}