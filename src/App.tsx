import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { SocialFeed } from './components/SocialFeed';
import { Dashboard } from './components/Dashboard';
import { ActivityView } from './components/ActivityView';
import { UserProfile } from './components/UserProfile';
import { useAuth } from './context/AuthContext';
import { postsAPI, activitiesAPI, siteSettingsAPI } from './services/api';

function AppContent() {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'social' | 'activities' | 'dashboard' | 'profile' | 'home'>('social');
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const handleDataUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleViewChange = (view: 'social' | 'activities' | 'dashboard' | 'profile' | 'home') => {
    setCurrentView(view);
    setSelectedUserId(null);
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    setCurrentView('profile');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onDataUpdate={handleDataUpdate} />;
      case 'activities':
        return <ActivityView key={refreshKey} />;
      case 'profile':
        return (
          <UserProfile 
            selectedUserId={selectedUserId} 
            onBack={() => setCurrentView('social')} 
          />
        );
      case 'home':
        return user ? (
          <div className="min-h-screen pt-32 pb-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-8">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 mb-6 animate-fade-in">
                  Bienvenido, {user.name}
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                  Tu espacio personal donde puedes gestionar tu contenido y conectar con la comunidad.
                </p>
              </div>
              
              <div className="flex justify-center">
                <div className="bg-white/80 backdrop-blur-sm rounded-full p-3 sm:p-4 shadow-lg border-2 border-black">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full flex items-center justify-center border-2 border-black">
                    <span className="text-2xl sm:text-4xl font-bold text-white">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <SocialFeed key={refreshKey} onUserSelect={handleUserSelect} />
        );
      default:
        return <SocialFeed key={refreshKey} onUserSelect={handleUserSelect} />;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5DC' }}>
      <Header 
        onAuthClick={() => setIsAuthModalOpen(true)} 
        currentView={currentView}
        onViewChange={handleViewChange}
      />
      
      {renderContent()}
      
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;