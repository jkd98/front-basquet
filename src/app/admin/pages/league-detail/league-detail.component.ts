import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { MenuModule } from 'primeng/menu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { LeagueService } from '../../../shared/services/league.service';
import { SeasonService } from '../../../shared/services/season.service';
import { CustomToastService } from '../../../shared/services/custom-toast.service';
import { CustomToastComponent } from '../../../shared/components/custom-toast/custom-toast.component';
import { League } from '../../../shared/interfaces/league.interface';
import { Season } from '../../../shared/interfaces/season.interface';
import { SeasonDetailComponent } from '../season-detail/season-detail.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-league-detail',
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    MenuModule,
    ConfirmDialogModule,
    CalendarModule,
    CustomToastComponent,
    SeasonDetailComponent
  ],
  providers: [ConfirmationService],
  templateUrl: './league-detail.component.html',
  styleUrl: './league-detail.component.css'
})
export default class LeagueDetailComponent implements OnInit {
  league: League | null = null;
  leagueId: string = '';
  isLoading: boolean = true;

  // Seasons
  seasons: Season[] = [];
  displaySeasonModal: boolean = false;
  displayEditSeasonModal: boolean = false;
  selectedSeason: Season | null = null;
  viewingSeason: Season | null = null;

  // Season form fields
  seasonYear: string = '';
  seasonStartDate: Date | null = null;
  seasonEndDate: Date | null = null;
  seasonStatus: string = 'upcoming';

  // Edit season form fields
  editSeasonYear: string = '';
  editSeasonStartDate: Date | null = null;
  editSeasonEndDate: Date | null = null;
  editSeasonStatus: string = 'upcoming';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private leagueService = inject(LeagueService);
  private seasonService = inject(SeasonService);
  private customToastService = inject(CustomToastService);
  private confirmationService = inject(ConfirmationService);

  ngOnInit() {
    this.leagueId = this.route.snapshot.paramMap.get('id') || '';
    if (this.leagueId) {
      this.loadLeague();
      this.loadSeasons();
    } else {
      this.goBack();
    }
  }

  loadLeague() {
    this.isLoading = true;
    this.leagueService.getLeagueById(this.leagueId).subscribe({
      next: (response) => {
        this.league = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar liga:', error);
        this.customToastService.renderToast(
          error.error?.msg || 'Error al cargar la liga',
          'error'
        );
        this.isLoading = false;
        setTimeout(() => this.goBack(), 2000);
      }
    });
  }

  loadSeasons() {
    this.seasonService.getSeasonsByLeague(this.leagueId).subscribe({
      next: (response) => {
        this.seasons = response.data || [];
      },
      error: (error) => {
        console.error('Error al cargar temporadas:', error);
        this.customToastService.renderToast(
          error.error?.msg || 'Error al cargar las temporadas',
          'error'
        );
      }
    });
  }

  // Season Modal Methods
  openSeasonModal() {
    this.displaySeasonModal = true;
  }

  closeSeasonModal() {
    this.displaySeasonModal = false;
    this.resetSeasonForm();
  }

  createSeason() {
    if (!this.isSeasonFormValid()) return;

    this.isLoading = true;
    const seasonData = {
      league: this.leagueId,
      year: this.seasonYear,
      startDate: this.seasonStartDate?.toISOString(),
      endDate: this.seasonEndDate?.toISOString() || undefined,
      status: this.seasonStatus
    };

    this.seasonService.createSeason(seasonData).subscribe({
      next: (response) => {
        this.customToastService.renderToast(
          response.msg || 'Temporada creada correctamente',
          'success'
        );
        this.closeSeasonModal();
        this.loadSeasons();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al crear temporada:', error);
        this.customToastService.renderToast(
          error.error?.msg || 'Error al crear la temporada',
          'error'
        );
        this.isLoading = false;
      }
    });
  }

  resetSeasonForm() {
    this.seasonYear = '';
    this.seasonStartDate = null;
    this.seasonEndDate = null;
    this.seasonStatus = 'upcoming';
  }

  isSeasonFormValid(): boolean {
    return this.seasonYear.trim() !== '' && this.seasonStartDate !== null;
  }

  // Edit Season Methods
  openEditSeasonModal(season: Season) {
    this.selectedSeason = season;
    this.editSeasonYear = season.year;
    this.editSeasonStartDate = new Date(season.startDate);
    this.editSeasonEndDate = season.endDate ? new Date(season.endDate) : null;
    this.editSeasonStatus = season.status;
    this.displayEditSeasonModal = true;
  }

  closeEditSeasonModal() {
    this.displayEditSeasonModal = false;
    this.selectedSeason = null;
    this.resetEditSeasonForm();
  }

  updateSeason() {
    if (!this.selectedSeason || !this.isEditSeasonFormValid()) return;

    this.isLoading = true;
    const seasonData = {
      year: this.editSeasonYear,
      startDate: this.editSeasonStartDate?.toISOString(),
      endDate: this.editSeasonEndDate?.toISOString() || undefined,
      status: this.editSeasonStatus
    };

    this.seasonService.updateSeason(this.selectedSeason._id!, seasonData).subscribe({
      next: (response) => {
        this.customToastService.renderToast(
          response.msg || 'Temporada actualizada correctamente',
          'success'
        );
        this.closeEditSeasonModal();
        this.loadSeasons();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al actualizar temporada:', error);
        this.customToastService.renderToast(
          error.error?.msg || 'Error al actualizar la temporada',
          'error'
        );
        this.isLoading = false;
      }
    });
  }

  resetEditSeasonForm() {
    this.editSeasonYear = '';
    this.editSeasonStartDate = null;
    this.editSeasonEndDate = null;
    this.editSeasonStatus = 'upcoming';
  }

  isEditSeasonFormValid(): boolean {
    return this.editSeasonYear.trim() !== '' && this.editSeasonStartDate !== null;
  }

  // Delete Season Methods
  confirmDeleteSeason(season: Season) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres eliminar la temporada ${season.year}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deleteSeason(season);
      }
    });
  }

  deleteSeason(season: Season) {
    this.seasonService.deleteSeason(season._id!).subscribe({
      next: (response) => {
        this.customToastService.renderToast(
          response.msg || 'Temporada eliminada correctamente',
          'success'
        );
        this.loadSeasons();
      },
      error: (error) => {
        console.error('Error al eliminar temporada:', error);
        this.customToastService.renderToast(
          error.error?.msg || 'Error al eliminar la temporada',
          'error'
        );
      }
    });
  }

  closeSeasonDetail() {
    this.viewingSeason = null;
    this.loadSeasons(); // Reload to get updates if any
  }

  // Helper Methods
  goBack() {
    this.router.navigate(['/admin/panel']);
  }

  getLogoUrl(logo: string | undefined): string {
    if (!logo) return 'assets/default-league-logo.png';
    return `${environment.baseUrl}/public/uploads/${logo}`;
  }

  formatDateForInput(date: string | Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getStatusBadgeClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'upcoming': 'status-upcoming',
      'active': 'status-active',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled'
    };
    return statusClasses[status] || '';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'upcoming': 'Próxima',
      'active': 'Activa',
      'completed': 'Completada',
      'cancelled': 'Cancelada'
    };
    return labels[status] || status;
  }

  onViewSeasonClick(season: Season): void {
    this.viewingSeason = season;
  }

  // funciona
  getSeasonMenuItems(season: Season): MenuItem[] {
    return [
      {
        label: 'Ver Temporada',
        icon: 'pi pi-eye',
        command: () => {
          this.onViewSeasonClick(season);
        }
      },
      {
        separator: true
      },
      {
        label: 'Editar Temporada',
        icon: 'pi pi-pencil',
        command: () => this.openEditSeasonModal(season)
      },
      {
        separator: true
      },
      {
        label: 'Eliminar Temporada',
        icon: 'pi pi-trash',
        command: () => this.confirmDeleteSeason(season)
      }
    ];
  }
}
