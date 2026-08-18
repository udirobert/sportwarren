import { runMatchVerification } from './cre/match-verification';

/**
 * Match location/weather verification — thin dispatcher over the CRE workflow.
 *
 * History (chain consolidation, 2026-08): this class used to drive hand-deployed
 * Chainlink oracle contracts on Avalanche (requestWeatherData /
 * requestLocationVerification) as a fallback. Those oracle contracts were never
 * deployed and their env vars (CHAINLINK_WEATHER_ORACLE,
 * CHAINLINK_LOCATION_ORACLE, WEB3_PRIVATE_KEY) were never set, so the fallback
 * always returned `verified: false`. The oracle half was deleted; CRE
 * (`cre/match-verification.ts`) is the single verification engine — Open-Meteo
 * weather + reverse geocoding over plain HTTP, no on-chain hop, no ethers.
 *
 * The class keeps its name and the `chainlinkService` singleton because
 * `match-workflow.ts` and the `match` router call it by name; semantically it is
 * now "Chainlink CRE-style verification", not an oracle integration.
 */
export class ChainlinkService {
  /**
   * Comprehensive match verification via the CRE workflow.
   */
  async verifyMatch(matchData: {
    latitude: number;
    longitude: number;
    timestamp: number;
    homeTeam: string;
    awayTeam: string;
  }): Promise<{
    verified: boolean;
    confidence: number;
    weatherVerified: boolean;
    locationVerified: boolean;
    details: any;
  }> {
    try {
      const creResult = await runMatchVerification({
        latitude: matchData.latitude,
        longitude: matchData.longitude,
        timestamp: matchData.timestamp,
        homeTeam: matchData.homeTeam,
        awayTeam: matchData.awayTeam,
      });

      return {
        verified: creResult.verified,
        confidence: creResult.confidence,
        weatherVerified: creResult.weather.verified,
        locationVerified: creResult.location.verified,
        details: creResult,
      };
    } catch (error) {
      console.error('[ChainlinkService] CRE verification failed:', error);
      return {
        verified: false,
        confidence: 0,
        weatherVerified: false,
        locationVerified: false,
        details: null,
      };
    }
  }
}

export const chainlinkService = new ChainlinkService();
