import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  navigateToUserLogin() {
    this.router.navigate(['/user-login']);
  }

  navigateToAdminLogin() {
    this.router.navigate(['/admin-login']);
  }

  navigateToUserDashboard() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/user/dashboard']);
    } else {
      this.navigateToUserLogin();
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
    }
  }

  navigateToAdminDashboard() {
    if (this.authService.isAuthenticated() && this.authService.isAdminOrManager()) {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.navigateToAdminLogin();
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
    }
  }

  navigateToQrGenerator() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/qr-generator']);
    } else {
      this.navigateToUserLogin();
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
    }
  }

  isAuthenticated(): Observable<boolean> {
    return this.authService.isAuthenticated();
  }

  isAuthenticatedAndConnected(){
    if (this.isAuthenticated() && this.isUser()) {
      return true
    } else if(this.isAuthenticated() && this.isAdminOrManager()){
      return true;
    }else{
      return false;
    }
  }

  isUser(): boolean{
    return this.authService.isUser();
  }

  isAdminOrManager(): boolean {
    return this.authService.isAdminOrManager();
  }

  getUserName(): string {
    return localStorage.getItem('username') || '';
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        window.location.reload();
      },
      error: (error) => {
        console.error('Erreur lors de la déconnexion:', error);
        window.location.reload();
      }
    });
  }
}

