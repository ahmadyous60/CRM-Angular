import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  template: `
  <section class="vh-100">
    <div class="container py-5 h-100">
      <div class="row d-flex align-items-center justify-content-center h-100">
        
        <!-- Image -->
        <div class="col-md-8 col-lg-7 col-xl-6">
          <img 
            src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.svg"
            class="img-fluid" 
            alt="Phone image"
          >
        </div>

        <!-- Form -->
        <div class="col-md-7 col-lg-5 col-xl-5 offset-xl-1">
          <form (ngSubmit)="onSignup()" #signupForm="ngForm">

            <!-- Name input -->
            <div class="form-outline mb-4">
              <input 
                type="text" 
                class="form-control form-control-lg" 
                placeholder="Enter your name"
                [(ngModel)]="name" 
                name="name" 
                required
              />
              <label class="form-label">Name</label>
              <div class="text-danger" *ngIf="signupForm.submitted && !name">
                Name is required
              </div>
            </div>

            <!-- Username input -->
            <div class="form-outline mb-4">
              <input 
                type="text" 
                class="form-control form-control-lg" 
                placeholder="Enter your username"
                [(ngModel)]="username" 
                name="username" 
                required
              />
              <label class="form-label">Username</label>
              <div class="text-danger" *ngIf="signupForm.submitted && !username">
                Username is required
              </div>
            </div>

            <!-- Email input -->
            <div class="form-outline mb-4">
              <input 
                type="email" 
                class="form-control form-control-lg" 
                placeholder="Enter your email"
                [(ngModel)]="email" 
                name="email" 
                required
              />
              <label class="form-label">Email</label>
              <div class="text-danger" *ngIf="signupForm.submitted && !email">
                Email is required
              </div>
            </div>

            <!-- Password input -->
            <div class="form-outline mb-4">
              <input 
                type="password" 
                class="form-control form-control-lg" 
                placeholder="Enter your password"
                [(ngModel)]="password" 
                name="password" 
                required
              />
              <label class="form-label">Password</label>
              <div class="text-danger" *ngIf="signupForm.submitted && !password">
                Password is required
              </div>
            </div>

            <!-- Sign Up Button -->
            <button 
              type="submit" 
              class="btn btn-primary btn-lg w-100" 
              [disabled]="signupForm.invalid"
              style="background: linear-gradient(45deg, #6a11cb, #2575fc); border: none;">
              Sign Up
            </button>

            <!-- Back to Login Button -->
            <a 
              routerLink="/login" 
              class="btn btn-lg w-100 mt-3"
              style="background: linear-gradient(45deg, #ff6b6b, #f06595); border: none; color: white; text-align: center;">
              Already have an account? Login
            </a>

          </form>
        </div>
      </div>
    </div>
  </section>
  `
})
export class SignupComponent {
  name = '';
  username = '';
  email = '';     // ✅ Added email field
  password = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSignup() {
    this.auth.signup(this.username, this.password, this.name, this.email).subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
