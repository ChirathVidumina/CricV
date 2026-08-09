export type ViewState = 'view-home' | 'view-setup' | 'view-squad-selection' | 'view-opening-players' | 'view-scoring';

export interface AppSettings {
    battingTeam: string;
    bowlingTeam: string;
    tossWinner: string;
    optedTo: string;
    overs: string;
    ballsPerOver: number;
    nbReball: boolean;
    nbRuns: number;
    wdReball: boolean;
    wdRuns: number;
    battingSquad?: string[];
    bowlingSquad?: string[];
    playersPerTeam?: number;
    includeSquadSelection?: boolean;
    testState?: any;
}