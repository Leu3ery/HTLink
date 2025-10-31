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
export class AuthGuard implements CanActivate, CanActivateChild {
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
      return true;
    } else {
      this.router.navigate(['/more/login']);
      return false;
    }
  }
}
