import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { SearchPipe } from '../../Pipes/search-pipe';
import { Idestination } from '../../core/models/idestination';
import { DestinationsService } from '../../services/destinations';
import { DestinationCard } from '../destination-card/destination-card';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    SearchPipe,
    DestinationCard,
    Navbar,
    Footer,CommonModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  destinations: Idestination[] = [];
  tripList: Idestination[] = [];
  searchText = '';
  loadingDestinations = true;
  destinationError = '';

  constructor(private readonly destinationService: DestinationsService) {}

  ngOnInit(): void {
    this.destinationService.getAllDestinations().subscribe({
      next: destinations => {
        this.destinations = destinations.slice(0, 3);
        this.loadingDestinations = false;
      },
      error: error => {
        this.loadingDestinations = false;
        this.destinationError =
          error?.error?.message || 'Unable to load destinations.';
      }
    });
  }

  addToCart(destination: Idestination): void {
    this.tripList.push(destination);
    console.log('Added to trip:', destination);
  }
}
