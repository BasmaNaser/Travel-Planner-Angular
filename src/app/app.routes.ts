import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { About } from './pages/about/about';
import { Services } from './pages/services/services';
import { Destination } from './pages/destination/destination';
import { Details } from './pages/details/details';
import { Book } from './pages/book/book';
import { Contact } from './pages/contact/contact';
import { Profile } from './pages/profile/profile';
import { Login } from './pages/login/login';
import { Signup } from './pages/signup/signup';
import { VerifyOtp } from './pages/verify-otp/verify-otp';
import { ForgetPasswordEmail } from './pages/forget-password-email/forget-password-email';
import { CreateNewPassword } from './pages/create-new-password/create-new-password';
import { ResetPasswordSuccessfuly } from './pages/reset-password-successfuly/reset-password-successfuly';
import { Complaints } from './pages/complaints/complaints';
import { AdminDashboard } from './pages/admin/admin-dashboard/admin-dashboard';
import { AdminBooking } from './pages/admin/admin-booking/admin-booking';
import { AdminComplaints } from './pages/admin/admin-complaints/admin-complaints';
import { ErrorPage } from './pages/error-page/error-page';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', component: Home, pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'about', component: About },
  { path: 'services', component: Services },
  { path: 'destinations', component: Destination },
  { path: 'details/:id', component: Details },
  { path: 'book/:id', component: Book },

  { path: 'contact', component: Contact, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'complaints', component: Complaints, canActivate: [authGuard] },

  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'signup', component: Signup, canActivate: [guestGuard] },
  { path: 'verify-otp', component: VerifyOtp, canActivate: [guestGuard] },
  { path: 'forget-password', component: ForgetPasswordEmail, canActivate: [guestGuard] },
  { path: 'create-new-password/:token', component: CreateNewPassword, canActivate: [guestGuard] },
  { path: 'reset-password-successfully', component: ResetPasswordSuccessfuly },

  { path: 'admin', component: AdminDashboard, canActivate: [adminGuard] },
  { path: 'admin/bookings', component: AdminBooking, canActivate: [adminGuard] },
  { path: 'admin/complaints', component: AdminComplaints, canActivate: [adminGuard] },

  { path: 'error', component: ErrorPage },
  { path: '**', component: ErrorPage }
];
