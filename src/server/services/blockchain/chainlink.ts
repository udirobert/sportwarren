import { runMatchVerification } from './cre/match-verification';

/**
 * Match verification service — delegates entirely to the CRE workflow
 * (Open-Meteo weather + reverse geocoding over plain HTTP).
 *
 * History (2026-08 consolidation): this module previously contained a
 * fallback path that called hand-deployed Chainlink oracle contracts on
 * Avalanche C-Chain. Those contracts were never deployed to any
 * environment, the required env vars (CHAINLINK_WEATHER_ORACLE,
 * CHAINLINK_LOCATION_ORACLE, WEB3_PRIVATE_KEY for oracle txs) were never
 * set, and the fallback was unreachable dead code. It has been removed.
 *
 * The class and singleton names are preserved so that existing call-sites
 * (`match-workflow.ts`, `routers/match.ts`, `scripts/test-chainlink.ts`)
 * continue to work without import changes.
 */
export class ChainlinkService {
  /**
   * Verify a match's claimed location and time against real-world weather
   * and geocoding data via the CRE workflow.
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
