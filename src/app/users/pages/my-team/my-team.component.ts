import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';

import { TeamService } from '../../../shared/services/team.service';
import { PlayerService } from '../../../shared/services/player.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-my-team',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, RouterLink],
  templateUrl: './my-team.component.html',
  styleUrl: './my-team.component.css',
})
export class MyTeamComponent implements OnInit {
  private teamService = inject(TeamService);
  private playerService = inject(PlayerService);

  teams: any[] = [];
  expandedTeamId: string | null = null;
  players: any[] = [];

  private playersByTeam: Record<string, any[]> = {};

  isLoading = true;
  isPlayersLoading = false;

  baseUrl = environment.baseUrl;

  ngOnInit() {
    this.loadTeams();
  }

  loadTeams() {
    this.isLoading = true;

    this.teamService.getTeamsByUser().subscribe({
      next: (response) => {
        this.teams = response.data || [];
        this.isLoading = false;

        this.expandedTeamId = null;
        this.players = [];
      },
      error: (error) => {
        console.error('Error al cargar equipos', error);
        this.teams = [];
        this.isLoading = false;
      },
    });
  }

  onToggleTeam(team: any) {
    if (!team) return;

    if (this.expandedTeamId === team._id) {
      return;
    }

    this.teams = [
      team,
      ...this.teams.filter((t) => t._id !== team._id),
    ];

    this.expandedTeamId = team._id;

    const cachedPlayers = this.playersByTeam[team._id];
    if (cachedPlayers) {
      this.players = cachedPlayers;
      this.isPlayersLoading = false;
      return;
    }

    this.players = [];
    this.loadPlayers(team._id);
  }

  collapseTeam(event: MouseEvent) {
    event.stopPropagation();
    this.expandedTeamId = null;
    this.players = [];
    this.isPlayersLoading = false;
  }

  loadPlayers(teamId: string) {
    this.isPlayersLoading = true;

    this.playerService.getPlayersByTeam(teamId).subscribe({
      next: (response) => {
        const data = response.data || [];
        this.playersByTeam[teamId] = data;

        if (this.expandedTeamId === teamId) {
          this.players = data;
        }

        this.isPlayersLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar jugadores', error);
        this.playersByTeam[teamId] = [];

        if (this.expandedTeamId === teamId) {
          this.players = [];
        }

        this.isPlayersLoading = false;
      },
    });
  }

  getLogoUrl(logoPath: string): string {
    if (!logoPath) return 'assets/images/default-team-logo.png';
    return `${this.baseUrl}/public/uploads/${logoPath}`;
  }

  getPlayerAvatar(player: any): string | null {
    if (!player?.picture) return null;
    return `${this.baseUrl}/public/uploads/${player.picture}`;
  }

  getInitials(name: string | undefined): string {
    if (!name) return '?';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();
  }

  getPlayerAge(birthday: string | Date | null | undefined): number | null {
    if (!birthday) return null;
    const birthDate = new Date(birthday);
    if (Number.isNaN(birthDate.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }
}