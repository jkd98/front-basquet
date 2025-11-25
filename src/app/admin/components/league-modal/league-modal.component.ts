import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { LeagueService } from '../../../shared/services/league.service';
import { CustomToastService } from '../../../shared/services/custom-toast.service';

@Component({
  selector: 'app-league-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule],
  templateUrl: './league-modal.component.html',
  styleUrl: './league-modal.component.css'
})
export class LeagueModalComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() leagueCreated = new EventEmitter<void>();

  leagueName: string = '';
  leagueCategory: string = '';
  leagueLogo: File | null = null;
  logoPreview: string | null = null;
  isLoading: boolean = false;

  private leagueService = inject(LeagueService);
  private customToastService = inject(CustomToastService);

  closeModal() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.resetForm();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.leagueLogo = file;
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
    if (!this.isFormValid()) return;

    this.isLoading = true;
    const formData = new FormData();
    formData.append('name', this.leagueName);
    formData.append('category', this.leagueCategory);
    if (this.leagueLogo) {
      formData.append('logo', this.leagueLogo);
    }

    this.leagueService.createLeague(formData).subscribe({
      next: (response) => {
        this.customToastService.renderToast(
          response.msg || 'Liga creada correctamente',
          'success'
        );
        this.isLoading = false;
        this.closeModal();
        this.leagueCreated.emit();
      },
      error: (error) => {
        console.error('Error al crear liga:', error);
        this.customToastService.renderToast(
          error.error?.msg || 'Error al crear la liga',
          'error'
        );
        this.isLoading = false;
      }
    });
  }

  resetForm() {
    this.leagueName = '';
    this.leagueCategory = '';
    this.leagueLogo = null;
    this.logoPreview = null;
  }

  isFormValid(): boolean {
    return (
      this.leagueName.trim() !== '' &&
      this.leagueCategory.trim() !== '' &&
      this.leagueLogo !== null
    );
  }
}