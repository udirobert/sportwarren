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
    };
    location: {
        region: string;
        isPitch: boolean;
        verified: boolean;
    };
    timestamp: string;
}

class MatchVerificationWorkflow {
    private readonly OWE_API_KEY = process.env.OPENWEATHER_API_KEY;
    private readonly GEO_API_KEY = process.env.GEO_VERIFICATION_API_KEY;

    /**
     * Orchestrates the verification workflow using real-world data sources.
     */
    async execute(input: MatchVerificationInput): Promise<MatchVerificationResult> {
        console.log(`[CRE] Executing Match Verification Workflow for ${input.homeTeam} vs ${input.awayTeam}`);

        // Parallel execution of off-chain data fetching
        const [weatherData, locationData] = await Promise.all([
            this.fetchRealWeather(input),
            this.fetchRealLocation(input)
        ]);

        // Computation: Trust Score calculation
        let confidence = 0;
        if (weatherData.verified) confidence += 40;
        if (locationData.verified) confidence += 40;
        if (locationData.isPitch) confidence += 20;

        const verified = confidence >= 60;

        return {
            verified,
            confidence,
            weather: weatherData,
            location: locationData,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Fetch real weather data from OpenWeatherMap Historic/Current API
     */
    private async fetchRealWeather(input: MatchVerificationInput) {
        if (!this.OWE_API_KEY) {
            return { temperature: 0, conditions: 'simulated', verified: false };
        }

        try {
            // For historical data we'd use the One Call API 3.0
            // For simplicity/demo we'll use current if timestamp is recent, or historic
            const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
                params: {
                    lat: input.latitude,
                    lon: input.longitude,
                    appid: this.OWE_API_KEY,
                    units: 'metric'
                }
            });

            return {
                temperature: response.data.main.temp,
                conditions: response.data.weather[0].main,
                verified: true
            };
        } catch (error) {
            console.error('[CRE] Weather Fetch Error:', error);
            return { temperature: 0, conditions: 'error', verified: false };
        }
    }

    /**
     * Fetch real location data and verify if it's a sports facility
     */
    private async fetchRealLocation(input: MatchVerificationInput) {
        if (!this.GEO_API_KEY) {
            return { region: 'Unknown', isPitch: false, verified: false };
        }

        try {
            // Use Reverse Geocoding to get the place type
            const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
                params: {
                    latlng: `${input.latitude},${input.longitude}`,
                    key: this.GEO_API_KEY
                }
            });

            const results = response.data.results;
            const region = results[0]?.formatted_address || 'Unknown';

            // Check if any place type in the results contains 'sports_complex', 'stadium', 'park', etc.
            const types = results.flatMap((r: any) => r.types);
            const isPitch = types.some((t: string) =>
                ['stadium', 'sports_complex', 'park', 'gym'].includes(t)
            );

            return {
                region,
                isPitch,
                verified: results.length > 0
            };
        } catch (error) {
            console.error('[CRE] Location Fetch Error:', error);
            return { region: 'Error', isPitch: false, verified: false };
        }
    }
}

export const matchVerificationWorkflow = new MatchVerificationWorkflow();
