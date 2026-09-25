import { Component, inject } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';

import { apiMessage, applyBackendErrors } from '../../core/utils/api-error.util';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);

  private authService = inject(AuthService);

  private router = inject(Router);

  loading = false;

  errorMessage = '';
  successMessage = '';

  form = this.fb.nonNullable.group({
    email: [
      '',
      [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)],
    ],

    password: ['', [Validators.required]],
  });

  get email() {
    return this.form.controls.email;
  }

  get password() {
    return this.form.controls.password;
  }

  fieldError(field: string): string {
    const control = this.form.get(field);

    if (!control || !control.touched || !control.errors) {
      return '';
    }

    if (control.errors['invalidCredentials'] && field === 'password') {
      return 'Email or password is incorrect.';
    }

    if (control.errors['backend']) {
      return control.errors['backend'];
    }

    if (control.errors['required']) {
      switch (field) {
        case 'email':
          return 'Email is required.';

        case 'password':
          return 'Password is required.';
      }
    }

    if (control.errors['pattern']) {
      if (field === 'email') {
        return 'Please enter a valid Gmail address.';
      }
    }

    return '';
  }

  private clearInvalidCredentialsError(): void {
    if (!this.password.errors) {
      return;
    }

    const errors = {
      ...this.password.errors,
    };

    delete errors['invalidCredentials'];

    this.password.setErrors(Object.keys(errors).length > 0 ? errors : null);
  }

  login(): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.clearInvalidCredentialsError();

    if (this.form.invalid) {
      this.form.markAllAsTouched();

      console.log('[Login Page] Form validation failed:', this.form.errors, this.form.value);

      return;
    }

    this.loading = true;

    const email = this.email.value.trim().toLowerCase();

    const password = this.password.value;

    const loginData = {
      email,
      password,
    };

    console.log('[Login Page] Login payload:', {
      email,
      password: '********',
    });

    this.authService.login(loginData).subscribe({
      next: (response: any) => {
        console.log('[Login Page] Login success:', response);

        this.loading = false;

        this.successMessage = response?.message || 'Login successful.';

        const currentUser = this.authService.getCurrentUser();

        console.log('[Login Page] Current user:', currentUser);

        if (currentUser?.role === 'admin') {
          console.log('[Login Page] Redirecting to admin dashboard...');

          this.router.navigate(['/admin']);

          return;
        }

        console.log('[Login Page] Redirecting to home...');

        this.router.navigate(['/home']);
      },

      error: (error) => {
        console.error('[Login Page] Login API error:', error);

        this.loading = false;

        const backendMessage = String(error?.error?.message || error?.message || '');

        const normalizedMessage = backendMessage.toLowerCase();

        if (
          error?.status === 401 ||
          (error?.status === 400 &&
            (normalizedMessage.includes('incorrect') ||
              normalizedMessage.includes('invalid credentials') ||
              normalizedMessage.includes('email or password') ||
              normalizedMessage.includes('wrong password')))
        ) {
          this.password.setErrors({
            ...(this.password.errors ?? {}),

            invalidCredentials: true,
          });

          this.password.markAsTouched();

          console.log('[Login Page] Email or password is incorrect.');

          return;
        }

        const mappedMessage = applyBackendErrors(this.form, error);

        if (mappedMessage) {
          this.errorMessage = mappedMessage;

          return;
        }

        this.errorMessage = apiMessage(error, 'Something went wrong. Please try again.');
      },
    });
  }
}
