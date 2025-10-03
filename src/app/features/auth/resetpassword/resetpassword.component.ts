import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './resetpassword.component.html',
  styleUrls: ['./resetpassword.scss'],
})
export class ResetPasswordComponent {
  token = '';
  email = '';
  newPassword = '';
  confirmPassword = '';

  message: string | null = null;
  messageClass = '';

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router
  ) {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      this.email = params['email'] || '';
    });
  }

  onReset() {
    // ✅ Frontend validations
    if (!this.newPassword || !this.confirmPassword) {
      this.showMessage("⚠️ Password cannot be empty!", "alert-danger");
      return;
    }

    if (this.newPassword.length < 6) {
      this.showMessage("⚠️ Password must be at least 6 characters long.", "alert-danger");
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.showMessage("⚠️ Passwords don't match!", "alert-danger");
      return;
    }

    // ✅ Call backend API
    this.auth.resetPassword(this.email, this.token, this.newPassword).subscribe({
      next: () => {
        this.showMessage("✅ Password reset successful! Redirecting to login...", "alert-success");
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        let errorMsg = "❌ Password reset failed. Please try again.";

        // ✅ Handle based on HTTP status codes
        if (err.status === 400) {
          errorMsg = "⚠️ Invalid request. Please check the input fields.";
        } else if (err.status === 404) {
          errorMsg = "⚠️ This reset link is invalid or has expired.";
        } else if (err.status === 401) {
          errorMsg = "⚠️ Unauthorized request. Please request a new password reset link.";
        } else if (err.status === 500) {
          errorMsg = "⚠️ Server error. Please try again later.";
        }

        // ✅ Handle backend custom error messages (if provided)
        if (err.error?.message) {
          const backendMsg = err.error.message.toLowerCase();

          if (backendMsg.includes("expired")) {
            errorMsg = "⚠️ Your reset link has expired. Please request a new one.";
          } else if (backendMsg.includes("invalid token")) {
            errorMsg = "⚠️ Invalid or tampered reset token. Please request a new link.";
          } else if (backendMsg.includes("user not found")) {
            errorMsg = "⚠️ No account found for this email.";
          } else if (backendMsg.includes("password")) {
            errorMsg = "⚠️ Password does not meet security requirements.";
          }
        }

        this.showMessage(errorMsg, "alert-danger");
      }
    });
  }

  private showMessage(text: string, cssClass: string) {
    this.message = text;
    this.messageClass = cssClass;

    // Auto-hide after 3s (optional)
    setTimeout(() => this.message = null, 3000);
  }
}
