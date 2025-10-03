import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-password-renewal',
  templateUrl: './password-renewal.component.html',
  styleUrls: ['./password-renewal.component.scss'],
  imports: [NgFor, NgIf, FormsModule]
})
export class PasswordRenewalComponent implements OnInit {
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
  ) {}

  ngOnInit() {
    // ✅ Get query params from the link
    this.userId = this.route.snapshot.queryParamMap.get('userId') || '';
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    // ✅ If params exist, auto-confirm email via the signup endpoint
    if (this.userId && this.token) {
      this.auth.signup('', '', '', '', this.userId, this.token).subscribe({
        next: () => {
          this.emailVerified = true;
          this.errors = [];
        },
        error: (err) => {
          this.errors = err.error?.errors || ['Email confirmation failed'];
        }
      });
    }
  }

  changePassword() {
    this.errors = [];

    if (!this.emailVerified) {
      this.errors.push('Please confirm your email first.');
      return;
    }

    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      this.errors.push('All fields are required.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errors.push('New password and confirmation do not match.');
      return;
    }

    this.auth.changePassword(this.userId, this.oldPassword, this.newPassword, this.token).subscribe({
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
