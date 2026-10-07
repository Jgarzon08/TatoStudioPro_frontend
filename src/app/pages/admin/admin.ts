import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PortfolioService, PortfolioItem } from '../../services/portfolio.service';
import { ContactService, ContactMessageItem } from '../../services/contact.service';
import { ServicesService, BackendService } from '../../services/services.service';
import { UserService, UserItem } from '../../services/user.service';

export interface FilePreviewItem {
  file: File;
  name: string;
  url: string;
  sizeKb: number;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  readonly authService = inject(AuthService);
  private readonly portfolioService = inject(PortfolioService);
  private readonly contactService = inject(ContactService);
  private readonly servicesService = inject(ServicesService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  // Pestaña activa ('portfolio' | 'messages' | 'services' | 'users')
  activeTab = signal<'portfolio' | 'messages' | 'services' | 'users'>('portfolio');

  // Estado de alertas flotantes
  alertMessage = signal('');
  alertType = signal<'success' | 'danger'>('success');

  // ==========================================
  // 1. MÓDULO PORTAFOLIO & CATEGORÍAS
  // ==========================================
  portfolioList = signal<PortfolioItem[]>([]);
  categoriesList = signal<string[]>(['wedding', 'arte', 'restaurantes']);
  
  // Selección múltiple de fotos (hasta 10)
  selectedFiles: File[] = [];
  filePreviews = signal<FilePreviewItem[]>([]);
  newPhotoTitle = '';
  newPhotoCategory = 'wedding';
  newPhotoTags = '';
  isUploadingPhotos = signal(false);

  // Creación de nueva categoría
  showNewCategoryInput = signal(false);
  newCategoryName = '';

  // ==========================================
  // 2. MÓDULO MENSAJES DE CONTACTO
  // ==========================================
  messagesList = signal<ContactMessageItem[]>([]);
  messageFilter = signal<'todos' | 'pendiente' | 'leido' | 'respondido'>('todos');

  filteredMessages = computed(() => {
    const filter = this.messageFilter();
    const list = this.messagesList();
    if (filter === 'todos') return list;
    return list.filter((m) => m.status === filter);
  });

  unreadMessagesCount = computed(() => {
    return this.messagesList().filter((m) => m.status === 'pendiente').length;
  });

  // ==========================================
  // 3. MÓDULO SERVICIOS Y PAQUETES
  // ==========================================
  servicesList = signal<BackendService[]>([]);
  editingService = signal<BackendService | null>(null);
  
  // Nuevo servicio
  showNewServiceForm = signal(false);
  newServiceTitle = '';
  newServiceCategory = 'Fotografía Comercial';
  newServicePrice = 0;
  newServiceDescription = '';
  newServiceFeatures = '';

  // ==========================================
  // 4. MÓDULO USUARIOS (EQUIPO CMS)
  // ==========================================
  usersList = signal<UserItem[]>([]);
  showNewUserForm = signal(false);
  newUserName = '';
  newUserEmail = '';
  newUserPassword = '';
  newUserRole: 'admin' | 'user' = 'user';
  isCreatingUser = signal(false);

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.loadPortfolio();
    this.loadCategories();
    this.loadMessages();
    this.loadServices();
    if (this.authService.currentUser()?.role === 'admin') {
      this.loadUsers();
    }
  }

  // --- SESIÓN ---
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // ==========================================
  // LÓGICA DE PORTAFOLIO Y SUBIDA MÚLTIPLE
  // ==========================================
  loadPortfolio(): void {
    this.portfolioService.getPortfolio().subscribe({
      next: (items) => this.portfolioList.set(items || []),
      error: () => this.showAlert('No se pudo cargar el portafolio.', 'danger'),
    });
  }

  loadCategories(): void {
    this.portfolioService.getCategories().subscribe({
      next: (cats) => {
        if (cats && cats.length > 0) {
          const merged = Array.from(new Set([...this.categoriesList(), ...cats]));
          this.categoriesList.set(merged);
        }
      },
      error: () => {},
    });
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const filesArray = Array.from(input.files);

    if (filesArray.length > 10) {
      this.showAlert('Solo puedes subir un máximo de 10 fotografías al mismo tiempo. Se han tomado las primeras 10.', 'danger');
    }

    const limitedFiles = filesArray.slice(0, 10);
    this.selectedFiles = limitedFiles;

    const previews: FilePreviewItem[] = [];
    limitedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        previews.push({
          file,
          name: file.name,
          url: reader.result as string,
          sizeKb: Math.round(file.size / 1024),
        });
        if (previews.length === limitedFiles.length) {
          this.filePreviews.set([...previews]);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  removeSelectedFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.filePreviews.update((list) => list.filter((_, i) => i !== index));
  }

  uploadPhotos(): void {
    if (this.selectedFiles.length === 0) {
      this.showAlert('Por favor selecciona al menos una imagen para subir.', 'danger');
      return;
    }
    if (!this.newPhotoTitle.trim()) {
      this.showAlert('Escribe un título descriptivo para la fotografía o serie.', 'danger');
      return;
    }

    this.isUploadingPhotos.set(true);
    const formData = new FormData();

    this.selectedFiles.forEach((file) => {
      formData.append('images', file);
    });

    formData.append('title', this.newPhotoTitle.trim());
    formData.append('category', this.newPhotoCategory.toLowerCase());
    formData.append('tags', this.newPhotoTags);

    this.portfolioService.uploadPhotos(formData).subscribe({
      next: (res) => {
        this.isUploadingPhotos.set(false);
        this.showAlert(res.message || '¡Fotografías subidas con éxito!', 'success');
        this.selectedFiles = [];
        this.filePreviews.set([]);
        this.newPhotoTitle = '';
        this.newPhotoTags = '';
        this.loadPortfolio();
      },
      error: (err) => {
        this.isUploadingPhotos.set(false);
        const msg = err?.error?.message;
        this.showAlert(msg || 'Error al procesar la subida de imágenes.', 'danger');
      },
    });
  }

  deletePhoto(item: PortfolioItem): void {
    if (!item._id) return;
    const confirmDelete = confirm(`¿Estás seguro/a de eliminar la fotografía "${item.title}"?`);
    if (!confirmDelete) return;

    this.portfolioService.deletePhoto(item._id).subscribe({
      next: () => {
        this.portfolioList.update((list) => list.filter((p) => p._id !== item._id));
        this.showAlert('Fotografía eliminada correctamente.', 'success');
      },
      error: () => this.showAlert('No fue posible eliminar la fotografía.', 'danger'),
    });
  }

  // --- CREAR NUEVA CATEGORÍA ---
  toggleNewCategoryInput(): void {
    this.showNewCategoryInput.set(!this.showNewCategoryInput());
    this.newCategoryName = '';
  }

  saveNewCategory(): void {
    const raw = this.newCategoryName.trim().toLowerCase();
    if (!raw) {
      this.showAlert('Escribe el nombre de la nueva categoría.', 'danger');
      return;
    }

    if (this.categoriesList().includes(raw)) {
      this.showAlert(`La categoría "${raw}" ya existe.`, 'danger');
      this.newPhotoCategory = raw;
      this.showNewCategoryInput.set(false);
      return;
    }

    this.categoriesList.update((cats) => [...cats, raw]);
    this.newPhotoCategory = raw;
    this.showNewCategoryInput.set(false);
    this.newCategoryName = '';
    this.showAlert(`Categoría "${raw}" agregada correctamente.`, 'success');
  }

  // ==========================================
  // LÓGICA DE MENSAJES (REACTIVIDAD INMEDIATA)
  // ==========================================
  loadMessages(): void {
    this.contactService.getMessages().subscribe({
      next: (items) => this.messagesList.set(items || []),
      error: () => {},
    });
  }

  updateMessageStatus(msg: ContactMessageItem, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value as 'pendiente' | 'leido' | 'respondido';

    this.contactService.updateMessageStatus(msg._id, newStatus).subscribe({
      next: () => {
        // Actualizamos la señal de forma inmutable para que computed() reaccione inmediatamente
        this.messagesList.update((list) =>
          list.map((m) => (m._id === msg._id ? { ...m, status: newStatus } : m))
        );
        this.showAlert(`Mensaje de ${msg.fullName} marcado como "${newStatus}".`, 'success');
      },
      error: () => this.showAlert('Error al actualizar el estado del mensaje.', 'danger'),
    });
  }

  deleteMessage(msg: ContactMessageItem): void {
    const confirmDelete = confirm(`¿Deseas eliminar el mensaje de ${msg.fullName}?`);
    if (!confirmDelete) return;

    this.contactService.deleteMessage(msg._id).subscribe({
      next: () => {
        this.messagesList.update((list) => list.filter((m) => m._id !== msg._id));
        this.showAlert('Mensaje eliminado correctamente.', 'success');
      },
      error: () => this.showAlert('Error al eliminar mensaje.', 'danger'),
    });
  }

  getWhatsAppReplyUrl(msg: ContactMessageItem): string {
    const raw = (msg.phone || '').replace(/[^0-9]/g, '');
    let cleanPhone = raw;
    if (raw.length === 10) {
      cleanPhone = `57${raw}`;
    }
    const clientName = encodeURIComponent(msg.fullName || 'Cliente');
    if (!cleanPhone) {
      return `https://wa.me/?text=Hola%20${clientName},%20gracias%20por%20contactar%20a%20Tato%20Studio.`;
    }
    return `https://wa.me/${cleanPhone}?text=Hola%20${clientName},%20gracias%20por%20contactar%20a%20Tato%20Studio.%20Recibimos%20tu%20solicitud%20para%20${encodeURIComponent(msg.eventType || 'tu evento')}.`;
  }

  // ==========================================
  // LÓGICA DE SERVICIOS (AGREGAR, EDITAR, BORRAR)
  // ==========================================
  loadServices(): void {
    this.servicesService.getServices().subscribe({
      next: (items) => this.servicesList.set(items || []),
      error: () => {},
    });
  }

  toggleNewServiceForm(): void {
    this.showNewServiceForm.set(!this.showNewServiceForm());
    this.newServiceTitle = '';
    this.newServiceCategory = 'Fotografía Comercial';
    this.newServicePrice = 0;
    this.newServiceDescription = '';
    this.newServiceFeatures = '';
  }

  saveNewService(): void {
    if (!this.newServiceTitle.trim()) {
      this.showAlert('El título del servicio es obligatorio.', 'danger');
      return;
    }

    const feats = this.newServiceFeatures
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    const newServicePayload: Partial<BackendService> = {
      title: this.newServiceTitle.trim(),
      category: this.newServiceCategory.trim(),
      price: Number(this.newServicePrice) || 0,
      description: this.newServiceDescription.trim(),
      features: feats,
      isActive: true,
    };

    this.servicesService.createService(newServicePayload).subscribe({
      next: (res) => {
        this.servicesList.update((list) => [...list, res.data]);
        this.showAlert(`Servicio "${res.data.title}" agregado con éxito.`, 'success');
        this.toggleNewServiceForm();
      },
      error: () => this.showAlert('Error al registrar el nuevo servicio.', 'danger'),
    });
  }

  startEditService(service: BackendService): void {
    this.editingService.set({
      ...service,
      features: [...(service.features || [])],
    });
  }

  cancelEditService(): void {
    this.editingService.set(null);
  }

  saveEditedService(): void {
    const s = this.editingService();
    if (!s || !s._id) return;

    this.servicesService.updateService(s._id, s).subscribe({
      next: (res) => {
        this.servicesList.update((list) =>
          list.map((item) => (item._id === s._id ? res.data : item))
        );
        this.showAlert(`Servicio "${s.title}" actualizado con éxito.`, 'success');
        this.editingService.set(null);
      },
      error: () => this.showAlert('No se pudo guardar la información del servicio.', 'danger'),
    });
  }

  deleteService(serv: BackendService): void {
    if (!serv._id) return;
    const confirmDelete = confirm(`¿Estás seguro/a de eliminar el servicio "${serv.title}"?`);
    if (!confirmDelete) return;

    this.servicesService.deleteService(serv._id).subscribe({
      next: () => {
        this.servicesList.update((list) => list.filter((item) => item._id !== serv._id));
        this.showAlert(`Servicio "${serv.title}" eliminado correctamente.`, 'success');
      },
      error: () => this.showAlert('Error al eliminar el servicio.', 'danger'),
    });
  }

  // ==========================================
  // LÓGICA DE USUARIOS (CREAR Y GESTIONAR)
  // ==========================================
  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => this.usersList.set(users || []),
      error: () => {},
    });
  }

  toggleNewUserForm(): void {
    this.showNewUserForm.set(!this.showNewUserForm());
    this.newUserName = '';
    this.newUserEmail = '';
    this.newUserPassword = '';
    this.newUserRole = 'user';
  }

  createUser(): void {
    if (!this.newUserName.trim() || !this.newUserEmail.trim() || !this.newUserPassword) {
      this.showAlert('Todos los campos son obligatorios para crear el usuario.', 'danger');
      return;
    }

    this.isCreatingUser.set(true);
    this.userService
      .createUser({
        name: this.newUserName.trim(),
        email: this.newUserEmail.trim(),
        password: this.newUserPassword,
        role: this.newUserRole,
      })
      .subscribe({
        next: (res) => {
          this.isCreatingUser.set(false);
          this.usersList.update((list) => [res.user, ...list]);
          this.showAlert(`Usuario "${res.user.name}" creado con éxito.`, 'success');
          this.toggleNewUserForm();
        },
        error: (err) => {
          this.isCreatingUser.set(false);
          const msg = err?.error?.message;
          this.showAlert(msg || 'Error al crear el nuevo usuario.', 'danger');
        },
      });
  }

  deleteUser(user: UserItem): void {
    if (!user._id) return;
    if (user.email === this.authService.currentUser()?.email) {
      this.showAlert('No puedes eliminar tu propia cuenta activa de administrador.', 'danger');
      return;
    }

    const confirmDelete = confirm(`¿Deseas eliminar al usuario "${user.name}" (${user.email})?`);
    if (!confirmDelete) return;

    this.userService.deleteUser(user._id).subscribe({
      next: () => {
        this.usersList.update((list) => list.filter((u) => u._id !== user._id));
        this.showAlert('Usuario eliminado correctamente.', 'success');
      },
      error: () => this.showAlert('Error al eliminar usuario.', 'danger'),
    });
  }

  // --- UTILIDADES ---
  showAlert(message: string, type: 'success' | 'danger'): void {
    this.alertMessage.set(message);
    this.alertType.set(type);
    setTimeout(() => {
      this.alertMessage.set('');
    }, 4500);
  }
}
