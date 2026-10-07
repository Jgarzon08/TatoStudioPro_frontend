import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavBar } from '../../components/nav-bar/nav-bar';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [NavBar, Footer, RouterLink],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {}
