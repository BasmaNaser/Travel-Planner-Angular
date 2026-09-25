import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Protected user pages must be accessible only to authenticated users.
  // If there is no session, show the project's error page instead of login.
  if (auth.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/error'], {
    queryParams: {
      status: 401,
      message: 'You must be logged in to access this page.'
    }
  });
};
