import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Idestination } from '../../core/models/idestination';

@Component({
  selector: 'app-destination-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './destination-card.html',
  styleUrl: './destination-card.css'
})
export class DestinationCard {

  @Input() destination!: Idestination;

  @Output() addTrip =
  new EventEmitter<Idestination>();

  toggleFavorite() {
    this.destination.favorite =
    !this.destination.favorite;
  }

  addToTrip() {
    this.addTrip.emit(this.destination);
  }
}