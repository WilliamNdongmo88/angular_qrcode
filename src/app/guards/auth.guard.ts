import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    console.log('Vérification du guard UserGuard');
    const requiredRoles = route.data['roles'] as Array<string>;
    console.log('Rôles requis pour cette route :', requiredRoles);

    return this.authService.isAuthenticated().pipe(
      map(authenticated => {
        if (authenticated) {
          // Si l'utilisateur est authentifié, vérifier les rôles si spécifiés
          if (requiredRoles && requiredRoles.length > 0) {
            const userRoles = this.authService.getRoles(); // Supposons que getRoles() est public ou une méthode pour obtenir les rôles
            const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
            if (hasRequiredRole) {
              console.log('AuthGuard: Authentifié et possède les rôles requis.');
              return true;
            } else {
              console.log('AuthGuard: Authentifié mais ne possède pas les rôles requis, redirection vers /unauthorized.');
              this.router.navigate(['/unauthorized']); // Ou une page d'erreur appropriée
              return false;
            }
          } else {
            // Pas de rôles requis, juste authentifié
            console.log('AuthGuard: Authentifié.');
            return true;
          }
        } else {
          console.log('AuthGuard: Non authentifié, redirection vers /user-login.');
          this.router.navigate(['/user-login']);
          localStorage.removeItem("authToken");
          localStorage.removeItem("refreshToken");
          return false;
        }
      }),
      catchError(() => {
        console.log('AuthGuard: Erreur d\'authentification, redirection vers /user-login.');
        this.router.navigate(['/user-login']);
        return of(false);
      })
    );
  }
}

