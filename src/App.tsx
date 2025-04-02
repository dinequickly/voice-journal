import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import VoiceJournalPage from '@/pages/VoiceJournal';
import { VoiceTest } from './components/VoiceTest';
import './App.css';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Router>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    <Link to="/" className="text-xl font-bold text-gray-900">Voice Journal</Link>
                  </div>
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    <Link
                      to="/"
                      className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      Home
                    </Link>
                    <Link
                      to="/voice-journal"
                      className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      Voice Journal
                    </Link>
                    <Link
                      to="/test"
                      className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      Test
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/voice-journal" element={<VoiceJournalPage />} />
              <Route path="/" element={
                <div className="px-4 py-6 sm:px-0">
                  <h1 className="text-4xl font-bold text-center mb-8">
                    Welcome to Voice Journal
                  </h1>
                  <p className="text-xl text-center text-gray-600 mb-8">
                    Your emotionally intelligent voice journal
                  </p>
                  <div className="text-center">
                    <Link
                      to="/voice-journal"
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Start Journaling
                    </Link>
                  </div>
                </div>
              } />
              <Route path="/test" element={<VoiceTest />} />
              <Route path="*" element={
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">404</h1>
                  <p className="text-xl text-gray-600">Page not found</p>
                  <Link
                    to="/"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Go Home
                  </Link>
                </div>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
