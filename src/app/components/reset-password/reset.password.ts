import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeaderComponent } from "../header/header";
import { ToastrService } from 'ngx-toastr';

export interface ResetPasswordRequest{
  token: string,
  newPassword: string
}

@Component({
  selector: 'app-rest-password',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule ],
  templateUrl: './reset.password.html',
  styleUrl: './reset.password.css'
})
export class ResetPassWordComponent {
  newpassForm!: FormGroup;
  isEmail = true;
  isPassword = false;
  submitted = false;
  returnUrl!: string;
  token!: string;
  error!: string;
  showPassword = false;
  showConfirmPassword = false;
  newpassword: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  showForgotPassword: boolean = false;
  resetEmail: string = '';
  resetMessage: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      console.log('Token reçu:', token);
      this.token = token;
      } else {
        this.error = 'Aucun token fourni';
      }

    // Récupérer l'URL de retour depuis les paramètres de route ou par défaut '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/login';
  }

  onSubmit() {
    this.submitted = true;
    if (!this.newpassword || !this.confirmPassword) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }
    if (this.newpassword !== this.confirmPassword) {
      this.toastr.error('Les mots de passe ne correspondent pas', 'Erreur');
      return;
    }

    this.isLoading = true;

      const data : any = {
        newPassword: this.newpassword,
        confirmPassword: this.confirmPassword
      };
      console.log('Data Reset PasswordRequest :: ', data); 
      this.authService.resetPassword(this.token, this.confirmPassword).subscribe({
        next: (data) => {
          console.log('Réinitialisation du mot de passe réussie:', data);
          this.toastr.success(data.message, 'Succès');
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          console.error('Erreur lors de la réinitialisation du mot de passe:', error.error.error);    
          this.toastr.error(error.error.error || 'Erreur de connexion', 'Erreur');
          this.isLoading = false;
        }
      });
  }

  toggleForgotPassword() {
    this.router.navigate(['/admin-login']);
  }

  goToUserLogin() {
    this.router.navigate(['/user-login']);
  }

  goToHome() {
    this.router.navigate(['/']);
  }
}

