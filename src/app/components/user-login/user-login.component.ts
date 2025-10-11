import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-login.component.html',
  styleUrl: './user-login.component.css'
})
export class UserLoginComponent {
  email: string = '';
  codeAcces: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  showGenerateCode: boolean = false;
  generateEmail: string = '';
  generateMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    console.log('Tentative de connexion avec email :', this.email + ', et code d\'accès : ' + this.codeAcces);
    if (!this.email || !this.codeAcces) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    //this.isLoading = true;
    this.errorMessage = '';

    this.authService.authenticateUserWithCode(this.email, this.codeAcces).subscribe({
      next: (response) => {
        console.log('Réponse de l\'API après tentative de connexion avec code d\'accès :', response);
        this.isLoading = false;
        if (response.accessToken) {
          // Le token est déjà stocké dans le service
          //this.router.navigate(['/user/dashboard']);
          this.router.navigate(['/home']);
        } else {
          this.errorMessage = response.message || 'Erreur de connexion';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Email ou code d\'accès incorrect';
        console.error('Erreur de connexion:', error);
      }
    });
  }

  onGenerateCode() {
    if (!this.generateEmail) {
      this.errorMessage = 'Veuillez saisir votre email';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.generateMessage = '';

    this.authService.generateAccessCode(this.generateEmail).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.generateMessage = response.message || 'Un nouveau code d\'accès a été envoyé à votre email';
        this.showGenerateCode = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.error || 'Erreur lors de la génération du code';
      }
    });
  }

  toggleGenerateCode() {
    this.showGenerateCode = !this.showGenerateCode;
    this.errorMessage = '';
    this.generateMessage = '';
    this.generateEmail = '';
  }

  goToAdminLogin() {
    this.router.navigate(['/admin-login']);
  }

  goToHome() {
    this.router.navigate(['/']);
  }
}

