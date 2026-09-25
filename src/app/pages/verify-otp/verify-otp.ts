import {
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectorRef,
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


@Component({
  selector: 'app-verify-otp',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule
  ],

  templateUrl: './verify-otp.html',

  styleUrl: './verify-otp.css'
})
export class VerifyOtp
  implements OnInit, OnDestroy {
    canResend = false;
  private fb =
    inject(FormBuilder);

  private cdr = inject(ChangeDetectorRef);

  private route =
    inject(ActivatedRoute);

  private router =
    inject(Router);

  private authService =
    inject(AuthService);


  email = '';

  loading = false;

  resendLoading = false;

  successMessage = '';

  errorMessage = '';

  secondsLeft = 0;

  private timer?: ReturnType<typeof setInterval>;


  form = this.fb.nonNullable.group({

    otp: [
      '',
      [
        Validators.required,

        Validators.pattern(
          /^[0-9]{6}$/
        )
      ]
    ]

  });


  ngOnInit(): void {

    this.route.queryParamMap
      .subscribe(params => {

        this.email =
          params.get('email') ||
          this.authService
            .getPendingVerificationEmail();

      });


    this.startTimer();

  }


  ngOnDestroy(): void {

    this.clearTimer();

  }


  get otp() {
    return this.form.controls.otp;
  }


  fieldError(): string {

    if (
      !this.otp.touched ||
      !this.otp.errors
    ) {
      return '';
    }


    if (this.otp.errors['backend']) {
      return this.otp.errors['backend'];
    }


    if (this.otp.errors['required']) {
      return 'OTP is required.';
    }


    if (this.otp.errors['pattern']) {
      return 'OTP must contain exactly 6 digits.';
    }


    return '';
  }


  verifyOtp(): void {

    this.successMessage = '';

    this.errorMessage = '';


    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;
    }


    if (!this.email) {

      this.errorMessage =
        'Verification email is missing.';

      return;
    }


    this.loading = true;


    const data = {

      email:
        this.email
          .trim()
          .toLowerCase(),

      otp:
        this.otp.value.trim()

    };


    console.log(
      '[Verify OTP] Sending verify request:',
      data
    );


    this.authService
      .verifyOtp(data)
      .subscribe({

        next: (response) => {

          console.log(
            '[Verify OTP] Success:',
            response
          );


          this.loading = false;


          this.successMessage =
            response?.message ||
            'Email verified successfully.';


          this.authService
            .clearPendingVerificationEmail();


          setTimeout(() => {

            this.router.navigate(
              ['/login']
            );

          }, 800);

        },


        error: (error) => {

          console.error(
            '[Verify OTP] API error:',
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
              'Invalid or expired OTP.'
            );

        }

      });

  }


resendOtp(): void {
  this.successMessage = '';
  this.errorMessage = '';

  if (!this.email) {
    this.errorMessage = 'Email is missing.';
    return;
  }

  if (this.secondsLeft > 0 || this.resendLoading) {
    return;
  }

  this.resendLoading = true;

  const data = {
    email: this.email.trim().toLowerCase()
  };

  this.authService.resendOtp(data).subscribe({
    next: (response) => {
      this.resendLoading = false;

      this.successMessage =
        response?.message ||
        'A new OTP has been sent.';

      this.startTimer();
    },

    error: (error) => {
      this.resendLoading = false;

      this.errorMessage =
        apiMessage(
          error,
          'Unable to resend OTP.'
        );
    }
  });
}


private startTimer(): void {
  this.clearTimer();

  this.secondsLeft = 60;

  this.timer = setInterval(() => {
    this.secondsLeft--;

    this.cdr.detectChanges();

    if (this.secondsLeft <= 0) {
      this.secondsLeft = 0;

      this.clearTimer();

      this.cdr.detectChanges();
    }
  }, 1000);
}
  private clearTimer(): void {

    if (this.timer) {

      clearInterval(this.timer);

      this.timer = undefined;

    }

  }

}