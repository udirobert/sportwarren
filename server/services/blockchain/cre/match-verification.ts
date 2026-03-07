import axios from 'axios';

/**
 * Chainlink Runtime Environment (CRE) Implementation
 * This module defines the orchestration layer for trustless match verification.
 * 
 * Pattern follows the CRE workflow specification:
 * 1. Fetch external data (Off-chain)
 * 2. Perform computation (Consensus-ready)
 * 3. Return results to the blockchain (Atoms/Actions)
 */

export interface MatchVerificationInput {
    latitude: number;
    longitude: number;
    timestamp: number; // Unix timestamp
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

class MatchVerificationWorkflow {
    private readonly OWE_API_KEY = process.env.OPENWEATHER_API_KEY;
    private readonly GEO_API_KEY = process.env.GEO_VERIFICATION_API_KEY;
    private get isTestMode(): boolean {
        return process.env.NODE_ENV === 'test' || process.env.CRE_SIMULATION === 'true';
    }

    /**
     * Orchestrates the verification workflow using real-world data sources.
     * Following Chainlink CRE Pattern: Orchestration -> Consensus -> Settlement
     */
    async execute(input: MatchVerificationInput): Promise<MatchVerificationResult> {
        const workflowId = `cre_mw_${Math.random().toString(36).substring(7)}`;
        console.log(`[CRE][${workflowId}] Starting Verification: ${input.homeTeam} v ${input.awayTeam}`);

        // Action 1 & 2: Parallel data acquisition
        const [weatherData, locationData] = await Promise.all([
            this.fetchWeatherAction(input),
            this.fetchLocationAction(input)
        ]);

        // Action 3: Multi-factor Verification Logic (The 'Consensus' part of the workflow)
        let confidence = 0;

        // Weather score (40% weight) - verifies match was possible in those conditions
        if (weatherData.verified) {
            confidence += 40;
        }

        // Location score (60% weight) - verifies match happened at a valid venue
        if (locationData.verified) {
            confidence += 20; // Verified location
            if (locationData.isPitch) {
                confidence += 40; // High confidence: it's a sports facility
            }
        }

        const verified = confidence >= 60;

        console.log(`[CRE][${workflowId}] Score: ${confidence}/100 | Verified: ${verified}`);

        return {
            verified,
            confidence,
            weather: weatherData,
            location: locationData,
            timestamp: new Date().toISOString(),
            workflowId
        };
    }

    /**
     * ACTION: Fetch Weather Data
     * Supports both Current and Historical (One Call API)
     */
    private async fetchWeatherAction(input: MatchVerificationInput) {
        if (this.isTestMode && !this.OWE_API_KEY) {
            return { temperature: 14, conditions: 'Cloudy', verified: true, source: 'simulator' };
        }

        if (!this.OWE_API_KEY) {
            return { temperature: 0, conditions: 'missing_key', verified: false, source: 'none' };
        }

        try {
            const isHistorical = (Date.now() / 1000) - input.timestamp > 3600; // More than 1h ago
            const endpoint = isHistorical
                ? `https://api.openweathermap.org/data/3.0/onecall/timemachine`
                : `https://api.openweathermap.org/data/2.5/weather`;

            const response = await axios.get(endpoint, {
                params: {
                    lat: input.latitude,
                    lon: input.longitude,
                    dt: input.timestamp,
                    appid: this.OWE_API_KEY,
                    units: 'metric'
                }
            });

            const data = isHistorical ? response.data.data[0] : response.data;
            const main = isHistorical ? data : data.main;
            const weather = isHistorical ? data.weather[0] : data.weather[0];

            return {
                temperature: main.temp,
                conditions: weather.main,
                verified: true,
                source: 'OpenWeatherMap'
            };
        } catch (error) {
            console.error('[CRE] Weather Action Error:', error instanceof Error ? error.message : error);
            return { temperature: 0, conditions: 'error', verified: false, source: 'error' };
        }
    }

    /**
     * ACTION: Verify Location via Reverse Geocoding and Place Type analysis
     */
    private async fetchLocationAction(input: MatchVerificationInput) {
        if (this.isTestMode && !this.GEO_API_KEY) {
            return { region: 'Stamford Bridge', isPitch: true, verified: true, placeType: 'stadium' };
        }

        if (!this.GEO_API_KEY) {
            return { region: 'Missing Key', isPitch: false, verified: false, placeType: 'none' };
        }

        try {
            const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
                params: {
                    latlng: `${input.latitude},${input.longitude}`,
                    key: this.GEO_API_KEY
                }
            });

            const results = response.data.results;
            if (!results || results.length === 0) {
                return { region: 'Unknown', isPitch: false, verified: false, placeType: 'none' };
            }

            const topResult = results[0];
            const types = results.flatMap((r: any) => r.types);

            const pitchTypes = ['stadium', 'sports_complex', 'park', 'gym', 'recreation_ground'];
            const isPitch = types.some((t: string) => pitchTypes.includes(t));
            const placeType = types.find((t: string) => pitchTypes.includes(t)) || types[0] || 'point_of_interest';

            return {
                region: topResult.formatted_address,
                isPitch,
                verified: true,
                placeType
            };
        } catch (error) {
            console.error('[CRE] Location Action Error:', error instanceof Error ? error.message : error);
            return { region: 'Error', isPitch: false, verified: false, placeType: 'none' };
        }
    }
}

export const matchVerificationWorkflow = new MatchVerificationWorkflow();
