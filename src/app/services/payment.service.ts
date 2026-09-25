
import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private apiUrl =
    'http://localhost:5000/bookings';

  constructor(
    private http: HttpClient
  ) {}

  // ==============================
  // PAY FOR BOOKING
  // ==============================

  payBooking(
    bookingId: string
  ): Observable<any> {

    const token =
      localStorage.getItem('accessToken');

    const headers =
      new HttpHeaders({
        Authorization:
          `Bearer ${token}`
      });

    return this.http.patch(
      `${this.apiUrl}/${bookingId}/pay`,
      {},
      { headers }
    );
  }
}

