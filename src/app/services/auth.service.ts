import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { environment } from '../../environments/environment';

import {
  SignupRequest,
  VerifyOtpRequest,
  ResendOtpRequest,
  LoginRequest,
  LoginResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  LoginUser
} from '../core/models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly apiUrl =
    `${environment.apiUrl}/auth`;

  private readonly ACCESS_TOKEN_KEY =
    'accessToken';

  private readonly CURRENT_USER_KEY =
    'currentUser';

  private readonly pendingEmailKey =
    'pendingVerificationEmail';

  private readonly loggedInSubject =
    new BehaviorSubject<boolean>(
      this.hasAccessToken()
    );

  readonly isLoggedIn$ =
    this.loggedInSubject.asObservable();


  // =========================
  // SIGNUP
  // =========================

  signup(data: SignupRequest): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/signup`,
      data
    );
  }


  // =========================
  // OTP
  // =========================

  verifyOtp(
    data: VerifyOtpRequest
  ): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/verify-otp`,
      data
    );
  }


  resendOtp(
    data: ResendOtpRequest
  ): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/resend-otp`,
      data
    );
  }


  // =========================
  // LOGIN
  // =========================

  login(
    data: LoginRequest
  ): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      data,
      {
        withCredentials: true
      }
    ).pipe(

      tap(response => {

        const token =
          response?.data?.accessToken ??
          response?.accessToken;

        const user =
          response?.data?.user ??
          response?.user;

        if (token) {
          this.setAccessToken(token);
        }

        if (user) {
          this.setCurrentUser(user);
        }

        this.loggedInSubject.next(
          !!token
        );

      })

    );
  }


  // =========================
  // REFRESH TOKEN
  // =========================

  refreshToken(): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/refresh-token`,
      {},
      {
        withCredentials: true
      }
    );
  }


  // =========================
  // GET ALL USERS
  // Used by Signup email check
  // =========================

  getAllUsers(): Observable<{
    success: boolean;
    count: number;

    data: Array<{
      _id: string;
      email: string;
    }>;

  }> {

    return this.http.get<{
      success: boolean;
      count: number;

      data: Array<{
        _id: string;
        email: string;
      }>;

    }>(
      `${environment.apiUrl}/users/all`
    );
  }


  // =========================
  // FORGOT PASSWORD
  // =========================

  forgotPassword(
    data: ForgotPasswordRequest
  ): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/forget-password`,
      data
    );
  }


  // =========================
  // VALIDATE RESET TOKEN
  // =========================

  validateResetToken(
    token: string
  ): Observable<any> {

    return this.http.get(
      `${this.apiUrl}/reset-password/${token}`
    );
  }


  // =========================
  // RESET PASSWORD
  // =========================

  resetPassword(
    token: string,
    data: ResetPasswordRequest
  ): Observable<any> {

    return this.http.patch(
      `${this.apiUrl}/reset-password/${token}`,
      data
    );
  }


  // =========================
  // LOGOUT
  // =========================

  logout(): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/logout`,
      {},
      {
        withCredentials: true
      }
    );
  }


  logoutAndClear(): void {

    this.clearAuth();

    void this.router.navigate([
      '/login'
    ]);
  }


  // =========================
  // TOKEN
  // =========================

  setAccessToken(
    token: string
  ): void {

    localStorage.setItem(
      this.ACCESS_TOKEN_KEY,
      token
    );

    this.loggedInSubject.next(true);
  }


  getAccessToken(): string | null {

    return localStorage.getItem(
      this.ACCESS_TOKEN_KEY
    );
  }


  // =========================
  // CURRENT USER
  // =========================

  setCurrentUser(
    user: LoginUser
  ): void {

    localStorage.setItem(
      this.CURRENT_USER_KEY,
      JSON.stringify(user)
    );
  }


  getCurrentUser(): LoginUser | null {

    const raw =
      localStorage.getItem(
        this.CURRENT_USER_KEY
      );

    if (!raw) {
      return null;
    }

    try {

      return JSON.parse(raw) as LoginUser;

    } catch {

      return null;
    }
  }


  // =========================
  // AUTH STATE
  // =========================

  isLoggedIn(): boolean {

    return this.hasAccessToken();
  }


  isAdmin(): boolean {

    return this.getCurrentUser()?.role === 'admin';
  }


  // =========================
  // PENDING OTP EMAIL
  // =========================

  setPendingVerificationEmail(
    email: string
  ): void {

    sessionStorage.setItem(
      this.pendingEmailKey,
      email
    );
  }


  getPendingVerificationEmail(): string {

    return (
      sessionStorage.getItem(
        this.pendingEmailKey
      ) ?? ''
    );
  }


  clearPendingVerificationEmail(): void {

    sessionStorage.removeItem(
      this.pendingEmailKey
    );
  }


  // =========================
  // CLEAR AUTH
  // =========================

  clearAuth(): void {

    localStorage.removeItem(
      this.ACCESS_TOKEN_KEY
    );

    localStorage.removeItem(
      this.CURRENT_USER_KEY
    );

    this.loggedInSubject.next(false);
  }


  private hasAccessToken(): boolean {

    return !!localStorage.getItem(
      this.ACCESS_TOKEN_KEY
    );
  }

}