import {
  CanActivate,
  CanActivateChild,
  Router,
} from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NotAuthGuard implements CanActivate, CanActivateChild {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    return this.checkAuth();
  }

  canActivateChild(): boolean {
    return this.checkAuth();
  }

  canLoad(): boolean {
    return this.checkAuth();
  }

  private checkAuth(): boolean {
    if (this.authService.isAuthed) {
      this.router.navigate(['/more']);
      return false;
    } else {
      return true;
    }
  }
}
