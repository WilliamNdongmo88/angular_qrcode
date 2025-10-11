import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css'
})
export class AdminLoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  showForgotPassword: boolean = false;
  resetEmail: string = '';
  resetMessage: string = '';
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    console.log('Tentative de connexion avec', this.email, this.password);
    if (!this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.authenticate(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Réponse de l\'API:', response);
        this.isLoading = false;
        if (response.accessToken) {
          // Le token est déjà stocké dans le service
          //this.router.navigate(['/admin/dashboard']);
          this.router.navigate(['/home']);
        } else {
          console.log('Échec de la connexion:', response);
          this.errorMessage = response.message || 'Erreur de connexion';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Email ou mot de passe incorrect';
        console.error('Erreur de connexion:', error);
      }
    });
  }

  onForgotPassword() {
    if (!this.resetEmail) {
      this.errorMessage = 'Veuillez saisir votre email';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.resetMessage = '';

    this.authService.requestPasswordReset(this.resetEmail).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.resetMessage = response.message || 'Un lien de réinitialisation a été envoyé à votre email';
        this.showForgotPassword = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.error || 'Erreur lors de la demande de réinitialisation';
      }
    });
  }

  toggleForgotPassword() {
    console.log("--- showForgotPassword :: ", this.showForgotPassword);
    this.showForgotPassword = !this.showForgotPassword;
    this.errorMessage = '';
    this.resetMessage = '';
    this.resetEmail = '';
  }

  goToUserLogin() {
    this.router.navigate(['/user-login']);
  }

  goToHome() {
    this.router.navigate(['/']);
  }
}

