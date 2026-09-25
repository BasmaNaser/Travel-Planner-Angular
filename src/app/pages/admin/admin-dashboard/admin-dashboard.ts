
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { DashboardService } from '../../services/dashboard.service';

import { Navbar } from '../../../components/navbar/navbar';

import { Footer } from '../../../components/footer/footer';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-admin-dashboard',

  imports: [Navbar, Footer,RouterLink],

  templateUrl: './admin-dashboard.html',

  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  totalTrips = 0;

  totalUsers = 0;

  totalBookings = 0;

  users: any[] = [];
  bookingsLoaded = false;

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadUsers();

    this.loadBookingStats();

    this.loadDestinations();
  }

  loadUsers(): void {
    this.dashboardService.getUsers().subscribe({
      next: (response) => {
        console.log('USERS RESPONSE:', response);

        this.users = response.data;
        this.totalUsers = response.count;
        this.cdr.detectChanges();

        console.log('USERS ARRAY:', this.users);
        console.log('TOTAL USERS:', this.totalUsers);
      },
      error: (error) => {
        console.log('Error loading users:', error);
      },
    });
  }

loadBookingStats(): void {
  this.dashboardService.getBookingStats().subscribe({
    next: (response) => {
      this.totalBookings = response.data.totalBookings;

      this.bookingsLoaded = true;

      this.cdr.detectChanges();
    },
    error: (error) => {
      console.log('Error loading booking stats:', error);
    },
  });
}

  // loadDestinations(): void {
  //   this.dashboardService.getDestinations().subscribe({
  //     next: (response) => {
  //       this.totalTrips = response.data.length;
  //     },

  //     error: (error) => {
  //       console.log('Error loading destinations:', error);
  //     },
  //   });
  // }
  loadDestinations(): void {
    this.dashboardService.getDestinations().subscribe({
      next: (response) => {
        console.log('DESTINATIONS RESPONSE:', response);

        this.totalTrips = response.destinations.length;
      },
      error: (error) => {
        console.log('Error loading destinations:', error);
      },
    });
  }

  deleteUser(id: string): void {
    this.dashboardService.deleteUser(id).subscribe({
      next: () => {
        this.loadUsers();
      },

      error: (error) => {
        console.log('Error deleting user:', error);
      },
    });
  }
}

