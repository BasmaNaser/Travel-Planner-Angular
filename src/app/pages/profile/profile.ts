import { CommonModule } from '@angular/common';

import {
  Component,
  inject,
  OnInit
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';

import { UserService } from '../../core/services/user.service';

import {
  BookingService,
  MyBooking
} from '../../services/booking.services';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Navbar,
    Footer
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {

  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private bookingService = inject(BookingService);

  // =========================
  // PROFILE
  // =========================

  showImageModal = false;
  selectedImageUrl: string | null = null;

  user: any = null;

  loading = true;
  editMode = false;

  errorMessage = '';
  successMessage = '';

  // =========================
  // PROFILE IMAGE
  // =========================

  selectedImage: File | null = null;
  imagePreview: string | null = null;

  uploadingImage = false;
  deletingImage = false;

  // =========================
  // BOOKINGS
  // =========================

  bookings: MyBooking[] = [];

  bookingsLoading = false;
  bookingError = '';

  // =========================
  // PROFILE FORM
  // =========================

  form = this.fb.group({

    fullName: this.fb.nonNullable.control(
      '',
      [
        Validators.required,
        Validators.pattern(
          /^[a-zA-Z]{3,20}(( )[a-zA-Z]{3,20}){1,4}$/
        )
      ]
    ),

    gender: this.fb.control<
      'Male' | 'Female' | 'Other' | undefined
    >(undefined),

    about: this.fb.nonNullable.control(
      '',
      [
        Validators.maxLength(1000)
      ]
    ),

    userLocation: this.fb.nonNullable.control(''),

    dob: this.fb.nonNullable.control('')
  });

  // =========================
  // CHANGE PASSWORD
  // =========================

  passwordForm = this.fb.nonNullable.group({

    currentPassword: [
      '',
      [
        Validators.required
      ]
    ],

    newPassword: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@%$&*^#]).{8,}$/
        )
      ]
    ],

    confirmPassword: [
      '',
      [
        Validators.required
      ]
    ]

  });

  showPasswordSection = false;

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  changingPassword = false;

  passwordSuccessMessage = '';
  passwordErrorMessage = '';

  currentPasswordIncorrect = false;

  // =========================
  // INIT
  // =========================

  ngOnInit(): void {
    this.loadProfile();
    this.loadBookings();
  }

  // =========================
  // LOAD PROFILE
  // =========================

  loadProfile(): void {

    this.loading = true;
    this.errorMessage = '';

    this.userService.getProfile().subscribe({

      next: (response: any) => {

        this.loading = false;

        this.user = response?.data;

        this.patchForm();
      },

      error: (error: any) => {

        this.loading = false;

        this.errorMessage =
          error?.error?.message ||
          'Unable to load profile.';
      }

    });
  }

  // =========================
  // PATCH PROFILE FORM
  // =========================

  patchForm(): void {

    if (!this.user) {
      return;
    }

    this.form.patchValue({

      fullName:
        this.user.fullName || '',

      gender:
        this.user.gender || undefined,

      about:
        this.user.about || '',

      userLocation:
        this.user.userLocation || '',

      dob:
        this.user.dob
          ? this.user.dob.substring(0, 10)
          : ''

    });
  }

  // =========================
  // EDIT PROFILE
  // =========================

  enableEdit(): void {

    this.editMode = true;

    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelEdit(): void {

    this.editMode = false;

    this.errorMessage = '';
    this.successMessage = '';

    this.patchForm();
  }

  // =========================
  // UPDATE PROFILE
  // =========================

  updateProfile(): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;
    }

    const formValue =
      this.form.getRawValue();

    const profileData = {

      ...formValue,

      gender:
        formValue.gender ?? undefined

    };

    this.userService
      .updateProfile(profileData)
      .subscribe({

        next: (response: any) => {

          this.user =
            response?.data ||
            {
              ...this.user,
              ...formValue
            };

          this.editMode = false;

          this.successMessage =
            response?.message ||
            'Profile updated successfully.';
        },

        error: (error: any) => {

          this.errorMessage =
            error?.error?.message ||
            'Unable to update profile.';
        }

      });
  }

  // =========================
  // IMAGE MODAL
  // =========================

  openImage(
    imageUrl: string | null
  ): void {

    if (!imageUrl) {
      return;
    }

    this.selectedImageUrl =
      imageUrl;

    this.showImageModal = true;
  }

  closeImage(): void {

    this.showImageModal = false;

    this.selectedImageUrl = null;
  }

  // =========================
  // SELECT IMAGE
  // =========================

  onImageSelected(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    if (
      !input.files ||
      input.files.length === 0
    ) {
      return;
    }

    const file =
      input.files[0];

    this.selectedImage = file;

    const reader =
      new FileReader();

    reader.onload = () => {

      this.imagePreview =
        reader.result as string;
    };

    reader.readAsDataURL(file);
  }

  // =========================
  // UPLOAD PROFILE PICTURE
  // =========================

  uploadProfilePicture(): void {

    if (!this.selectedImage) {
      return;
    }

    this.uploadingImage = true;

    this.errorMessage = '';
    this.successMessage = '';

    this.userService
      .uploadProfilePicture(
        this.selectedImage
      )
      .subscribe({

        next: (response: any) => {

          this.uploadingImage = false;

          this.user =
            response?.data ||
            this.user;

          this.selectedImage = null;
          this.imagePreview = null;

          this.successMessage =
            response?.message ||
            'Profile picture updated successfully.';
        },

        error: (error: any) => {

          this.uploadingImage = false;

          this.errorMessage =
            error?.error?.message ||
            'Unable to upload profile picture.';
        }

      });
  }

  // =========================
  // DELETE PROFILE PICTURE
  // =========================

  deleteProfilePicture(): void {

    this.deletingImage = true;

    this.errorMessage = '';
    this.successMessage = '';

    this.userService
      .deleteProfilePicture()
      .subscribe({

        next: (response: any) => {

          this.deletingImage = false;

          if (this.user) {
            this.user.profilePicture = null;
          }

          this.selectedImage = null;
          this.imagePreview = null;

          this.successMessage =
            response?.message ||
            'Profile picture deleted successfully.';
        },

        error: (error: any) => {

          this.deletingImage = false;

          this.errorMessage =
            error?.error?.message ||
            'Unable to delete profile picture.';
        }

      });
  }

  // =========================
  // DELETE ACCOUNT
  // =========================

  deleteAccount(): void {

    const confirmed =
      confirm(
        'Are you sure you want to delete your account? This action cannot be undone.'
      );

    if (!confirmed) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.userService
      .deleteAccount()
      .subscribe({

        next: (response: any) => {

          this.successMessage =
            response?.message ||
            'Account deleted successfully.';
        },

        error: (error: any) => {

          this.errorMessage =
            error?.error?.message ||
            'Unable to delete account.';
        }

      });
  }

  // =========================
  // PASSWORD SECTION
  // =========================

  togglePasswordSection(): void {

    this.showPasswordSection =
      !this.showPasswordSection;

    this.passwordErrorMessage = '';
    this.passwordSuccessMessage = '';

    this.currentPasswordIncorrect = false;

    if (!this.showPasswordSection) {

      this.resetPasswordForm();
    }
  }

  cancelPasswordChange(): void {

    this.showPasswordSection = false;

    this.passwordErrorMessage = '';
    this.passwordSuccessMessage = '';

    this.currentPasswordIncorrect = false;

    this.resetPasswordForm();
  }

  resetPasswordForm(): void {

    this.passwordForm.reset();

    this.currentPasswordIncorrect = false;

    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
  }

  // =========================
  // PASSWORD VISIBILITY
  // =========================

  toggleCurrentPassword(): void {

    this.showCurrentPassword =
      !this.showCurrentPassword;
  }

  toggleNewPassword(): void {

    this.showNewPassword =
      !this.showNewPassword;
  }

  toggleConfirmPassword(): void {

    this.showConfirmPassword =
      !this.showConfirmPassword;
  }

  // =========================
  // CHANGE PASSWORD
  // =========================

  changePassword(): void {

    this.passwordErrorMessage = '';
    this.passwordSuccessMessage = '';

    this.currentPasswordIncorrect = false;

    // Frontend validation
    if (this.passwordForm.invalid) {

      this.passwordForm.markAllAsTouched();

      return;
    }

    const currentPassword =
      this.passwordForm.controls
        .currentPassword.value
        .trim();

    const newPassword =
      this.passwordForm.controls
        .newPassword.value;

    const confirmPassword =
      this.passwordForm.controls
        .confirmPassword.value;

    // Current password empty
    if (!currentPassword) {

      this.passwordErrorMessage =
        'Please enter your current password.';

      this.currentPassword.markAsTouched();

      return;
    }

    // New password empty
    if (!newPassword) {

      this.passwordErrorMessage =
        'Please enter a new password.';

      this.newPassword.markAsTouched();

      return;
    }

    // Confirm password empty
    if (!confirmPassword) {

      this.passwordErrorMessage =
        'Please confirm your new password.';

      this.confirmPassword.markAsTouched();

      return;
    }

    // Password mismatch
    if (
      newPassword !== confirmPassword
    ) {

      this.passwordErrorMessage =
        'New password and confirmation password do not match.';

      this.confirmPassword.markAsTouched();

      return;
    }

    // Same password
    if (
      currentPassword === newPassword
    ) {

      this.passwordErrorMessage =
        'New password must be different from your current password.';

      this.newPassword.markAsTouched();

      return;
    }

    this.changingPassword = true;

    const passwordData = {

      currentPassword,

      newPassword

    };

    // IMPORTANT:
    // Keep using the existing service method
    // exactly as before.

    this.userService
      .changePassword(passwordData)
      .subscribe({

        next: (response: any) => {

          this.changingPassword = false;

          this.passwordSuccessMessage =
            response?.message ||
            'Password changed successfully.';

          this.passwordForm.reset();

          this.currentPasswordIncorrect = false;

          this.showCurrentPassword = false;
          this.showNewPassword = false;
          this.showConfirmPassword = false;

          this.showPasswordSection = false;
        },

        error: (error: any) => {

          this.changingPassword = false;

          console.error(
            'CHANGE PASSWORD ERROR:',
            error
          );

          const message =
            error?.error?.message ||
            error?.message ||
            'Unable to change password.';

          /*
           * Backend says current password is wrong.
           */
          if (
            error?.status === 400 ||
            error?.status === 401
          ) {

            this.currentPasswordIncorrect = true;

            this.currentPassword.markAsTouched();

            this.passwordErrorMessage =
              'Current password is incorrect.';

            return;
          }

          this.passwordErrorMessage =
            message;
        }

      });
  }

  // =========================
  // BOOKINGS
  // =========================

  loadBookings(): void {

    this.bookingsLoading = true;

    this.bookingError = '';

    this.bookingService
      .getMyBookings()
      .subscribe({

        next: (response: any) => {

          console.log(
            'MY BOOKINGS:',
            response
          );

          this.bookings =
            response?.data ?? [];

          this.bookingsLoading = false;
        },

        error: (error: any) => {

          console.error(
            'GET MY BOOKINGS ERROR:',
            error
          );

          this.bookings = [];

          this.bookingError =
            error?.error?.message ||
            'Unable to load your bookings.';

          this.bookingsLoading = false;
        }

      });
  }

  // =========================
  // BOOKING DESTINATION
  // =========================

  getBookingDestination(
    booking: MyBooking
  ): any {

    return (
      booking?.ItineraryDayID
        ?.DestinationID ??
      {}
    );
  }

  // =========================
  // BOOKING STATUS CLASS
  // =========================

  getBookingStatusClass(
    status: string
  ): string {

    switch (
      (status || '').toLowerCase()
    ) {

      case 'confirmed':

        return 'booking-status confirmed';

      case 'completed':

        return 'booking-status completed';

      case 'cancelled':

        return 'booking-status cancelled';

      case 'pending':
      default:

        return 'booking-status pending';
    }
  }

  // =========================
  // BOOKING STATUS ICON
  // =========================

  getBookingStatusIcon(
    status: string
  ): string {

    switch (
      (status || '').toLowerCase()
    ) {

      case 'confirmed':

        return 'bi-check-circle-fill';

      case 'completed':

        return 'bi-check2-all';

      case 'cancelled':

        return 'bi-x-circle-fill';

      case 'pending':
      default:

        return 'bi-clock-fill';
    }
  }

  // =========================
  // BOOKING STATUS TEXT
  // =========================

  getBookingStatusText(
    status: string
  ): string {

    switch (
      (status || '').toLowerCase()
    ) {

      case 'confirmed':

        return 'Confirmed';

      case 'completed':

        return 'Completed';

      case 'cancelled':

        return 'Cancelled';

      case 'pending':
      default:

        return 'Pending';
    }
  }

  // =========================
  // BOOKING IMAGE
  // =========================

  getBookingImage(
    booking: MyBooking
  ): string {

    const destination =
      this.getBookingDestination(
        booking
      );

    const image =
      destination?.Image || '';

    if (!image) {

      return 'assets/images/destination-placeholder.jpg';
    }

    if (
      image.startsWith('http')
    ) {

      return image;
    }

    return `http://localhost:5000${
      image.startsWith('/')
        ? ''
        : '/'
    }${image}`;
  }

  // =========================
  // FORM GETTERS
  // =========================

  get fullName() {
    return this.form.controls.fullName;
  }

  get about() {
    return this.form.controls.about;
  }

  get currentPassword() {
    return this.passwordForm.controls.currentPassword;
  }

  get newPassword() {
    return this.passwordForm.controls.newPassword;
  }

  get confirmPassword() {
    return this.passwordForm.controls.confirmPassword;
  }
}