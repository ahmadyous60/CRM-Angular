import { Component } from '@angular/core';
import { Router} from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SharedModule } from '../../core/sahred.module';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [SharedModule],
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
