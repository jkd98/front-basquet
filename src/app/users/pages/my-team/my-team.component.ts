import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TeamService } from '../../../shared/services/team.service';
import { PlayerService } from '../../../shared/services/player.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-my-team',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  template: `
    <div class="my-team-container">
      <div class="loading-container" *ngIf="isLoading">
        <i class="pi pi-spin pi-spinner"></i>
        <p>Cargando tu equipo...</p>
      </div>

      <div class="no-team-container" *ngIf="!isLoading && !team">
        <i class="pi pi-info-circle"></i>
        <h2>No tienes un equipo registrado</h2>
        <p>Si tienes un código de invitación, puedes registrar tu equipo.</p>
        <button pButton label="Registrar Equipo" routerLink="/users/register-team"></button>
      </div>

      <div class="team-details" *ngIf="!isLoading && team">
        <div class="team-header">
          <div class="team-logo-wrapper">
            <img [src]="getLogoUrl(team.logo)" alt="{{ team.name }}" class="team-logo">
          </div>
          <div class="team-info">
            <h1>{{ team.name }}</h1>
            <span class="status-badge">Activo</span>
          </div>
        </div>

        <div class="players-section">
          <h2>Jugadores</h2>
          <div class="players-grid">
            <div class="player-card" *ngFor="let player of players">
              <div class="player-avatar">
                <i class="pi pi-user"></i>
              </div>
              <div class="player-info">
                <h3>{{ player.fullname }}</h3>
                <p class="jersey">#{{ player.jersey }}</p>
                <p class="role" *ngIf="player.isLider">Capitán</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .my-team-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      color: white;
    }

    .loading-container, .no-team-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 50vh;
      text-align: center;
      gap: 1rem;
    }

    .loading-container i, .no-team-container i {
      font-size: 3rem;
      color: var(--primary-color);
    }

    .team-header {
      display: flex;
      align-items: center;
      gap: 2rem;
      margin-bottom: 3rem;
      background: rgba(255, 255, 255, 0.05);
      padding: 2rem;
      border-radius: 16px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .team-logo-wrapper {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      overflow: hidden;
      background: rgba(0, 0, 0, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid rgba(255, 255, 255, 0.2);
    }

    .team-logo {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .team-info h1 {
      font-size: 2.5rem;
      margin: 0 0 0.5rem 0;
      font-weight: 700;
    }

    .status-badge {
      background: rgba(34, 197, 94, 0.2);
      color: #4ade80;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-size: 0.875rem;
      font-weight: 500;
      border: 1px solid rgba(34, 197, 94, 0.3);
    }

    .players-section h2 {
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 0.5rem;
    }

    .players-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .player-card {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: transform 0.2s, background 0.2s;
    }

    .player-card:hover {
      transform: translateY(-5px);
      background: rgba(255, 255, 255, 0.08);
    }

    .player-avatar {
      width: 60px;
      height: 60px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      margin: 0 auto 1rem auto;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .player-avatar i {
      font-size: 1.5rem;
      color: rgba(255, 255, 255, 0.7);
    }

    .player-info h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .player-info .jersey {
      color: var(--primary-color);
      font-weight: 700;
      font-size: 1.2rem;
      margin: 0;
    }

    .player-info .role {
      font-size: 0.8rem;
      color: #fbbf24;
      margin-top: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  `]
})
export class MyTeamComponent implements OnInit {
  teamService = inject(TeamService);
  playerService = inject(PlayerService);
  team: any = null;
  players: any[] = [];
  isLoading = true;
  baseUrl = environment.baseUrl;

  ngOnInit() {
    this.loadTeam();
  }

  loadTeam() {
    this.teamService.getTeamsByUser().subscribe({
      next: (response) => {
        if (response.data && response.data.length > 0) {
          this.team = response.data[0];
          this.loadPlayers(this.team._id);
        } else {
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error loading team', error);
        this.isLoading = false;
      }
    });
  }

  loadPlayers(teamId: string) {
    this.playerService.getPlayersByTeam(teamId).subscribe({
      next: (response) => {
        this.players = response.data || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading players', error);
        this.isLoading = false;
      }
    });
  }

  getLogoUrl(logoPath: string): string {
    if (!logoPath) return 'assets/images/default-team-logo.png';
    return `${this.baseUrl}/public/uploads/${logoPath}`;
  }
}
