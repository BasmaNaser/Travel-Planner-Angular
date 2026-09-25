import { Injectable } from '@angular/core';
import {
  HttpClient
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ItineraryDayService {

  private apiUrl =
    'http://localhost:5000/itinerary-days';

  constructor(
    private http: HttpClient
  ) {}

  getItineraryDaysByDestination(
    destinationId: string
  ): Observable<any> {

    return this.http.get(
      `${this.apiUrl}/destination/${destinationId}`
    );
  }
}