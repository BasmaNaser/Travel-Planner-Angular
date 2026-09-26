import {
  CommonModule
} from '@angular/common';

import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  Navbar
} from '../../components/navbar/navbar';

import {
  Footer
} from '../../components/footer/footer';

import {
  UserService
} from '../../core/services/user.service';

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

  private readonly fb =
    inject(FormBuilder);

  private readonly userService =
    inject(UserService);

  private readonly bookingService =
    inject(BookingService);

  private readonly cdr =
    inject(ChangeDetectorRef);


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

    fullName:
      this.fb.nonNullable.control(
        '',
        [
          Validators.required,

          Validators.pattern(
            /^[a-zA-Z]{3,20}(( )[a-zA-Z]{3,20}){1,4}$/
          )
        ]
      ),

    gender:
      this.fb.control<
        'Male' |
        'Female' |
        'Other' |
        undefined
      >(undefined),

    about:
      this.fb.nonNullable.control(
        '',
        [
          Validators.maxLength(1000)
        ]
      ),

    userLocation:
      this.fb.nonNullable.control(''),

    dob:
      this.fb.nonNullable.control('')

  });


  // =========================
  // CHANGE PASSWORD
  // =========================

  passwordForm =
    this.fb.nonNullable.group({

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
  // SAVING
  // =========================

  saving = false;


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

    this.cdr.detectChanges();


    this.userService
      .getProfile()
      .subscribe({

        next: (response: any) => {

          this.loading = false;

          this.user =
            response?.data || null;


          if (this.user?.profilePicture) {

            this.user.profilePicture =
              this.normalizeProfileImage(
                this.user.profilePicture
              );

          }


          this.patchForm();


          this.cdr.detectChanges();

        },


        error: (error: any) => {

          this.loading = false;

          this.errorMessage =
            error?.error?.message ||
            'Unable to load profile.';


          this.cdr.detectChanges();

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


    // Make Edit Mode appear
    // immediately on first click.
    this.cdr.detectChanges();

  }


  cancelEdit(): void {

    this.editMode = false;

    this.errorMessage = '';

    this.successMessage = '';


    this.patchForm();


    // Update UI immediately.
    this.cdr.detectChanges();

  }


  // =========================
  // UPDATE PROFILE
  // =========================

  updateProfile(): void {

    this.errorMessage = '';

    this.successMessage = '';


    if (this.form.invalid) {

      this.form.markAllAsTouched();

      this.cdr.detectChanges();

      return;

    }


    const formValue =
      this.form.getRawValue();


    const profileData = {

      ...formValue,

      gender:
        formValue.gender ?? undefined

    };


    this.saving = true;

    this.cdr.detectChanges();


    this.userService
      .updateProfile(profileData)
      .subscribe({

        next: (response: any) => {

          this.saving = false;


          /*
           * Update the local user immediately.
           */

          this.user = {

            ...(this.user || {}),

            ...(response?.data || formValue)

          };


          /*
           * Update form with the new
           * values returned from backend.
           */

          this.patchForm();


          /*
           * Close edit mode immediately.
           */

          this.editMode = false;


          this.successMessage =
            response?.message ||
            'Profile updated successfully.';


          /*
           * VERY IMPORTANT:
           * Force Angular to render the
           * new data immediately.
           */

          this.cdr.detectChanges();

        },


        error: (error: any) => {

          this.saving = false;

          this.errorMessage =
            error?.error?.message ||
            'Unable to update profile.';


          this.cdr.detectChanges();

        }

      });

  }


  // =========================
  // IMAGE MODAL
  // =========================

  private normalizeProfileImage(
    url: string | null | undefined,
    cacheBust = false
  ): string {

    if (!url) {

      return '';

    }


    const fullUrl =
      url.startsWith('http')
        ? url
        : `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`;


    if (!cacheBust) {

      return fullUrl;

    }


    const separator =
      fullUrl.includes('?')
        ? '&'
        : '?';


    return `${fullUrl}${separator}v=${Date.now()}`;

  }


  getProfileImageUrl(): string {

    return this.normalizeProfileImage(
      this.user?.profilePicture
    );

  }


  openImage(
    imageUrl: string | null
  ): void {

    if (!imageUrl) {

      return;

    }


    this.selectedImageUrl =
      imageUrl;

    this.showImageModal = true;


    this.cdr.detectChanges();

  }


  closeImage(): void {

    this.showImageModal = false;

    this.selectedImageUrl = null;


    this.cdr.detectChanges();

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

    this.errorMessage = '';

    this.successMessage = '';


    const reader =
      new FileReader();


    reader.onload = () => {

      this.imagePreview =
        reader.result as string;


      /*
       * Show preview immediately.
       */

      this.cdr.detectChanges();

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


    this.cdr.detectChanges();


    this.userService
      .uploadProfilePicture(
        this.selectedImage
      )
      .subscribe({

        next: (response: any) => {

          this.uploadingImage = false;


          const returnedPicture =
            response?.data?.profilePicture ??
            response?.profilePicture ??
            this.user?.profilePicture;


          /*
           * Update image immediately.
           *
           * cacheBust=true prevents the browser
           * from showing the old cached picture.
           */

          if (this.user) {

            this.user = {

              ...this.user,

              ...(response?.data || {}),

              profilePicture:
                this.normalizeProfileImage(
                  returnedPicture,
                  true
                )

            };

          }


          this.selectedImage = null;

          this.imagePreview = null;


          this.successMessage =
            response?.message ||
            'Profile picture updated successfully.';


          /*
           * Clear file input so the same image
           * can be selected again.
           */

          const fileInput =
            document.querySelector(
              'input[type="file"]'
            ) as HTMLInputElement | null;


          if (fileInput) {

            fileInput.value = '';

          }


          /*
           * Update UI immediately.
           */

          this.cdr.detectChanges();

        },


        error: (error: any) => {

          this.uploadingImage = false;

          this.errorMessage =
            error?.error?.message ||
            'Unable to upload profile picture.';


          this.cdr.detectChanges();

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


    this.cdr.detectChanges();


    this.userService
      .deleteProfilePicture()
      .subscribe({

        next: (response: any) => {

          this.deletingImage = false;


          if (this.user) {

            this.user = {

              ...this.user,

              profilePicture: null

            };

          }


          this.selectedImage = null;

          this.imagePreview = null;


          this.successMessage =
            response?.message ||
            'Profile picture deleted successfully.';


          this.cdr.detectChanges();

        },


        error: (error: any) => {

          this.deletingImage = false;

          this.errorMessage =
            error?.error?.message ||
            'Unable to delete profile picture.';


          this.cdr.detectChanges();

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


          this.cdr.detectChanges();

        },


        error: (error: any) => {

          this.errorMessage =
            error?.error?.message ||
            'Unable to delete account.';


          this.cdr.detectChanges();

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


    this.cdr.detectChanges();

  }


  cancelPasswordChange(): void {

    this.showPasswordSection = false;

    this.passwordErrorMessage = '';

    this.passwordSuccessMessage = '';

    this.currentPasswordIncorrect = false;


    this.resetPasswordForm();


    this.cdr.detectChanges();

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


    this.cdr.detectChanges();

  }


  toggleNewPassword(): void {

    this.showNewPassword =
      !this.showNewPassword;


    this.cdr.detectChanges();

  }


  toggleConfirmPassword(): void {

    this.showConfirmPassword =
      !this.showConfirmPassword;


    this.cdr.detectChanges();

  }


  // =========================
  // CHANGE PASSWORD
  // =========================

  changePassword(): void {

    this.passwordErrorMessage = '';

    this.passwordSuccessMessage = '';

    this.currentPasswordIncorrect = false;


    if (this.passwordForm.invalid) {

      this.passwordForm.markAllAsTouched();

      this.cdr.detectChanges();

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


    if (!currentPassword) {

      this.passwordErrorMessage =
        'Please enter your current password.';

      this.currentPassword.markAsTouched();

      this.cdr.detectChanges();

      return;

    }


    if (!newPassword) {

      this.passwordErrorMessage =
        'Please enter a new password.';

      this.newPassword.markAsTouched();

      this.cdr.detectChanges();

      return;

    }


    if (!confirmPassword) {

      this.passwordErrorMessage =
        'Please confirm your new password.';

      this.confirmPassword.markAsTouched();

      this.cdr.detectChanges();

      return;

    }


    if (
      newPassword !==
      confirmPassword
    ) {

      this.passwordErrorMessage =
        'New password and confirmation password do not match.';

      this.confirmPassword.markAsTouched();

      this.cdr.detectChanges();

      return;

    }


    if (
      currentPassword ===
      newPassword
    ) {

      this.newPassword.setErrors({

        ...(this.newPassword.errors ?? {}),

        sameAsCurrent: true

      });


      this.newPassword.markAsTouched();

      this.passwordErrorMessage = '';

      this.cdr.detectChanges();

      return;

    }


    this.changingPassword = true;

    this.cdr.detectChanges();


    const passwordData = {

      currentPassword,

      newPassword

    };


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


          this.cdr.detectChanges();

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


          const normalizedMessage =
            String(message).toLowerCase();


          const currentPasswordError =
            normalizedMessage.includes(
              'current password'
            ) &&
            (
              normalizedMessage.includes(
                'incorrect'
              ) ||
              normalizedMessage.includes(
                'wrong'
              ) ||
              normalizedMessage.includes(
                'invalid'
              )
            );


          if (
            error?.status === 401 ||
            currentPasswordError
          ) {

            this.currentPasswordIncorrect =
              true;


            this.currentPassword.setErrors({

              ...(this.currentPassword.errors ?? {}),

              incorrect: true

            });


            this.currentPassword.markAsTouched();


            this.passwordErrorMessage =
              'Current password is incorrect.';


            this.cdr.detectChanges();

            return;

          }


          this.passwordErrorMessage =
            message;


          this.cdr.detectChanges();

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


          this.cdr.detectChanges();

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


          this.cdr.detectChanges();

        }

      });

  }


  // =========================
  // BOOKING DESTINATION
  // =========================

  getBookingDestination(
    booking: MyBooking
  ): any {

    return booking?.ItineraryDayID
      ?.DestinationID ?? {};

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
    booking: any
  ): string {

    return booking?.DestinationID?.Image || '';

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

    return this.passwordForm.controls
      .currentPassword;

  }


  get newPassword() {

    return this.passwordForm.controls
      .newPassword;

  }


  get confirmPassword() {

    return this.passwordForm.controls
      .confirmPassword;

  }

}
