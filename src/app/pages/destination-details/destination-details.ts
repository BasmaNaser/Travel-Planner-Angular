import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { DestinationService } from '../../services/destination.service';
import { Destination } from '../../Models/destination';

import { ReviewService } from '../../services/review.service';
import { Review } from '../../Models/review';


@Component({
  selector: 'app-destination-details',

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './destination-details.html',

  styleUrls: ['./destination-details.css']
})
export class DestinationDetailsComponent
  implements OnInit {


  destination: Destination | null = null;


  reviews: Review[] = [];


  errorMessage: string = '';


  reviewError: string = '';


  isLoading: boolean = true;


  isReviewsLoading: boolean = false;


  selectedRating: number = 0;


  reviewComment: string = '';


  editingReviewId: string = '';


  editingRating: number = 0;


  editingComment: string = '';


  constructor(
    private route: ActivatedRoute,

    private destinationService:
      DestinationService,

    private reviewService:
      ReviewService,

    private cdr:
      ChangeDetectorRef
  ) {}


  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      const id =
        params.get('id');


      console.log(
        'DESTINATION ID:',
        id
      );


      if (!id) {

        this.isLoading = false;

        this.errorMessage =
          'Destination ID not found.';

        return;

      }


      this.getDestinationDetails(id);


      this.getReviews(id);

    });

  }


  getDestinationDetails(
    id: string
  ): void {

    this.destinationService
      .getDestinationById(id)
      .subscribe({

        next: (response) => {

          console.log(
            'DESTINATION RESPONSE:',
            response
          );


          this.destination =
            response.destination;


          console.log(
            'DESTINATION:',
            this.destination
          );


          this.isLoading = false;


          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'DESTINATION ERROR:',
            error
          );


          this.isLoading = false;


          this.errorMessage =
            'Failed to load destination details.';


          this.cdr.detectChanges();

        }

      });

  }


  getReviews(
    destinationId: string
  ): void {

    this.isReviewsLoading = true;


    this.reviewError = '';


    this.reviewService
      .getReviewsByDestination(
        destinationId
      )
      .subscribe({

        next: (response) => {

          console.log(
            'REVIEWS RESPONSE:',
            response
          );


          this.reviews =
            response.reviews || [];


          this.isReviewsLoading = false;


          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'REVIEWS ERROR:',
            error
          );


          this.reviews = [];


          this.isReviewsLoading = false;


          this.reviewError =
            'Failed to load reviews.';


          this.cdr.detectChanges();

        }

      });

  }


  selectRating(
    rating: number
  ): void {

    this.selectedRating =
      rating;

  }


  submitReview(): void {

    if (!this.destination?._id) {
      return;
    }


    if (
      this.selectedRating < 1
    ) {

      this.reviewError =
        'Please select a rating.';

      return;

    }


    if (
      !this.reviewComment.trim()
    ) {

      this.reviewError =
        'Please write a comment.';

      return;

    }


    const review: Review = {

      Rating:
        this.selectedRating,

      Comment:
        this.reviewComment.trim(),

      DestinationID:
        this.destination._id

    };


    this.reviewService
      .createReview(review)
      .subscribe({

        next: (response) => {

          console.log(
            'REVIEW CREATED:',
            response
          );


          this.reviewComment = '';


          this.selectedRating = 0;


          this.reviewError = '';


          this.getReviews(
            this.destination!._id!
          );

        },


        error: (error) => {

          console.error(
            'CREATE REVIEW ERROR:',
            error
          );


          this.reviewError =
            error?.error?.message ||
            'Failed to submit review.';

        }

      });

  }


  startEditReview(
    review: Review
  ): void {

    if (!review._id) {
      return;
    }


    this.editingReviewId =
      review._id;


    this.editingRating =
      review.Rating;


    this.editingComment =
      review.Comment || '';

  }


  cancelEdit(): void {

    this.editingReviewId = '';


    this.editingRating = 0;


    this.editingComment = '';

  }


  updateReview(): void {

    if (!this.editingReviewId) {
      return;
    }


    if (
      this.editingRating < 1
    ) {

      this.reviewError =
        'Please select a rating.';

      return;

    }


    if (
      !this.editingComment.trim()
    ) {

      this.reviewError =
        'Please write a comment.';

      return;

    }


    const review: Review = {

      Rating:
        this.editingRating,

      Comment:
        this.editingComment.trim(),

      DestinationID:
        this.destination?._id || ''

    };


    this.reviewService
      .updateReview(
        this.editingReviewId,
        review
      )
      .subscribe({

        next: (response) => {

          console.log(
            'REVIEW UPDATED:',
            response
          );


          this.cancelEdit();


          this.reviewError = '';


          this.getReviews(
            this.destination!._id!
          );

        },


        error: (error) => {

          console.error(
            'UPDATE REVIEW ERROR:',
            error
          );


          this.reviewError =
            error?.error?.message ||
            'Failed to update review.';

        }

      });

  }


  deleteReview(
    id: string
  ): void {

    const confirmed =
      confirm(
        'Are you sure you want to delete this review?'
      );


    if (!confirmed) {
      return;
    }


    this.reviewService
      .deleteReview(id)
      .subscribe({

        next: (response) => {

          console.log(
            'REVIEW DELETED:',
            response
          );


          this.reviewError = '';


          this.getReviews(
            this.destination!._id!
          );

        },


        error: (error) => {

          console.error(
            'DELETE REVIEW ERROR:',
            error
          );


          this.reviewError =
            error?.error?.message ||
            'Failed to delete review.';

        }

      });

  }


  getAverageRating(): number {

    if (!this.reviews.length) {
      return 0;
    }


    const total =
      this.reviews.reduce(
        (sum, review) =>
          sum + review.Rating,
        0
      );


    return total /
      this.reviews.length;

  }


  getRatingStars(
    rating: number
  ): number[] {

    return Array.from(
      { length: 5 },
      (_, index) =>
        index < rating ? 1 : 0
    );

  }


  getReviewDate(
    review: Review
  ): string {

    const date =
      review.createdAt ||
      review.CreatedAt;


    if (!date) {
      return '';
    }


    return new Date(date)
      .toLocaleDateString();

  }

}