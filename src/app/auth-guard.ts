import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isAuthenticated()) {
      // Nếu muốn chỉ admin mới vào được admin route
      if (route.url[0]?.path === 'admin' && this.authService.getUser()?.role !== 'admin') {
        this.router.navigate(['/']);
        return false;
      }
      return true;
    }

    // Nếu chưa login → chuyển về login + query param returnUrl
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
