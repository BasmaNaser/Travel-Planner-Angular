import {
  Injectable,
  inject
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  environment
} from '../../../environments/environment';

import {
  User,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ContactRequest
} from '../models/user.model';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  private http =
    inject(HttpClient);


  private apiUrl =
    `${environment.apiUrl}/users`;


  // =========================
  // PROFILE
  // =========================

  getProfile(): Observable<any> {

    return this.http.get(
      `${this.apiUrl}/profile`
    );

  }


  // =========================
  // UPDATE PROFILE
  // =========================

  updateProfile(
    data: UpdateProfileRequest
  ): Observable<any> {

    return this.http.patch(
      `${this.apiUrl}/profile`,
      data
    );

  }


  // =========================
  // CHANGE PASSWORD
  // =========================

  changePassword(
    data: ChangePasswordRequest
  ): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/update-password`,
      data
    );

  }


  // =========================
  // DELETE ACCOUNT
  // =========================

  deleteAccount(): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/delete-account`,
      {}
    );

  }


  // =========================
  // UPLOAD PROFILE PICTURE
  // =========================

  uploadProfilePicture(
    file: File
  ): Observable<any> {

    const formData =
      new FormData();

    formData.append(
      'image',
      file
    );


    return this.http.patch(
      `${this.apiUrl}/profile-picture`,
      formData
    );

  }


  // =========================
  // DELETE PROFILE PICTURE
  // =========================

  deleteProfilePicture(): Observable<any> {

    return this.http.delete(
      `${this.apiUrl}/profile-picture`
    );

  }


  // =========================
  // CONTACT
  // =========================

  sendContact(
    data: ContactRequest
  ): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/contact/send`,
      data
    );

  }


  // =========================
  // MY COMPLAINTS
  // =========================

  getMyComplaints(): Observable<any> {

    return this.http.get(
      `${this.apiUrl}/my-complaints`
    );

  }

}