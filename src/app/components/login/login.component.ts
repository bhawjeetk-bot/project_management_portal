import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  authenticating = false;

  constructor(private auth: AuthService, private router: Router) {}

  // No credentials are collected here — tapping Login just establishes the
  // (demo) session behind the scenes and then routes to the dashboard.
  async onLoginClick() {
    this.authenticating = true;
    await this.auth.ensureAuthenticated();
    this.authenticating = false;
    this.router.navigate(['/dashboard']);
  }
}
