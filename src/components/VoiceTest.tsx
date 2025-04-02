import React, { useState } from 'react';
import { voiceAnalysisService } from '../services/voiceAnalysis';

export const VoiceTest: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStartRecording = async () => {
    try {
      await voiceAnalysisService.startRecording();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      setError('Failed to start recording: ' + (err as Error).message);
    }
  };

  const handleStopRecording = async () => {
    try {
      const audioBlob = await voiceAnalysisService.stopRecording();
      setIsRecording(false);
      
      // Analyze the recording
      const emotionAnalysis = await voiceAnalysisService.analyzeEmotion(audioBlob);
      const speakerMoods = await voiceAnalysisService.detectSpeakerMood(audioBlob);
      const prompts = await voiceAnalysisService.generateReflectionPrompts(emotionAnalysis);
      
      // Save to storage
      const audioUrl = await voiceAnalysisService.uploadToStorage(audioBlob);
      
      // Save to journal
      await voiceAnalysisService.saveToJournal(
        emotionAnalysis,
        audioUrl,
        'Test transcription' // In real implementation, this would come from AssemblyAI
      );

      setAnalysis({
        emotions: emotionAnalysis,
        moods: speakerMoods,
        prompts
      });
    } catch (err) {
      setError('Failed to process recording: ' + (err as Error).message);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Voice Analysis Test</h2>
      
      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={handleStartRecording}
            disabled={isRecording}
            className={`px-4 py-2 rounded ${
              isRecording
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
          >
            Start Recording
          </button>
          
          <button
            onClick={handleStopRecording}
            disabled={!isRecording}
            className={`px-4 py-2 rounded ${
              !isRecording
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-500 hover:bg-red-600'
            } text-white`}
          >
            Stop Recording
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {analysis && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-bold mb-2">Emotional Analysis</h3>
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(analysis.emotions, null, 2)}
              </pre>
            </div>

            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-bold mb-2">Speaker Moods</h3>
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(analysis.moods, null, 2)}
              </pre>
            </div>

            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-bold mb-2">Reflection Prompts</h3>
              <ul className="list-disc pl-5">
                {analysis.prompts.map((prompt: string, index: number) => (
                  <li key={index}>{prompt}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 