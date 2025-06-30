import OpenAI from 'openai';

export class OpenAIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // Voice transcription using Whisper
  async transcribeAudio(audioBuffer: Buffer, language?: string): Promise<string> {
    try {
      const response = await this.client.audio.transcriptions.create({
        file: new File([audioBuffer], 'audio.wav', { type: 'audio/wav' }),
        model: 'whisper-1',
        language: language || 'en',
        response_format: 'text',
      });

      return response;
    } catch (error) {
      console.error('OpenAI transcription error:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  // Generate match narrative
  async generateMatchNarrative(matchData: any): Promise<string> {
    try {
      const prompt = `
        Create an engaging match report for a grassroots football match with the following details:
        
        Teams: ${matchData.homeTeam} vs ${matchData.awayTeam}
        Score: ${matchData.homeScore}-${matchData.awayScore}
        Key Events: ${JSON.stringify(matchData.events)}
        Player Stats: ${JSON.stringify(matchData.playerStats)}
        
        Write it in a fun, engaging style that captures the spirit of grassroots football.
        Focus on the drama, key moments, and standout performances.
        Keep it under 200 words.
      `;

      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a sports journalist who specializes in grassroots football. Write engaging, fun match reports that celebrate the spirit of amateur football.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || 'Match completed successfully!';
    } catch (error) {
      console.error('OpenAI narrative generation error:', error);
      return 'Match completed successfully!';
    }
  }

  // Process voice match logging
  async processVoiceMatchLog(transcription: string): Promise<any> {
    try {
      const prompt = `
        Extract structured match data from this voice transcription:
        "${transcription}"
        
        Return a JSON object with the following structure:
        {
          "events": [
            {
              "type": "goal" | "assist" | "substitution" | "card",
              "player": "player name",
              "minute": number,
              "description": "description"
            }
          ],
          "score": {
            "home": number,
            "away": number
          },
          "summary": "brief summary of what happened"
        }
        
        If you can't extract specific information, use null values.
      `;

      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant that extracts structured sports data from natural language descriptions. Always return valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        try {
          return JSON.parse(content);
        } catch (parseError) {
          console.error('Failed to parse OpenAI response:', parseError);
          return null;
        }
      }

      return null;
    } catch (error) {
      console.error('OpenAI voice processing error:', error);
      return null;
    }
  }

  // Generate achievement descriptions
  async generateAchievementDescription(achievementType: string, playerStats: any): Promise<string> {
    try {
      const prompt = `
        Create a fun, engaging description for a football achievement of type "${achievementType}".
        Player stats: ${JSON.stringify(playerStats)}
        
        Make it celebratory and personal, mentioning specific stats where relevant.
        Keep it under 50 words and make it feel like a badge of honor.
      `;

      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are creating achievement descriptions for grassroots football players. Make them fun, personal, and celebratory.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 100,
        temperature: 0.8,
      });

      return response.choices[0]?.message?.content || 'Achievement unlocked!';
    } catch (error) {
      console.error('OpenAI achievement description error:', error);
      return 'Achievement unlocked!';
    }
  }

  // Analyze team chemistry
  async analyzeTeamChemistry(teamData: any): Promise<any> {
    try {
      const prompt = `
        Analyze team chemistry based on this data:
        ${JSON.stringify(teamData)}
        
        Return insights about:
        - Player partnerships that work well together
        - Formation effectiveness
        - Areas for improvement
        - Key player roles
        
        Format as JSON with actionable insights.
      `;

      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a football analyst specializing in team chemistry and tactics for grassroots teams.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 400,
        temperature: 0.5,
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        try {
          return JSON.parse(content);
        } catch (parseError) {
          return { insights: content };
        }
      }

      return null;
    } catch (error) {
      console.error('OpenAI team chemistry analysis error:', error);
      return null;
    }
  }
}