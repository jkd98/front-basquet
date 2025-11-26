import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../interfaces/league.interface';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class GameService {
    
    private baseUrl = `${environment.baseUrl}/game`;
    private http = inject(HttpClient);
    private authservice = inject(AuthService);
    

    private getHeaders(): HttpHeaders {
         const token = this.authservice.token();
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }

    getGamesBySeason(seasonId: string): Observable<ApiResponse<any[]>> {
        return this.http.get<ApiResponse<any[]>>(
            `${this.baseUrl}/season/${seasonId}`,
            { headers: this.getHeaders() }
        );
    }

    generateGames(seasonId: string): Observable<ApiResponse<any[]>> {
        return this.http.post<ApiResponse<any[]>>(
            `${this.baseUrl}/generate`,
            { seasonId },
            { headers: this.getHeaders() }
        );
    }

    updateGameDate(gameId: string, date: Date): Observable<ApiResponse<any>> {
        return this.http.put<ApiResponse<any>>(
            `${this.baseUrl}/${gameId}/date`,
            { date: date.toISOString() },
            { headers: this.getHeaders() }
        );
    }
}
