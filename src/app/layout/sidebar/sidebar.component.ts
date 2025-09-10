import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth.service';
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
  <div class="d-flex flex-column gap-2">
    <a class="navbar-brand fw-bold d-flex align-items-center gap-2 mb-3">
      <i class="bi bi-speedometer2"></i> Dashboard
    </a>
    <a routerLink="/leads" routerLinkActive="active" class="nav-link px-3 py-2 d-flex align-items-center gap-2">
      <i class="bi bi-person-lines-fill"></i> Leads
    </a>
    <a routerLink="/deals" routerLinkActive="active" class="nav-link px-3 py-2 d-flex align-items-center gap-2">
      <i class="bi bi-cash-coin"></i> Deals
    </a>
    <a routerLink="/contacts" routerLinkActive="active" class="nav-link px-3 py-2 d-flex align-items-center gap-2">
      <i class="bi bi-people"></i> Contacts
    </a>
    <a routerLink="/companies" routerLinkActive="active" class="nav-link px-3 py-2 d-flex align-items-center gap-2">
      <i class="bi bi-buildings"></i> Companies
    </a>
     <a routerLink="/tasks" routerLinkActive="active" class="nav-link px-3 py-2 d-flex align-items-center gap-2">
      <i class="bi bi-list-task"></i> Tasks
    </a>
    <a routerLink="/notes" routerLinkActive="active" class="nav-link px-3 py-2 d-flex align-items-center gap-2">
      <i class="bi bi-sticky"></i> Notes
    </a>
    <a routerLink="/events" routerLinkActive="active" class="nav-link px-3 py-2 d-flex align-items-center gap-2">
      <i class="bi bi-calendar-event"></i> Events
    </a>

    <a class="nav-link px-3 py-2 d-flex align-items-center gap-2" (click)="logout()" style="cursor:pointer;">
    <i class="bi bi-box-arrow-right"></i> Logout
  </a>
  </div>
  `
})
export class SidebarComponent {
  constructor(public auth: AuthService, private router: Router) {}

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
