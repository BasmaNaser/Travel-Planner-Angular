import { Injectable } from '@angular/core';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import { Review } from '../Models/review';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  private apiUrl =
    'http://localhost:5000/reviews';

  constructor(
    private http: HttpClient
  ) {}

  // =====================================
  // Get Reviews By Destination
  // =====================================

  getReviewsByDestination(
    destinationId: string
  ) {

    return this.http.get<{
      message: string;
      reviews: Review[];
    }>(
      `${this.apiUrl}/${destinationId}`
    );

  }

  // =====================================
  // Headers
  // =====================================

  private getHeaders() {

    const token =
      localStorage.getItem(
        'accessToken'
      );

    return new HttpHeaders({

      Authorization:
        `Bearer ${token}`

    });

  }

  // =====================================
  // Get Deleted Review Notification
  // =====================================

  getDeletedReviewNotification() {

    return this.http.get<{

      notification:
        | {
            reviewId: string;
            message: string;
            destination: string;
          }
        | null;

    }>(
      `${this.apiUrl}/notification/deleted`,

      {
        headers:
          this.getHeaders()
      }

    );

  }

  // =====================================
  // Create Review
  // =====================================

  createReview(
    review: Review
  ) {

    return this.http.post<{
      message: string;
      review: Review;
    }>(
      this.apiUrl,

      {

        Rating:
          review.Rating,

        Comment:
          review.Comment,

        DestinationID:
          review.DestinationID

      },

      {

        headers:
          this.getHeaders()

      }

    );

  }

  // =====================================
  // Update Review
  // =====================================

  updateReview(
    id: string,
    review: Review
  ) {

    return this.http.patch<{
      message: string;
      review: Review;
    }>(
      `${this.apiUrl}/${id}`,

      {

        Rating:
          review.Rating,

        Comment:
          review.Comment

      },

      {

        headers:
          this.getHeaders()

      }

    );

  }

  // =====================================
  // Delete Review
  // =====================================

  deleteReview(
    id: string
  ) {

    return this.http.delete(
      `${this.apiUrl}/${id}`,

      {

        headers:
          this.getHeaders()

      }

    );

  }

  // =====================================
  // Mark Notification As Read
  // =====================================

  markDeletedReviewNoticeRead(
    id: string
  ) {

    return this.http.patch(
      `${this.apiUrl}/notice/${id}/read`,

      {},

      {

        headers:
          this.getHeaders()

      }

    );

  }

}