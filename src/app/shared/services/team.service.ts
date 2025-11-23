import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../interfaces/league.interface';

@Injectable({
    providedIn: 'root'
})
export class TeamService {
    private baseUrl = `${environment.baseUrl}/teams`;
    private http = inject(HttpClient);

    private getHeaders(): HttpHeaders {
        const token = sessionStorage.getItem('_jwt');
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
            `${this.baseUrl}/my-teams`,
            { headers: this.getHeaders() }
        );
    }

    getTeamById(id: string): Observable<ApiResponse<any>> {
        return this.http.get<ApiResponse<any>>(
            `${this.baseUrl}/${id}`,
            { headers: this.getHeaders() }
        );
    }
}
