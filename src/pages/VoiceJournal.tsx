import React from 'react';
import { VoiceRecorder } from '@/components/VoiceJournal/VoiceRecorder';
import { EmotionalTimeline } from '@/components/VoiceJournal/EmotionalTimeline';

const mockTimelineData = {
  timestamps: [
    '2024-04-01',
    '2024-04-02',
    '2024-04-03',
    '2024-04-04',
    '2024-04-05',
    '2024-04-06',
    '2024-04-07',
  ],
  emotions: {
    joy: [0.8, 0.6, 0.7, 0.9, 0.7, 0.8, 0.9],
    sadness: [0.2, 0.3, 0.2, 0.1, 0.2, 0.1, 0.1],
    anger: [0.1, 0.2, 0.1, 0.0, 0.1, 0.1, 0.0],
    fear: [0.1, 0.2, 0.1, 0.1, 0.1, 0.0, 0.0],
    surprise: [0.3, 0.2, 0.4, 0.3, 0.2, 0.3, 0.2],
  },
};

export default function VoiceJournalPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Your Emotional Voice Journal</h1>
        <p className="text-xl text-gray-600">
          Understand yourself better through voice reflection
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <VoiceRecorder />
        </div>
        <div>
          <EmotionalTimeline data={mockTimelineData} />
        </div>
      </div>

      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Your Voice Journal Insights</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-medium mb-2">Emotional Patterns</h3>
            <p className="text-gray-600">
              Your emotional expression shows strong consistency with peaks of joy during social interactions.
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-medium mb-2">Communication Style</h3>
            <p className="text-gray-600">
              Your tone is predominantly confident and engaging, with a good balance of formal and informal elements.
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-medium mb-2">Growth Areas</h3>
            <p className="text-gray-600">
              Consider exploring deeper emotional expression during reflective moments.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-500">
          Your voice journal is private and secure. All analysis is performed locally.
        </p>
      </div>
    </div>
  );
} 