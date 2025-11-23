export interface Season {
    _id?: string;
    league: string;
    year: string;
    startDate: string | Date;
    endDate?: string | Date;
    status: 'upcoming' | 'active' | 'completed' | 'cancelled';
    championTeamId?: string;
    mvpPlayerId?: string;
    weekMvplayerId?: string;
    standings?: Standing[];
}

export interface Standing {
    teamId: string;
    position: number;
    wins: number;
    losses: number;
}
