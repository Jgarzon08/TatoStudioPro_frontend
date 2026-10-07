import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { About } from './pages/about/about';
import { Contact } from './pages/contact/contact';
import { Portfolio } from './pages/portfolio/portfolio';
import { Services } from './pages/services/services';
import { Login } from './pages/login/login';
import { Admin } from './pages/admin/admin';
import { NotFound } from './pages/not-found/not-found';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Home, title: 'Tato Studio - Inicio' },
  { path: 'about', component: About, title: 'Acerca de mí - Tato Studio' },
  { path: 'portfolio', component: Portfolio, title: 'Portafolio - Tato Studio' },
  { path: 'servicios', component: Services, title: 'Servicios - Tato Studio' },
  { path: 'services', redirectTo: 'servicios', pathMatch: 'full' },
  { path: 'contact', component: Contact, title: 'Contáctame - Tato Studio' },
  { path: 'login', component: Login, title: 'Acceso CMS - Tato Studio' },
  { path: 'admin', component: Admin, canActivate: [authGuard], title: 'Panel Administrador - Tato Studio' },
  { path: 'forms', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', component: NotFound, title: 'Página no encontrada - Tato Studio' },
];
