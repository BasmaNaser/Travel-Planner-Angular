import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

import { BookingService } from '../../services/booking.service';
import { DestinationService } from '../../services/destination.service';
import { ItineraryDayService } from '../../services/itinerary-day.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './booking.html',
  styleUrls: ['./booking.css']
})
export class BookingComponent implements OnInit {

  user: any = {
    name: '',
    email: '',
    phone: ''
  };

  destination: any = null;
  destinationId: string = '';

  itineraryDays: any[] = [];
  selectedItineraryDayId: string = '';

  travelDate: string = '';
  endDate: string = '';
  travelers: number = 1;

  isBooking: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private destinationService: DestinationService,
    private itineraryDayService: ItineraryDayService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.loadUser();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');

      if (!id) {
        Swal.fire({
          icon: 'error',
          title: 'Destination Not Found',
          text: 'Destination ID was not found in the URL.'
        });
        return;
      }

      this.destinationId = id;
      this.loadDestination(id);
      this.loadItineraryDays(id);
    });
  }

  loadUser(): void {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      this.user = {
        name: '',
        email: '',
        phone: ''
      };
      return;
    }

    try {
      const tokenParts = token.split('.');

      if (tokenParts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      const payload = JSON.parse(atob(tokenParts[1]));

      this.user = {
        id: payload.id || '',
        name: payload.name || '',
        email: payload.email || '',
        phone: payload.phone || ''
      };
    } catch (error) {
      console.error(error);

      this.user = {
        name: '',
        email: '',
        phone: ''
      };
    }
  }

  loadDestination(id: string): void {
    this.destinationService.getDestinationById(id).subscribe({
      next: (response: any) => {
        if (!response || !response.destination) {
          this.destination = null;
          return;
        }

        const data = response.destination;

        this.destination = {
          _id: data._id,
          name: data.Name,
          country: data.Location,
          price: Number(data.PricePerPerson)
        };
      },
      error: (error: any) => {
        console.error(error);

        this.destination = null;

        Swal.fire({
          icon: 'error',
          title: 'Failed to Load Destination',
          text: error?.error?.message || 'Failed to load destination.'
        });
      }
    });
  }

  loadItineraryDays(destinationId: string): void {
    this.itineraryDayService
      .getItineraryDaysByDestination(destinationId)
      .subscribe({
        next: (response: any) => {
          this.itineraryDays = response?.itineraryDays || [];
          this.selectedItineraryDayId = '';
        },
        error: (error: any) => {
          console.error(error);
          this.itineraryDays = [];
          this.selectedItineraryDayId = '';
        }
      });
  }

  get totalPrice(): number {
    if (!this.destination) {
      return 0;
    }

    return Number(this.destination.price) * Number(this.travelers || 1);
  }

  confirmBooking(): void {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      Swal.fire({
        icon: 'info',
        title: 'Login Required',
        text: 'Please login before making a booking.',
        confirmButtonText: 'Go to Login',
        showCancelButton: true,
        cancelButtonText: 'Cancel'
      }).then(result => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']);
        }
      });

      return;
    }

    if (!this.destination) {
      Swal.fire({
        icon: 'error',
        title: 'Destination Not Found',
        text: 'Destination information is missing.'
      });
      return;
    }

    if (!this.user?.name?.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Name Required',
        text: 'Please enter your name.'
      });
      return;
    }

    if (!this.user?.phone?.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Phone Required',
        text: 'Please enter your phone number.'
      });
      return;
    }

    if (!this.travelDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Choose Start Date',
        text: 'Please select your start date.'
      });
      return;
    }

    if (!this.endDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Choose End Date',
        text: 'Please select your end date.'
      });
      return;
    }

    if (new Date(this.endDate) < new Date(this.travelDate)) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Dates',
        text: 'End date cannot be before start date.'
      });
      return;
    }

    if (Number(this.travelers) < 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Travelers',
        text: 'Number of travelers must be at least 1.'
      });
      return;
    }

    if (!this.selectedItineraryDayId) {
      Swal.fire({
        icon: 'warning',
        title: 'Choose Itinerary Day',
        text: 'Please select an itinerary day.'
      });
      return;
    }

    const destinationId =
      this.destination._id || this.destinationId;

    if (!destinationId) {
      Swal.fire({
        icon: 'error',
        title: 'Destination Error',
        text: 'Destination ID is missing.'
      });
      return;
    }

    const bookingData = {
      DestinationID: destinationId,
      NumberOfPeople: Number(this.travelers),
      StartDate: this.travelDate,
      EndDate: this.endDate,
      ItineraryDayID: this.selectedItineraryDayId
    };

    this.isBooking = true;

    this.bookingService.createBooking(bookingData).subscribe({
      next: (response: any) => {
        this.isBooking = false;

        const booking = response?.data;

        if (!booking) {
          Swal.fire({
            icon: 'error',
            title: 'Booking Error',
            text: 'Booking data was not returned.'
          });
          return;
        }

        const bookingId = booking._id;

        if (!bookingId) {
          Swal.fire({
            icon: 'error',
            title: 'Booking Error',
            text: 'Booking ID was not returned.'
          });
          return;
        }

        localStorage.setItem(
          'pendingBooking',
          JSON.stringify(booking)
        );

        this.router.navigate(['/payments', bookingId]);
      },
      error: (error: any) => {
        console.error(error);

        this.isBooking = false;

        Swal.fire({
          icon: 'error',
          title: 'Booking Failed',
          text:
            error?.error?.message ||
            'Failed to create booking.'
        });
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}