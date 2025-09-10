import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
<section class="vh-100 d-flex justify-content-center align-items-center bg-light-soft">
  <div class="card forgot-card p-4 border-0 shadow-sm">
    <h3 class="mb-4 text-center text-primary fw-semibold">Forgot Password</h3>

    <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()">
      <!-- Email Input -->
      <div class="form-floating mb-3">
        <input 
          type="email" 
          class="form-control rounded-3" 
          id="emailInput"
          placeholder="Enter your email" 
          formControlName="email" 
          required />
        <label for="emailInput">Email address</label>
        <div 
          class="invalid-feedback d-block small" 
          *ngIf="forgotForm.get('email')?.touched && forgotForm.get('email')?.invalid">
          Please enter a valid email
        </div>
      </div>

      <!-- Submit Button -->
      <button 
        class="btn btn-primary w-100 rounded-3 py-2 fw-semibold" 
        type="submit" 
        [disabled]="forgotForm.invalid">
        Send Reset Link
      </button>
    </form>
  </div>
</section>




  `
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;

  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotForm.valid) {
      const { email } = this.forgotForm.value;
      this.auth.forgotPassword(email).subscribe({
        next: () => alert('Password reset link has been sent to your email.'),
        error: () => alert('Something went wrong.')
      });
    }
  }
}
