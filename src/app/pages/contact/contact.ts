
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
  UserService
} from '../../core/services/user.service';

import {
  apiMessage,
  applyBackendErrors
} from '../../core/utils/api-error.util';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';


@Component({
  selector: 'app-contact',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,Navbar,Footer
  ],

  templateUrl: './contact.html',

  styleUrl: './contact.css'
})
export class Contact {

  private fb =
    inject(FormBuilder);

  private userService =
    inject(UserService);


  loading = false;

  successMessage = '';

  errorMessage = '';


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

        Validators.pattern(
          /^[a-z]{3,20}[0-9]{0,12}@gmail\.com$/
        )
      ]
    ],

    subject: [
      '',
      [
        Validators.required,

        Validators.minLength(3),

        Validators.maxLength(100)
      ]
    ],

    message: [
      '',
      [
        Validators.required,

        Validators.minLength(10),

        Validators.maxLength(10000)
      ]
    ]

  });


  get fullName() {
    return this.form.controls.fullName;
  }


  get email() {
    return this.form.controls.email;
  }


  get subject() {
    return this.form.controls.subject;
  }


  get message() {
    return this.form.controls.message;
  }


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


    if (control.errors['backend']) {
      return control.errors['backend'];
    }


    if (control.errors['required']) {

      if (field === 'fullName') {
        return 'Full Name is required.';
      }

      if (field === 'email') {
        return 'Email is required.';
      }

      if (field === 'subject') {
        return 'Subject is required.';
      }

      if (field === 'message') {
        return 'Message is required.';
      }

    }


    if (control.errors['pattern']) {

      if (field === 'fullName') {
        return 'Please enter a valid full name.';
      }

      if (field === 'email') {
        return 'Please enter a valid Gmail address.';
      }

    }


    if (control.errors['minlength']) {

      if (field === 'subject') {
        return 'Subject must be at least 3 characters.';
      }

      if (field === 'message') {
        return 'Message must be at least 10 characters.';
      }

    }


    if (control.errors['maxlength']) {

      if (field === 'subject') {
        return 'Subject cannot exceed 100 characters.';
      }

      if (field === 'message') {
        return 'Message cannot exceed 10000 characters.';
      }

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


    const data =
      this.form.getRawValue();


    console.log(
      '[Contact Page] Sending contact request:',
      data
    );


    this.userService
      .sendContact(data)
      .subscribe({

        next: (response) => {

          console.log(
            '[Contact Page] Contact success:',
            response
          );


          this.loading = false;


          this.successMessage =
            response?.message ||
            'Your message has been sent successfully!';


          this.form.reset();

        },


        error: (error) => {

          console.error(
            '[Contact Page] Contact API error:',
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
              'Unable to send your message.'
            );

        }

      });

  }

}
