export interface MatchVerificationInput {
    latitude: number;
    longitude: number;
    timestamp: number;
    homeTeam: string;
    awayTeam: string;
}

export interface MatchVerificationResult {
    verified: boolean;
    confidence: number;
    weather: {
        temperature: number;
        conditions: string;
        verified: boolean;
        source: string;
    };
    location: {
        region: string;
        isPitch: boolean;
        verified: boolean;
        placeType: string;
    };
    timestamp: string;
    workflowId: string;
}
