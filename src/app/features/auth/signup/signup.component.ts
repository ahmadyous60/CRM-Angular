import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  name = '';
  username = '';
  email = '';
  password = '';
  showPassword: boolean = false;

  errors: string[] = [];

  // ✅ Friendly mapping dictionary
  private errorMap: { [key: string]: string } = {
    "Passwords must be at least 8 characters.": 
      "Password must be at least 8 characters long.",
    "Passwords must have at least one non alphanumeric character.":
      "Password must include at least one special character (e.g. @, #, $).",
    "Passwords must have at least one digit ('0'-'9').":
      "Password must include at least one number.",
    "Passwords must have at least one uppercase ('A'-'Z').":
      "Password must include at least one uppercase letter.",
    "Passwords must have at least one lowercase ('a'-'z').":
      "Password must include at least one lowercase letter.",
    "Username already exists":
      "This username is already taken. Please choose another.",
    "Email already exists":
      "This email is already registered. Try logging in instead."
  };

  constructor(private auth: AuthService, private router: Router) {}

 onSignup() {
  this.errors = [];

  this.auth.signup(this.username, this.password, this.name, this.email).subscribe({
    next: (message) => {
      if (message) {
        // ✅ Just show success message and stay on signup page
        // User must check their email now
        this.errors = [];
      }
    },
    error: (err) => {
      console.log("Signup error response:", err.error);

      let backendErrors: string[] = [];

      if (Array.isArray(err.error)) {
        backendErrors = err.error;
      } else if (Array.isArray(err.error?.errors)) {
        backendErrors = err.error.errors;
      } else if (err.error?.message) {
        backendErrors = [err.error.message];
      } else if (typeof err.error === 'string') {
        backendErrors = [err.error];
      }

      // ✅ Map backend messages to friendly UI messages
      this.errors = backendErrors.map(e => this.errorMap[e] || e);
    }
  });
}


  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}