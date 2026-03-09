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

async function fetchWeather(input: MatchVerificationInput) {
    const OWE_API_KEY = process.env.OPENWEATHER_API_KEY;
    try {
        const date = new Date(input.timestamp * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const isHistorical = (Date.now() / 1000) - input.timestamp > 3600;
        const endpoint = isHistorical
            ? `https://archive-api.open-meteo.com/v1/archive`
            : `https://api.open-meteo.com/v1/forecast`;

        const params = new URLSearchParams({
            latitude: String(input.latitude),
            longitude: String(input.longitude),
            timezone: 'UTC',
            ...(isHistorical
                ? { start_date: dateStr, end_date: dateStr, hourly: 'temperature_2m,weather_code' }
                : { current: 'temperature_2m,weather_code' }),
        });

        const res = await fetch(`${endpoint}?${params}`, { signal: AbortSignal.timeout(5000) });
        const data = await res.json();

        let temperature = 0;
        let weatherCode = 0;
        if (isHistorical) {
            const hour = date.getUTCHours();
            temperature = data.hourly.temperature_2m[hour];
            weatherCode = data.hourly.weather_code[hour];
        } else {
            temperature = data.current.temperature_2m;
            weatherCode = data.current.weather_code;
        }

        return { temperature, conditions: mapWmoToCondition(weatherCode), verified: true, source: 'Open-Meteo' };
    } catch {
        // fallback to OpenWeatherMap
    }

    if (OWE_API_KEY) {
        try {
            const isHistorical = (Date.now() / 1000) - input.timestamp > 3600;
            const endpoint = isHistorical
                ? `https://api.openweathermap.org/data/3.0/onecall/timemachine`
                : `https://api.openweathermap.org/data/2.5/weather`;
            const params = new URLSearchParams({
                lat: String(input.latitude),
                lon: String(input.longitude),
                dt: String(input.timestamp),
                appid: OWE_API_KEY,
                units: 'metric',
            });
            const res = await fetch(`${endpoint}?${params}`, { signal: AbortSignal.timeout(5000) });
            const data = await res.json();
            const d = isHistorical ? data.data[0] : data;
            return { temperature: d.main?.temp ?? d.temp, conditions: d.weather[0].main, verified: true, source: 'OpenWeatherMap' };
        } catch {
            // fall through
        }
    }

    return { temperature: 0, conditions: 'unknown', verified: false, source: 'none' };
}

async function fetchLocation(input: MatchVerificationInput) {
    const GEO_API_KEY = process.env.GEO_VERIFICATION_API_KEY;

    if (GEO_API_KEY) {
        try {
            const params = new URLSearchParams({ latlng: `${input.latitude},${input.longitude}`, key: GEO_API_KEY });
            const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${params}`, { signal: AbortSignal.timeout(5000) });
            const data = await res.json();
            if (data.results?.length > 0) {
                const types = data.results.flatMap((r: any) => r.types);
                const pitchTypes = ['stadium', 'sports_complex', 'park', 'gym', 'recreation_ground'];
                const isPitch = types.some((t: string) => pitchTypes.includes(t));
                const placeType = types.find((t: string) => pitchTypes.includes(t)) || types[0] || 'point_of_interest';
                return { region: data.results[0].formatted_address, isPitch, verified: true, placeType };
            }
        } catch {
            // fall through
        }
    }

    try {
        const params = new URLSearchParams({
            lat: String(input.latitude),
            lon: String(input.longitude),
            format: 'json',
            addressdetails: '1',
        });
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
            headers: { 'User-Agent': 'SportWarren-Verifier' },
            signal: AbortSignal.timeout(5000),
        });
        const data = await res.json();
        if (data?.display_name) {
            const pitchTypes = ['stadium', 'pitch', 'sports_centre', 'recreation_ground', 'park', 'leisure'];
            const osmType = data.type || data.category || 'unknown';
            const isPitch = pitchTypes.includes(osmType) || data.display_name.toLowerCase().includes('stadium');
            return { region: data.display_name, isPitch, verified: true, placeType: osmType };
        }
    } catch {
        // fall through
    }

    return { region: 'Unknown', isPitch: false, verified: false, placeType: 'none' };
}

export async function runMatchVerification(input: MatchVerificationInput): Promise<MatchVerificationResult> {
    const workflowId = `cre_mw_${Math.random().toString(36).substring(7)}`;

    const [weather, location] = await Promise.all([fetchWeather(input), fetchLocation(input)]);

    let confidence = 0;
    if (weather.verified) confidence += 40;
    if (location.verified) confidence += location.isPitch ? 60 : 30;

    return {
        verified: confidence >= 60,
        confidence: Math.min(100, confidence),
        weather,
        location,
        timestamp: new Date().toISOString(),
        workflowId,
    };
}
