
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { DestinationService } from '../../services/destination.service';
import { Destination } from '../../Models/destination';

@Component({
  selector: 'app-destination',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './destinations.html',
  styleUrls: ['./destinations.css']
})
export class DestinationComponent implements OnInit {

  destinations: Destination[] = [];
  filteredDestinationsList: Destination[] = [];
  searchText: string = '';
  errorMessage: string = '';
  isAdmin: boolean = true;
  showForm: boolean = false;
  isEditMode: boolean = false;
  editId: string = '';
  thingsToDoText: string = '';
  selectedImage: File | null = null;

  newDestination: Destination = {
    Name: '',
    Location: '',
    Description: '',
    Image: '',
    Category: '',
    Duration: 0,
    PricePerPerson: 0,
    BaseTime: 0,
    AvailableSeats: 0,
    ThingsToDo: []
  };

  constructor(
    private destinationService: DestinationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getDestinations();
  }

  getDestinations(): void {
    this.destinationService
      .getAllDestinations()
      .subscribe({
        next: (response) => {
          console.log('API Response:', response);

          this.destinations = response.destinations || [];

          this.filteredDestinationsList = [
            ...this.destinations
          ];

          console.log(
            'Destinations:',
            this.destinations
          );

          console.log(
            'Filtered:',
            this.filteredDestinationsList
          );

          this.errorMessage = '';

          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error(
            'Get Destinations Error:',
            error
          );

          this.errorMessage =
            'Failed to load destinations.';

          this.cdr.detectChanges();
        }
      });
  }

  searchDestinations(): void {
    const search =
      this.searchText
        .trim()
        .toLowerCase();

    if (!search) {
      this.filteredDestinationsList = [
        ...this.destinations
      ];

      return;
    }

    this.filteredDestinationsList =
      this.destinations.filter(
        destination =>
          destination.Name
            .toLowerCase()
            .includes(search) ||

          destination.Location
            .toLowerCase()
            .includes(search) ||

          destination.Category
            .toLowerCase()
            .includes(search)
      );
  }

  clearSearch(): void {
    this.searchText = '';

    this.filteredDestinationsList = [
      ...this.destinations
    ];
  }

  openAddForm(): void {
    this.isEditMode = false;
    this.showForm = true;
    this.editId = '';
    this.thingsToDoText = '';
    this.selectedImage = null;

    this.newDestination = {
      Name: '',
      Location: '',
      Description: '',
      Image: '',
      Category: '',
      Duration: 0,
      PricePerPerson: 0,
      BaseTime: 0,
      AvailableSeats: 0,
      ThingsToDo: []
    };
  }

  openEditForm(
    destination: Destination
  ): void {

    this.isEditMode = true;
    this.showForm = true;

    this.editId =
      destination._id || '';

    this.selectedImage = null;

    this.newDestination = {
      ...destination,

      ThingsToDo: [
        ...destination.ThingsToDo
      ]
    };

    this.thingsToDoText =
      destination.ThingsToDo.join(', ');
  }

  onImageSelected(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    if (
      input.files &&
      input.files.length > 0
    ) {

      this.selectedImage =
        input.files[0];

      console.log(
        'Selected Image:',
        this.selectedImage
      );
    }
  }

  closeForm(): void {
    this.showForm = false;
    this.isEditMode = false;
    this.editId = '';
    this.thingsToDoText = '';
    this.selectedImage = null;
  }

  addDestination(): void {

    this.newDestination.ThingsToDo =
      this.thingsToDoText
        .split(',')
        .map(item => item.trim())
        .filter(
          item => item !== ''
        );

    this.destinationService
      .addDestination(
        this.newDestination,
        this.selectedImage
      )
      .subscribe({

        next: (response) => {

          console.log(
            'Destination Added:',
            response
          );

          this.closeForm();

          this.getDestinations();
        },

        error: (error) => {

          console.error(
            'Add Error:',
            error
          );

          this.errorMessage =
            'Failed to add destination.';
        }
      });
  }

  updateDestination(): void {

    if (!this.editId) {
      return;
    }

    this.newDestination.ThingsToDo =
      this.thingsToDoText
        .split(',')
        .map(item => item.trim())
        .filter(
          item => item !== ''
        );

    this.destinationService
      .updateDestination(
        this.editId,
        this.newDestination,
        this.selectedImage
      )
      .subscribe({

        next: (response) => {

          console.log(
            'Destination Updated:',
            response
          );

          this.closeForm();

          this.getDestinations();
        },

        error: (error) => {

          console.error(
            'Update Error:',
            error
          );

          this.errorMessage =
            'Failed to update destination.';
        }
      });
  }

  deleteDestination(
    id: string
  ): void {

    const confirmed =
      confirm(
        'Are you sure you want to delete this destination?'
      );

    if (!confirmed) {
      return;
    }

    this.destinationService
      .deleteDestination(id)
      .subscribe({

        next: () => {
          this.getDestinations();
        },

        error: (error) => {

          console.error(
            'Delete Error:',
            error
          );

          this.errorMessage =
            'Failed to delete destination.';
        }
      });
  }
}
