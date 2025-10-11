import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map, catchError, throwError, of } from 'rxjs';
import { environment } from '../../environment/environment';
import { PdfMetadata, QrCodeMetadata } from './qr-code.service';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { AuthUser } from '../interfaces/auth';

export interface LoginRequest {
  email: string;
  password?: string;
  codeAcces?: string;
}

export interface UserActionDto {
  id: number;
  typeAction: string;
  timestamp: string;
  userName: string;
  description: string;
  dateAction: Date;
}

export interface JwtResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  id: number;
  nom: string;
  email: string;
  message: string;
  roles: string[];
}

export interface LoginResponse {
  token: string;
  message: string;
}

export interface RegisterRequest {
  nom: string;
  email: string;
  password: string;
  role?: string;
}

export interface User {
  id: number;
  nom: string;
  email: string;
  role: string;
  token: string,
  actif: boolean;
  dateCreation: string;
  dateModification: string;
}

//Pour décoder le token
interface Authority {
  authority: string;
}

interface CustomJwtPayload {
  sub: string;
  role: Authority[];
  email?: string;
  exp?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl: string | undefined;
  private isProd = environment.production;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  //user = signal<User | undefined| null>(undefined);
  private currentUserRole: string | null = null;

  //Pour décoder le token
  private user: CustomJwtPayload | null = null;

  constructor(private http: HttpClient) {
    // Vérifier si l'utilisateur est déjà connecté
    //this.checkStoredAuth();
    // Définir l'URL de l'API selon l'environnement
    if (this.isProd) {
      this.apiUrl = environment.apiUrlProd;
    } else {
      this.apiUrl = environment.apiUrlDev;
    }
    //Recharger les infos du user dès l’initialisation du service
    this.loadUserFromStorage();
  }

  private checkStoredAuth() {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Récupérer le profil utilisateur pour vérifier la validité du token
      this.getUserProfile().subscribe({
        next: (user) => {
          this.currentUserSubject.next(user);
          console.log("this.currentUserSubject.next(user) :: ", this.currentUserSubject.next(user));
        },
        error: () => {
          this.logout();
        }
      });
    }
  }

  // Pour décoder le token
  private loadUserFromStorage() {
    const token = localStorage.getItem('authToken');
    //console.log('[AuthService] token :: ', token);
    if (token) {
      this.decodeToken(token); // met à jour this.user
    }
  }
  // Récupère seulement les rôles sous forme de string
  public getRoles(): string[] {
    return this.user?.role?.map(r => r.authority) || [];
  }
  private decodeToken(token: string): CustomJwtPayload {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.user = payload;
      return payload;
    } catch (e) {
      console.error('Erreur décodage token', e);
      this.user = null;
      return null as any;
    }
  }

  private isTokenExpired(): boolean {
    if (!this.user?.exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return this.user.exp < now;
  }

  register(userData: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/register`, userData);
  }

  authenticate(email: string, password: string): Observable<JwtResponse> {
    const loginData: LoginRequest = { email, password };
    return this.http.post<JwtResponse>(`${this.apiUrl}/auth/authenticate`, loginData)
      .pipe(
        tap(response => {
          console.log('Réponse de l\'API apres authentification:', response);
          localStorage.setItem('authToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);
          console.log('Roles:', response.roles[0]);
          this.user = this.decodeToken(response.accessToken); 
          localStorage.setItem('username', response.nom);
          this.currentUserRole = response.roles[0];
          this.getUserProfile().subscribe(user => {
            this.currentUserSubject.next(user);
          });
        })
      );
  }

  authenticateUserWithCode(email: string, codeAcces: string): Observable<JwtResponse> {
    const loginData: LoginRequest = { email, codeAcces };
    console.log('Données de connexion avec code d\'accès:', loginData);
    return this.http.post<JwtResponse>(`${this.apiUrl}/auth/authenticate-user-code`, loginData)
      .pipe(
        tap(response => {
          console.log('Réponse de l\'API apres authentification avec code d\'accès:', response);
          this.currentUserRole = response.roles[0] || 'USER'; // Rôle par défaut pour les utilisateurs standards
          localStorage.setItem('authToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);
          this.user = this.decodeToken(response.accessToken);
          localStorage.setItem('username', response.nom);
          this.getUserProfile().subscribe(user => {
            this.currentUserSubject.next(user);
          });
        })
      );
  }

    // Méthode pour rafraîchir le token; Utilisé dans l'[interceptor] et le [guard]
  refreshToken(): Observable<any> {
    console.log('[AuthService] Tentative de rafraîchissement du token');
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      console.log('[AuthService] Refresh token trouvé: ', refreshToken);
      console.log('[AuthService] Appel API pour rafraîchir le token: ');
      return this.http.post<any>(this.apiUrl  + '/auth/refresh-token', { refreshToken }).pipe(
        tap(response => {
          console.log('[AuthService] Nouveau token reçu du serveur après rafraîchissement');
          // Mettre à jour le token et le refresh token dans le localStorage
          localStorage.setItem('authToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);
          this.user = this.decodeToken(response.accessToken);

          const authUser: AuthUser = {
            id: response.id,
            nom: response.nom,
            email: response.email,
            roles: response.roles,
            token: response.accessToken,
            refreshToken: response.refreshToken,
            tokenType: response.type,
            message: response.message
          };
          const user : User = {
            id: authUser.id,
            nom: authUser.nom,
            email: authUser.email,
            role: authUser.roles[0],
            actif: true,
            token:response.accessToken,
            dateCreation: '',
            dateModification: '',
          }
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          console.log('[AuthService] currentUser mis à jour après rafraîchissement :: ', this.getCurrentUser());
        }),
        map(() => true),
        catchError(error => {
          console.error('[AuthService] Échec du rafraîchissement du token:', error);
          // En cas d'erreur (ex: refresh token invalide), déconnecter l'utilisateur
          this.logout();
          return throwError(() => error);
        })
      );
    } else {
      console.warn('[AuthService] Aucun refresh token disponible, impossible de rafraîchir le token');
      // Pas de refresh token, déconnecter l'utilisateur
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  generateAccessCode(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/generate-access-code`, { email });
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/password-reset/request`, { email });
  }

  validateResetToken(token: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auth/password-reset/validate/${token}`);
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/password-reset/reset`, { token, newPassword });
  }
  updateUserPassword(passwordData: any): Observable<any> {
    console.log("passwordData :: ", passwordData)
    const headers = this.getAuthHeaders();
    return this.http.put<any>(`${this.apiUrl}/auth/reset-password`, passwordData, { headers });
  }

  logout(): Observable<void> {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.user = null; // Réinitialiser l'utilisateur décodé
    return this.http.post<void>(`${this.apiUrl}/auth/logout`, {});
  }

  checkIfAuthenticated(): Observable<boolean> {
    return this.isAuthenticated();
  }

  isAuthenticated(): Observable<boolean> {
    const valid = !!this.user && !this.isTokenExpired();
    console.log('Utilisateur décodé:', this.user);
    console.log('Token expiré ?:', this.isTokenExpired());
    console.log('isAuthenticated return (initial):', valid);

    if (valid) {
      return of(true); // Le token est valide, retourne un Observable de true
    } else {
      // Le token est expiré ou inexistant, tenter de le rafraîchir
      return this.refreshToken().pipe(
        map(() => {
          // Si le rafraîchissement réussit, vérifier à nouveau l'authentification
          // (le token et l'utilisateur auront été mis à jour par refreshToken)
          const refreshedValid = !!this.user && !this.isTokenExpired();
          console.log('isAuthenticated return (après refresh):', refreshedValid);
          return refreshedValid;
        }),
        catchError(() => {
          // Si le rafraîchissement échoue, l'utilisateur est déconnecté par refreshToken()
          // Retourne false pour indiquer que l'authentification a échoué
          console.log('isAuthenticated return (refresh échoué):', false);
          return of(false);
        })
      );
    }
  }

  isAdmin(): boolean {
    return this.getRoles().includes('ADMIN');
  }

  isManager(): boolean {
    return this.getRoles().includes('MANAGER');
  }

  isUser(): boolean {
    return this.getRoles().includes('USER');
  }

  isAdminOrManager(): boolean {
    return this.isAdmin() || this.isManager();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Méthodes pour l'administration
  getAllUsers(): Observable<User[]> {
    const headers = this.getAuthHeaders();
    console.log('Headers pour getAllUsers:', headers);
    return this.http.get<User[]>(`${this.apiUrl}/admin/users`, { headers });
  }

  createUser(userData: any): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.post<User>(`${this.apiUrl}/admin/users`, userData, { headers });
  }

  updateUserRole(userId: number, role: string): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.put<User>(`${this.apiUrl}/admin/users/${userId}/role`, { role }, { headers });
  }

  resetUserCode(userId: number): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.put<User>(`${this.apiUrl}/admin/users/${userId}/access-code`, {}, { headers });
  }

  toggleUserStatus(userId: number): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.put<User>(`${this.apiUrl}/admin/users/${userId}/status`, {}, { headers });
  }

  getAllActions(): Observable<UserActionDto[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<UserActionDto[]>(`${this.apiUrl}/admin/actions`, { headers });
  }

  deleteQrCode(uniqueId: number): Observable<number> {
    const headers = this.getAuthHeaders();
    return this.http.delete<number>(`${this.apiUrl}/admin/qrcodes/${uniqueId}`, { headers });
  }

  getAllQrCodes(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiUrl}/admin/qrcodes`, { headers });
  }

  // Méthodes pour les utilisateurs
  getUserProfile(): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.get<User>(`${this.apiUrl}/users/profile`, { headers });
  }

  updateUserProfile(profileData: any): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.put<User>(`${this.apiUrl}/users/profile`, profileData, { headers });
  }

  getUserActions(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiUrl}/users/actions`, { headers });
  }

  getUserQrCodes(): Observable<QrCodeMetadata[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<QrCodeMetadata[]>(`${this.apiUrl}/users/qrcodes`, { headers });
  }

  getUserPdfs(): Observable<PdfMetadata[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<PdfMetadata[]>(`${this.apiUrl}/users/pdfs`, { headers });
  }

  // Méthode helper pour extraire les infos utilisateur du TOKEN
  extractUserFromToken(token: string) {
    // try {
    //   const payload = JSON.parse(atob(token.split('.')[1]));
    //   // console.log('[AuthService] payload '+  JSON.stringify(payload));
    //     const newLocal: User = {
    //       id: payload.id,
    //       nom: payload.name,
    //       email: payload.email,
    //       role: payload.role,
    //       actif: payload.status,
    //       dateCreation: '',
    //       dateModification: ''
    //     };
    //     //this.user.set(newLocal);
    //     //console.log('[AuthService] this.userGoogle '+  JSON.stringify(this.user()));
    //   } catch (e) {
    //     console.error('Erreur de décodage du token', e);
    //   }
  }

  getUser(): CustomJwtPayload | null {
    return this.user;
  }
}

