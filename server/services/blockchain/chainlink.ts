import { ethers } from 'ethers';

/**
 * Chainlink Oracle Service
 * Provides external data verification for match submissions
 */
export class ChainlinkService {
  private provider: ethers.Provider;
  private weatherOracleContract: ethers.Contract | null = null;
  private locationOracleContract: ethers.Contract | null = null;
  private initialized: boolean = false;

  constructor() {
    const rpcUrl = process.env.AVALANCHE_RPC_URL || 'https://api.avax.network/ext/bc/C/rpc';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    // Don't await in constructor - call ensureInitialized() in methods
  }

  private async initializeOracles(): Promise<void> {
    if (this.initialized) return;

    // Chainlink oracle contract ABIs
    const oracleABI = [
      'function requestWeatherData(int256 lat, int256 lon, uint256 timestamp) external returns (bytes32)',
      'function getWeatherData(bytes32 requestId) external view returns (int256 temperature, uint256 conditions, bool fulfilled)',
      'function requestLocationVerification(int256 lat, int256 lon) external returns (bytes32)',
      'function getLocationData(bytes32 requestId) external view returns (bool isValid, string memory region, bool fulfilled)',
      'event WeatherDataReceived(bytes32 indexed requestId, int256 temperature, uint256 conditions)',
      'event LocationVerified(bytes32 indexed requestId, bool isValid)',
    ];

    const weatherOracleAddress = process.env.CHAINLINK_WEATHER_ORACLE;
    const locationOracleAddress = process.env.CHAINLINK_LOCATION_ORACLE;

    if (weatherOracleAddress) {
      this.weatherOracleContract = new ethers.Contract(
        weatherOracleAddress,
        oracleABI,
        this.provider
      );
    }

    if (locationOracleAddress) {
      this.locationOracleContract = new ethers.Contract(
        locationOracleAddress,
        oracleABI,
        this.provider
      );
    }

    this.initialized = true;
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initializeOracles();
    }
  }

  /**
   * Verify weather conditions at match time/location
   */
  async verifyWeather(
    latitude: number,
    longitude: number,
    timestamp: number
  ): Promise<{
    verified: boolean;
    temperature?: number;
    conditions?: string;
    requestId?: string;
  }> {
    try {
      await this.ensureInitialized();

      if (!this.weatherOracleContract) {
        console.warn('Weather oracle not configured');
        return { verified: false };
      }

      // Convert to Chainlink format (scaled integers)
      const lat = BigInt(Math.floor(latitude * 1e6));
      const lon = BigInt(Math.floor(longitude * 1e6));
      const ts = BigInt(timestamp);

      // Request weather data from Chainlink oracle
      const privateKey = process.env.WEB3_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error('WEB3_PRIVATE_KEY not configured');
      }

      const wallet = new ethers.Wallet(privateKey, this.provider);
      const contractWithSigner = this.weatherOracleContract.connect(wallet);
      
      // Use getFunction to properly call the contract method
      const requestWeatherData = contractWithSigner.getFunction('requestWeatherData');
      const tx = await requestWeatherData(lat, lon, ts);
      const receipt = await tx.wait();

      if (!receipt) {
        return { verified: false };
      }

      // Extract request ID from events
      const requestId = receipt.logs[0]?.topics[1] || '';

      // Poll for oracle response (in production, use event listeners)
      await this.waitForOracleResponse(requestId, 30000);

      const getWeatherData = this.weatherOracleContract.getFunction('getWeatherData');
      const weatherData = await getWeatherData(requestId);

      if (weatherData.fulfilled) {
        return {
          verified: true,
          temperature: Number(weatherData.temperature) / 100,
          conditions: this.decodeWeatherConditions(Number(weatherData.conditions)),
          requestId,
        };
      }

      return { verified: false, requestId };
    } catch (error) {
      console.error('Weather verification error:', error);
      return { verified: false };
    }
  }

  /**
   * Verify GPS location authenticity
   */
  async verifyLocation(
    latitude: number,
    longitude: number
  ): Promise<{
    verified: boolean;
    region?: string;
    isValid?: boolean;
    requestId?: string;
  }> {
    try {
      await this.ensureInitialized();

      if (!this.locationOracleContract) {
        console.warn('Location oracle not configured');
        return { verified: false };
      }

      const lat = BigInt(Math.floor(latitude * 1e6));
      const lon = BigInt(Math.floor(longitude * 1e6));

      const privateKey = process.env.WEB3_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error('WEB3_PRIVATE_KEY not configured');
      }

      const wallet = new ethers.Wallet(privateKey, this.provider);
      const contractWithSigner = this.locationOracleContract.connect(wallet);

      const requestLocationVerification = contractWithSigner.getFunction('requestLocationVerification');
      const tx = await requestLocationVerification(lat, lon);
      const receipt = await tx.wait();

      if (!receipt) {
        return { verified: false };
      }

      const requestId = receipt.logs[0]?.topics[1] || '';

      await this.waitForOracleResponse(requestId, 30000);

      const getLocationData = this.locationOracleContract.getFunction('getLocationData');
      const locationData = await getLocationData(requestId);

      if (locationData.fulfilled) {
        return {
          verified: true,
          isValid: locationData.isValid,
          region: locationData.region,
          requestId,
        };
      }

      return { verified: false, requestId };
    } catch (error) {
      console.error('Location verification error:', error);
      return { verified: false };
    }
  }

  /**
   * Comprehensive match verification using multiple oracles
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
    const [weatherResult, locationResult] = await Promise.all([
      this.verifyWeather(matchData.latitude, matchData.longitude, matchData.timestamp),
      this.verifyLocation(matchData.latitude, matchData.longitude),
    ]);

    const weatherVerified = weatherResult.verified;
    const locationVerified = locationResult.verified && locationResult.isValid === true;

    // Calculate confidence score
    let confidence = 0;
    if (weatherVerified) confidence += 50;
    if (locationVerified) confidence += 50;

    const verified = confidence >= 50; // At least one oracle must verify

    return {
      verified,
      confidence,
      weatherVerified,
      locationVerified,
      details: {
        weather: weatherResult,
        location: locationResult,
      },
    };
  }

  private async waitForOracleResponse(
    _requestId: string,
    timeout: number = 30000
  ): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      // In production, check if oracle has responded
      // For now, just wait
    }
  }

  private decodeWeatherConditions(code: number): string {
    const conditions: { [key: number]: string } = {
      0: 'Clear',
      1: 'Partly Cloudy',
      2: 'Cloudy',
      3: 'Rainy',
      4: 'Stormy',
      5: 'Snowy',
    };
    return conditions[code] || 'Unknown';
  }

  /**
   * Get oracle verification cost estimate
   */
  async getVerificationCost(): Promise<{
    weatherCost: string;
    locationCost: string;
    totalCost: string;
  }> {
    // Chainlink oracle costs (approximate)
    const weatherCost = ethers.parseUnits('0.1', 'ether'); // 0.1 LINK
    const locationCost = ethers.parseUnits('0.05', 'ether'); // 0.05 LINK
    const totalCost = weatherCost + locationCost;

    return {
      weatherCost: ethers.formatEther(weatherCost),
      locationCost: ethers.formatEther(locationCost),
      totalCost: ethers.formatEther(totalCost),
    };
  }

  /**
   * Check if oracles are configured and healthy
   */
  async healthCheck(): Promise<{
    weatherOracle: boolean;
    locationOracle: boolean;
    overall: boolean;
  }> {
    await this.ensureInitialized();

    const weatherOracle = this.weatherOracleContract !== null;
    const locationOracle = this.locationOracleContract !== null;

    return {
      weatherOracle,
      locationOracle,
      overall: weatherOracle && locationOracle,
    };
  }
}

export const chainlinkService = new ChainlinkService();
