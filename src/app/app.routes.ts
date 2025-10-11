import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { UserLoginComponent } from './components/user-login/user-login.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { UserDashboardComponent } from './components/user-dashboard/user-dashboard.component';
import { QrGeneratorComponent } from './components/qr-generator/qr-generator.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { ResetPassWordComponent } from './components/reset-password/reset.password';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'admin-login', component: AdminLoginComponent },
  { path: 'user-login', component: UserLoginComponent },
  { path: 'reset-password', component: ResetPassWordComponent},
  { 
    path: 'admin/dashboard', 
    component: AdminDashboardComponent,
    canActivate: [AdminGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },
  { 
    path: 'user/dashboard', 
    component: UserDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['USER', 'MANAGER', 'ADMIN'] },
    children: [
      { path: 'qr-generator', component: QrGeneratorComponent },
      //{ path: 'settings', component: UserSettingsComponent }
    ]
  },
  { 
    path: 'qr-generator', 
    component: QrGeneratorComponent,
    canActivate: [AuthGuard],
    data: { roles: ['USER', 'MANAGER', 'ADMIN'] }
  },
  { path: '**', redirectTo: '' }
];

