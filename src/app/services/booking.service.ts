
// import { Injectable } from '@angular/core';

// import {
//   HttpClient,
//   HttpHeaders
// } from '@angular/common/http';

// import { Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class BookingService {

//   private apiUrl =
//     'http://localhost:5000/bookings';

//   constructor(
//     private http: HttpClient
//   ) {}

//   // ==============================
//   // CREATE BOOKING
//   // ==============================

//   createBooking(
//     bookingData: {
//       DestinationID: string;
//       NumberOfPeople: number;
//       StartDate: string;
//       EndDate: string;
//       ItineraryDayID?: string;
//     }
//   ): Observable<any> {

//     const token =
//       localStorage.getItem('accessToken');

//     const headers =
//       new HttpHeaders({
//         Authorization:
//           `Bearer ${token}`
//       });

//     return this.http.post(
//       this.apiUrl,
//       bookingData,
//       { headers }
//     );
//   }

//   // ==============================
//   // GET MY BOOKING BY ID - USER
//   // ==============================

//   getBookingById(
//     bookingId: string
//   ): Observable<any> {

//     const token =
//       localStorage.getItem('accessToken');

//     const headers =
//       new HttpHeaders({
//         Authorization:
//           `Bearer ${token}`
//       });

//     return this.http.get(
//       `${this.apiUrl}/user/${bookingId}`,
//       { headers }
//     );
//   }
// }



import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private apiUrl = 'http://localhost:5000/bookings';

  constructor(
    private http: HttpClient
  ) {}

  // ==============================
  // CREATE BOOKING
  // ==============================
  createBooking(
    bookingData: {
      DestinationID: string;
      NumberOfPeople: number;
      StartDate: string;
      EndDate: string;
      ItineraryDayID?: string;
    }
  ): Observable<any> {

    const token = localStorage.getItem('accessToken');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.post(
      this.apiUrl,
      bookingData,
      { headers }
    );
  }

  // ==============================
  // GET MY BOOKING BY ID - USER
  // ==============================
  getBookingById(
    bookingId: string
  ): Observable<any> {

    const token = localStorage.getItem('accessToken');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get(
      `${this.apiUrl}/user/${bookingId}`,
      { headers }
    );
  }
}