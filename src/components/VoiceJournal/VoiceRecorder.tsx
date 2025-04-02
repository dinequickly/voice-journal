import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { voiceAnalysisService } from '@/services/voiceAnalysis';

export const VoiceRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      await voiceAnalysisService.startRecording();
      setIsRecording(true);
      setRecordingTime(0);
      setAnalysis(null);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      setIsAnalyzing(true);
      const audioBlob = await voiceAnalysisService.stopRecording();
      const emotionalAnalysis = await voiceAnalysisService.analyzeEmotion(audioBlob);
      const speakerMood = await voiceAnalysisService.detectSpeakerMood(audioBlob);
      const reflectionPrompts = await voiceAnalysisService.generateReflectionPrompts(emotionalAnalysis);
      
      setAnalysis({
        emotional: emotionalAnalysis,
        speaker: speakerMood,
        prompts: reflectionPrompts
      });
    } catch (error) {
      console.error('Failed to stop recording:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Voice Journal</h2>
          <p className="text-gray-600">Record your thoughts and feelings</p>
        </div>

        <div className="flex justify-center space-x-4">
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            variant={isRecording ? "destructive" : "default"}
            disabled={isAnalyzing}
          >
            {isRecording ? "Stop Recording" : "Start Recording"}
          </Button>
        </div>

        {isRecording && (
          <div className="text-center">
            <div className="text-xl font-semibold">{formatTime(recordingTime)}</div>
            <Progress value={recordingTime % 60 * (100/60)} className="mt-2" />
          </div>
        )}

        {isAnalyzing && (
          <div className="text-center">
            <p className="text-lg">Analyzing your voice...</p>
            <Progress value={undefined} className="mt-2" />
          </div>
        )}

        {analysis && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Emotional Analysis</h3>
                <div className="space-y-2">
                  {Object.entries(analysis.emotional.emotions).map(([emotion, value]) => (
                    <div key={emotion} className="flex justify-between items-center">
                      <span className="capitalize">{emotion}</span>
                      <Progress value={Number(value) * 100} className="w-32" />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Tone Analysis</h3>
                <div className="space-y-2">
                  {Object.entries(analysis.emotional.tone).map(([tone, value]) => (
                    <div key={tone} className="flex justify-between items-center">
                      <span className="capitalize">{tone}</span>
                      <Progress value={Number(value) * 100} className="w-32" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Reflection Prompts</h3>
              <ul className="list-disc list-inside space-y-2">
                {analysis.prompts.map((prompt: string, index: number) => (
                  <li key={index}>{prompt}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Topics Detected</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.emotional.topics.map((topic: string) => (
                  <span
                    key={topic}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}; 