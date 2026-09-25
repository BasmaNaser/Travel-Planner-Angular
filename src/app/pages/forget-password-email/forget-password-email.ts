import {
  Component,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  RouterLink
} from '@angular/router';

import {
  AuthService
} from '../../services/auth.service';

import {
  apiMessage,
  applyBackendErrors
} from '../../core/utils/api-error.util';


@Component({
  selector: 'app-forget-password-email',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],

  templateUrl:
    './forget-password-email.html',

  styleUrl:
    './forget-password-email.css'
})
export class ForgetPasswordEmail {

  private fb =
    inject(FormBuilder);

  private authService =
    inject(AuthService);


  loading = false;

  successMessage = '';

  errorMessage = '';


  form = this.fb.nonNullable.group({

    email: [
      '',
      [
        Validators.required,

        Validators.email,

        Validators.pattern(
          /^[a-zA-Z0-9._%+-]+@gmail\.com$/
        )
      ]
    ]

  });


  get email() {
    return this.form.controls.email;
  }


  fieldError(): string {

    if (
      !this.email.touched ||
      !this.email.errors
    ) {
      return '';
    }


    if (this.email.errors['backend']) {
      return this.email.errors['backend'];
    }


    if (this.email.errors['required']) {
      return 'Email is required.';
    }


    if (
      this.email.errors['email'] ||
      this.email.errors['pattern']
    ) {
      return 'Enter a valid Gmail address.';
    }


    return '';
  }


  submit(): void {

    this.successMessage = '';

    this.errorMessage = '';


    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;
    }


    this.loading = true;


    const email =
      this.email.value
        .trim()
        .toLowerCase();


    console.log(
      '[Forgot Password] Sending request:',
      { email }
    );


    this.authService
      .forgotPassword({ email })
      .subscribe({

        next: (response) => {

          console.log(
            '[Forgot Password] Success:',
            response
          );


          this.loading = false;


          this.successMessage =
            response?.message ||
            'Password reset link sent. Check your email.';


          sessionStorage.setItem(
            'forgotPasswordEmail',
            email
          );

        },


        error: (error) => {

          console.error(
            '[Forgot Password] API error:',
            error
          );


          this.loading = false;


          const mappedMessage =
            applyBackendErrors(
              this.form,
              error
            );


          this.errorMessage =
            mappedMessage ||
            apiMessage(
              error,
              'Unable to send reset link.'
            );

        }

      });

  }

}