'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface EnvironmentState {
    city: string;
    country: string;
    venue: string;
    weather: string;
    temp: string;
    proximity: string;
    isNight: boolean;
    greeting: string;
    rivals: { home: string; away: string };
    localMission: { title: string; landmark: string; bonus: string };
    loading: boolean;
}

const EnvironmentContext = createContext<EnvironmentState | undefined>(undefined);

const DEFAULT_ENVIRONMENT_STATE: EnvironmentState = {
    city: 'your local chapter',
    country: 'Unknown',
    venue: 'your next ground',
    weather: 'Unavailable',
    temp: '--',
    proximity: 'Location not shared',
    isNight: false,
    greeting: 'Welcome back',
    rivals: { home: 'Home Squad', away: 'Away Squad' },
    localMission: {
        title: 'Log your next verified match',
        landmark: 'your next fixture',
        bonus: 'Proof unlocks progression',
    },
    loading: true,
};

function formatCityFromTimeZone(timeZone?: string) {
    if (!timeZone || !timeZone.includes('/')) {
        return DEFAULT_ENVIRONMENT_STATE.city;
    }

    const city = timeZone.split('/').pop()?.replace(/_/g, ' ').trim();
    return city || DEFAULT_ENVIRONMENT_STATE.city;
}

function formatCountryFromLocale(locale?: string) {
    const region = locale?.split('-')[1];
    if (!region) {
        return DEFAULT_ENVIRONMENT_STATE.country;
    }

    try {
        return new Intl.DisplayNames([locale], { type: 'region' }).of(region) || region;
    } catch {
        return region;
    }
}

export const EnvironmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<EnvironmentState>(DEFAULT_ENVIRONMENT_STATE);

    useEffect(() => {
        try {
            const now = new Date();
            const hour = now.getHours();
            const isNight = hour >= 19 || hour < 6;
            const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const locale = typeof navigator !== 'undefined'
                ? navigator.language
                : Intl.DateTimeFormat().resolvedOptions().locale;
            const city = formatCityFromTimeZone(timeZone);
            const country = formatCountryFromLocale(locale);

            setState({
                city,
                country,
                venue: DEFAULT_ENVIRONMENT_STATE.venue,
                weather: DEFAULT_ENVIRONMENT_STATE.weather,
                temp: DEFAULT_ENVIRONMENT_STATE.temp,
                proximity: DEFAULT_ENVIRONMENT_STATE.proximity,
                isNight,
                greeting,
                rivals: DEFAULT_ENVIRONMENT_STATE.rivals,
                localMission: DEFAULT_ENVIRONMENT_STATE.localMission,
                loading: false,
            });
        } catch (err) {
            console.error('Environment detection failed:', err);
            setState((prev) => ({ ...prev, loading: false }));
        }
    }, []);

    return (
        <EnvironmentContext.Provider value={state}>
            {children}
        </EnvironmentContext.Provider>
    );
};

export const useEnvironment = () => {
    const context = useContext(EnvironmentContext);
    if (!context) throw new Error('useEnvironment must be used within EnvironmentProvider');
    return context;
};
