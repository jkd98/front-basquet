import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../interfaces/league.interface';

@Injectable({
    providedIn: 'root'
})
export class InvitationService {
    private baseUrl = `${environment.baseUrl}/invitation`;
    private http = inject(HttpClient);

    private getHeaders(): HttpHeaders {
        const token = sessionStorage.getItem('_jwt');
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }

    createInvitation(data: { season: string, expireAt: string, clientTimeZone: string }): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(
            this.baseUrl,
            data,
            { headers: this.getHeaders() }
        );
    }

    getInvitationsBySeason(seasonId: string): Observable<ApiResponse<any[]>> {
        return this.http.get<ApiResponse<any[]>>(
            `${this.baseUrl}/season/${seasonId}`,
            { headers: this.getHeaders() }
        );
    }

    validateInvitation(code: string): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(
            `${this.baseUrl}/validate`,
            { code },
            { headers: this.getHeaders() }
        );
    }
}
