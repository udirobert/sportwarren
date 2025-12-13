# Player Analytics - Roboflow Rapid + SAM3 Integration

## Overview

The Player Analytics feature provides real-time analysis of player performance using advanced computer vision and AI technologies. This system combines Roboflow Rapid for object detection with SAM3 (Segment Anything Model 3) for player segmentation and Python for comprehensive analytics.

## Features

### 1. Performance Analysis
- **Pro Comparison**: Compare your performance metrics against professional players
- **Detailed Metrics**: Track shot accuracy, speed, distance, positioning, and more
- **Skill Rating**: Get an overall performance score and rating level
- **Strengths & Weaknesses**: Identify areas of excellence and opportunities for improvement

### 2. Match Prediction
- **Win Probability**: AI-powered prediction of match outcomes
- **Score Prediction**: Expected final score based on team statistics
- **Strength Comparison**: Detailed comparison of team vs opponent strength
- **Key Factors**: Identify the most important factors affecting the match

### 3. Video Analysis (Coming Soon)
- **Player Detection**: Automatic detection and tracking of all players
- **Movement Analysis**: Track speed, distance covered, and positioning
- **Formation Detection**: Identify team formations and tactical patterns
- **Highlight Generation**: Automatically identify key moments

## Technical Architecture

### Python Analytics Service
Located at: `server/services/ai/player-analytics.py`

**Key Components:**
- `PlayerAnalyticsService`: Main service class handling all analytics
- Roboflow Rapid API integration for player detection
- Professional benchmarking system
- Match prediction algorithms
- Performance comparison engine

**API Endpoints:**
- `POST /api/analyze-frame`: Analyze a single video frame
- `POST /api/analyze-performance`: Compare player against pros
- `POST /api/predict-result`: Predict match outcome
- `GET /api/pro-benchmarks`: Get professional player benchmarks
- `GET /health`: Service health check

### Node.js Bridge API
Located at: `server/services/ai/player-analytics-api.ts`

**Purpose:** Provides a TypeScript interface for the Node.js server to communicate with the Python analytics service.

**Key Methods:**
- `analyzeFrame()`: Send video frame for analysis
- `analyzePerformance()`: Request performance analysis
- `predictMatchResult()`: Get match prediction
- `getProBenchmarks()`: Fetch pro benchmarks
- `analyzeVideoStream()`: Process video streams
- `generateTechniqueReport()`: Generate comprehensive technique reports

### Frontend Components
Located at: `src/pages/PlayerAnalytics.tsx`

**Tabs:**
1. **Performance Analysis**: View your performance vs pros
2. **Match Prediction**: See predicted match outcomes
3. **Video Analysis**: Upload and analyze match footage

## Setup Instructions

### 1. Install Python Dependencies

```bash
npm run setup:analytics
# OR
pip3 install -r server/services/ai/requirements.txt
```

### 2. Configure Environment Variables

Add to your `.env` file:

```env
# Roboflow Configuration
ROBOFLOW_API_KEY=your_roboflow_api_key
ROBOFLOW_WORKSPACE=sportwarren
ROBOFLOW_MODEL=football-player-detection

# Analytics Service
ANALYTICS_SERVICE_URL=http://localhost:5001
ANALYTICS_PORT=5001
```

### 3. Start the Services

```bash
# Start all services (client, server, analytics)
npm run dev

# OR start services individually
npm run dev:client    # React frontend
npm run dev:server    # Node.js backend
npm run dev:analytics # Python analytics service
```

## Usage

### Frontend Usage

1. Navigate to `/analytics` in the application
2. Choose from three tabs:
   - **Performance Analysis**: View your stats compared to pros
   - **Match Prediction**: Get AI predictions for upcoming matches
   - **Video Analysis**: Upload match videos for analysis

### API Usage

#### Analyze Performance

```typescript
import { playerAnalyticsAPI } from './server/services/ai/player-analytics-api';

const playerData = {
  shot_accuracy: 0.72,
  avg_speed: 27.8,
  distance_per_match: 10.2,
  sprint_count: 42,
  successful_dribbles: 0.65,
  positioning_score: 8.3
};

const analysis = await playerAnalyticsAPI.analyzePerformance(
  playerData,
  'striker'
);

console.log('Overall Score:', analysis.overall_score);
console.log('Rating:', analysis.comparison.rating);
```

#### Predict Match Result

```typescript
const teamStats = {
  avg_rating: 7.8,
  recent_form: 7.5,
  goals_scored: 45,
  goals_conceded: 28
};

const opponentStats = {
  avg_rating: 7.5,
  recent_form: 6.8,
  goals_scored: 38,
  goals_conceded: 32
};

const prediction = await playerAnalyticsAPI.predictMatchResult(
  teamStats,
  opponentStats
);

console.log('Win Probability:', prediction.probabilities.win);
console.log('Predicted Score:', prediction.predicted_score);
```

#### Analyze Video Frame

```typescript
import fs from 'fs';

const imageBuffer = fs.readFileSync('./match-frame.jpg');
const result = await playerAnalyticsAPI.analyzeFrame(imageBuffer);

console.log('Players Detected:', result.players_detected);
console.log('Formation:', result.analytics.formation.formation);
console.log('Field Coverage:', result.analytics.field_coverage);
```

## Professional Benchmarks

The system includes professional benchmarks for different positions:

### Striker
- Shot Accuracy: 75%
- Average Speed: 28.5 km/h
- Distance per Match: 10.5 km
- Sprint Count: 45
- Successful Dribbles: 68%
- Positioning Score: 8.5/10

### Midfielder
- Pass Accuracy: 88%
- Average Speed: 26.8 km/h
- Distance per Match: 11.8 km
- Sprint Count: 38
- Successful Dribbles: 65%
- Positioning Score: 8.2/10

### Defender
- Tackle Success: 82%
- Average Speed: 25.2 km/h
- Distance per Match: 10.2 km
- Sprint Count: 32
- Aerial Duels: 74%
- Positioning Score: 8.7/10

### Goalkeeper
- Save Percentage: 72%
- Reaction Time: 0.35s
- Distribution Accuracy: 76%
- Positioning Score: 9.0/10

## GraphQL API

### Queries

```graphql
# Get player analytics
query GetPlayerAnalytics($userId: ID!) {
  playerAnalytics(userId: $userId) {
    id
    position
    overallScore
    comparisonRating
    metrics {
      name
      playerValue
      proValue
      score
      percentageOfPro
    }
    strengths {
      metric
      message
    }
    areasForImprovement {
      metric
      message
    }
  }
}

# Get match prediction
query PredictMatch($teamStats: JSON!, $opponentStats: JSON!) {
  matchPrediction(teamStats: $teamStats, opponentStats: $opponentStats) {
    probabilities {
      win
      draw
      lose
    }
    predictedScore {
      home
      away
    }
    confidence
    keyFactors
  }
}

# Get pro benchmarks
query GetProBenchmarks($position: String) {
  proBenchmarks(position: $position)
}
```

### Mutations

```graphql
# Analyze performance
mutation AnalyzePerformance($input: AnalyzePerformanceInput!) {
  analyzePerformance(input: $input) {
    id
    overallScore
    comparisonRating
  }
}

# Predict match
mutation PredictMatch($input: PredictMatchInput!) {
  predictMatch(input: $input) {
    probabilities {
      win
      draw
      lose
    }
  }
}

# Analyze video
mutation AnalyzeVideo($input: AnalyzeVideoInput!) {
  analyzeVideo(input: $input) {
    id
    processingStatus
  }
}
```

## Performance Ratings

| Score Range | Rating Level |
|-------------|-------------|
| 90-100 | Elite |
| 80-89 | Professional |
| 70-79 | Semi-Professional |
| 60-69 | Advanced Amateur |
| 0-59 | Amateur |

## Future Enhancements

### Phase 1 (Current)
- [x] Basic performance analysis
- [x] Pro benchmarking
- [x] Match prediction
- [x] Frontend dashboard
- [ ] Video frame analysis

### Phase 2 (Coming Soon)
- [ ] Full video stream processing
- [ ] Real-time match analysis
- [ ] Advanced formation detection
- [ ] Player heatmaps
- [ ] Movement pattern analysis

### Phase 3 (Future)
- [ ] Multi-camera support
- [ ] 3D player tracking
- [ ] Injury risk prediction
- [ ] Technique coaching suggestions
- [ ] Integration with wearable devices

## Troubleshooting

### Analytics Service Not Starting

**Problem:** Python service fails to start
**Solution:** 
1. Ensure Python 3.8+ is installed
2. Install dependencies: `pip3 install -r server/services/ai/requirements.txt`
3. Check port 5001 is available

### Roboflow API Errors

**Problem:** Player detection not working
**Solution:**
1. Verify `ROBOFLOW_API_KEY` is set in `.env`
2. Check API key is valid at https://roboflow.com
3. Service will fall back to mock data if API is unavailable

### Video Upload Issues

**Problem:** Video upload fails
**Solution:**
1. Check file size (max 500MB)
2. Verify file format (MP4, MOV, AVI)
3. Ensure sufficient server storage

## Support

For issues or questions:
- GitHub Issues: Create an issue with the `analytics` label
- Email: support@sportwarren.com
- Discord: #player-analytics channel

## Contributing

We welcome contributions! Areas of interest:
- Improving prediction accuracy
- Adding new player metrics
- Enhancing video analysis
- Performance optimizations

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.
