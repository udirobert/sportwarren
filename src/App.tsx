import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import { SmartNavigation } from "./components/adaptive/SmartNavigation";
import { SmartOnboarding } from "./components/onboarding/SmartOnboarding";
import { AdaptiveDashboard } from "./components/adaptive/AdaptiveDashboard";
import { MatchTracker } from "./pages/MatchTracker";
import { PlayerStats } from "./pages/PlayerStats";
import { Squad } from "./pages/Squad";
import { Community } from "./pages/Community";
import { Achievements } from "./pages/Achievements";
// import { SquadDAO } from './components/algorand/SquadDAO';
import { MatchVerification } from "./components/algorand/MatchVerification";
import { GlobalChallenges } from "./components/algorand/GlobalChallenges";
import { PlayerReputation } from "./components/algorand/PlayerReputation";
// import { AlgorandWallet } from './components/algorand/AlgorandWallet';
import { apolloClient } from "./lib/apollo-client";
import { useSocket } from "./hooks/useSocket";
import { useUserPreferences } from "./hooks/useUserPreferences";

function AppContent() {
  const { preferences, isLoading } = useUserPreferences();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Initialize socket connection
  useSocket();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 bg-white rounded-lg"></div>
          </div>
          <p className="text-gray-600">Loading SportWarren...</p>
        </div>
      </div>
    );
  }

  // Show onboarding for new users
  if (!preferences.usagePatterns.completedOnboarding || showOnboarding) {
    return <SmartOnboarding onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50">
      <SmartNavigation />
      <main className="pb-20 md:pb-0">
        <Routes>
          <Route path="/" element={<AdaptiveDashboard />} />
          <Route path="/match" element={<MatchTracker />} />
          <Route path="/stats" element={<PlayerStats />} />
          <Route path="/squad" element={<Squad />} />
          <Route path="/community" element={<Community />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/dao" element={<SquadDAO />} />
          <Route path="/verification" element={<MatchVerification />} />
          <Route path="/challenges" element={<GlobalChallenges />} />
          <Route path="/reputation" element={<PlayerReputation />} />
          <Route path="/wallet" element={<AlgorandWallet />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <Router>
        <AppContent />
      </Router>
    </ApolloProvider>
  );
}

export default App;
