import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  readonly whatsappNumber = '+573204876248';
  readonly whatsappMessage = encodeURIComponent('Hola Tato Studio, quisiera cotizar una sesión fotográfica.');
  readonly whatsappUrl = `https://wa.me/573204876248?text=${this.whatsappMessage}`;
}
