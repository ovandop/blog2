import React, { useState, useEffect } from 'react';
import { User, LogOut, Menu, X, Settings, Home, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SidebarMenu } from './SidebarMenu';

interface HeaderProps {
  onAuthClick: () => void;
  currentView: 'social' | 'activities' | 'dashboard' | 'profile' | 'home';
  onViewChange: (view: 'social' | 'activities' | 'dashboard' | 'profile' | 'home') => void;
}

export const Header: React.FC<HeaderProps> = ({ onAuthClick, currentView, onViewChange }) => {
  const { user, logout } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <>
      <header className={`bg-white shadow-lg fixed top-0 left-0 right-0 z-40 border-b-4 border-black transition-transform duration-300 ${
        isVisible ? 'transform translate-y-0' : 'transform -translate-y-full'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            {/* Left side with menu button */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-lg border-2 border-black bg-teal-500 text-white hover:bg-teal-600 transition-colors"
              >
                <Menu size={20} />
              </button>
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Por María Camila Guerrero Roqueme</p>
                  Mi Blog Social
            </div>

            {/* Right side with user info */}
            <div className="flex items-center gap-2 sm:gap-4">
              {user ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-700">¡Bienvenido/a!</p>
                    <p className="text-lg font-bold text-teal-600">
                      {user.name}
                    </p>
                  </div>
                  <div className="sm:hidden">
                    <p className="text-sm font-bold text-teal-600">
                      {user.name.split(' ')[0]}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => onViewChange('home')}
                      className={`p-1.5 sm:p-2 rounded-full border-2 border-black transition-colors ${
                        currentView === 'home' 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                      }`}
                      title="Inicio"
                    >
                      <Home size={16} />
                    </button>
                    <button
                      onClick={() => onViewChange('home')}
                      className={`p-1.5 sm:p-2 rounded-full border-2 border-black transition-colors ${
                        currentView === 'home' 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                      }`}
                      title="Inicio"
                    >
                      <Home size={16} />
                    </button>
                    <button
                      onClick={() => onViewChange('dashboard')}
                      className={`p-1.5 sm:p-2 rounded-full border-2 border-black transition-colors ${
                        currentView === 'dashboard' 
                          ? 'bg-teal-500 text-white' 
                          : 'bg-teal-100 text-teal-600 hover:bg-teal-200'
                      }`}
                      title="Dashboard"
                    >
                      <Settings size={16} />
                    </button>
                    <div className="bg-teal-100 p-1.5 sm:p-2 rounded-full border-2 border-black">
                      <User className="text-teal-600" size={16} />
                    </div>
                    <button
                      onClick={logout}
                      className="text-gray-600 hover:text-red-600 transition-colors p-1.5 sm:p-2 rounded-full hover:bg-red-50 border-2 border-black"
                      title="Cerrar sesión"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={onAuthClick}
                  className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-full font-semibold hover:from-teal-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 flex items-center gap-1 sm:gap-2 border-2 border-black text-sm sm:text-base"
                >
                  <User size={16} />
                  <span className="hidden sm:inline">Iniciar Sesión</span>
                  <span className="sm:hidden">Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Menu */}
      <SidebarMenu 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentView={currentView}
        onViewChange={(view) => {
          onViewChange(view);
          setIsSidebarOpen(false);
        }}
      />
    </>
  );
};