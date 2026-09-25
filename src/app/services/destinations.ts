import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Idestination } from '../core/models/idestination';

interface ApiDestination {
  _id: string;
  Name: string;
  Location: string;
  Description?: string;
  Image?: string;
  Category?: string;
  Badge?: 'Trending' | 'Best Seller' | '';
  Duration?: number;
  PricePerPerson?: number;
  BaseTime?: number;
  AvailableSeats?: number;
  ThingsToDo?: string[];
}

interface DestinationsResponse {
  message: string;
  destinations: ApiDestination[];
}

@Injectable({
  providedIn: 'root'
})
export class DestinationsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/destinations`;

  getAllDestinations(): Observable<Idestination[]> {
    return this.http.get<DestinationsResponse>(this.apiUrl).pipe(
      map(response =>
        (response?.destinations ?? []).map(destination => ({
          id: destination._id,
          name: destination.Name,
          country: destination.Location,
          image: destination.Image || 'assets/images/destination-placeholder.jpg',
          price: destination.PricePerPerson ?? 0,
          rating: 0,
          tags: destination.ThingsToDo ?? [],
          favorite: false,
          badge: destination.Badge || destination.Category || undefined
        }))
      )
    );
  }
}
