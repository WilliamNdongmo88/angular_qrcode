export interface AuthUser {
  id: number;
  nom: string;
  email: string;
  roles: string[];
  token: string;
  refreshToken: string;
  tokenType: string;
  message: string;
}