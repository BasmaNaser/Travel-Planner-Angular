import { Component, inject } from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';

import { apiMessage, applyBackendErrors } from '../../core/utils/api-error.util';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;

  const confirmPassword = control.get('confirmPassword')?.value;

  if (password && confirmPassword && password !== confirmPassword) {
    return {
      passwordMismatch: true,
    };
  }

  return null;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  private fb = inject(FormBuilder);

  private authService = inject(AuthService);

  private router = inject(Router);

  loading = false;
  errorMessage = '';
  successMessage = '';

  form = this.fb.nonNullable.group(
    {
      fullName: [
        '',
        [Validators.required, Validators.pattern(/^[a-zA-Z]{3,20}(( )[a-zA-Z]{3,20}){1,4}$/)],
      ],

      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/),
        ],
      ],

      phone: ['', [Validators.required, Validators.pattern(/^(01)(1|2|0|5)[0-9]{8}$/)]],

      dob: ['', [Validators.required]],

      password: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@%$&*^#])[a-zA-Z0-9@%$&*^#]{8,}$/,
          ),
        ],
      ],

      confirmPassword: ['', [Validators.required]],
    },
    {
      validators: passwordMatchValidator,
    },
  );

  // =========================================================
  // GETTERS
  // =========================================================

  get fullName() {
    return this.form.controls.fullName;
  }

  get email() {
    return this.form.controls.email;
  }

  get phone() {
    return this.form.controls.phone;
  }

  get dob() {
    return this.form.controls.dob;
  }

  get password() {
    return this.form.controls.password;
  }

  get confirmPassword() {
    return this.form.controls.confirmPassword;
  }

  // =========================================================
  // FIELD ERRORS
  // =========================================================

  fieldError(field: string): string {
    const control = this.form.get(field);

    if (!control || !control.touched || !control.errors) {
      return '';
    }

    if (control.errors['userExists']) {
      if (field === 'email') {
        return 'User already exists in email.';
      }

      if (field === 'phone') {
        return 'User already exists with this phone number.';
      }
    }

    if (control.errors['backend']) {
      return control.errors['backend'];
    }

    if (control.errors['required']) {
      switch (field) {
        case 'fullName':
          return 'Full Name is required.';

        case 'email':
          return 'Email is required.';

        case 'phone':
          return 'Phone Number is required.';

        case 'dob':
          return 'Date of birth is required.';

        case 'password':
          return 'Password is required.';

        case 'confirmPassword':
          return 'Confirm Password is required.';
      }
    }

    if (control.errors['pattern']) {
      switch (field) {
        case 'fullName':
          return 'Please enter a valid full name.';

        case 'email':
          return 'Please enter a valid Gmail address.';

        case 'phone':
          return 'Please enter a valid Egyptian phone number.';

        case 'password':
          return 'Password must contain at least 8 characters, uppercase, lowercase, number and special character.';
      }
    }

    if (field === 'confirmPassword' && control.errors['passwordMismatch']) {
      return 'Passwords do not match.';
    }

    return '';
  }

  // =========================================================
  // REMOVE OLD DUPLICATE ERRORS
  // =========================================================

  private clearDuplicateErrors(): void {
    const controls = [this.email, this.phone];

    controls.forEach((control) => {
      if (!control.errors) {
        return;
      }

      const errors = {
        ...control.errors,
      };

      delete errors['userExists'];

      control.setErrors(Object.keys(errors).length > 0 ? errors : null);
    });
  }

  // =========================================================
  // SUBMIT
  // =========================================================

  submit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.clearDuplicateErrors();

    if (this.form.invalid) {
      this.form.markAllAsTouched();

      console.log('[Signup Page] Form validation failed:', this.form.errors, this.form.value);

      return;
    }

    this.loading = true;

    const email = this.email.value.trim().toLowerCase();

    const phone = this.phone.value.trim();

    // =======================================================
    // CHECK ALL USERS + ADMINS BEFORE SIGNUP
    // =======================================================

    console.log('[Signup Page] Checking existing users and admins before signup...');

    this.authService.getAllUsers().subscribe({
      next: (response) => {
        console.log('[Signup Page] GET /users/All success:', response);

        const users = Array.isArray(response?.data) ? response.data : [];

        console.log('[Signup Page] Users and admins received:', users);

        // ===================================================
        // CHECK EMAIL
        // ===================================================

        const emailExists = users.some((user: any) => {
          const existingEmail = String(user?.email ?? '')
            .trim()
            .toLowerCase();

          return existingEmail === email;
        });

        if (emailExists) {
          this.loading = false;

          this.email.setErrors({
            ...(this.email.errors ?? {}),
            userExists: true,
          });

          this.email.markAsTouched();

          console.log('[Signup Page] Email already exists. Signup request was not sent.');

          return;
        }

        // ===================================================
        // CHECK PHONE
        // ===================================================

        const phoneExists = users.some((user: any) => {
          const existingPhone = String(user?.phone ?? '').trim();

          return existingPhone === phone;
        });

        if (phoneExists) {
          this.loading = false;

          this.phone.setErrors({
            ...(this.phone.errors ?? {}),
            userExists: true,
          });

          this.phone.markAsTouched();

          console.log('[Signup Page] Phone already exists. Signup request was not sent.');

          return;
        }

        // ===================================================
        // EMAIL + PHONE AVAILABLE
        // ===================================================

        console.log('[Signup Page] Email and phone are available. Sending signup request...');

        this.createAccount();
      },

      error: (error) => {
        console.error('[Signup Page] GET /users/All error:', error);

        this.loading = false;

        this.errorMessage = apiMessage(error, 'Unable to check email and phone availability.');
      },
    });
  }

  // =========================================================
  // CREATE ACCOUNT
  // =========================================================

  private createAccount(): void {
    const signupData = {
      fullName: this.fullName.value.trim(),

      email: this.email.value.trim().toLowerCase(),

      phone: this.phone.value.trim(),

      dob: this.dob.value,

      password: this.password.value,
    };

    console.log('[Signup Page] Signup payload:', {
      ...signupData,
      password: '********',
    });

    this.authService.signup(signupData).subscribe({
      // ===================================================
      // SIGNUP SUCCESS
      // ===================================================

      next: (signupResponse) => {
        console.log('[Signup Page] Signup success:', signupResponse);

        this.loading = false;

        this.successMessage =
          signupResponse?.message || 'Account created successfully. Please verify your email.';

        this.authService.setPendingVerificationEmail(signupData.email);

        this.router.navigate(['/verify-otp'], {
          queryParams: {
            email: signupData.email,
          },
        });
      },

      // ===================================================
      // SIGNUP ERROR
      // ===================================================

      error: (error) => {
        console.error('[Signup Page] Signup API error:', error);

        this.loading = false;

        const backendMessage = String(error?.error?.message || error?.message || '');

        const normalizedMessage = backendMessage.toLowerCase();

        // =================================================
        // EMAIL ALREADY EXISTS
        // =================================================

        if (error?.status === 409 && normalizedMessage.includes('email already exists')) {
          this.email.setErrors({
            ...(this.email.errors ?? {}),
            userExists: true,
          });

          this.email.markAsTouched();

          return;
        }

        // =================================================
        // PHONE ALREADY EXISTS
        // =================================================

        if (
          error?.status === 409 &&
          (normalizedMessage.includes('phone already exists') ||
            normalizedMessage.includes('phone number already exists') ||
            normalizedMessage.includes('mobile already exists'))
        ) {
          this.phone.setErrors({
            ...(this.phone.errors ?? {}),
            userExists: true,
          });

          this.phone.markAsTouched();

          return;
        }

        // =================================================
        // OTHER BACKEND FIELD ERRORS
        // =================================================

        const mappedMessage = applyBackendErrors(this.form, error);

        if (mappedMessage) {
          this.errorMessage = mappedMessage;

          return;
        }

        // =================================================
        // GENERAL BACKEND ERROR
        // =================================================

        this.errorMessage = apiMessage(error, 'Something went wrong. Please try again.');
      },
    });
  }
}
