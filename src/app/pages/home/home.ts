import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavBar } from '../../components/nav-bar/nav-bar';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavBar, Footer, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {
  readonly slides = [
    { image: 'assets/boda1.jpg', alt: 'Fotografía de boda' },
    { image: 'assets/rest1.jpeg', alt: 'Fotografía de restaurante' },
    { image: 'assets/danza.jpg', alt: 'Fotografía de danza' },
  ];

  currentSlide = signal(0);
  private timerId: any = null;

  ngOnInit(): void {
    this.timerId = setInterval(() => {
      this.currentSlide.update((prev) => (prev + 1) % this.slides.length);
    }, 4000);
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }
}
