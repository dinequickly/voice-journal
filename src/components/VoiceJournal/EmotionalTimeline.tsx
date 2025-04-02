import React from 'react';
import { Card } from "@/components/ui/card";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface EmotionalTimelineProps {
  data: {
    timestamps: string[];
    emotions: {
      joy: number[];
      sadness: number[];
      anger: number[];
      fear: number[];
      surprise: number[];
    };
  };
}

export const EmotionalTimeline: React.FC<EmotionalTimelineProps> = ({ data }) => {
  const chartData = {
    labels: data.timestamps,
    datasets: [
      {
        label: 'Joy',
        data: data.emotions.joy,
        borderColor: 'rgb(255, 205, 86)',
        backgroundColor: 'rgba(255, 205, 86, 0.5)',
        tension: 0.4,
      },
      {
        label: 'Sadness',
        data: data.emotions.sadness,
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        tension: 0.4,
      },
      {
        label: 'Anger',
        data: data.emotions.anger,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.4,
      },
      {
        label: 'Fear',
        data: data.emotions.fear,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.4,
      },
      {
        label: 'Surprise',
        data: data.emotions.surprise,
        borderColor: 'rgb(153, 102, 255)',
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Emotional Journey Timeline',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        title: {
          display: true,
          text: 'Intensity',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Time',
        },
      },
    },
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Your Emotional Journey</h3>
          <div className="text-sm text-gray-500">
            Last 7 days
          </div>
        </div>
        <div className="h-[400px]">
          <Line data={chartData} options={options} />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Key Insights</h4>
            <ul className="text-sm space-y-2">
              <li>• Peak joy moments correlate with social interactions</li>
              <li>• Stress levels decrease during evening reflections</li>
              <li>• Consistent emotional balance throughout the week</li>
            </ul>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Recommendations</h4>
            <ul className="text-sm space-y-2">
              <li>• Schedule more social activities</li>
              <li>• Continue evening reflection practice</li>
              <li>• Consider morning meditation sessions</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
}; 