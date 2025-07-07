import React from 'react';
import { X, Home, Activity, Settings, User, LogOut, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: 'social' | 'activities' | 'dashboard' | 'profile' | 'home';
  onViewChange: (view: 'social' | 'activities' | 'dashboard' | 'profile' | 'home') => void;
}

export const SidebarMenu: React.FC<SidebarMenuProps> = ({ 
  isOpen, 
  onClose, 
  currentView, 
  onViewChange 
}) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'social', label: 'Feed Social', icon: Users },
    { id: 'activities', label: 'Actividades', icon: Activity },
  ];

  const userMenuItems = user ? [
    { id: 'home', label: 'Mi Inicio', icon: Home },
    { id: 'dashboard', label: 'Publicar', icon: Settings },
  ] : [];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-r-4 border-black ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b-4 border-black bg-gradient-to-r from-teal-500 to-emerald-600">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-black">
                <span className="text-xl font-bold text-teal-600">MC</span>
              </div>
              <div className="text-white">
                <h2 className="text-lg font-bold">Mi Blog Social</h2>
                <p className="text-sm text-teal-100">Menú Principal</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-teal-200 transition-colors p-2 rounded-full hover:bg-white/20 border-2 border-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* User Info */}
          {user && (
            <div className="p-6 border-b-2 border-gray-200 bg-teal-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center border-2 border-black">
                  <User className="text-white" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Menu */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {/* Public menu items */}
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 border-2 border-black ${
                      isActive
                        ? 'bg-teal-500 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-teal-50 hover:text-teal-600 bg-white'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}

              {/* User-specific menu items */}
              {user && (
                <>
                  <div className="border-t-2 border-gray-200 my-4"></div>
                  {userMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => onViewChange(item.id as any)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 border-2 border-black ${
                          isActive
                            ? 'bg-emerald-500 text-white shadow-lg'
                            : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 bg-white'
                        }`}
                      >
                        <Icon size={20} />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          </nav>

          {/* Footer */}
          {user && (
            <div className="p-4 border-t-2 border-gray-200">
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors border-2 border-black bg-white"
              >
                <LogOut size={20} />
                <span className="font-medium">Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};