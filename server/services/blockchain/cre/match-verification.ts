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
        let reasons: string[] = [];

        // Weather score (40% weight) - verifies match was possible in those conditions
        if (weatherData.verified) {
            confidence += 40;
            reasons.push(`Weather confirmed by ${weatherData.source}: ${weatherData.conditions}, ${weatherData.temperature}°C`);
        } else {
            reasons.push('Weather verification failed or skipped.');
        }

        // Location score (60% weight) - verifies match happened at a valid venue
        if (locationData.verified) {
            if (locationData.isPitch) {
                confidence += 60; // 100% location confidence for stadiums/pitches
                reasons.push(`Match played at confirmed venue: ${locationData.region} (${locationData.placeType})`);
            } else {
                confidence += 30; // 50% location confidence for recognized regions that aren't specific pitches
                reasons.push(`Location verified at ${locationData.region}, but venue type (${locationData.placeType}) is unconfirmed.`);
            }
        } else {
            reasons.push('Location verification failed - outside known perimeter.');
        }

        const verified = confidence >= 60;

        console.log(`[CRE][${workflowId}] Score: ${confidence}/100 | Verified: ${verified}`);

        return {
            verified,
            confidence: Math.min(100, confidence),
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

        // 1. Try Open-Meteo (Zero-Key, Sovereign Default)
        try {
            const date = new Date(input.timestamp * 1000);
            const dateStr = date.toISOString().split('T')[0];
            const isHistorical = (Date.now() / 1000) - input.timestamp > 3600;

            const endpoint = isHistorical
                ? `https://archive-api.open-meteo.com/v1/archive`
                : `https://api.open-meteo.com/v1/forecast`;

            const response = await axios.get(endpoint, {
                params: {
                    latitude: input.latitude,
                    longitude: input.longitude,
                    ...(isHistorical
                        ? { start_date: dateStr, end_date: dateStr, hourly: 'temperature_2m,weather_code' }
                        : { current: 'temperature_2m,weather_code' }),
                    timezone: 'UTC'
                },
                timeout: 5000
            });

            let temperature = 0;
            let weatherCode = 0;

            if (isHistorical) {
                // Find the closest hour in the archive
                const hour = date.getUTCHours();
                temperature = response.data.hourly.temperature_2m[hour];
                weatherCode = response.data.hourly.weather_code[hour];
            } else {
                temperature = response.data.current.temperature_2m;
                weatherCode = response.data.current.weather_code;
            }

            // Map WMO Weather Codes to SportWarren Conditions
            const mapWmoToCondition = (code: number) => {
                if (code === 0) return 'Clear';
                if (code <= 3) return 'Cloudy';
                if (code <= 48) return 'Fog';
                if (code <= 55) return 'Drizzle';
                if (code <= 65) return 'Rain';
                if (code <= 77) return 'Snow';
                if (code <= 82) return 'Showers';
                return 'Thunderstorm';
            };

            return {
                temperature,
                conditions: mapWmoToCondition(weatherCode),
                verified: true,
                source: 'Open-Meteo (Sovereign)'
            };
        } catch (error) {
            console.warn('[CRE] Open-Meteo action failed, checking for OpenWeatherMap fallback.');
        }

        // 2. Fallback: OpenWeatherMap (Key-Based)
        if (this.OWE_API_KEY) {
            try {
                const isHistorical = (Date.now() / 1000) - input.timestamp > 3600;
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
                    },
                    timeout: 5000
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
                console.error('[CRE] OpenWeatherMap fallback failed:', error instanceof Error ? error.message : error);
            }
        }

        return { temperature: 0, conditions: 'unknown', verified: false, source: 'none' };
    }

    /**
     * ACTION: Verify Location via Reverse Geocoding and Place Type analysis
     */
    private async fetchLocationAction(input: MatchVerificationInput) {
        if (this.isTestMode && !this.GEO_API_KEY) {
            return { region: 'Stamford Bridge', isPitch: true, verified: true, placeType: 'stadium' };
        }

        // 1. Try Google Maps / LocationIQ (Legacy/Key-Based)
        if (this.GEO_API_KEY) {
            try {
                const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
                    params: {
                        latlng: `${input.latitude},${input.longitude}`,
                        key: this.GEO_API_KEY
                    },
                    timeout: 5000
                });

                const results = response.data.results;
                if (results && results.length > 0) {
                    const types = results.flatMap((r: any) => r.types);
                    const pitchTypes = ['stadium', 'sports_complex', 'park', 'gym', 'recreation_ground'];
                    const isPitch = types.some((t: string) => pitchTypes.includes(t));
                    const placeType = types.find((t: string) => pitchTypes.includes(t)) || types[0] || 'point_of_interest';

                    return {
                        region: results[0].formatted_address,
                        isPitch,
                        verified: true,
                        placeType
                    };
                }
            } catch (error) {
                console.warn('[CRE] Primary Location Action (Key-based) failed, falling back to Nominatim.');
            }
        }

        // 2. Fallback: OpenStreetMap (Nominatim) - No Key Required (Hackathon Proof)
        try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
                params: {
                    lat: input.latitude,
                    lon: input.longitude,
                    format: 'json',
                    addressdetails: 1
                },
                headers: {
                    'User-Agent': `${process.env.NEXT_PUBLIC_APP_NAME || 'SportWarren'}-Hackathon-Verifier`
                },
                timeout: 5000
            });

            const data = response.data;
            if (data && data.display_name) {
                // Pitch detection for OSM
                const pitchTypes = ['stadium', 'pitch', 'sports_centre', 'recreation_ground', 'park', 'leisure'];
                const osmType = data.type || data.category || 'unknown';
                const isPitch = pitchTypes.includes(osmType) ||
                    data.extratags?.sport === 'soccer' ||
                    data.display_name.toLowerCase().includes('stadium');

                return {
                    region: data.display_name,
                    isPitch,
                    verified: true,
                    placeType: osmType
                };
            }
        } catch (error) {
            console.error('[CRE] Fallback Location Action (OSM) failed:', error instanceof Error ? error.message : error);
        }

        return { region: 'Unknown', isPitch: false, verified: false, placeType: 'none' };
    }
}

export const matchVerificationWorkflow = new MatchVerificationWorkflow();
