import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { DestinationService } from '../../services/destination.service';
import { Destination } from '../../Models/destination';
import { ReviewService } from '../../services/review.service';
import { Review } from '../../Models/review';

@Component({
  selector: 'app-destination-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './destination-details.html',
  styleUrls: ['./destination-details.css']
})
export class DestinationDetailsComponent implements OnInit {

  destination: Destination | null = null;
  reviews: Review[] = [];

  errorMessage = '';
  reviewError = '';

  isLoading = true;
  isReviewsLoading = false;

  selectedRating = 0;
  reviewComment = '';

  editingReviewId = '';
  editingRating = 0;
  editingComment = '';

  currentUserId = '';
  isAdmin = false;

  // =========================================
  // Deleted Review Notification
  // =========================================

  showDeletedReviewNotification = false;
  deletedReviewNotificationId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private destinationService: DestinationService,
    private reviewService: ReviewService,
    private cdr: ChangeDetectorRef
  ) {}

  // =========================================
  // INIT
  // =========================================

  ngOnInit(): void {

    this.checkUserRole();

    this.route.paramMap.subscribe(params => {

      const id = params.get('id');

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

      // Check deleted review notification
      this.getDeletedReviewNotification();

    });

  }

  // =========================================
  // CHECK USER ROLE
  // =========================================

  checkUserRole(): void {

    const token =
      localStorage.getItem(
        'accessToken'
      );

    if (!token) {

      this.currentUserId = '';

      this.isAdmin = false;

      return;
    }

    try {

      const payload = JSON.parse(
        atob(
          token
            .split('.')[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/')
        )
      );

      this.currentUserId =
        payload.id || '';

      this.isAdmin =
        payload.role === 'admin';

      console.log(
        'Current User ID:',
        this.currentUserId
      );

      console.log(
        'User Role:',
        payload.role
      );

      console.log(
        'Is Admin:',
        this.isAdmin
      );

    } catch (error) {

      console.error(
        'Invalid access token:',
        error
      );

      this.currentUserId = '';

      this.isAdmin = false;

    }

  }

  // =========================================
  // GET DESTINATION
  // =========================================

  getDestinationDetails(
    id: string
  ): void {

    this.destinationService
      .getDestinationById(id)
      .subscribe({

        next: response => {

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

        error: error => {

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

  // =========================================
  // GET REVIEWS
  // =========================================

  getReviews(
    destinationId: string
  ): void {

    this.isReviewsLoading = true;

    this.reviewError = '';

    this.reviewService
      .getReviewsByDestination(destinationId)
      .subscribe({

        next: response => {

          console.log(
            'REVIEWS RESPONSE:',
            response
          );

          this.reviews =
            response.reviews || [];

          this.isReviewsLoading = false;

          this.cdr.detectChanges();

        },

        error: error => {

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

  // =========================================
  // GET DELETED REVIEW NOTIFICATION
  // =========================================

  getDeletedReviewNotification(): void {

    const token =
      localStorage.getItem(
        'accessToken'
      );

    if (!token) {

      return;

    }

    // Admin does not need
    // deleted review notification

    if (this.isAdmin) {

      return;

    }

    this.reviewService
      .getDeletedReviewNotification()
      .subscribe({

        next: response => {

          console.log(
            'DELETED REVIEW NOTIFICATION:',
            response
          );

          if (
            response.notification
          ) {

            this.deletedReviewNotificationId =
              response.notification.reviewId;

            this.showDeletedReviewNotification =
              true;

            this.cdr.detectChanges();

          }

        },

        error: error => {

          console.error(
            'DELETED REVIEW NOTIFICATION ERROR:',
            error
          );

        }

      });

  }

  // =========================================
  // BOOK TRIP
  // =========================================

  tripNow(): void {

    const token =
      localStorage.getItem(
        'accessToken'
      );

    if (!token) {

      Swal.fire({

        icon: 'info',

        title: 'Login Required',

        text:
          'Please login before booking your trip.',

        confirmButtonText:
          'Go to Login',

        showCancelButton: true,

        cancelButtonText:
          'Cancel'

      }).then(result => {

        if (result.isConfirmed) {

          this.router.navigate([
            '/login'
          ]);

        }

      });

      return;

    }

    if (!this.destination?._id) {

      Swal.fire({

        icon: 'error',

        title: 'Destination Error',

        text:
          'Destination information is missing.'

      });

      return;

    }

    this.router.navigate([
      '/book',
      this.destination._id
    ]);

  }

  // =========================================
  // SELECT RATING
  // =========================================

  selectRating(
    rating: number
  ): void {

    this.selectedRating =
      rating;

  }

  // =========================================
  // CREATE REVIEW
  // =========================================

  submitReview(): void {

    const token =
      localStorage.getItem(
        'accessToken'
      );

    if (!token) {

      Swal.fire({

        icon: 'info',

        title: 'Login Required',

        text:
          'Please login to write a review.',

        confirmButtonText:
          'Go to Login',

        showCancelButton: true,

        cancelButtonText:
          'Cancel'

      }).then(result => {

        if (result.isConfirmed) {

          this.router.navigate([
            '/login'
          ]);

        }

      });

      return;

    }

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

        next: response => {

          console.log(
            'REVIEW CREATED:',
            response
          );

          this.reviewComment = '';

          this.selectedRating = 0;

          this.reviewError = '';

          Swal.fire({

            icon: 'success',

            title: 'Review Added',

            text:
              'Your review has been added successfully.',

            confirmButtonText:
              'OK'

          });

          this.getReviews(
            this.destination!._id!
          );

        },

        error: error => {

          console.error(
            'CREATE REVIEW ERROR:',
            error
          );

          Swal.fire({

            icon: 'error',

            title: 'Error',

            text:
              error?.error?.message ||
              'Failed to submit review.'

          });

          this.reviewError =
            error?.error?.message ||
            'Failed to submit review.';

        }

      });

  }

  // =========================================
  // START EDIT REVIEW
  // =========================================

  startEditReview(
    review: Review
  ): void {

    if (
      !review._id ||
      review.isDeleted
    ) {

      return;

    }

    this.editingReviewId =
      review._id;

    this.editingRating =
      review.Rating;

    this.editingComment =
      review.Comment || '';

  }

  // =========================================
  // CANCEL EDIT
  // =========================================

  cancelEdit(): void {

    this.editingReviewId = '';

    this.editingRating = 0;

    this.editingComment = '';

  }

  // =========================================
  // UPDATE REVIEW
  // =========================================

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

        next: response => {

          console.log(
            'REVIEW UPDATED:',
            response
          );

          this.cancelEdit();

          this.reviewError = '';

          Swal.fire({

            icon: 'success',

            title: 'Review Updated',

            text:
              'Your review has been updated successfully.',

            confirmButtonText:
              'OK'

          });

          this.getReviews(
            this.destination!._id!
          );

        },

        error: error => {

          console.error(
            'UPDATE REVIEW ERROR:',
            error
          );

          Swal.fire({

            icon: 'error',

            title: 'Error',

            text:
              error?.error?.message ||
              'Failed to update review.'

          });

          this.reviewError =
            error?.error?.message ||
            'Failed to update review.';

        }

      });

  }

  // =========================================
  // DELETE REVIEW
  // =========================================

  deleteReview(
    id: string
  ): void {

    Swal.fire({

      title:
        'Delete Review?',

      text:
        'Are you sure you want to delete this review?',

      icon:
        'warning',

      showCancelButton:
        true,

      confirmButtonText:
        'Yes, delete it',

      cancelButtonText:
        'Cancel'

    }).then(result => {

      if (
        !result.isConfirmed
      ) {

        return;

      }

      this.reviewService
        .deleteReview(id)
        .subscribe({

          next: response => {

            console.log(
              'REVIEW DELETED:',
              response
            );

            this.reviewError = '';

            Swal.fire({

              icon:
                'success',

              title:
                'Deleted',

              text:
                'The review has been deleted successfully.',

              confirmButtonText:
                'OK'

            });

            this.getReviews(
              this.destination!._id!
            );

          },

          error: error => {

            console.error(
              'DELETE REVIEW ERROR:',
              error
            );

            Swal.fire({

              icon:
                'error',

              title:
                'Error',

              text:
                error?.error?.message ||
                'Failed to delete review.'

            });

            this.reviewError =
              error?.error?.message ||
              'Failed to delete review.';

          }

        });

    });

  }

  // =========================================
  // CLOSE DELETED REVIEW NOTIFICATION
  // =========================================

  closeDeletedReviewNotification(): void {

    if (
      !this.deletedReviewNotificationId
    ) {

      this.showDeletedReviewNotification =
        false;

      return;

    }

    this.reviewService
      .markDeletedReviewNoticeRead(
        this.deletedReviewNotificationId
      )
      .subscribe({

        next: () => {

          this.showDeletedReviewNotification =
            false;

          this.deletedReviewNotificationId =
            '';

          this.cdr.detectChanges();

        },

        error: error => {

          console.error(
            'MARK DELETED REVIEW NOTICE ERROR:',
            error
          );

          // Hide it locally even if
          // the server request fails.

          this.showDeletedReviewNotification =
            false;

          this.deletedReviewNotificationId =
            '';

          this.cdr.detectChanges();

        }

      });

  }

  // =========================================
  // AVERAGE RATING
  // =========================================

  getAverageRating(): number {

    const activeReviews =
      this.reviews.filter(
        review =>
          !review.isDeleted
      );

    if (
      !activeReviews.length
    ) {

      return 0;

    }

    const total =
      activeReviews.reduce(
        (sum, review) =>
          sum + review.Rating,
        0
      );

    return (
      total /
      activeReviews.length
    );

  }

  // =========================================
  // ACTIVE REVIEWS COUNT
  // =========================================

  getActiveReviewsCount(): number {

    return this.reviews.filter(
      review =>
        !review.isDeleted
    ).length;

  }

  // =========================================
  // RATING STARS
  // =========================================

  getRatingStars(
    rating: number
  ): number[] {

    return Array.from(
      {
        length: 5
      },
      (_, index) =>
        index < rating
          ? 1
          : 0
    );

  }

  // =========================================
  // REVIEW DATE
  // =========================================

  getReviewDate(
    review: Review
  ): string {

    const date =
      review.createdAt ||
      review.CreatedAt;

    if (!date) {

      return '';

    }

    return new Date(
      date
    ).toLocaleDateString();

  }

}