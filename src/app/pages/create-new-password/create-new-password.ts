
import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  AuthService
} from '../../services/auth.service';

import {
  apiMessage,
  applyBackendErrors
} from '../../core/utils/api-error.util';

function passwordMatchValidator(
  control: AbstractControl
): ValidationErrors | null {

  const password = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (
    password &&
    confirmPassword &&
    password !== confirmPassword
  ) {
    return {
      passwordMismatch: true
    };
  }

  return null;
}

@Component({
  selector: 'app-create-new-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './create-new-password.html',
  styleUrl: './create-new-password.css'
})
export class CreateNewPassword implements OnInit {

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  token = '';
  loading = false;
  errorMessage = '';
  successMessage = '';

  form = this.fb.nonNullable.group(
    {
      newPassword: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@%$&*^#])[a-zA-Z0-9@%$&*^#]{8,}$/
          )
        ]
      ],

      confirmPassword: [
        '',
        [
          Validators.required
        ]
      ]
    },
    {
      validators: passwordMatchValidator
    }
  );

  ngOnInit(): void {

    this.token =
      this.route.snapshot.paramMap.get('token') || '';

    if (!this.token) {
      this.router.navigate([
        '/reset-password-error'
      ]);
    }
  }

  get newPassword() {
    return this.form.controls.newPassword;
  }

  get confirmPassword() {
    return this.form.controls.confirmPassword;
  }

  fieldError(field: string): string {

    const control = this.form.get(field);

    if (
      !control ||
      !control.touched ||
      !control.errors
    ) {
      return '';
    }

    if (control.errors['backend']) {
      return control.errors['backend'];
    }

    if (control.errors['required']) {

      if (field === 'newPassword') {
        return 'New password is required.';
      }

      if (field === 'confirmPassword') {
        return 'Confirm password is required.';
      }
    }

    if (control.errors['pattern']) {
      return 'Password must contain at least 8 characters, uppercase, lowercase, number and special character.';
    }

    return '';
  }

  submit(): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.token) {
      this.router.navigate([
        '/reset-password-error'
      ]);
      return;
    }

    this.loading = true;

    const data = {
      newPassword: this.newPassword.value,
      ConfirmedNewPassword: this.confirmPassword.value
    };

    this.authService
      .resetPassword(this.token, data)
      .subscribe({

        next: (response) => {

          this.loading = false;

          this.successMessage =
            response?.message ||
            'Password reset successfully.';

          setTimeout(() => {

            this.router.navigate([
              '/reset-password-successfully'
            ]);

          }, 700);
        },

        error: (error) => {

          this.loading = false;

          const mappedMessage =
            applyBackendErrors(
              this.form,
              error
            );

          const message =
            mappedMessage ||
            apiMessage(
              error,
              'This password reset link is invalid or expired.'
            );

          this.router.navigate(
            ['/reset-password-error'],
            {
              queryParams: {
                message: message
              }
            }
          );
        }

      });
  }
}

