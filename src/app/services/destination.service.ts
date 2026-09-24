import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Destination } from '../Models/destination';

export interface Review {
  _id?: string;
  Rating: number;
  Comment?: string;
  Platform?: string;
  CreatedAt?: string;
  UserID?: string;
  DestinationID: string;
}

@Injectable({
  providedIn: 'root'
})
export class DestinationService {

  private apiUrl =
    'http://localhost:5000/destinations';

  private reviewApiUrl =
    'http://localhost:5000/reviews';

  constructor(
    private http: HttpClient
  ) {}

  getAllDestinations() {
    return this.http.get<{
      destinations: Destination[]
    }>(
      this.apiUrl
    );
  }

  getDestinationById(
    id: string
  ) {
    return this.http.get<{
      destination: Destination
    }>(
      `${this.apiUrl}/${id}`
    );
  }

  addDestination(
    destination: Destination,
    image: File | null
  ) {

    const formData =
      new FormData();

    formData.append(
      'Name',
      destination.Name
    );

    formData.append(
      'Location',
      destination.Location
    );

    formData.append(
      'Description',
      destination.Description
    );

    formData.append(
      'Category',
      destination.Category
    );

    formData.append(
      'Badge',
      destination.Badge || ''
    );

    formData.append(
      'Duration',
      destination.Duration.toString()
    );

    formData.append(
      'PricePerPerson',
      destination.PricePerPerson.toString()
    );

    formData.append(
      'BaseTime',
      destination.BaseTime.toString()
    );

    formData.append(
      'AvailableSeats',
      destination.AvailableSeats.toString()
    );

    destination.ThingsToDo.forEach(
      item => {
        formData.append(
          'ThingsToDo',
          item
        );
      }
    );

    if (image) {
      formData.append(
        'Image',
        image
      );
    }

    return this.http.post(
      this.apiUrl,
      formData
    );
  }

  updateDestination(
    id: string,
    destination: Destination,
    image: File | null
  ) {

    const formData =
      new FormData();

    formData.append(
      'Name',
      destination.Name
    );

    formData.append(
      'Location',
      destination.Location
    );

    formData.append(
      'Description',
      destination.Description
    );

    formData.append(
      'Category',
      destination.Category
    );

    formData.append(
      'Badge',
      destination.Badge || ''
    );

    formData.append(
      'Duration',
      destination.Duration.toString()
    );

    formData.append(
      'PricePerPerson',
      destination.PricePerPerson.toString()
    );

    formData.append(
      'BaseTime',
      destination.BaseTime.toString()
    );

    formData.append(
      'AvailableSeats',
      destination.AvailableSeats.toString()
    );

    destination.ThingsToDo.forEach(
      item => {
        formData.append(
          'ThingsToDo',
          item
        );
      }
    );

    if (image) {
      formData.append(
        'Image',
        image
      );
    }

    return this.http.patch(
      `${this.apiUrl}/${id}`,
      formData
    );
  }

  deleteDestination(
    id: string
  ) {

    return this.http.delete(
      `${this.apiUrl}/${id}`
    );
  }

  getReviews(
    destinationId: string
  ) {

    return this.http.get<{
      reviews: Review[]
    }>(
      `${this.reviewApiUrl}/${destinationId}`
    );
  }

  addReview(
    review: {
      Rating: number;
      Comment: string;
      DestinationID: string;
    }
  ) {

    return this.http.post(
      this.reviewApiUrl,
      review
    );
  }

  updateReview(
    id: string,
    review: {
      Rating: number;
      Comment: string;
    }
  ) {

    return this.http.patch(
      `${this.reviewApiUrl}/${id}`,
      review
    );
  }

  deleteReview(
    id: string
  ) {

    return this.http.delete(
      `${this.reviewApiUrl}/${id}`
    );
  }

}