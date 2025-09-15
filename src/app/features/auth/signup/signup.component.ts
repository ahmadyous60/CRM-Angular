import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './signup.component.html'
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
