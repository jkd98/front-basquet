import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../interfaces/league.interface';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class TeamService {
    private baseUrl = `${environment.baseUrl}/team`;
    private http = inject(HttpClient);

    private authservice = inject(AuthService);

    private getHeaders(): HttpHeaders {
        const token = this.authservice.token();
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }

    createTeam(teamData: FormData): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(
            this.baseUrl,
            teamData,
            { headers: this.getHeaders() }
        );
    }

    getTeams(): Observable<ApiResponse<any[]>> {
        return this.http.get<ApiResponse<any[]>>(
            this.baseUrl,
            { headers: this.getHeaders() }
        );
    }

    getTeamsByUser(): Observable<ApiResponse<any[]>> {
        return this.http.get<ApiResponse<any[]>>(
            `${this.baseUrl}/by-user`,
            { headers: this.getHeaders() }
        );
    }

    getTeamById(id: string): Observable<ApiResponse<any>> {
        return this.http.get<ApiResponse<any>>(
            `${this.baseUrl}/${id}`,
            { headers: this.getHeaders() }
        );
    }

    addTeamToSeason(teamId: string, code: string): Observable<ApiResponse<any>> {
        const body = { teamId, code };

        return this.http.post<ApiResponse<any>>(
        `${this.baseUrl}/season`,
        body,
        { headers: this.getHeaders() }
        );
    }
}
