import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../interfaces/league.interface';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class PlayerService {
    private baseUrl = `${environment.baseUrl}/player`;
    private http = inject(HttpClient);

    private authservice = inject(AuthService);
    
    
        private getHeaders(): HttpHeaders {
            const token = this.authservice.token();
            return new HttpHeaders({
                'Authorization': `Bearer ${token}`
            });
        }

    getPlayersByTeam(teamId: string): Observable<ApiResponse<any[]>> {
        return this.http.get<ApiResponse<any[]>>(
            `${this.baseUrl}/team/${teamId}`,
            { headers: this.getHeaders() }
        );
    }
}
