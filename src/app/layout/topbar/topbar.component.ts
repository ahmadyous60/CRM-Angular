// import { Component } from '@angular/core';
// @Component({
//   selector: 'app-topbar',
//   standalone: true,
//   template: `
//   <nav class="navbar navbar-dark px-3" style="background:rgba(255,255,255,.04); border-bottom:1px solid rgba(255,255,255,.08)">
//     <span class="navbar-brand mb-0 h1 d-flex align-items-center gap-2">
//       <i class="bi bi-gem"></i> Mordern CRM
//     </span>
//     <form class="d-flex" role="search">
//       <input class="form-control" type="search" placeholder="Global search" aria-label="Search">
//     </form>
//   </nav>
//   `
// })
// export class TopbarComponent {}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router} from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="navbar navbar-dark px-3"
         style="background:rgba(255,255,255,.04); border-bottom:1px solid rgba(255,255,255,.08)">
      <span class="navbar-brand mb-0 h1 d-flex align-items-center gap-2">
        <i class="bi bi-gem"></i> Modern CRM
      </span>

      <div class="d-flex align-items-center gap-3 text-white">
        <span *ngIf="auth.currentUser() as u">👤 {{ u.name }}</span>
        <!-- <button 
          *ngIf="auth.currentUser()" 
          class="btn btn-sm btn-outline-light" 
          (click)="logout()">
          Logout
        </button> -->
      </div>
    </nav>
  `
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
