import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { Router, RouterLink } from '@angular/router';
import { MenuItem } from 'primeng/api';

import { TeamService } from '../../../shared/services/team.service';
import { PlayerService } from '../../../shared/services/player.service';
import { environment } from '../../../../environments/environment';
import { CustomToastService } from '../../../shared/services/custom-toast.service';
import {
  CreateTeamModalComponent,
  CreateTeamPayload,
} from '../../components/create-team-modal/create-team-modal.component';
import { JoinSeasonModalComponent } from '../../components/join-season-modal/join-season-modal.component';

@Component({
  selector: 'app-my-team',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    MenuModule,
    RouterLink,
    CreateTeamModalComponent,
    JoinSeasonModalComponent,
  ],
  templateUrl: './my-team.component.html',
  styleUrl: './my-team.component.css',
})
export class MyTeamComponent implements OnInit {
  private teamService = inject(TeamService);
  private playerService = inject(PlayerService);
  private customToast = inject(CustomToastService);
  private router = inject(Router);

  // --- Join season modal ---
  joinSeasonVisible = false;
  joinSeasonTeamId: string | null = null;
  joinSeasonTeamName: string | null = null;

  teams: any[] = [];
  expandedTeamId: string | null = null;
  players: any[] = [];
  teamMenuItems: MenuItem[] = [];
  private currentMenuTeam: any | null = null;

  private playersByTeam: Record<string, any[]> = {};

  isLoading = true;
  isPlayersLoading = false;

  baseUrl = environment.baseUrl;

  createTeamVisible = false;

  ngOnInit() {
    this.loadTeams();
  }

  openCreateTeamModal() {
    this.createTeamVisible = true;
  }

  onCreateTeam(payload: CreateTeamPayload) {
    const formData = new FormData();

    formData.append('name', payload.name);
    payload.availabilityDays.forEach((day) => {
      formData.append('availabilityDays', day);
    });

    if (payload.logo) {
      formData.append('logo', payload.logo);
    }

    this.teamService.createTeam(formData).subscribe({
      next: () => {
        this.customToast.renderToast('Equipo creado correctamente', 'success');
        this.loadTeams();
      },
      error: (error) => {
        console.error('Error al crear equipo', error);
        this.customToast.renderToast(
          error.error?.msg || 'Error al crear el equipo',
          'error'
        );
      },
    });
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

    this.teams = [team, ...this.teams.filter((t) => t._id !== team._id)];
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

  // ========= OVERFLOW MENU =========

  onMenuButtonClick(event: MouseEvent, team: any, menu: any) {
    event.stopPropagation();

    this.currentMenuTeam = team;

    this.teamMenuItems = [
      {
        label: 'Unirse a temporada',
        icon: 'pi pi-calendar-plus',
        command: () => this.openJoinSeasonModal(this.currentMenuTeam),
      },
      {
        label: 'Editar Equipo',
        icon: 'pi pi-pencil',
        command: () => this.onEditTeam(this.currentMenuTeam),
      },
      {
        label: 'Editar Jugadores',
        icon: 'pi pi-users',
        command: () => this.onManagePlayers(this.currentMenuTeam),
      },
      {
        label: 'Eliminar',
        icon: 'pi pi-trash',
        disabled: true,
      },
    ];

    menu.toggle(event);
  }

  openJoinSeasonModal(team: any) {
    this.joinSeasonTeamId = team._id;
    this.joinSeasonTeamName = team.name;
    this.joinSeasonVisible = true;
  }

  onJoinedSeason() {
    this.joinSeasonVisible = false;
    this.customToast.renderToast(
      'Equipo inscrito a la temporada correctamente',
      'success'
    );
  }

  onEditTeam(team: any) {
    this.customToast.renderToast(
      `Edición de equipo "${team.name}"`,
      'info'
    );
  }

  onManagePlayers(team: any) {
    this.router.navigate(['/users/register-team'], {
      queryParams: {
        teamId: team._id,
        teamName: team.name,
        teamLogo: team.logo,
      },
    });
  }
}