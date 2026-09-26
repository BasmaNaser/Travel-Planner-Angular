import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface BookingDestination {
  _id: string;
  Name: string;
  Location: string;
  Description?: string;
  Image?: string;
  Category?: string;
  Badge?: string;
  Duration?: number;
  PricePerPerson?: number;
  AvailableSeats?: number;
  ThingsToDo?: string[];
}

export interface BookingItineraryDay {
  _id: string;
  DayNumber?: number;
  Title?: string;
  Activities?: string;
  Price?: number;
  DestinationID?: BookingDestination;
}

export interface MyBooking {
  _id: string;

  UserID: string;

  DestinationID?: BookingDestination;

  ItineraryDayID?: BookingItineraryDay;

  NumberOfPeople?: number;

  StartDate?: string;

  EndDate?: string;

  PriceOf?: number;

  Status:
    | 'pending'
    | 'confirmed'
    | 'cancelled'
    | 'completed';

  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/bookings`;

  getMyBookings(): Observable<any> {

    return this.http.get<any>(
      `${this.apiUrl}/my-bookings`
    );

  }
}