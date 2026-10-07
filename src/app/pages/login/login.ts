import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { Footer } from '../../components/footer/footer';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Footer],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/admin']);
    }
  }

  onLogin(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (!this.email.trim() || !this.password) {
      this.errorMessage.set('Por favor ingresa tu correo y contraseña.');
      return;
    }

    this.isLoading.set(true);

    this.authService
      .login({
        email: this.email.trim(),
        password: this.password,
      })
      .subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.successMessage.set(`¡Bienvenido/a, ${res.user?.name || 'Administrador'}! Redirigiendo al panel...`);
          setTimeout(() => {
            this.router.navigate(['/admin']);
          }, 600);
        },
        error: (err) => {
          this.isLoading.set(false);
          const msg = err?.error?.message;
          this.errorMessage.set(msg || 'No fue posible iniciar sesión. Verifica tus credenciales.');
        },
      });
  }
}
