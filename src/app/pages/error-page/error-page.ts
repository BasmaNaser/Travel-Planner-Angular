import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  imports: [CommonModule, RouterLink],
  selector: 'app-error-page',
  styleUrl: './error-page.css',
  templateUrl: './error-page.html',
})
export class ErrorPage {

  private readonly route = inject(ActivatedRoute);

  status = 404;

  message = 'The page or resource you requested was not found.';

  heading = 'Lost in Space?';

  constructor() {

    const status =
      Number(this.route.snapshot.queryParamMap.get('status'));

    const message =
      this.route.snapshot.queryParamMap.get('message');

    if (status) {
      this.status = status;
    }

    if (message) {
      this.message = message;
    }

    if (this.status === 401) {

      this.heading = 'Login Required';

    } else if (this.status === 403) {

      this.heading = 'Access Denied';

    } else if (this.status === 404) {

      this.heading = 'Lost in Space?';

    }

  }

}
