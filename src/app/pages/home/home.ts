import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { SearchPipe } from '../../Pipes/search-pipe';
import { DestinationsService } from '../../services/destinations';

import { DestinationCard } from '../destination-card/destination-card';

import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    SearchPipe,
    DestinationCard,
    Navbar,
    Footer,
    CommonModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  destinations: any[] = [];

  tripList: any[] = [];

  searchText = '';

  loadingDestinations = true;

  destinationError = '';

  constructor(
    private readonly destinationService: DestinationsService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadDestinations();
  }

  loadDestinations(): void {

    this.loadingDestinations = true;
    this.destinationError = '';

    this.destinationService.getAllDestinations().subscribe({

      next: (response: any) => {

        console.log('DESTINATIONS RESPONSE:', response);

        this.destinations =
          response?.destinations ??
          response?.data ??
          [];

        // أول 3 فقط
        this.destinations =
          this.destinations.slice(0, 3);

        console.log('HOME DESTINATIONS:', this.destinations);

        this.loadingDestinations = false;
      },

      error: (error: any) => {

        console.error('GET DESTINATIONS ERROR:', error);

        this.destinations = [];

        this.destinationError =
          error?.error?.message ||
          'Unable to load destinations.';

        this.loadingDestinations = false;
      }

    });
  }

  addToCart(destination: any): void {

    console.log('Selected destination:', destination);

    const destinationId =
      destination?._id ||
      destination?.id;

    if (!destinationId) {
      console.error(
        '❌ Destination ID not found:',
        destination
      );
      return;
    }

    console.log(
      '➡️ Navigating to destination:',
      destinationId
    );

    this.router.navigate([
      '/destinations',
      destinationId
    ]);
  }
}