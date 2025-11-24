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
  templateUrl: './my-team.component.html',
  styleUrl: './my-team.component.css'
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
