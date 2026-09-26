import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';

import { UserService } from '../../core/services/user.service';

import { apiMessage } from '../../core/utils/api-error.util';

import {
  interval,
  startWith
} from 'rxjs';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';


@Component({
  selector: 'app-complaints',

  standalone: true,

  imports: [
    CommonModule,
    Navbar,
    Footer
  ],

  templateUrl: './complaints.html',

  styleUrl: './complaints.css'
})
export class Complaints
  implements OnInit {

  private readonly userService =
    inject(UserService);

  private readonly destroyRef =
    inject(DestroyRef);

  private readonly cdr =
    inject(ChangeDetectorRef);


  complaints: any[] = [];

  loading = true;

  errorMessage = '';


  // =====================================
  // INIT
  // =====================================

  ngOnInit(): void {

    // Load immediately.
    this.loadComplaints();


    // Refresh every 5 seconds.
    // No browser refresh is required.
    interval(5000)
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe(() => {

        this.loadComplaints(false);

      });

  }


  // =====================================
  // LOAD COMPLAINTS
  // =====================================

  loadComplaints(
    showLoader = true
  ): void {

    if (showLoader) {

      this.loading = true;

    }


    this.errorMessage = '';


    this.userService
      .getMyComplaints()

      .subscribe({

        next: (response: any) => {

          console.log(
            'MY COMPLAINTS RESPONSE:',
            response
          );


          this.complaints =
            Array.isArray(response?.data)
              ? response.data
              : [];


          this.loading = false;


          this.cdr.detectChanges();

        },


        error: (error: any) => {

          console.error(
            'MY COMPLAINTS ERROR:',
            error
          );


          this.loading = false;


          // =================================
          // NO COMPLAINTS
          // =================================

          if (error?.status === 400) {

            this.complaints = [];

            this.errorMessage =
              error?.error?.message ||
              'No complaints found.';


            this.cdr.detectChanges();

            return;

          }


          // =================================
          // OTHER ERRORS
          // =================================

          this.errorMessage =
            apiMessage(
              error,
              'Unable to load complaints.'
            );


          this.cdr.detectChanges();

        }

      });

  }


  // =====================================
  // STATUS CLASS
  // =====================================

  getStatusClass(
    status: string
  ): string {

    switch (
      status?.toLowerCase()
    ) {

      case 'resolved':

        return 'status-resolved';


      case 'inprocess':

        return 'status-inprocess';


      case 'pending':

        return 'status-pending';


      default:

        return 'status-pending';

    }

  }


  // =====================================
  // STATUS ICON
  // =====================================

  getStatusIcon(
    status: string
  ): string {

    switch (
      status?.toLowerCase()
    ) {

      case 'resolved':

        return 'bi-check-circle-fill';


      case 'inprocess':

        return 'bi-hourglass-split';


      case 'pending':

        return 'bi-clock-fill';


      default:

        return 'bi-clock-fill';

    }

  }


  // =====================================
  // STATUS TEXT
  // =====================================

  getStatusText(
    status: string
  ): string {

    switch (
      (status || '').toLowerCase()
    ) {

      case 'inprocess':

        return 'In Process';


      case 'resolved':

        return 'Resolved';


      case 'pending':

      default:

        return 'Pending';

    }

  }

}