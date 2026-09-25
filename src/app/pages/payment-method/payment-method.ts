import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-payment-method',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './payment-method.html',
  styleUrls: ['./payment-method.css']
})
export class PaymentMethodComponent implements OnInit {

  bookingId: string = '';
  booking: any = null;

  selectedMethod: string = 'card';

  cardNumber: string = '';
  cardName: string = '';
  expiryDate: string = '';
  cvv: string = '';

  paypalEmail: string = '';

  walletNumber: string = '';

  isPaying: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.bookingId =
      this.route.snapshot.paramMap.get('id') || '';

    const pendingBooking =
      localStorage.getItem('pendingBooking');

    if (pendingBooking) {
      try {
        this.booking =
          JSON.parse(pendingBooking);
      } catch (error) {
        console.error(error);
      }
    }

    if (!this.booking) {
      Swal.fire({
        icon: 'error',
        title: 'Booking Not Found',
        text: 'Booking information is missing.'
      }).then(() => {
        this.router.navigate(['/']);
      });
    }
  }

  selectMethod(method: string): void {
    this.selectedMethod = method;
  }

  confirmPayment(): void {

    if (!this.bookingId) {
      Swal.fire({
        icon: 'error',
        title: 'Booking Not Found',
        text: 'Booking ID is missing.'
      });

      return;
    }

    if (this.selectedMethod === 'card') {

      if (!this.cardNumber.trim()) {
        Swal.fire({
          icon: 'warning',
          title: 'Card Number Required',
          text: 'Please enter your card number.'
        });
        return;
      }

      if (!this.cardName.trim()) {
        Swal.fire({
          icon: 'warning',
          title: 'Card Holder Required',
          text: 'Please enter the card holder name.'
        });
        return;
      }

      if (!this.expiryDate.trim()) {
        Swal.fire({
          icon: 'warning',
          title: 'Expiry Date Required',
          text: 'Please enter the expiry date.'
        });
        return;
      }

      if (!this.cvv.trim()) {
        Swal.fire({
          icon: 'warning',
          title: 'CVV Required',
          text: 'Please enter the CVV.'
        });
        return;
      }
    }

    if (this.selectedMethod === 'paypal') {

      if (!this.paypalEmail.trim()) {
        Swal.fire({
          icon: 'warning',
          title: 'Email Required',
          text: 'Please enter your PayPal email.'
        });
        return;
      }
    }

    if (this.selectedMethod === 'vodafone') {

      if (!this.walletNumber.trim()) {
        Swal.fire({
          icon: 'warning',
          title: 'Phone Number Required',
          text: 'Please enter your Vodafone Cash number.'
        });
        return;
      }
    }

    this.isPaying = true;

    this.paymentService
      .payBooking(this.bookingId)
      .subscribe({
        next: (response: any) => {

          this.isPaying = false;

          if (
            response &&
            response.data
          ) {
            this.booking =
              response.data;
          } else if (this.booking) {
            this.booking.Status =
              'confirmed';
          }

          localStorage.removeItem(
            'pendingBooking'
          );

          Swal.fire({
            icon: 'success',
            title: 'Payment Successful!',
            text:
              'Your booking has been confirmed.',
            confirmButtonText: 'Go to Home'
          }).then(() => {
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

  goBack(): void {
    this.router.navigate([
      '/payments',
      this.bookingId
    ]);
  }
}