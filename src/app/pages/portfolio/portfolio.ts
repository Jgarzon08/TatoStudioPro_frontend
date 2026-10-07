import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBar } from '../../components/nav-bar/nav-bar';
import { Footer } from '../../components/footer/footer';
import { PortfolioService, PortfolioItem } from '../../services/portfolio.service';

interface CategoryConfig {
  prefix: string;
  ext: string;
  total: number;
}

export interface CategoryCardView {
  id: string;
  title: string;
  cover: string;
}

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, NavBar, Footer],
  templateUrl: './portfolio.html',
  styleUrl: './portfolio.css',
})
export class Portfolio implements OnInit {
  private readonly portfolioService = inject(PortfolioService);

  readonly categoriesConfig: Record<string, CategoryConfig> = {
    arte: { prefix: 'artes', ext: 'jpeg', total: 10 },
    wedding: { prefix: 'boda', ext: 'jpg', total: 10 },
    restaurantes: { prefix: 'rest', ext: 'jpeg', total: 10 },
  };

  readonly dynamicItems = signal<PortfolioItem[]>([]);
  readonly isPopupOpen = signal(false);
  readonly currentCategory = signal<string>('arte');
  readonly currentPhotoIndex = signal<number>(0);

  // Lista de categorías que se mostrarán en la cuadrícula (las 3 fijas + cualquier categoría nueva creada en el CMS)
  readonly displayedCategories = computed<CategoryCardView[]>(() => {
    const baseCats: CategoryCardView[] = [
      { id: 'arte', title: 'Artes', cover: 'assets/artes1.jpeg' },
      { id: 'wedding', title: 'Bodas', cover: 'assets/boda1.jpg' },
      { id: 'restaurantes', title: 'Restaurantes', cover: 'assets/rest1.jpeg' },
    ];

    // Detectar categorías adicionales que vengan de MongoDB/Cloudinary
    const extraCats: CategoryCardView[] = [];
    for (const item of this.dynamicItems()) {
      const catId = item.category?.toLowerCase().trim();
      if (
        catId &&
        !baseCats.some((b) => b.id === catId) &&
        !extraCats.some((e) => e.id === catId)
      ) {
        extraCats.push({
          id: catId,
          title: item.category.charAt(0).toUpperCase() + item.category.slice(1),
          cover: item.imageUrl || 'assets/danza.jpg',
        });
      }
    }

    return [...baseCats, ...extraCats];
  });

  // Lista de URLs para la categoría seleccionada (combina fotos locales fijas + fotos dinámicas de Cloudinary)
  readonly currentCategoryImages = computed(() => {
    const cat = this.currentCategory().toLowerCase().trim();
    const config = this.categoriesConfig[cat];
    const urls: string[] = [];

    // Fotos base predeterminadas si es una categoría original
    if (config) {
      for (let i = 1; i <= config.total; i++) {
        urls.push(`assets/${config.prefix}${i}.${config.ext}`);
      }
    }

    // Fotos añadidas desde Cloudinary / MongoDB
    const dynamicForCat = this.dynamicItems().filter(
      (item) => item.category?.toLowerCase().trim() === cat
    );
    for (const item of dynamicForCat) {
      if (item.imageUrl) {
        urls.push(item.imageUrl);
      }
    }

    return urls;
  });

  readonly currentImageUrl = computed(() => {
    const images = this.currentCategoryImages();
    if (images.length === 0) return '';
    const idx = this.currentPhotoIndex();
    return images[idx] || images[0];
  });

  ngOnInit(): void {
    this.portfolioService.getPortfolio().subscribe({
      next: (items) => {
        if (items && Array.isArray(items)) {
          this.dynamicItems.set(items);
        }
      },
      error: () => {},
    });
  }

  openGallery(category: string): void {
    this.currentCategory.set(category.toLowerCase().trim());
    this.currentPhotoIndex.set(0);
    this.isPopupOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeGallery(): void {
    this.isPopupOpen.set(false);
    document.body.style.overflow = '';
  }

  nextPhoto(): void {
    const total = this.currentCategoryImages().length;
    if (total === 0) return;
    const nextIdx = (this.currentPhotoIndex() + 1) % total;
    this.currentPhotoIndex.set(nextIdx);
  }

  prevPhoto(): void {
    const total = this.currentCategoryImages().length;
    if (total === 0) return;
    const prevIdx = (this.currentPhotoIndex() - 1 + total) % total;
    this.currentPhotoIndex.set(prevIdx);
  }
}
