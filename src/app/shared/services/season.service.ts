import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Season } from '../interfaces/season.interface';
import { ApiResponse } from '../interfaces/league.interface';

@Injectable({
    providedIn: 'root'
})
export class SeasonService {
    private baseUrl = `${environment.baseUrl}/season`;
    private http = inject(HttpClient);

    private getHeaders(): HttpHeaders {
        const token = sessionStorage.getItem('_jwt');
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }

    createSeason(seasonData: any): Observable<ApiResponse<Season>> {
        return this.http.post<ApiResponse<Season>>(
            this.baseUrl,
            seasonData,
            { headers: this.getHeaders() }
        );
    }

    getSeasonsByLeague(leagueId: string): Observable<ApiResponse<Season[]>> {
        return this.http.get<ApiResponse<Season[]>>(
            `${this.baseUrl}/league/${leagueId}`,
            { headers: this.getHeaders() }
        );
    }

    getSeasonById(id: string): Observable<ApiResponse<Season>> {
        return this.http.get<ApiResponse<Season>>(
            `${this.baseUrl}/${id}`,
            { headers: this.getHeaders() }
        );
    }

    updateSeason(id: string, seasonData: any): Observable<ApiResponse<Season>> {
        return this.http.put<ApiResponse<Season>>(
            `${this.baseUrl}/${id}`,
            seasonData,
            { headers: this.getHeaders() }
        );
    }

    updateSeasonStatus(id: string, status: string): Observable<ApiResponse<Season>> {
        return this.http.patch<ApiResponse<Season>>(
            `${this.baseUrl}/${id}/status`,
            { status },
            { headers: this.getHeaders() }
        );
    }

    deleteSeason(id: string): Observable<ApiResponse<any>> {
        return this.http.delete<ApiResponse<any>>(
            `${this.baseUrl}/${id}`,
            { headers: this.getHeaders() }
        );
    }

    getSeasonTeams(id: string): Observable<ApiResponse<any[]>> {
        return this.http.get<ApiResponse<any[]>>(
            `${this.baseUrl}/${id}/teams`,
            { headers: this.getHeaders() }
        );
    }
}
