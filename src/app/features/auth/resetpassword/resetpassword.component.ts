import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
 <section class="vh-100 d-flex justify-content-center align-items-center bg-light">
  <div class="card p-4 shadow-lg border-0 rounded-4" style="width: 100%; max-width: 450px; background: linear-gradient(135deg, #f8f9fa, #e9ecef);">
    <div class="text-center mb-4">
      <i class="bi bi-shield-lock-fill text-primary fs-1"></i>
      <h3 class="fw-bold mt-2">Reset Your Password</h3>
      <p class="text-muted small">Secure your account with a new password</p>
    </div>

    <form (ngSubmit)="onReset()" class="needs-validation" novalidate>
      <div class="form-floating mb-3">
        <input type="password" class="form-control rounded-3" id="newPassword" [(ngModel)]="newPassword" name="newPassword" placeholder="New Password" required>
        <label for="newPassword">New Password</label>
      </div>

      <div class="form-floating mb-4">
        <input type="password" class="form-control rounded-3" id="confirmPassword" [(ngModel)]="confirmPassword" name="confirmPassword" placeholder="Confirm Password" required>
        <label for="confirmPassword">Confirm Password</label>
      </div>

      <button class="btn btn-gradient w-100 py-2 fw-semibold" type="submit">Reset Password</button>
    </form>
  </div>
</section>

  `
})
export class ResetPasswordComponent {
  token = '';
  email = '';
  newPassword = '';
  confirmPassword = '';

  constructor(private route: ActivatedRoute, private auth: AuthService, private router: Router) {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      this.email = params['email'];
    });
  }

  onReset() {
    if (this.newPassword !== this.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    this.auth.resetPassword(this.email, this.token, this.newPassword)
      .subscribe({
        next: () => {
          alert("Password reset successful!");
          this.router.navigate(['/login']);
        },
        error: () => alert("Password reset failed.")
      });
  }
}
