import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-password-renewal',
  templateUrl: './password-renewal.component.html',
  styleUrls: ['./password-renewal.component.scss'],
  imports:[NgFor, FormsModule, NgIf]
})
export class PasswordRenewalComponent {
  userId = '';
  token = '';
  oldPassword = '';
  newPassword = '';
  emailVerified = false;
  errors: string[] = [];

  constructor(private route: ActivatedRoute, private auth: AuthService, private router: Router) {
    this.userId = this.route.snapshot.queryParamMap.get('userId') || '';
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  confirmEmail() {
    this.auth.confirmEmail(this.userId, this.token).subscribe({
      next: (res) => {
        this.emailVerified = true;
      },
      error: (err) => {
        this.errors = err.error?.errors || ['Email confirmation failed'];
      }
    });
  }

  changePassword() {
    if (!this.emailVerified) {
      this.errors = ['Please confirm your email first.'];
      return;
    }

    this.auth.changePassword(this.userId, this.oldPassword, this.newPassword).subscribe({
      next: (res) => {
        this.router.navigate(['/dashboard']); // ✅ redirect after renewal success
      },
      error: (err) => {
        this.errors = err.error?.errors || ['Password change failed'];
      }
    });
  }
}
