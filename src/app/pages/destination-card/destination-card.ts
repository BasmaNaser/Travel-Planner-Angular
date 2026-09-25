import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-destination-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './destination-card.html',
  styleUrl: './destination-card.css'
})
export class DestinationCard {

  @Input() destination: any;

  @Output() addTrip = new EventEmitter<any>();

  addToTrip(): void {
    this.addTrip.emit(this.destination);
  }

  getImage(): string {

    const image = this.destination?.Image;

    if (!image) {
      return 'assets/images/destination-placeholder.jpg';
    }

    if (image.startsWith('http')) {
      return image;
    }

    return `http://localhost:5000${
      image.startsWith('/') ? '' : '/'
    }${image}`;
  }

  getThingsToDo(): string[] {

    return Array.isArray(this.destination?.ThingsToDo)
      ? this.destination.ThingsToDo
      : [];
  }
}