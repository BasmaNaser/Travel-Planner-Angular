import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { UserService } from '../../core/services/user.service';
import { FormsModule } from '@angular/forms';

type ComplaintStatus =
  | 'pending'
  | 'inProcess'
  | 'resolved';

@Component({
  selector: 'app-all-complaints',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Navbar,
    Footer
  ],
  templateUrl: './all-complaints.html',
  styleUrl: './all-complaints.css'
})
export class AllComplaints implements OnInit {

  private readonly userService =
    inject(UserService);

  private readonly cdr =
    inject(ChangeDetectorRef);

  complaints: any[] = [];

  loading = true;

  errorMessage = '';

  updatingId: string | null = null;

  readonly statuses: {
    value: ComplaintStatus;
    label: string;
  }[] = [
    {
      value: 'pending',
      label: 'Pending'
    },
    {
      value: 'inProcess',
      label: 'In Process'
    },
    {
      value: 'resolved',
      label: 'Resolved'
    }
  ];

  ngOnInit(): void {
    this.loadComplaints();
  }

  loadComplaints(): void {

    this.loading = true;
    this.errorMessage = '';

    console.log(
      '➡️ Requesting all complaints...'
    );

    this.userService
      .getAllComplaints()
      .subscribe({

        next: (response: any) => {

          console.log(
            '✅ ALL COMPLAINTS RESPONSE:',
            response
          );

          this.complaints =
            response?.data ?? [];

          this.loading = false;

          // تحديث الـ UI فورًا
          this.cdr.detectChanges();
        },

        error: (error: any) => {

          console.error(
            '❌ ALL COMPLAINTS ERROR:',
            error
          );

          this.complaints = [];

          this.errorMessage =
            error?.error?.message ||
            `Unable to load complaints. Status: ${
              error?.status || 'Unknown'
            }`;

          this.loading = false;

          // تحديث الـ UI في حالة الخطأ أيضًا
          this.cdr.detectChanges();
        }

      });
  }

  getUserImage(complaint: any): string {

    const image =
      complaint?.userId?.profilePicture;

    if (!image) {
      return '';
    }

    if (image.startsWith('http')) {
      return image;
    }

    return `http://localhost:5000${
      image.startsWith('/')
        ? ''
        : '/'
    }${image}`;
  }

  changeStatus(
    complaint: any,
    newStatus: ComplaintStatus
  ): void {

    console.log(
      '🔄 Selected status:',
      newStatus
    );

    console.log(
      '🔄 Old status:',
      complaint.status
    );

    const allowedStatuses:
      ComplaintStatus[] = [
        'pending',
        'inProcess',
        'resolved'
      ];

    if (
      !allowedStatuses.includes(newStatus)
    ) {
      console.error(
        '❌ Invalid status:',
        newStatus
      );

      return;
    }

    const oldStatus =
      complaint.status;

    if (
      newStatus === oldStatus
    ) {
      return;
    }

    const id =
      this.getId(complaint);

    if (!id) {

      console.error(
        '❌ Complaint ID not found:',
        complaint
      );

      return;
    }

    this.updatingId = id;
    this.errorMessage = '';

    /*
     * Optimistic update
     * الحالة تتغير فورًا في الشاشة
     */
    complaint.status =
      newStatus;

    this.complaints = [
      ...this.complaints
    ];

    this.cdr.detectChanges();

    console.log(
      '📤 Updating complaint:',
      {
        id,
        status: newStatus
      }
    );

    this.userService
      .updateComplaintStatus(
        id,
        newStatus
      )
      .subscribe({

        next: (response: any) => {

          console.log(
            '✅ STATUS UPDATED:',
            response
          );

          /*
           * بعد نجاح update
           * نجيب أحدث data من backend
           */
          this.userService
            .getAllComplaints()
            .subscribe({

              next: (
                complaintsResponse: any
              ) => {

                console.log(
                  '✅ REFRESHED COMPLAINTS:',
                  complaintsResponse
                );

                this.complaints =
                  complaintsResponse?.data ??
                  [];

                this.updatingId = null;

                this.cdr.detectChanges();
              },

              error: (
                error: any
              ) => {

                console.error(
                  '❌ Failed to reload complaints:',
                  error
                );

                /*
                 * الـ update نجح بالفعل،
                 * فنخلي الحالة الجديدة
                 */
                complaint.status =
                  newStatus;

                this.complaints = [
                  ...this.complaints
                ];

                this.updatingId = null;

                this.errorMessage =
                  'Status updated, but the complaints list could not be refreshed.';

                this.cdr.detectChanges();
              }

            });
        },

        error: (
          error: any
        ) => {

          console.error(
            '❌ STATUS UPDATE ERROR:',
            error
          );

          /*
           * الـ API فشل
           * نرجع الحالة القديمة
           */
          complaint.status =
            oldStatus;

          this.complaints = [
            ...this.complaints
          ];

          this.updatingId = null;

          this.errorMessage =
            error?.error?.message ||
            'Unable to update complaint status.';

          this.cdr.detectChanges();
        }

      });
  }

  getId(
    complaint: any
  ): string {

    return (
      complaint?._id ||
      complaint?.id ||
      ''
    );
  }

  getUserName(
    complaint: any
  ): string {

    return (
      complaint?.userId?.fullName ||
      complaint?.fullName ||
      'Unknown user'
    );
  }

  getUserEmail(
    complaint: any
  ): string {

    return (
      complaint?.userId?.email ||
      complaint?.email ||
      ''
    );
  }

  getStatusClass(
    status: string
  ): string {

    switch (
      (status || '').toLowerCase()
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

  getStatusIcon(
    status: string
  ): string {

    switch (
      (status || '').toLowerCase()
    ) {

      case 'resolved':
        return 'bi-check-circle-fill';

      case 'inprocess':
        return 'bi-hourglass-split';

      default:
        return 'bi-clock-fill';
    }
  }

  getStatusText(
    status: string
  ): string {

    const found =
      this.statuses.find(
        item =>
          item.value === status
      );

    return (
      found?.label ??
      'Pending'
    );
  }
}