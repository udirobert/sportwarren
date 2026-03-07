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

export const EnvironmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<EnvironmentState>({
        city: 'Hackney',
        country: 'UK',
        venue: 'Hackney Marshes',
        weather: 'Cloudy',
        temp: '8°C',
        proximity: '2.4km from Center Circle',
        isNight: false,
        greeting: 'Good Day',
        rivals: { home: 'Hackney Hammers', away: 'Marshes Marauders' },
        localMission: { title: 'Center Circle Check-in', landmark: 'Hackney Marshes', bonus: '1.5x XP' },
        loading: true,
    });

    useEffect(() => {
        const fetchLocation = async () => {
            try {
                // 1. IP Geolocation
                const res = await fetch('https://ipapi.co/json/');
                const data = await res.json();

                if (data.city) {
                    const city = data.city;
                    const country = data.country_name;

                    // Time detection
                    const hour = new Date().getHours();
                    const isNight = hour > 18 || hour < 6;
                    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

                    let venue = `${city} Central Field`;
                    let rival1 = `${city} Navigators`;
                    let rival2 = `${city} Raiders`;
                    let missionLandmark = `${city} Park`;

                    if (city.toLowerCase().includes('nairobi')) {
                        venue = 'Nairobi City Ground';
                        rival1 = 'Nairobi Navigators';
                        rival2 = 'Mombasa Mariners';
                        missionLandmark = 'Uhuru Park';
                    }
                    if (city.toLowerCase().includes('london')) {
                        venue = 'Hackney Marshes';
                        rival1 = 'Hackney Hammers';
                        rival2 = 'Marshes Marauders';
                        missionLandmark = 'Hackney Marshes';
                    }

                    // 2. Mock Weather based on region (could be actual API later)
                    // (OpenWeather would be better, but this gets the POC running fast)
                    const temp = country === 'Kenya' ? '24°C' : '8°C';
                    const weather = country === 'Kenya' ? 'Sunny' : 'Light Rain';

                    setState({
                        city,
                        country,
                        venue,
                        weather,
                        temp,
                        proximity: `Verified: ${city} Core Active`,
                        isNight,
                        greeting,
                        rivals: { home: rival1, away: rival2 },
                        localMission: {
                            title: 'Home Ground Activation',
                            landmark: missionLandmark,
                            bonus: '1.5x XP Multiplier'
                        },
                        loading: false
                    });
                }
            } catch (err) {
                console.error("Environment detection failed:", err);
                setState(prev => ({ ...prev, loading: false }));
            }
        };

        fetchLocation();
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
