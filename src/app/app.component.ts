import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { QrGeneratorComponent } from './components/qr-generator/qr-generator.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, QrGeneratorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Générateur de QR Code PDF';
}
