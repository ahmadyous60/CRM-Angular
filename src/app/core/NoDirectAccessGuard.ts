import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { NavigationService } from '../services/navigation.service';

@Injectable({
  providedIn: 'root'
})
export class NoDirectAccessGuard implements CanActivate {
  constructor(private router: Router, private navService: NavigationService) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const token = route.queryParamMap.get('token');

    if (this.navService.isNavigated || token) {
      this.navService.isNavigated = false;
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}
