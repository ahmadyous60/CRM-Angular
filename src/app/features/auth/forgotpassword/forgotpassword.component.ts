import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NavigationService } from '../../../services/navigation.service'; 

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.scss']
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private navService: NavigationService,
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotForm.valid) {
      this.loading = true;
      const { email } = this.forgotForm.value;

      this.auth.forgotPassword(email).subscribe({
        next: () => {
          this.loading = false;
          this.forgotForm.reset();

          // ✅ mark navigation as internal
          this.navService.isNavigated = true;

          // redirect to confirmation page
          this.router.navigate(['/reset-link-sent']);
        },
        error: () => {
          this.loading = false;
          alert('❌ Something went wrong. Please try again.');
        }
      });
    }
  }
}
