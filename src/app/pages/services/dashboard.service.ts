import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private usersUrl = 'http://localhost:5000/users';
  private bookingsUrl = 'http://localhost:5000/bookings';
  private destinationsUrl = 'http://localhost:5000/destinations';

  constructor(private http: HttpClient) {}

  getUsers() {
    const token = localStorage.getItem('token');

    console.log('TOKEN FROM ANGULAR:', token);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<any>(this.usersUrl, { headers });
  }

  getBookingStats() {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<any>(`${this.bookingsUrl}/stats`, { headers });
  }

  getBookings() {
  const token = localStorage.getItem('token');

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  return this.http.get<any>(this.bookingsUrl, { headers });
}

updateBookingStatus(id: string, status: string) {
  const token = localStorage.getItem('token');

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  return this.http.patch<any>(
    `${this.bookingsUrl}/${id}/status`,
    { Status: status },
    { headers }
  );
}



  getDestinations() {
    return this.http.get<any>(this.destinationsUrl);
  }

  deleteUser(id: string) {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.delete<any>(`${this.usersUrl}/${id}`, { headers });
  }
}
