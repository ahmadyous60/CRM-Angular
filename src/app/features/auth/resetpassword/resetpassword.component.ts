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
