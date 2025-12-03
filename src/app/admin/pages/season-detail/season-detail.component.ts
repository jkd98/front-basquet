import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Season } from '../../../shared/interfaces/season.interface';
import { SeasonService } from '../../../shared/services/season.service';
import { InvitationService } from '../../../shared/services/invitation.service';
import { GameService } from '../../../shared/services/game.service';
import { CustomToastService } from '../../../shared/services/custom-toast.service';
import { environment } from '../../../../environments/environment';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';

@Component({
    selector: 'app-season-detail',
    standalone: true,
    imports: [CommonModule, FormsModule, CalendarModule, DialogModule],
    templateUrl: './season-detail.component.html',
    styleUrl: './season-detail.component.css'
})
export class SeasonDetailComponent {
    @Input() season: Season | null = null;
    @Output() goBack = new EventEmitter<void>();

    private seasonService = inject(SeasonService);
    private invitationService = inject(InvitationService);
    private gameService = inject(GameService);
    private customToastService = inject(CustomToastService);

    activeTab: 'teams' | 'invite' | 'games' | null = null;

    // Teams Tab
    teams: any[] = [];
    isLoadingTeams: boolean = false;

    // Invitation Tab
    invitations: any[] = [];
    isLoadingInvitations: boolean = false;
    displayInviteModal: boolean = false;
    invitationExpireDate: Date | null = null;
    generatedLink: string = '';

    // Games Tab
    games: any[] = [];
    isLoadingGames: boolean = false;
    displayDateModal: boolean = false;
    selectedGame: any = null;
    selectedGameDate: Date | null = null;

    onBack() {
        this.goBack.emit();
    }

    setActiveTab(tab: 'teams' | 'invite' | 'games') {
        this.activeTab = tab;
        if (tab === 'teams' && this.season) {
            this.loadTeams();
        } else if (tab === 'invite' && this.season) {
            this.loadInvitations();
        } else if (tab === 'games' && this.season) {
            this.loadGames();
        }
    }

    // Teams Logic
    loadTeams() {
        if (!this.season) return;
        this.isLoadingTeams = true;
        this.seasonService.getSeasonTeams(this.season._id!).subscribe({
            next: (response) => {
                this.teams = response.data || [];
                this.isLoadingTeams = false;
            },
            error: (error) => {
                console.error('Error loading teams', error);
                this.isLoadingTeams = false;
            }
        });
    }

    getLogoUrl(logo: string): string {
        if (!logo) return 'assets/default-team-logo.png';
        return `${environment.baseUrl}/public/uploads/${logo}`;
    }

    // Invitation Logic
    loadInvitations() {
        if (!this.season) return;
        this.isLoadingInvitations = true;
        this.invitationService.getInvitationsBySeason(this.season._id!).subscribe({
            next: (response) => {
                this.invitations = response.data || [];
                this.isLoadingInvitations = false;
            },
            error: (error) => {
                console.error('Error loading invitations', error);
                this.customToastService.renderToast('Error al cargar invitaciones', 'error');
                this.isLoadingInvitations = false;
            }
        });
    }

    openInviteModal() {
        this.displayInviteModal = true;
        this.invitationExpireDate = null;
        this.generatedLink = '';
    }

    generateInvitation() {
        if (!this.season || !this.invitationExpireDate) return;

        const data = {
            season: this.season._id!,
            expireAt: this.invitationExpireDate.toISOString(),
            clientTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };

        this.invitationService.createInvitation(data).subscribe({
            next: (response) => {
                const code = response.data.code;
                // Assuming the registration page is at /users/register-team
                // and accepts a query param 'code'
                this.generatedLink = `${code}`;
                this.customToastService.renderToast('Invitación generada correctamente', 'success');
                this.loadInvitations();
            },
            error: (error) => {
                console.error('Error generating invitation', error);
                this.customToastService.renderToast('Error al generar invitación', 'error');
            }
        });
    }

    copyLink() {
        navigator.clipboard.writeText(this.generatedLink).then(() => {
            this.customToastService.renderToast('Enlace copiado al portapapeles', 'success');
            this.displayInviteModal = false;
        });
    }

    copyLinkFromList(code: string) {
        navigator.clipboard.writeText(code).then(() => {
            this.customToastService.renderToast('Código copiado al portapapeles', 'success');
        });
    }

    // Games Logic
    loadGames() {
        if (!this.season) return;
        this.isLoadingGames = true;
        this.gameService.getGamesBySeason(this.season._id!).subscribe({
            next: (response) => {
                this.games = response.data || [];
                this.isLoadingGames = false;
            },
            error: (error) => {
                console.error('Error loading games', error);
                this.customToastService.renderToast('Error al cargar los juegos', 'error');
                this.isLoadingGames = false;
            }
        });
    }

    generateGamesForSeason() {
        if (!this.season) return;
        this.isLoadingGames = true;
        this.gameService.generateGames(this.season._id!).subscribe({
            next: (response) => {
                this.games = response.data || [];
                this.customToastService.renderToast('Juegos generados correctamente', 'success');
                this.isLoadingGames = false;
            },
            error: (error) => {
                console.error('Error generating games', error);
                this.customToastService.renderToast(error.error?.msg || 'Error al generar los juegos', 'error');
                this.isLoadingGames = false;
            }
        });
    }

    openDateModal(game: any) {
        this.selectedGame = game;
        this.selectedGameDate = game.date ? new Date(game.date) : null;
        this.displayDateModal = true;
    }

    assignDateToGame() {
        if (!this.selectedGame || !this.selectedGameDate) return;

        this.gameService.updateGameDate(this.selectedGame._id, this.selectedGameDate).subscribe({
            next: (response) => {
                this.customToastService.renderToast('Fecha asignada correctamente', 'success');
                this.displayDateModal = false;
                this.selectedGame = null;
                this.selectedGameDate = null;
                this.loadGames();
            },
            error: (error) => {
                console.error('Error assigning date', error);
                this.customToastService.renderToast(error.error?.msg || 'Error al asignar la fecha', 'error');
            }
        });
    }
}
