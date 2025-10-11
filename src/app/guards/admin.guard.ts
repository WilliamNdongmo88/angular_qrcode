import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    console.log('Vérification du guard AdminGuard');
    return this.authService.isAuthenticated().pipe(
      map(authenticated => {
        if (authenticated && this.authService.isAdminOrManager()) {
          console.log('AdminGuard: Authentifié et Admin/Manager');
          return true;
        } else {
          console.log('AdminGuard: Non authentifié ou pas Admin/Manager, redirection vers /admin-login');
          this.router.navigate(['/admin-login']);
          localStorage.removeItem("authToken");
          localStorage.removeItem("refreshToken");
          return false;
        }
      }),
      catchError(() => {
        console.log('AdminGuard: Erreur d\'authentification, redirection vers /admin-login');
        this.router.navigate(['/admin-login']);
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
        return of(false);
      })
    );
  }
}

