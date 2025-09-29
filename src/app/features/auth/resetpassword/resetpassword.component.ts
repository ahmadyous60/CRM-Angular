import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './resetpassword.component.html',
})
export class ResetPasswordComponent {
  token = '';
  email = '';
  newPassword = '';
  confirmPassword = '';

  message: string | null = null;
  messageClass = '';

  constructor(private route: ActivatedRoute, private auth: AuthService, private router: Router) {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      this.email = params['email'];
    });
  }

  onReset() {
    if (this.newPassword !== this.confirmPassword) {
      this.showMessage("Passwords don't match!", "alert-danger");
      return;
    }

    this.auth.resetPassword(this.email, this.token, this.newPassword).subscribe({
      next: () => {
        this.showMessage("✅ Password reset successful! Redirecting to login...", "alert-success");
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: () => this.showMessage("❌ Password reset failed. Please try again.", "alert-danger")
    });
  }

  private showMessage(text: string, cssClass: string) {
    this.message = text;
    this.messageClass = cssClass;

    // Auto-hide after 3s (optional)
    setTimeout(() => this.message = null, 3000);
  }
}
