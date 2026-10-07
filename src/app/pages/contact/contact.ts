import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavBar } from '../../components/nav-bar/nav-bar';
import { Footer } from '../../components/footer/footer';
import { ContactService } from '../../services/contact.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, NavBar, Footer],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  private readonly contactService = inject(ContactService);

  fullName = '';
  email = '';
  eventType = '';
  message = '';

  isSubmitted = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  isLoading = signal(false);

  onSubmit(): void {
    this.isSubmitted.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    if (!this.fullName.trim() || !this.email.trim() || !this.eventType || !this.message.trim()) {
      this.errorMessage.set('Por favor completa todos los campos requeridos.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email.trim())) {
      this.errorMessage.set('Ingresa un correo electrónico válido.');
      return;
    }

    this.isLoading.set(true);

    this.contactService
      .sendMessage({
        fullName: this.fullName.trim(),
        email: this.email.trim(),
        eventType: this.eventType,
        message: this.message.trim(),
      })
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.successMessage.set(
            response.message || '¡Gracias por comunicarte! Tu mensaje ha sido recibido con éxito en Tato Studio.'
          );
          this.fullName = '';
          this.email = '';
          this.eventType = '';
          this.message = '';
          this.isSubmitted.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);
          const serverMsg = err?.error?.message;
          this.errorMessage.set(
            serverMsg || 'No pudimos procesar el mensaje en este momento. Por favor contáctanos por WhatsApp.'
          );
        },
      });
  }
}
