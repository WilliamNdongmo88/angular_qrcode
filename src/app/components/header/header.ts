import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent {
    
    constructor(
        public authService: AuthService,
        private router: Router
    ) {}

    isUser(): boolean{
        return this.authService.isUser();
    }

    isAdminOrManager(): boolean {
        return this.authService.isAdminOrManager();
    }

    goToHomePage(){
        if(this.authService.isAuthenticated()){
            this.router.navigate(['/']);
        }else{
            this.router.navigate(['/']);
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
        }
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