import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import SummaryDashboard from './components/SummaryDashboard';
import LoadingAnalysis from './components/LoadingAnalysis';
import ErrorMessage from './components/ErrorMessage';
import Footer from './components/Footer';
import { analyzeWebsite } from './services/api';

export default function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [targetUrl, setTargetUrl] = useState('');

  const handleAnalyze = async (url) => {
    setIsLoading(true);
    setError(null);
    setTargetUrl(url);

    try {
      const data = await analyzeWebsite(url);
      setAnalysisData(data);
    } catch (err) {
      setError(err.message || 'Failed to analyze website. Please check the URL and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysisData(null);
    setError(null);
    setTargetUrl('');
  };

  const handleRetry = () => {
    if (targetUrl) {
      handleAnalyze(targetUrl);
    } else {
      handleReset();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation Bar */}
      <Navbar
        onReset={handleReset}
        hasResults={Boolean(analysisData || error || isLoading)}
        isAnalyzing={isLoading}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center">
        {isLoading ? (
          <LoadingAnalysis targetUrl={targetUrl} />
        ) : error ? (
          <ErrorMessage
            error={error}
            onRetry={handleRetry}
            onReset={handleReset}
          />
        ) : analysisData ? (
          <SummaryDashboard
            analysisData={analysisData}
            onReset={handleReset}
          />
        ) : (
          <HomePage
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
