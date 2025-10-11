import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { QrCodeMetadata } from '../../interfaces/qrcode.interface';
import { QrcodeService } from '../../services/qrcode.service';
import { ConfirmModalComponent } from "../confirm-modal/confirm-modal";
import { SpinnerComponent } from "../spinner/spinner";
import { UserDashboardComponent } from "../user-dashboard/user-dashboard.component";
import { HeaderComponent } from "../header/header";
import { CommunicationService } from '../../services/communication.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent, SpinnerComponent, UserDashboardComponent, HeaderComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  users: User[] = [];
  filteredUsersRole: User[] = [];
  actions: any[] = [];
  qrCodes: QrCodeMetadata[] = [];
  generatedQrCode: QrCodeMetadata | null = null;
  isLoading = false;
  isUserTemplate = false;
  errorMessage = '';
  successMessage = '';
  
  // Formulaire de création d'utilisateur
  showCreateUserForm = false;
  newUser = {
    nom: '',
    email: '',
    role: 'USER'
  };

  // Filtres et pagination
  userFilter = '';
  actionFilter = '';
  currentTab = 'users';

  // Modal de confirmation
  isModalVisible = false;
  modalMessage = '';
  selectedUserId: number | null = null;
  selectedQrcodeId: number | null = null;

  // Communication avec UserDashboardComponent
  isOriginalPage = true

  constructor(
    public authService: AuthService,
    private qrCodeService: QrcodeService,
    private router: Router,
    private communicationService: CommunicationService
  ) {}

  ngOnInit() {
    if (!this.authService.isAdminOrManager()) {
      this.router.navigate(['/admin-login']);
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      return;
    }
    this.communicationService.sendMessage(this.isOriginalPage);
    this.communicationService.triggerAction$.subscribe(() => {
      this.changeTemplate();
    });
    this.loadData();
  }

  loadData() {
    this.loadUsers();
    this.loadActions();
    this.loadQrCodes();
  }

  loadUsers() {
    this.isLoading = true;
    this.authService.getAllUsers().subscribe({
      next: (users) => {
        console.log('Utilisateurs chargés:', users);
        this.users = users;
        this.isLoading = false;
        setTimeout(() => {
          this.clearMessages();
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des utilisateurs';
        this.isLoading = false;
        console.error('Erreur:', error);
        setTimeout(() => {
          this.clearMessages();
        }, 2000);
      }
    });
  }

  loadActions() {
    this.authService.getAllActions().subscribe({
      next: (actions) => {
        console.log('Actions chargées:', actions);
        this.actions = actions;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des actions:', error);
      }
    });
  }

  loadQrCodes() {
    this.authService.getAllQrCodes().subscribe({
      next: (qrCodes) => {
        console.log('QR Codes chargés:', qrCodes);
        this.qrCodes = qrCodes;
        this.qrCodes.forEach(qrCode => {
          this.generatedQrCode = qrCode; 
        });
      },
      error: (error) => {
        console.error('Erreur lors du chargement des QR codes:', error);
      }
    });
  }

  getQrCodeImageUrl(): string {
    if (this.generatedQrCode) {
      return this.qrCodeService.viewQrCode(this.generatedQrCode.qrCodeId);
    }
    return '';
  }

  createUser() {
    if (!this.newUser.nom || !this.newUser.email) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    this.isLoading = true;
    this.authService.createUser(this.newUser).subscribe({
      next: (user) => {
        this.users.push(user);
        this.successMessage = 'Utilisateur créé avec succès';
        this.resetCreateUserForm();
        this.isLoading = false;
        setTimeout(() => {
          this.clearMessages();
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la création de l\'utilisateur';
        this.isLoading = false;
        console.error('Erreur:', error);
        setTimeout(() => {
          this.clearMessages();
        }, 2000);
      }
    });
  }

  updateUserRole(userId: number, newRole: string) {
    this.isLoading = true;
    this.authService.updateUserRole(userId, newRole).subscribe({
      next: (updatedUser) => {
        const index = this.users.findIndex(u => u.id === userId);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }
        this.successMessage = 'Rôle mis à jour avec succès';
        this.isLoading = false;
        setTimeout(() => {
          this.clearMessages();
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la mise à jour du rôle';
        console.error('Erreur:', error);
        setTimeout(() => {
          this.clearMessages();
        }, 2000);
      }
    });
  }

  toggleUserStatus(userId: number) {
    this.isLoading = true;
    this.authService.toggleUserStatus(userId).subscribe({
      next: (updatedUser) => {
        const index = this.users.findIndex(u => u.id === userId);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }
        this.successMessage = 'Statut utilisateur mis à jour';
        this.isLoading = false;
        setTimeout(() => {
          this.clearMessages();
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la mise à jour du statut';
        console.error('Erreur:', error);
        this.isLoading = false;
        setTimeout(() => {
          this.clearMessages();
        }, 2000);
      }
    });
  }

  resetUserCode(userId: number) {
    this.isLoading = true;
    this.authService.resetUserCode(userId).subscribe({
      next: () => {
        this.successMessage = 'Code d\'accès réinitialisé et envoyé par email';
        this.isLoading = false;
        setTimeout(() => {
          this.clearMessages();
        }, 2000);
      },
      error: (error: any) => {
        this.errorMessage = 'Erreur lors de la réinitialisation du code d\'accès';
        console.error('Erreur:', error);
        this.isLoading = false;
        setTimeout(() => {
          this.clearMessages();
        }, 2000);
      }
    });
  }

  deleteQrCode(qrCodeId: number) {
    this.authService.deleteQrCode(qrCodeId).subscribe({
      next: () => {
        this.qrCodes = this.qrCodes.filter(qr => qr.id !== qrCodeId);
        this.successMessage = 'QR code supprimé avec succès';
        setTimeout(() => {
          this.clearMessages();
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la suppression du QR code';
        console.error('Erreur:', error);
        setTimeout(() => {
          this.clearMessages();
        }, 2000);
      }
    });
  }

  resetCreateUserForm() {
    this.newUser = {
      nom: '',
      email: '',
      role: 'USER'
    };
    this.showCreateUserForm = false;
  }

  setCurrentTab(tab: string) {
    this.currentTab = tab;
    this.clearMessages();
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Erreur lors de la déconnexion:', error);
        this.router.navigate(['/']);
      }
    });
  }

  get filteredUsers() {
    this.filteredUsersRole = this.users.filter(u => u.role !== 'ADMIN');
    return this.filteredUsersRole.filter(user =>
      (user.nom?.toLowerCase() ?? '').includes(this.userFilter?.toLowerCase() ?? '') ||
      (user.email?.toLowerCase() ?? '').includes(this.userFilter?.toLowerCase() ?? '')
    );
}


  get filteredActions() {
    return this.actions.filter(action => 
      action.description?.toLowerCase().includes(this.actionFilter.toLowerCase()) ||
      action.typeAction?.toLowerCase().includes(this.actionFilter.toLowerCase())
    );
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ADMIN': return 'badge-danger';
      case 'MANAGER': return 'badge-warning';
      case 'USER': return 'badge-primary';
      default: return 'badge-secondary';
    }
  }

  getStatusBadgeClass(actif: boolean, role: string): string {
    // console.log("Role :: ", role);
    return actif ? 'badge-success' : 'badge-danger';
  }

  getActionBadgeClass(typeAction: string): string {
    switch (typeAction) {
      case 'CREATION_QR': return 'badge-primary';
      case 'CONNEXION': return 'badge-info';
      case 'MODIFICATION_PROFIL': return 'badge-warning';
      case 'SUPPRESSION_QR': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  // Gestion du modal de confirmation
openModal(userId?: number, message?: string, qrcodeId?: number) {
  this.isModalVisible = true;
  this.modalMessage = message || '';

  if (userId && userId !== 0) {
    this.selectedUserId = userId;
  } else if (qrcodeId && qrcodeId !== 0) {
    this.selectedQrcodeId = qrcodeId;
  }
}

  handleModalResponse(confirmed: boolean) {
    console.log("this.selectedUserId :: ", this.selectedUserId);
    console.log("this.selectedQrcodeId :: ", this.selectedQrcodeId);
    if (confirmed && this.selectedUserId) {
      if(this.modalMessage.includes('désactiver') || this.modalMessage.includes('activer')) {
        this.toggleUserStatus(this.selectedUserId);
      }else{
        this.resetUserCode(this.selectedUserId);
      }
      this.selectedUserId = null;
    }else if (confirmed && this.selectedQrcodeId) {
      this.deleteQrCode(this.selectedQrcodeId);
    }
    this.isModalVisible = false;
  }

  changeTemplate(){
    if (this.isUserTemplate) {
      this.isUserTemplate = false;
    } else {
      this.isUserTemplate = true;
    }
  }
}

