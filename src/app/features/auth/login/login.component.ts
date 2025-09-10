import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../../core/navigation.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
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
            />
          </div>

          <!-- Form -->
          <div class="col-md-7 col-lg-5 col-xl-5 offset-xl-1">
            <form [formGroup]="loginForm" (ngSubmit)="onLogin()">

              <!-- Username -->
              <div class="form-outline mb-4">
                <input 
                  type="text" 
                  id="username" 
                  class="form-control form-control-lg"
                  placeholder="Username"
                  formControlName="username"
                />
                <label class="form-label" for="username">Username</label>
                <div class="text-danger" *ngIf="loginForm.get('username')?.touched && loginForm.get('username')?.invalid">
                  Username is required
                </div>
              </div>

              <!-- Password -->
              <div class="form-outline mb-4">
                <input 
                  type="password" 
                  id="password" 
                  class="form-control form-control-lg"
                  placeholder="Enter password"
                  formControlName="password"
                />
                <label class="form-label" for="password">Password</label>
                <div class="text-danger" *ngIf="loginForm.get('password')?.touched && loginForm.get('password')?.invalid">
                  Password is required
                </div>
              </div>

              <!-- Forgot Password -->
              <div class="d-flex justify-content-around align-items-center mb-4">
                <div class="form-check"></div>
                <button 
                  type="button" 
                  class="btn btn-link text-decoration-none p-0" 
                  (click)="goToForgotPassword()">
                  Forgot password?
                </button>
              </div>

              <!-- Sign In Button -->
              <button 
                type="submit" 
                class="btn btn-primary btn-lg w-100" 
                [disabled]="loginForm.invalid"
                style="background: linear-gradient(45deg, #6a11cb, #2575fc); border: none;">
                Sign in
              </button>

              <!-- Sign Up Button -->
              <a 
                routerLink="/signup" 
                class="btn btn-lg w-100 mt-3"
                style="background: linear-gradient(45deg, #ff6b6b, #f06595); border: none; color: white;">
                Sign up
              </a>

              <!-- Divider -->
              <div class="divider d-flex align-items-center my-4">
                <p class="text-center fw-bold mx-3 mb-0 text-muted">OR</p>
              </div>

            </form>
          </div>
        </div>
      </div>
    </section>
  `
})
export class LoginComponent {
  loginForm: FormGroup;

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
      this.auth.login(username, password).subscribe(success => {
        if (success) {
          this.router.navigate(['/leads']);
        } else {
          alert('Invalid username or password');
        }
      });
    }
  }

  goToForgotPassword(): void {
    this.navService.isNavigated = true;
    this.router.navigate(['/forgot-password']);
  }
}
