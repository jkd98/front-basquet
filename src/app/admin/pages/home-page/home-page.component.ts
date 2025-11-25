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
  displayModal: boolean = false;

  displayEditModal: boolean = false;
  selectedLeague: League | null = null;
  editLeagueName: string = '';
  editLeagueCategory: string = '';
  editLeagueLogo: File | null = null;
  editLogoPreview: string | null = null;

  isLoading: boolean = false;

  leagues: League[] = [];

  private leagueService = inject(LeagueService);
  private customToastService = inject(CustomToastService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);

  ngOnInit() {
    this.loadLeagues();
  }

  loadLeagues() {
    this.leagueService.getLeagues().subscribe({
      next: (response) => {
        this.leagues = response.data || [];
      },
      error: (error) => {
        console.error('Error al cargar ligas:', error);
        this.customToastService.renderToast(
          error.error?.msg || 'Error al cargar las ligas',
          'error'
        );
      }
    });
  }

  openModal() {
    this.displayModal = true;
  }

  openEditModal(league: League) {
    this.selectedLeague = league;
    this.editLeagueName = league.name;
    this.editLeagueCategory = league.category;
    this.editLogoPreview = league.logo
      ? `${environment.baseUrl}/public/uploads/${league.logo}`
      : null;
    this.editLeagueLogo = null;
    this.displayEditModal = true;
  }

  closeEditModal() {
    this.displayEditModal = false;
    this.selectedLeague = null;
    this.resetEditForm();
  }

  onEditFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.editLeagueLogo = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.editLogoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  triggerEditFileInput() {
    const fileInput = document.getElementById('editLogoInput') as HTMLInputElement;
    fileInput?.click();
  }

  updateLeague() {
    if (!this.selectedLeague || !this.isEditFormValid()) return;

    this.isLoading = true;
    const formData = new FormData();
    formData.append('name', this.editLeagueName);
    formData.append('category', this.editLeagueCategory);
    if (this.editLeagueLogo) {
      formData.append('logo', this.editLeagueLogo);
    }

    this.leagueService.updateLeague(this.selectedLeague._id!, formData).subscribe({
      next: (response) => {
        this.customToastService.renderToast(
          response.msg || 'Liga actualizada correctamente',
          'success'
        );
        this.closeEditModal();
        this.loadLeagues();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al actualizar liga:', error);
        this.customToastService.renderToast(
          error.error?.msg || 'Error al actualizar la liga',
          'error'
        );
        this.isLoading = false;
      }
    });
  }

  resetEditForm() {
    this.editLeagueName = '';
    this.editLeagueCategory = '';
    this.editLeagueLogo = null;
    this.editLogoPreview = null;
  }

  isEditFormValid(): boolean {
    return (
      this.editLeagueName.trim() !== '' &&
      this.editLeagueCategory.trim() !== ''
    );
  }

  confirmDeleteLeague(league: League) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres eliminar la liga "${league.name}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deleteLeague(league);
      }
    });
  }

  deleteLeague(league: League) {
    this.leagueService.deleteLeague(league._id!).subscribe({
      next: (response) => {
        this.customToastService.renderToast(
          response.msg || 'Liga eliminada correctamente',
          'success'
        );
        this.loadLeagues();
      },
      error: (error) => {
        console.error('Error al eliminar liga:', error);
        this.customToastService.renderToast(
          error.error?.msg || 'Error al eliminar la liga',
          'error'
        );
      }
    });
  }

  navigateToLeagueDetail(leagueId: string) {
    this.router.navigate(['/admin/league', leagueId]);
  }

  getLeagueMenuItems(league: League): MenuItem[] {
    return [
      {
        label: 'Administrar Liga',
        icon: 'pi pi-cog',
        command: () => this.navigateToLeagueDetail(league._id!)
      },
      {
        separator: true
      },
      {
        label: 'Editar Liga',
        icon: 'pi pi-pencil',
        command: () => this.openEditModal(league)
      },
      {
        separator: true
      },
      {
        label: 'Eliminar Liga',
        icon: 'pi pi-trash',
        command: () => this.confirmDeleteLeague(league),
        styleClass: 'text-red-500'
      }
    ];
  }

  getLogoUrl(logo: string | undefined): string {
    if (!logo) return 'assets/default-league-logo.png';
    return `${environment.baseUrl}/public/uploads/${logo}`;
  }
}