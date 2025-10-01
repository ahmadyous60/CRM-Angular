import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-password-renewal',
  templateUrl: './password-renewal.component.html',
  styleUrls: ['./password-renewal.component.scss'],
  imports: [NgFor, FormsModule, NgIf]
})
export class PasswordRenewalComponent {
  userId = '';
  token = '';
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  emailVerified = false;
  errors: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router
  ) {
    this.userId = this.route.snapshot.queryParamMap.get('userId') || '';
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  confirmEmail() {
    this.auth.confirmEmail(this.userId, this.token).subscribe({
      next: () => {
        this.emailVerified = true;
        this.errors = [];
      },
      error: (err) => {
        this.errors = err.error?.errors || ['Email confirmation failed'];
      }
    });
  }

  changePassword() {
    this.errors = [];

    // ✅ Step 1: Ensure email is confirmed
    if (!this.emailVerified) {
      this.errors.push('Please confirm your email first.');
      return;
    }

    // ✅ Step 2: Check required fields
    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      this.errors.push('All fields are required.');
      return;
    }

    // ✅ Step 3: Check confirm password match
    if (this.newPassword !== this.confirmPassword) {
      this.errors.push('New password and confirmation do not match.');
      return;
    }

    // ✅ Step 4: Call API
      this.auth.changePassword(this.userId, this.oldPassword, this.newPassword).subscribe({
      next: () => {
        this.router.navigate(['/login']); 
      },
      error: (err) => {
        if (err.status === 400) {
          this.errors = err.error?.errors || ['Your old password is incorrect.'];
        } else if (err.status === 401) {
          this.errors = ['Session expired. Please try the password reset link again.'];
        } else {
          this.errors = ['Unexpected error. Please try again later.'];
        }
      }
    });

  }
}
