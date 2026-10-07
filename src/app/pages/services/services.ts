import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavBar } from '../../components/nav-bar/nav-bar';
import { Footer } from '../../components/footer/footer';
import { ServicesService } from '../../services/services.service';

interface DisplayServiceItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  features: string[];
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [NavBar, Footer, RouterLink],
  templateUrl: './services.html',
  styleUrl: './services.css',
})
export class Services implements OnInit {
  private readonly servicesService = inject(ServicesService);

  private readonly defaultServices: DisplayServiceItem[] = [
    {
      id: 'productos',
      title: 'Fotografía de Productos',
      category: 'Comercial & Gastronomía',
      image: 'assets/rest2.jpeg',
      description:
        'Creación de contenido visual de alta gama para marcas, catálogos, restaurantes y e-commerce. Iluminación precisa y dirección de arte orientada a destacar texturas, colores y el valor distintivo de cada producto.',
      features: [
        'Fotografía de menú y platos de alta cocina',
        'Bodegones publicitarios y e-commerce',
        'Sesiones en locación o estudio con estilismo visual',
        'Edición minuciosa y entrega en máxima resolución',
      ],
    },
    {
      id: 'eventos',
      title: 'Fotografía de Eventos Sociales',
      category: 'Bodas & Celebraciones',
      image: 'assets/boda2.jpg',
      description:
        'Bodas íntimas, aniversarios y celebraciones que merecen ser recordadas para siempre. Un estilo documental y sensible que captura la espontaneidad y emoción genuina sin poses forzadas ni artificios.',
      features: [
        'Cobertura fotográfica completa de la celebración',
        'Sesiones pre-boda y retratos familiares espontáneos',
        'Enfoque en luz natural y narrativa emotiva',
        'Galería digital privada para descarga y selección',
      ],
    },
    {
      id: 'plataforma360',
      title: 'Plataforma 360',
      category: 'Experiencia Interactiva',
      image: 'assets/danza.jpg',
      description:
        'Una experiencia interactiva y memorable para eventos corporativos, bodas y fiestas. Captura de videos giratorios en cámara lenta con efectos personalizados para compartir al instante en redes sociales.',
      features: [
        'Estructura giratoria con iluminación LED profesional',
        'Grabación en video HD con música y plantillas personalizadas',
        'Descarga inmediata para invitados mediante código QR',
        'Operador profesional presente durante todo el evento',
      ],
    },
  ];

  readonly servicesList = signal<DisplayServiceItem[]>(this.defaultServices);
  readonly isLoading = signal(false);

  ngOnInit(): void {
    this.loadBackendServices();
  }

  private loadBackendServices(): void {
    this.isLoading.set(true);
    this.servicesService.getServices().subscribe({
      next: (data) => {
        this.isLoading.set(false);
        if (data && data.length > 0) {
          const sampleImages = ['assets/rest2.jpeg', 'assets/boda2.jpg', 'assets/danza.jpg', 'assets/artes1.jpeg'];
          const mapped: DisplayServiceItem[] = data
            .filter((item) => item.isActive !== false)
            .map((item, idx) => ({
              id: item._id || String(idx),
              title: item.title,
              category: item.category,
              image: sampleImages[idx % sampleImages.length],
              description: item.description,
              features: item.features || [],
            }));

          if (mapped.length > 0) {
            this.servicesList.set(mapped);
          }
        }
      },
      error: () => {
        this.isLoading.set(false);
        // Si hay error en la red, se mantienen los servicios por defecto de forma segura
      },
    });
  }
}
