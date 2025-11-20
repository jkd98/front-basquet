import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export default class HomePageComponent {
  displayModal: boolean = false;
  leagueName: string = '';
  leagueLogo: File | null = null;
  logoPreview: string | null = null;

  openModal() {
    this.displayModal = true;
  }

  closeModal() {
    this.displayModal = false;
    this.resetForm();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.leagueLogo = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  triggerFileInput() {
    const fileInput = document.getElementById('logoInput') as HTMLInputElement;
    fileInput?.click();
  }

  createLeague() {
    if (this.leagueName && this.leagueLogo) {
      // Por ahora solo mostramos en consola, sin conexión al backend
      console.log('Liga creada:', {
        nombre: this.leagueName,
        logo: this.leagueLogo.name
      });

      // Aquí iría la llamada al backend en el futuro
      // this.leagueService.createLeague(this.leagueName, this.leagueLogo).subscribe(...)

      this.closeModal();
    }
  }

  resetForm() {
    this.leagueName = '';
    this.leagueLogo = null;
    this.logoPreview = null;
  }

  isFormValid(): boolean {
    return this.leagueName.trim() !== '' && this.leagueLogo !== null;
  }
}
