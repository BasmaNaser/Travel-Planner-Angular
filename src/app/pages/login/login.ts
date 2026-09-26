
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


@Component({
  selector: 'app-login',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,RouterLink
  ],

  templateUrl: './login.html',

  styleUrl: './login.css'
})
export class Login {

  private fb =
    inject(FormBuilder);

  private authService =
    inject(AuthService);

  private router =
    inject(Router);


  loading = false;

  errorMessage = '';

  successMessage = '';

  showPassword = false;


  // =========================================================
  // FORM
  // =========================================================

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
    ],


    password: [
      '',
      [
        Validators.required
      ]
    ]

  });


  // =========================================================
  // GETTERS
  // =========================================================

  get email() {
    return this.form.controls.email;
  }


  get password() {
    return this.form.controls.password;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }


  // =========================================================
  // FIELD ERRORS
  // =========================================================

  fieldError(
    field: string
  ): string {

    const control =
      this.form.get(field);


    if (
      !control ||
      !control.touched ||
      !control.errors
    ) {
      return '';
    }

    if (
  field === 'email' &&
  control.errors['userNotFound']
) {
  return 'User not found. Please sign up first.';
}
    // =======================================================
    // WRONG EMAIL OR PASSWORD
    // =======================================================

    if (
      control.errors['invalidCredentials'] &&
      field === 'password'
    ) {

      return 'Email or password is incorrect.';

    }


    // =======================================================
    // BACKEND FIELD ERROR
    // =======================================================

    if (
      control.errors['backend']
    ) {

      return control.errors['backend'];

    }


    // =======================================================
    // REQUIRED
    // =======================================================

    if (
      control.errors['required']
    ) {

      switch (field) {

        case 'email':
          return 'Email is required.';

        case 'password':
          return 'Password is required.';
      }

    }


    // =======================================================
    // EMAIL PATTERN
    // =======================================================

    if (
      control.errors['pattern']
    ) {

      if (
        field === 'email'
      ) {

        return 'Please enter a valid Gmail address.';

      }

    }


    return '';
  }


  // =========================================================
  // CLEAR LOGIN ERROR
  // =========================================================

  private clearInvalidCredentialsError(): void {

    if (
      !this.password.errors
    ) {
      return;
    }


    const errors = {
      ...this.password.errors
    };


    delete errors['invalidCredentials'];


    this.password.setErrors(
      Object.keys(errors).length > 0
        ? errors
        : null
    );

  }


  // =========================================================
  // SUBMIT
  // =========================================================

  login(): void {

    this.errorMessage = '';

    this.successMessage = '';


    // Remove previous "Email or password is incorrect"
    // before trying login again.

    this.clearInvalidCredentialsError();


    // =======================================================
    // FRONTEND VALIDATION
    // =======================================================

    if (
      this.form.invalid
    ) {

      this.form.markAllAsTouched();


      console.log(
        '[Login Page] Form validation failed:',
        this.form.errors,
        this.form.value
      );


      return;
    }


    this.loading = true;


    const email =
      this.email.value
        .trim()
        .toLowerCase();


    const password =
      this.password.value;


    const loginData = {

      email,

      password

    };


    console.log(
      '[Login Page] Login payload:',
      {
        email,
        password: '********'
      }
    );


    // =======================================================
    // LOGIN API
    // =======================================================

    this.authService
      .login(loginData)
      .subscribe({

        // ===================================================
        // LOGIN SUCCESS
        // ===================================================

        next: (response: any) => {

          console.log(
            '[Login Page] Login success:',
            response
          );


          this.loading = false;


          this.successMessage =
            response?.message ||
            'Login successful.';


          // =================================================
          // GET CURRENT USER
          // =================================================

          const currentUser =
            this.authService.getCurrentUser();


          console.log(
            '[Login Page] Current user:',
            currentUser
          );


          // =================================================
          // ADMIN
          // =================================================

          if (
            currentUser?.role === 'admin'
          ) {

            console.log(
              '[Login Page] Redirecting to admin dashboard...'
            );


            this.router.navigate([
              '/admin'
            ]);


            return;
          }


          // =================================================
          // NORMAL USER
          // =================================================

          console.log(
            '[Login Page] Redirecting to home...'
          );


          this.router.navigate([
            '/home'
          ]);

        },


        // ===================================================
        // LOGIN ERROR
        // ===================================================

error: (error) => {

  // Stop loading for every error
  this.loading = false;

  console.error(
    '[Login Page] Login API error:',
    error
  );


  // Get backend message
  const backendMessage = String(
    error?.error?.message ??
    error?.error ??
    error?.message ??
    ''
  ).trim();


  const normalizedMessage =
    backendMessage.toLowerCase();


  console.log(
    '[Login Page] Backend message:',
    backendMessage
  );

  console.log(
    '[Login Page] Status:',
    error?.status
  );


  // ================================================
  // USER NOT FOUND
  // ================================================

  if (
    error?.status === 404 &&
    normalizedMessage.includes('user not found')
  ) {

    // Remove old password error
    if (this.password.errors) {

      const passwordErrors = {
        ...this.password.errors
      };

      delete passwordErrors['invalidCredentials'];

      this.password.setErrors(
        Object.keys(passwordErrors).length > 0
          ? passwordErrors
          : null
      );
    }


    // Put error under EMAIL
    this.email.setErrors({

      ...(this.email.errors ?? {}),

      userNotFound: true

    });


    this.email.markAsTouched();


    return;
  }


  // ================================================
  // WRONG PASSWORD
  // ================================================

  if (
    error?.status === 401 ||
    normalizedMessage.includes('incorrect') ||
    normalizedMessage.includes('invalid credentials') ||
    normalizedMessage.includes('email or password') ||
    normalizedMessage.includes('wrong password')
  ) {

    this.password.setErrors({

      ...(this.password.errors ?? {}),

      invalidCredentials: true

    });


    this.password.markAsTouched();


    return;
  }


  // ================================================
  // OTHER BACKEND ERRORS
  // ================================================

  const mappedMessage =
    applyBackendErrors(
      this.form,
      error
    );


  if (mappedMessage) {

    this.errorMessage =
      mappedMessage;

    return;
  }


  // ================================================
  // GENERAL ERROR
  // ================================================

  this.errorMessage =
    apiMessage(
      error,
      'Something went wrong. Please try again.'
    );

}


        });

  }

}
