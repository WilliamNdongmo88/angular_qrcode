import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { QrCodeMetadata, QrCodeService } from '../../services/qr-code.service';
import { HeaderComponent } from "../header/header";
import { CommunicationService } from '../../services/communication.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})
export class UserDashboardComponent implements OnInit {
  user: any = null;
  qrCodes: QrCodeMetadata[] = [];
  generatedQrCode: QrCodeMetadata | null = null;
  actions: any[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  
  // Onglet actuel
  currentTab = 'qrcodes';
  
  // Formulaire de génération de QR code
  showQrForm = false;
  qrContent = '';
  
  // Formulaire de modification du profil
  showProfileData = true;
  showProfileForm = false;
  isResetPassword = false;
  @Input() isResetPass: boolean = false;
  profileForm = {
    nom: '',
    email: ''
  };

  passwordForm = {
    currentPassword: '',
    newPassword: '',
    newPasswordConfirm: ''
  }

  // Communication avec AdminDashboardComponent
  isOriginalPage = false
  isUserTemplate = true;

  constructor(
    private authService: AuthService,
    private qrCodeService: QrCodeService,
    private router: Router,
    private toastr: ToastrService,
    private communicationService: CommunicationService
  ) {}

  ngOnInit() {
    console.log("--- onInit 1---");
    if (!this.authService.isAuthenticated()) {
      console.log("--- onInit ---");
      this.router.navigate(['/user-login']);
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      return;
    }
    this.communicationService.message$.subscribe(msg => {
      this.isOriginalPage = msg;
    });
    this.loadUserData();
  }

  loadUserData() {
    this.loadProfile();
    this.loadQrCodes();
    this.loadActions();
  }

  loadProfile() {
    this.authService.getUserProfile().subscribe({
      next: (user) => {
        this.user = user;
        this.profileForm = {
          nom: user.nom,
          email: user.email
        };
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement, veuillez rafraîchir la page';
        console.error('Erreur:', error);
      }
    });
  }

  loadQrCodes() {
    this.authService.getUserQrCodes().subscribe({
      next: (qrCodes) => {
        console.log('QR Codes chargés:', qrCodes);
        this.qrCodes = qrCodes;
        for (let qr of qrCodes) {
          this.generatedQrCode = qr;
          console.log('Premier QR code:', this.generatedQrCode);
          // break; // Juste pour afficher le premier QR code généré
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des QR codes:', error);
      }
    });
  }

  loadActions() {
    this.authService.getUserActions().subscribe({
      next: (actions) => {
        this.actions = actions;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des actions:', error);
      }
    });
  }

  generateQrCode() {
    if (!this.qrContent.trim()) {
      this.errorMessage = 'Veuillez entrer le contenu du QR code';
      return;
    }

    this.isLoading = true;
    this.qrCodeService.generateQrCode(this.qrContent).subscribe({
      next: (response: any) => {
        this.successMessage = 'QR code généré avec succès';
        this.qrContent = '';
        this.showQrForm = false;
        this.loadQrCodes(); // Recharger la liste
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Erreur lors de la génération du QR code';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  getQrCodeImageUrl(): string {
    //console.log('this.generatedQrCode dans getQrCodeImageUrl():', this.generatedQrCode);
    if (this.generatedQrCode) {
      return this.qrCodeService.viewQrCode(this.generatedQrCode.qrCodeId);
    }
    return '';
  }

  updateProfile() {
    if (!this.profileForm.nom || !this.profileForm.email) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    this.isLoading = true;
    this.authService.updateUserProfile(this.profileForm).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.successMessage = 'Profil mis à jour avec succès';
        this.isResetPassword = false;
        this.showProfileForm = false;
        this.showProfileData = true;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la mise à jour du profil';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  updatePassword() {
    if (!this.passwordForm.currentPassword ||
        !this.passwordForm.newPassword ||
        !this.passwordForm.newPasswordConfirm) {
      this.toastr.error('Veuillez remplir tous les champs', 'Erreur');
      return;
    }

    if (this.passwordForm.newPassword !== this.passwordForm.newPasswordConfirm) {
      this.toastr.error('Les mots de passe ne correspondent pas', 'Erreur');
      return;
    }

    this.isLoading = true;
    console.log("passwordForm :: ", this.passwordForm)
    this.authService.updateUserPassword(this.passwordForm).subscribe({
      next: (updatedResp) => {
        console.log("updatedResp :: ", updatedResp);
        this.toastr.success('Mot de passe mis à jour avec succès', 'Success');
        //this.successMessage = 'Profil mis à jour avec succès';
        this.isResetPassword = false;
        this.showProfileForm = false;
        this.showProfileData = true;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        if (error.error && error.error.error) {
          console.error("❌ Erreur backend :", error.error.error);
          this.toastr.error(error.error.error, 'Erreur');
          //this.errorMessage = error.error.error;
          setTimeout(() => {
            this.errorMessage = '';
          }, 5000);
        } else {
          console.error("❌ Erreur inconnue :", error);
           if (error.error && error.error.message) {
            this.toastr.error(error.error.message, 'Erreur');
          } else {
            this.toastr.error("❌ Une erreur inattendue est survenue.", 'Erreur');
            //this.errorMessage = "❌ Une erreur inattendue est survenue.";
          }
          setTimeout(() => {
            this.errorMessage = '';
          }, 5000);
        }
      }
    });
  }

  setCurrentTab(tab: string) {
    console.log("### tab : ", tab);
    this.currentTab = tab;
    this.clearMessages();
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  resetQrForm() {
    this.qrContent = '';
    this.showQrForm = false;
  }

  changeProfileForm(){
    this.showProfileForm = true;
    this.showProfileData = false;
  }

  resetProfileForm() {
    this.profileForm = {
      nom: this.user?.nom || '',
      email: this.user?.email || ''
    };
    console.log("ProfilForm :: ", this.profileForm);
    this.showProfileData = true;
    this.showProfileForm = false;
    this.isResetPassword = false;
  }

  changePassword(){
    this.isResetPassword = true;
    this.showProfileForm = false;
    this.showProfileData = false;
  }

  resetPasswordForm() {
    this.passwordForm = {
      currentPassword: this.user?.currentPassword || '',
      newPassword: this.user?.newPassword || '',
      newPasswordConfirm: this.user?.newPasswordConfirm || '',
    };
    this.showProfileData = true;
    this.showProfileForm = false;
    this.isResetPassword = false;
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error: any) => {
        console.error('Erreur lors de la déconnexion:', error);
        this.router.navigate(['/']);
      }
    });
  }

  getActionBadgeClass(typeAction: string): string {
    switch (typeAction) {
      case 'CREATION_QR': return 'badge-primary';
      case 'CONNEXION': return 'badge-info';
      case 'MODIFICATION_PROFIL': return 'badge-warning';
      default: return 'badge-secondary';
    }
  }

  downloadQrCode(): void {
    if (this.generatedQrCode) {
      console.log("Download URL: ", this.generatedQrCode.downloadUrl + this.generatedQrCode.qrCodeId);
      window.open(this.generatedQrCode.downloadUrl + this.generatedQrCode.qrCodeId, '_blank');
    }
  }

  goToQrGenerator() {
    this.router.navigate(['/qr-generator']);
  }

  changeTemplate(){
    this.communicationService.triggerSenderAction();
  }
}

