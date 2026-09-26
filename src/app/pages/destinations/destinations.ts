import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import Swal from 'sweetalert2';

import { DestinationService } from '../../services/destination.service';
import { Destination } from '../../Models/destination';

@Component({
  selector: 'app-destination',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    Navbar,
    Footer
  ],
  templateUrl: './destinations.html',
  styleUrls: ['./destinations.css']
})
export class DestinationComponent implements OnInit {

  destinations: Destination[] = [];
  filteredDestinationsList: Destination[] = [];
  selectedDestinations: Destination[] = [];
  showComparison: boolean = false;
  searchText: string = '';
  errorMessage: string = '';
  isAdmin: boolean = false;
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
    Badge: '',
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
    this.checkUserRole();
    this.getDestinations();
  }

  checkUserRole(): void {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      this.isAdmin = false;
      return;
    }

    try {
      const payload = JSON.parse(
        atob(
          token.split('.')[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/')
        )
      );

      this.isAdmin = payload.role === 'admin';

      console.log('User Role:', payload.role);
      console.log('Is Admin:', this.isAdmin);
    } catch (error) {
      console.error('Invalid access token:', error);
      this.isAdmin = false;
    }
  }

  getDestinations(): void {
    this.destinationService
      .getAllDestinations()
      .subscribe({
        next: (response) => {
          console.log('API Response:', response);

          this.destinations =
            response.destinations || [];

          this.filteredDestinationsList = [
            ...this.destinations
          ];

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
      Badge: '',
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

          Swal.fire({
            icon: 'success',
            title: 'Destination Added!',
            text: 'Your destination has been added successfully.',
            confirmButtonText: 'Great!',
            confirmButtonColor: '#0a9c99',
            timer: 2500,
            timerProgressBar: true
          });
        },

        error: (error) => {

          console.error(
            'Add Error:',
            error
          );

          this.errorMessage =
            'Failed to add destination.';

          Swal.fire({
            icon: 'error',
            title: 'Something went wrong',
            text: 'The destination could not be added.',
            confirmButtonText: 'Try Again',
            confirmButtonColor: '#ef4444'
          });
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

    console.log(
      'Badge before update:',
      this.newDestination.Badge
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

          Swal.fire({
            icon: 'success',
            title: 'Destination Updated!',
            text: 'Your destination has been updated successfully.',
            confirmButtonText: 'Perfect!',
            confirmButtonColor: '#0a9c99',
            timer: 2500,
            timerProgressBar: true
          });
        },

        error: (error) => {

          console.error(
            'Update Error:',
            error
          );

          this.errorMessage =
            'Failed to update destination.';

          Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: 'The destination could not be updated.',
            confirmButtonText: 'Try Again',
            confirmButtonColor: '#ef4444'
          });
        }
      });
  }

  deleteDestination(
    id: string
  ): void {

    Swal.fire({
      title: 'Delete destination?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280'
    }).then((result) => {

      if (!result.isConfirmed) {
        return;
      }

      this.destinationService
        .deleteDestination(id)
        .subscribe({

          next: () => {

            this.getDestinations();

            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'The destination has been deleted successfully.',
              confirmButtonText: 'OK',
              confirmButtonColor: '#0a9c99',
              timer: 2500,
              timerProgressBar: true
            });
          },

          error: (error) => {

            console.error(
              'Delete Error:',
              error
            );

            this.errorMessage =
              'Failed to delete destination.';

            Swal.fire({
              icon: 'error',
              title: 'Delete Failed',
              text: 'The destination could not be deleted.',
              confirmButtonText: 'Try Again',
              confirmButtonColor: '#ef4444'
            });
          }
        });
    });
  }

  selectForCompare(destination: Destination): void {
  const alreadySelected = this.selectedDestinations.some(
    item => item._id === destination._id
  );

  if (alreadySelected) {
    this.selectedDestinations = this.selectedDestinations.filter(
      item => item._id !== destination._id
    );
  } else {
    if (this.selectedDestinations.length >= 2) {
      alert('You can compare only 2 destinations.');
      return;
    }

    this.selectedDestinations.push(destination);
  }

  console.log('SELECTED:', this.selectedDestinations);
}

compareDestinations(): void {
  if (this.selectedDestinations.length !== 2) {
    return;
  }

  this.showComparison = true;
}

closeComparison(): void {
  this.showComparison = false;
  this.selectedDestinations = [];
}

}
