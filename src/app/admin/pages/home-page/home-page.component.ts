import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { LeagueService } from '../../../shared/services/league.service';
import { CustomToastService } from '../../../shared/services/custom-toast.service';
import { CustomToastComponent } from '../../../shared/components/custom-toast/custom-toast.component';
import { League } from '../../../shared/interfaces/league.interface';
import { environment } from '../../../../environments/environment';
import { LeagueModalComponent } from '../../components/league-modal/league-modal.component';

interface EditLeagueForm {
  name: string;
  category: string;
  logo: File | null;
  logoPreview: string | null;
}

@Component({
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    MenuModule,
    ConfirmDialogModule,
    CustomToastComponent,
    LeagueModalComponent
  ],
  providers: [ConfirmationService],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export default class HomePageComponent implements OnInit {
  // Services
  private leagueService = inject(LeagueService);
  private customToastService = inject(CustomToastService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);

  // State
  displayModal = false;
  displayEditModal = false;
  isLoading = false;
  leagues: League[] = [];

  // Edit Form
  selectedLeague: League | null = null;
  editForm: EditLeagueForm = {
    name: '',
    category: '',
    logo: null,
    logoPreview: null
  };

  ngOnInit() {
    this.loadLeagues();
  }

  // Data Methods
  loadLeagues(): void {
    this.leagueService.getLeagues().subscribe({
      next: (response) => {
        this.leagues = response.data || [];
      },
      error: (error) => {
        this.handleError('Error al cargar las ligas', error);
      }
    });
  }

  // Modal Methods
  openModal(): void {
    this.displayModal = true;
  }

  openEditModal(league: League): void {
    this.selectedLeague = league;
    this.editForm = {
      name: league.name,
      category: league.category,
      logo: null,
      logoPreview: league.logo ? this.getLogoUrl(league.logo) : null
    };
    this.displayEditModal = true;
  }

  closeEditModal(): void {
    this.displayEditModal = false;
    this.selectedLeague = null;
    this.resetEditForm();
  }

  // File Methods
  onEditFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.editForm.logo = file;
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.editForm.logoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  triggerEditFileInput(): void {
    document.getElementById('editLogoInput')?.click();
  }

  // League Operations
  updateLeague(): void {
    if (!this.selectedLeague || !this.isEditFormValid()) return;

    this.isLoading = true;
    const formData = new FormData();
    formData.append('name', this.editForm.name);
    formData.append('category', this.editForm.category);
    if (this.editForm.logo) {
      formData.append('logo', this.editForm.logo);
    }

    this.leagueService.updateLeague(this.selectedLeague._id!, formData).subscribe({
      next: (response) => {
        this.handleSuccess(response.msg || 'Liga actualizada correctamente');
        this.closeEditModal();
        this.loadLeagues();
      },
      error: (error) => {
        this.handleError('Error al actualizar la liga', error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  confirmDeleteLeague(league: League): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres eliminar la liga "${league.name}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteLeague(league)
    });
  }

  private deleteLeague(league: League): void {
    this.leagueService.deleteLeague(league._id!).subscribe({
      next: (response) => {
        this.handleSuccess(response.msg || 'Liga eliminada correctamente');
        this.loadLeagues();
      },
      error: (error) => {
        this.handleError('Error al eliminar la liga', error);
      }
    });
  }

  // Navigation
  navigateToLeagueDetail(leagueId: string): void {
    this.router.navigate(['/admin/league', leagueId]);
  }

  // UI Helpers
  getLeagueMenuItems(league: League): MenuItem[] {
    return [
      {
        label: 'Administrar Liga',
        icon: 'pi pi-cog',
        command: () => this.navigateToLeagueDetail(league._id!)
      },
      { separator: true },
      {
        label: 'Editar Liga',
        icon: 'pi pi-pencil',
        command: () => this.openEditModal(league)
      },
      { separator: true },
      {
        label: 'Eliminar Liga',
        icon: 'pi pi-trash',
        command: () => this.confirmDeleteLeague(league),
        styleClass: 'p-menuitem-link-danger'
      }
    ];
  }

  getLogoUrl(logo: string | undefined): string {
    return logo 
      ? `${environment.baseUrl}/public/uploads/${logo}`
      : 'assets/default-league-logo.png';
  }

  // Form Validation
  isEditFormValid(): boolean {
    return this.editForm.name.trim() !== '' && this.editForm.category.trim() !== '';
  }

  private resetEditForm(): void {
    this.editForm = {
      name: '',
      category: '',
      logo: null,
      logoPreview: null
    };
  }

  // Utility Methods
  private handleSuccess(message: string): void {
    this.customToastService.renderToast(message, 'success');
  }

  private handleError(defaultMessage: string, error: any): void {
    console.error(defaultMessage, error);
    this.customToastService.renderToast(
      error.error?.msg || defaultMessage,
      'error'
    );
  }
}