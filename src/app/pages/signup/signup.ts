import {
  Component,
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


// =========================================================
// PASSWORD MATCH VALIDATOR
// =========================================================

function passwordMatchValidator(
  control: AbstractControl
): ValidationErrors | null {

  const password =
    control.get('password')?.value;

  const confirmPassword =
    control.get('confirmPassword')?.value;

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


// =========================================================
// COMPONENT
// =========================================================

@Component({
  selector: 'app-signup',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],

  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class Signup {

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

  showConfirmPassword = false;


  // =========================================================
  // FORM
  // =========================================================

  form = this.fb.nonNullable.group({

    fullName: [
      '',
      [
        Validators.required,
        Validators.pattern(
          /^[a-zA-Z]{3,20}(( )[a-zA-Z]{3,20}){1,4}$/
        )
      ]
    ],

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

    phone: [
      '',
      [
        Validators.required,
        Validators.pattern(
          /^(01)(1|2|0|5)[0-9]{8}$/
        )
      ]
    ],

    dob: [
      '',
      [
        Validators.required
      ]
    ],

    password: [
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

  }, {
    validators: passwordMatchValidator
  });


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
  // PASSWORD VISIBILITY
  // =========================================================

  togglePassword(): void {

    this.showPassword =
      !this.showPassword;
  }


  toggleConfirmPassword(): void {

    this.showConfirmPassword =
      !this.showConfirmPassword;
  }


  // =========================================================
  // FIELD ERROR
  // =========================================================

  fieldError(field: string): string {

    const control =
      this.form.get(field);

    if (
      !control ||
      !control.errors
    ) {
      return '';
    }


    // =======================================================
    // REQUIRED
    // =======================================================

    if (control.errors['required']) {

      switch (field) {

        case 'fullName':
          return 'Full name is required.';

        case 'email':
          return 'Email is required.';

        case 'phone':
          return 'Phone number is required.';

        case 'dob':
          return 'Date of birth is required.';

        case 'password':
          return 'Password is required.';

        case 'confirmPassword':
          return 'Please confirm your password.';
      }
    }


    // =======================================================
    // EMAIL ALREADY REGISTERED
    // =======================================================

    if (
      field === 'email' &&
      (
        control.errors['emailAlreadyRegistered'] ||
        control.errors['userExists']
      )
    ) {

      return 'Email already registered. Please use another email.';
    }


    // =======================================================
    // PHONE ALREADY REGISTERED
    // =======================================================

    if (
      field === 'phone' &&
      (
        control.errors['phoneAlreadyRegistered'] ||
        control.errors['userExists']
      )
    ) {

      return 'Phone already registered. Please use another phone number.';
    }


    // =======================================================
    // FULL NAME
    // =======================================================

    if (
      field === 'fullName' &&
      control.errors['pattern']
    ) {

      return 'Please enter a valid full name.';
    }


    // =======================================================
    // EMAIL
    // =======================================================

    if (
      field === 'email' &&
      control.errors['pattern']
    ) {

      return 'Please enter a valid Gmail address.';
    }


    // =======================================================
    // PHONE
    // =======================================================

    if (
      field === 'phone' &&
      control.errors['pattern']
    ) {

      return 'Please enter a valid Egyptian phone number.';
    }


    // =======================================================
    // PASSWORD
    // =======================================================

    if (
      field === 'password' &&
      control.errors['pattern']
    ) {

      return 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character (@ % $ & * ^ #).';
    }


    // =======================================================
    // CONFIRM PASSWORD
    // =======================================================

    if (
      field === 'confirmPassword' &&
      control.errors['passwordMismatch']
    ) {

      return 'Passwords do not match.';
    }


    // =======================================================
    // BACKEND VALIDATION
    // =======================================================

    if (
      control.errors['serverError']
    ) {

      return control.errors['serverError'];
    }


    return '';
  }


  // =========================================================
  // CLEAR DUPLICATE ERRORS
  // =========================================================

  private clearDuplicateErrors(): void {

    const controls = [
      this.email,
      this.phone
    ];


    controls.forEach(control => {

      if (!control.errors) {
        return;
      }


      const errors = {
        ...control.errors
      };


      delete errors['userExists'];

      delete errors['phoneAlreadyRegistered'];

      delete errors['emailAlreadyRegistered'];

      delete errors['serverError'];


      control.setErrors(
        Object.keys(errors).length > 0
          ? errors
          : null
      );

    });

  }


  // =========================================================
  // SUBMIT
  // =========================================================

  submit(): void {

    this.errorMessage = '';

    this.successMessage = '';

    this.clearDuplicateErrors();


    // =======================================================
    // ANGULAR VALIDATION
    // =======================================================

    if (
      this.form.invalid
    ) {

      this.form.markAllAsTouched();

      return;
    }


    this.loading = true;


    const email =
      this.email.value
        .trim()
        .toLowerCase();


    const phone =
      this.phone.value
        .trim();


    // =======================================================
    // CHECK EXISTING USERS
    // =======================================================

    this.authService
      .getAllUsers()
      .subscribe({

        next: (response: any) => {

          const users =
            Array.isArray(response?.data)
              ? response.data
              : [];


          // =================================================
          // CHECK EMAIL
          // =================================================

          const emailExists =
            users.some(
              (user: any) => {

                const existingEmail =
                  String(
                    user?.email ?? ''
                  )
                    .trim()
                    .toLowerCase();

                return existingEmail === email;
              }
            );


          if (emailExists) {

            this.loading = false;

            this.email.setErrors({

              ...(this.email.errors ?? {}),

              emailAlreadyRegistered: true

            });

            this.email.markAsTouched();

            return;
          }


          // =================================================
          // CHECK PHONE
          // =================================================

          const phoneExists =
            users.some(
              (user: any) => {

                const existingPhone =
                  String(
                    user?.phone ?? ''
                  )
                    .trim();

                return existingPhone === phone;
              }
            );


          if (phoneExists) {

            this.loading = false;

            this.phone.setErrors({

              ...(this.phone.errors ?? {}),

              phoneAlreadyRegistered: true

            });

            this.phone.markAsTouched();

            return;
          }


          // =================================================
          // CREATE ACCOUNT
          // =================================================

          this.createAccount();
        },


        // ===================================================
        // GET USERS ERROR
        // ===================================================

        error: (error) => {

          console.error(
            '[Signup Page] GET /users error:',
            error
          );

          this.loading = false;

          this.errorMessage =
            apiMessage(
              error,
              'Unable to check existing users. Please try again.'
            );
        }

      });
  }


  // =========================================================
  // CREATE ACCOUNT
  // =========================================================

  private createAccount(): void {

    const signupData = {

      fullName:
        this.fullName.value
          .trim(),

      email:
        this.email.value
          .trim()
          .toLowerCase(),

      phone:
        this.phone.value
          .trim(),

      dob:
        this.dob.value,

      password:
        this.password.value
    };


    console.log(
      '[Signup Page] Signup payload:',
      {
        ...signupData,
        password: '********'
      }
    );


    this.authService
      .signup(signupData)
      .subscribe({

        // ===================================================
        // SUCCESS
        // ===================================================

        next: (signupResponse: any) => {

          console.log(
            '[Signup Page] Signup success:',
            signupResponse
          );


          this.loading = false;


          this.successMessage =
            signupResponse?.message ||
            'Account created successfully. Please verify your email.';


          this.authService
            .setPendingVerificationEmail(
              signupData.email
            );


          this.router.navigate(
            ['/verify-otp'],
            {
              queryParams: {
                email: signupData.email
              }
            }
          );
        },


        // ===================================================
        // SIGNUP API ERROR
        // ===================================================

        error: (error) => {

          console.error(
            '[Signup Page] Signup API error:',
            error
          );


          // IMPORTANT:
          // Stop loading immediately

          this.loading = false;


          // =================================================
          // GET BACKEND MESSAGE
          // =================================================

          const backendMessage =
            String(
              error?.error?.message ??
              error?.error ??
              error?.message ??
              ''
            ).trim();


          const normalizedMessage =
            backendMessage.toLowerCase();


          console.log(
            '[Signup Page] Backend message:',
            backendMessage
          );


          // =================================================
          // PHONE ALREADY REGISTERED
          // =================================================

          if (
            normalizedMessage.includes(
              'phone already registered'
            ) ||

            normalizedMessage.includes(
              'phone already exists'
            ) ||

            normalizedMessage.includes(
              'phone number already registered'
            ) ||

            normalizedMessage.includes(
              'phone number already exists'
            ) ||

            normalizedMessage.includes(
              'mobile already registered'
            ) ||

            normalizedMessage.includes(
              'mobile already exists'
            )
          ) {

            console.log(
              '[Signup Page] Phone already registered.'
            );


            this.phone.setErrors({

              ...(this.phone.errors ?? {}),

              phoneAlreadyRegistered: true

            });


            this.phone.markAsTouched();


            return;
          }


          // =================================================
          // EMAIL ALREADY REGISTERED
          // =================================================

          if (
            normalizedMessage.includes(
              'email already registered'
            ) ||

            normalizedMessage.includes(
              'email already exists'
            )
          ) {

            console.log(
              '[Signup Page] Email already registered.'
            );


            this.email.setErrors({

              ...(this.email.errors ?? {}),

              emailAlreadyRegistered: true

            });


            this.email.markAsTouched();


            return;
          }


          // =================================================
          // OTHER BACKEND FIELD ERRORS
          // =================================================

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


          // =================================================
          // GENERAL ERROR
          // =================================================

          this.errorMessage =
            apiMessage(
              error,
              'Something went wrong. Please try again.'
            );
        }

      });
  }

}