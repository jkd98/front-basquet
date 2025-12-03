import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../interfaces/league.interface';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private baseUrl = `${environment.baseUrl}/player`;
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private getHeaders(): HttpHeaders {
    const token = this.authService.token();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // ========= GET =========

  /** Jugadores por equipo */
  getPlayersByTeam(teamId: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.baseUrl}/team/${teamId}`,
      { headers: this.getHeaders() }
    );
  }

  getPlayerById(id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/${id}`,
      { headers: this.getHeaders() }
    );
  }

  // ========= CREATE =========
  createPlayer(payload: {
    fullname: string;
    birthday: string | Date;
    jersey: number;
    teamId: string;
    picture?: File | null;
  }): Observable<ApiResponse<any>> {
    const formData = new FormData();

    formData.append('fullname', payload.fullname);

    const birthdayValue =
      payload.birthday instanceof Date
        ? payload.birthday.toISOString()
        : String(payload.birthday);

    formData.append('birthday', birthdayValue);
    formData.append('jersey', String(payload.jersey));
    formData.append('teamId', payload.teamId);

    if (payload.picture) {
      formData.append('picture', payload.picture);
    }

    return this.http.post<ApiResponse<any>>(this.baseUrl, formData, {
      headers: this.getHeaders(),
    });
  }

  createPlayersForTeam(
    teamId: string,
    players: {
      id?: string | null;
      fullName: string;
      birthDate: string | Date;
      jerseyNumber: number;
      photo?: File | null;
    }[]
  ): Observable<ApiResponse<any>[]> {
    const requests = players.map((p) => {
      if (p.id) {
        // Actualización de jugador existente (sin foto por ahora)
        return this.updatePlayer(p.id, {
          fullname: p.fullName,
          birthday: p.birthDate,
          jersey: p.jerseyNumber,
        });
      }

      // Creación de nuevo jugador
      return this.createPlayer({
        fullname: p.fullName,
        birthday: p.birthDate,
        jersey: p.jerseyNumber,
        teamId,
        picture: p.photo ?? null,
      });
    });

    return forkJoin(requests);
  }

  // ========= UPDATE =========

  updatePlayer(
    id: string,
    updates: {
      fullname?: string;
      birthday?: string | Date;
      jersey?: number;
    }
  ): Observable<ApiResponse<any>> {
    const body: any = { ...updates };

    if (updates.birthday instanceof Date) {
      body.birthday = updates.birthday.toISOString();
    }

    return this.http.put<ApiResponse<any>>(
      `${this.baseUrl}/${id}`,
      body,
      { headers: this.getHeaders() }
    );
  }

  // ========= DELETE =========

  deletePlayer(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(
      `${this.baseUrl}/${id}`,
      { headers: this.getHeaders() }
    );
  }
}
