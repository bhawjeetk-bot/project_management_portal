import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, User } from '../models/models';

// A single shared demo account is used so the app never shows a login screen.
// Swap this out (or reintroduce a real login form) if you need per-user accounts.
const DEMO_USERNAME = 'demo';
const DEMO_EMAIL = 'demo@codealpha.local';
const DEMO_PASSWORD = 'demo12345';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  get token(): string | null {
    return localStorage.getItem('ph_token');
  }

  private setSession(res: AuthResponse) {
    localStorage.setItem('ph_token', res.token);
    this.currentUserSubject.next(res.user);
  }

  /**
   * Ensures there is a valid session without ever showing a login form:
   * 1. If a token is already stored, verify it against /auth/me/.
   * 2. Otherwise, log in with the shared demo account.
   * 3. If the demo account doesn't exist yet, register it.
   */
  async ensureAuthenticated(): Promise<User> {
    const existingToken = this.token;
    if (existingToken) {
      try {
        const { user } = await firstValueFrom(
          this.http.get<{ user: User }>(`${environment.apiUrl}/auth/me/`)
        );
        this.currentUserSubject.next(user);
        return user;
      } catch {
        localStorage.removeItem('ph_token');
      }
    }

    try {
      const res = await firstValueFrom(
        this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login/`, {
          email: DEMO_EMAIL,
          password: DEMO_PASSWORD
        })
      );
      this.setSession(res);
      return res.user;
    } catch {
      const res = await firstValueFrom(
        this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register/`, {
          username: DEMO_USERNAME,
          email: DEMO_EMAIL,
          password: DEMO_PASSWORD
        })
      );
      this.setSession(res);
      return res.user;
    }
  }

  logout() {
    localStorage.removeItem('ph_token');
    this.currentUserSubject.next(null);
  }
}
