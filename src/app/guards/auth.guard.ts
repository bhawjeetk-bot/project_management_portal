import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

// Protects /dashboard: if there's no session yet, send the person back to
// the login page (which itself doesn't ask for credentials — see LoginComponent).
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('ph_token');

  if (token) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
