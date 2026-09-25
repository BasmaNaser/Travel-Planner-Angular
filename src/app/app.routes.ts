import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { About } from './pages/about/about';
import { Services } from './pages/services/services';
import { Details } from './pages/details/details';
import { BookingComponent } from './pages/booking/booking';
import { PaymentsComponent } from './pages/payments/payments';
import { PaymentMethodComponent } from './pages/payment-method/payment-method';
import { Contact } from './pages/contact/contact';
import { Profile } from './pages/profile/profile';
import { Login } from './pages/login/login';
import { Signup } from './pages/signup/signup';
import { ForgetPasswordEmail } from './pages/forget-password-email/forget-password-email';
import { CreateNewPassword } from './pages/create-new-password/create-new-password';
import { ResetPasswordSuccessfuly } from './pages/reset-password-successfuly/reset-password-successfuly';
import { AdminDashboard } from './pages/admin/admin-dashboard/admin-dashboard';
import { AdminBooking } from './pages/admin/admin-booking/admin-booking';
import { AdminComplaints } from './pages/admin/admin-complaints/admin-complaints';
import { DestinationComponent } from './pages/destinations/destinations';
import { DestinationDetailsComponent } from './pages/destination-details/destination-details';
import { ErrorPage } from './pages/error-page/error-page';

export const routes: Routes = [

  {
    path: '',
    component: Home,
    pathMatch: 'full'
  },

  {
    path: 'home',
    component: Home
  },

  {
    path: 'about',
    component: About
  },

  {
    path: 'services',
    component: Services
  },

  {
    path: 'details/:id',
    component: Details
  },

  {
    path: 'book/:id',
    component: BookingComponent
  },

  {
    path: 'payments/:id',
    component: PaymentsComponent
  },

  {
    path: 'payment-method/:id',
    component: PaymentMethodComponent
  },

  {
    path: 'contact',
    component: Contact
  },

  {
    path: 'profile',
    component: Profile
  },

  {
    path: 'login',
    component: Login
  },

  {
    path: 'signup',
    component: Signup
  },

  {
    path: 'forget-password',
    component: ForgetPasswordEmail
  },

  {
    path: 'create-new-password',
    component: CreateNewPassword
  },

  {
    path: 'reset-password-successfully',
    component: ResetPasswordSuccessfuly
  },

  {
    path: 'admin',
    component: AdminDashboard
  },

  {
    path: 'admin/bookings',
    component: AdminBooking
  },

  {
    path: 'admin/complaints',
    component: AdminComplaints
  },

  {
    path: 'destinations',
    component: DestinationComponent,
    pathMatch: 'full'
  },

  {
    path: 'destinations/:id',
    component: DestinationDetailsComponent
  },

  {
    path: '**',
    component: ErrorPage
  }

];