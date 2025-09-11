import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router} from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.component.html',
})
export class TopbarComponent {
  constructor(public auth: AuthService, private router: Router) {
    this.auth.restoreUser(); // restore on load
  }

  // logout() {
  //   this.auth.logout();           // clear user
  //   this.router.navigate(['/login']); // redirect
  // }
}
