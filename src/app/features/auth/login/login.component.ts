import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NavigationService } from '../../../services/navigation.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword: boolean = false;
  errorMessage: string | null = null; // ✅ for showing login errors

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private navService: NavigationService
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      remember: [true]
    });
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;

      this.auth.login(username, password).subscribe({
        next: success => {
          if (success) {
            this.errorMessage = null; // clear any old errors
            this.router.navigate(['/leads']);
          } else {
            this.errorMessage = 'Invalid username or password';
          }
        },
        error: () => {
          this.errorMessage = 'Something went wrong. Please try again later.';
        }
      });
    }
  }

  goToForgotPassword(): void {
    this.navService.isNavigated = true;
    this.router.navigate(['/forgot-password']);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
