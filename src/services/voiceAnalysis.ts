import { createClient } from '@supabase/supabase-js';

interface EmotionalAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  emotions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
  };
  topics: string[];
  tone: {
    formal: number;
    informal: number;
    confident: number;
    tentative: number;
  };
}

interface SpeakerMood {
  speakerId: string;
  mood: string;
  confidence: number;
  timestamp: number;
}

class VoiceAnalysisService {
  private audioContext: AudioContext;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording = false;
  private supabase;
  private assemblyAIHeaders: HeadersInit;

  constructor() {
    this.audioContext = new AudioContext();
    
    // Initialize AssemblyAI headers
    this.assemblyAIHeaders = {
      'Authorization': process.env.VITE_ASSEMBLYAI_API_KEY || '',
      'Content-Type': 'application/json'
    };
    
    // Initialize Supabase client
    this.supabase = createClient(
      process.env.VITE_SUPABASE_URL || '',
      process.env.VITE_SUPABASE_ANON_KEY || ''
    );
  }

  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.isRecording = true;

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        this.recordedChunks = [];
        this.isRecording = false;
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  private async uploadToAssemblyAI(audioBlob: Blob): Promise<string> {
    // Get upload URL from AssemblyAI
    const response = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: this.assemblyAIHeaders
    });

    const { upload_url } = await response.json();

    // Upload the audio file
    await fetch(upload_url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream'
      },
      body: audioBlob
    });

    return upload_url;
  }

  async uploadToStorage(audioBlob: Blob): Promise<string> {
    const fileName = `voice-journal/${Date.now()}.webm`;
    const { data, error } = await this.supabase.storage
      .from('voice-recordings')
      .upload(fileName, audioBlob);

    if (error) throw error;
    return data.path;
  }

  async analyzeEmotion(audioBlob: Blob): Promise<EmotionalAnalysis> {
    try {
      // Upload audio to AssemblyAI
      const audioUrl = await this.uploadToAssemblyAI(audioBlob);
      
      // Create transcription request
      const response = await fetch('https://api.assemblyai.com/v2/transcript', {
        method: 'POST',
        headers: this.assemblyAIHeaders,
        body: JSON.stringify({
          audio_url: audioUrl,
          sentiment_analysis: true,
          entity_detection: true,
          auto_chapters: true,
          iab_categories: true
        })
      });

      const { id } = await response.json();

      // Poll for results
      const result = await this.pollForCompletion(id);
      
      // Process the results
      const emotions = this.processEmotions(result.sentiment_analysis_results);
      const topics = this.processTopics(result.iab_categories_result);
      const tone = this.processTone(result.sentiment_analysis_results);

      return {
        sentiment: this.getOverallSentiment(result.sentiment_analysis_results),
        emotions,
        topics,
        tone
      };
    } catch (error) {
      console.error('Error analyzing emotion:', error);
      throw error;
    }
  }

  private async pollForCompletion(transcriptId: string): Promise<any> {
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;

    while (attempts < maxAttempts) {
      const response = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: this.assemblyAIHeaders
      });

      const result = await response.json();

      if (result.status === 'completed') {
        return result;
      } else if (result.status === 'error') {
        throw new Error(`Transcription failed: ${result.error}`);
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    }

    throw new Error('Transcription timed out');
  }

  private processEmotions(sentimentResults: any[]): EmotionalAnalysis['emotions'] {
    const emotions = {
      joy: 0,
      sadness: 0,
      anger: 0,
      fear: 0,
      surprise: 0
    };

    if (!sentimentResults?.length) return emotions;

    // Process sentiment results to extract emotional intensities
    sentimentResults.forEach(result => {
      switch (result.sentiment) {
        case 'POSITIVE':
          emotions.joy += 0.2;
          break;
        case 'NEGATIVE':
          emotions.sadness += 0.1;
          emotions.anger += 0.1;
          break;
        case 'NEUTRAL':
          emotions.surprise += 0.1;
          break;
      }
    });

    // Normalize values between 0 and 1
    Object.keys(emotions).forEach(key => {
      emotions[key as keyof typeof emotions] = Math.min(
        emotions[key as keyof typeof emotions],
        1
      );
    });

    return emotions;
  }

  private processTopics(iabCategories: any): string[] {
    if (!iabCategories?.results) return [];
    return iabCategories.results
      .slice(0, 5)
      .map((category: any) => category.label);
  }

  private processTone(sentimentResults: any[]): EmotionalAnalysis['tone'] {
    const tone = {
      formal: 0.5,
      informal: 0.5,
      confident: 0.5,
      tentative: 0.5
    };

    if (!sentimentResults?.length) return tone;

    // Calculate confidence based on sentiment consistency
    const sentimentStrength = sentimentResults.reduce((acc, result) => {
      return acc + Math.abs(result.confidence);
    }, 0) / sentimentResults.length;

    tone.confident = sentimentStrength;
    tone.tentative = 1 - sentimentStrength;

    return tone;
  }

  private getOverallSentiment(sentimentResults: any[]): 'positive' | 'negative' | 'neutral' {
    if (!sentimentResults?.length) return 'neutral';

    const sentimentCounts = sentimentResults.reduce((acc: any, result) => {
      acc[result.sentiment] = (acc[result.sentiment] || 0) + 1;
      return acc;
    }, {});

    const maxSentiment = Object.entries(sentimentCounts).reduce((a, b) => 
      (b[1] > a[1] ? b : a)
    )[0];

    switch (maxSentiment) {
      case 'POSITIVE':
        return 'positive';
      case 'NEGATIVE':
        return 'negative';
      default:
        return 'neutral';
    }
  }

  async detectSpeakerMood(audioBlob: Blob): Promise<SpeakerMood[]> {
    try {
      const audioUrl = await this.uploadToAssemblyAI(audioBlob);
      
      const response = await fetch('https://api.assemblyai.com/v2/transcript', {
        method: 'POST',
        headers: this.assemblyAIHeaders,
        body: JSON.stringify({
          audio_url: audioUrl,
          speaker_labels: true,
          sentiment_analysis: true
        })
      });

      const { id } = await response.json();
      const result = await this.pollForCompletion(id);
      
      return this.processSpeakerMoods(result);
    } catch (error) {
      console.error('Error detecting speaker mood:', error);
      throw error;
    }
  }

  private processSpeakerMoods(result: any): SpeakerMood[] {
    if (!result.utterances) return [];

    return result.utterances.map((utterance: any) => ({
      speakerId: utterance.speaker,
      mood: this.getMoodFromSentiment(utterance.sentiment),
      confidence: utterance.confidence,
      timestamp: utterance.start
    }));
  }

  private getMoodFromSentiment(sentiment: string): string {
    switch (sentiment) {
      case 'POSITIVE':
        return 'enthusiastic';
      case 'NEGATIVE':
        return 'concerned';
      default:
        return 'neutral';
    }
  }

  async generateReflectionPrompts(analysis: EmotionalAnalysis): Promise<string[]> {
    const prompts = [];
    
    if (analysis.emotions.joy > 0.7) {
      prompts.push('What specific moments brought you the most joy during this conversation?');
    }
    
    if (analysis.emotions.sadness > 0.3) {
      prompts.push('What aspects of the discussion felt challenging or difficult?');
    }

    if (analysis.tone.confident > 0.7) {
      prompts.push('What gave you confidence during this interaction?');
    }

    return prompts;
  }

  async saveToJournal(analysis: EmotionalAnalysis, audioUrl: string, transcription: string): Promise<void> {
    const { error } = await this.supabase
      .from('journal_entries')
      .insert([
        {
          timestamp: new Date().toISOString(),
          analysis,
          audio_url: audioUrl,
          transcription,
          user_id: (await this.supabase.auth.getUser()).data.user?.id
        }
      ]);

    if (error) throw error;
  }
}

export const voiceAnalysisService = new VoiceAnalysisService(); 