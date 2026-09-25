import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { UserService } from '../../core/services/user.service';

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

  user: any = null;

  loading = true;
  editMode = false;

  errorMessage = '';
  successMessage = '';

  selectedImage: File | null = null;
  imagePreview: string | null = null;

  uploadingImage = false;
  deletingImage = false;

  form = this.fb.group({

    fullName: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.pattern(
        /^[a-zA-Z]{3,20}(( )[a-zA-Z]{3,20}){1,4}$/
      )
    ]),

    gender: this.fb.control<
      'Male' | 'Female' | 'Other' | undefined
    >(undefined),

    about: this.fb.nonNullable.control('', [
      Validators.maxLength(1000)
    ]),

    userLocation: this.fb.nonNullable.control(''),

    dob: this.fb.nonNullable.control('')
  });

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

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.errorMessage = '';

    this.userService.getProfile().subscribe({
      next: (response: any) => {
        this.loading = false;

        this.user = response?.data;

        this.patchForm();
      },

      error: (error) => {
        this.loading = false;

        this.errorMessage =
          error?.error?.message ||
          'Unable to load profile.';
      }
    });
  }

  patchForm(): void {

    if (!this.user) {
      return;
    }

    this.form.patchValue({

      fullName: this.user.fullName || '',

      gender: this.user.gender || undefined,

      about: this.user.about || '',

      userLocation: this.user.userLocation || '',

      dob: this.user.dob
        ? this.user.dob.substring(0, 10)
        : ''
    });
  }

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

  updateProfile(): void {

  this.errorMessage = '';
  this.successMessage = '';

  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const formValue = this.form.getRawValue();

  const profileData = {
    ...formValue,
    gender: formValue.gender ?? undefined
  };

  this.userService
    .updateProfile(profileData)
    .subscribe({

      next: (response: any) => {

        this.user = response?.data || {
          ...this.user,
          ...formValue
        };

        this.editMode = false;

        this.successMessage =
          response?.message ||
          'Profile updated successfully.';
      },

      error: (error) => {

        this.errorMessage =
          error?.error?.message ||
          'Unable to update profile.';
      }
    });
}

  onImageSelected(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    this.selectedImage = file;

    const reader = new FileReader();

    reader.onload = () => {

      this.imagePreview =
        reader.result as string;
    };

    reader.readAsDataURL(file);
  }

  uploadProfilePicture(): void {

    if (!this.selectedImage) {
      return;
    }

    this.uploadingImage = true;

    this.errorMessage = '';
    this.successMessage = '';

    this.userService
      .uploadProfilePicture(this.selectedImage)
      .subscribe({

        next: (response: any) => {

          this.uploadingImage = false;

          this.user = response?.data || this.user;

          this.selectedImage = null;
          this.imagePreview = null;

          this.successMessage =
            response?.message ||
            'Profile picture updated successfully.';
        },

        error: (error) => {

          this.uploadingImage = false;

          this.errorMessage =
            error?.error?.message ||
            'Unable to upload profile picture.';
        }
      });
  }

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

        error: (error) => {

          this.deletingImage = false;

          this.errorMessage =
            error?.error?.message ||
            'Unable to delete profile picture.';
        }
      });
  }

  deleteAccount(): void {

    const confirmed = confirm(
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

        error: (error) => {

          this.errorMessage =
            error?.error?.message ||
            'Unable to delete account.';
        }
      });
  }

  togglePasswordSection(): void {

    this.showPasswordSection =
      !this.showPasswordSection;

    this.passwordErrorMessage = '';
    this.passwordSuccessMessage = '';

    if (!this.showPasswordSection) {
      this.resetPasswordForm();
    }
  }

  cancelPasswordChange(): void {

    this.showPasswordSection = false;

    this.passwordErrorMessage = '';
    this.passwordSuccessMessage = '';

    this.resetPasswordForm();
  }

  resetPasswordForm(): void {

    this.passwordForm.reset();

    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
  }

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

  changePassword(): void {

    this.passwordErrorMessage = '';
    this.passwordSuccessMessage = '';

    if (this.passwordForm.invalid) {

      this.passwordForm.markAllAsTouched();

      return;
    }

    if (
      this.passwordForm.controls.newPassword.value !==
      this.passwordForm.controls.confirmPassword.value
    ) {

      this.passwordErrorMessage =
        'New password and confirmation password do not match.';

      return;
    }

    this.changingPassword = true;

    const passwordData = {

      currentPassword:
        this.passwordForm.controls.currentPassword.value,

      newPassword:
        this.passwordForm.controls.newPassword.value
    };

    this.userService
      .changePassword(passwordData)
      .subscribe({

        next: (response: any) => {

          this.changingPassword = false;

          this.passwordForm.reset();

          this.showCurrentPassword = false;
          this.showNewPassword = false;
          this.showConfirmPassword = false;

          this.showPasswordSection = false;

          this.passwordSuccessMessage =
            response?.message ||
            'Password changed successfully.';
        },

        error: (error) => {

          this.changingPassword = false;

          this.passwordErrorMessage =
            error?.error?.message ||
            'Unable to change password.';
        }
      });
  }

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