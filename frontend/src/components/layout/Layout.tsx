import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Plus, User, Package, LogOut, Menu, X, BarChart3 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    ...(user?.isSeller && user?.sellerStatus === 'approved' ? [
      { path: '/dashboard', icon: BarChart3, label: 'Dashboard' },
      { path: '/create-item', icon: Plus, label: 'Sell/Rent' }
    ] : []),
    { path: '/my-items', icon: Package, label: 'My Items' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Simplified Header */}
      <header className="bg-white border-b border-primary-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Simple Logo */}
            <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-dark-900">Fretio</h1>
                {user?.hostel?.university && (
                  <p className="text-sm text-primary-600 font-medium">
                    {user.hostel.university}
                  </p>
                )}
              </div>
            </Link>

            {/* Simple Navigation */}
            <nav className="hidden lg:flex items-center space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActivePath(item.path)
                      ? 'text-white bg-primary-500'
                      : 'text-dark-700 hover:text-primary-700 hover:bg-primary-100'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden xl:block">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Simple User Section */}
            <div className="hidden md:flex items-center space-x-4">
              {/* User Info */}
              <div className="text-right">
                <p className="text-sm font-medium text-dark-900">{user?.hostel?.name}</p>
                <p className="text-xs text-primary-600">Room {user?.roomNumber}</p>
              </div>

              {/* Simple Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden xl:block">Logout</span>
              </button>
            </div>

            {/* Simple Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-dark-600 hover:text-dark-900 hover:bg-primary-100 transition-colors duration-200"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Simple Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-primary-200 bg-white">
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 ${
                    isActivePath(item.path)
                      ? 'text-white bg-primary-500'
                      : 'text-dark-700 hover:text-primary-700 hover:bg-primary-100'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
              
              {/* Mobile User Info */}
              <div className="pt-4 mt-4 border-t border-primary-200">
                <div className="px-4 py-2">
                  <p className="text-sm font-medium text-dark-900">{user?.hostel?.name}</p>
                  <p className="text-xs text-primary-600">Room {user?.roomNumber}</p>
                </div>
                
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center space-x-3 px-4 py-3 w-full text-left rounded-lg text-base font-medium text-white bg-red-500 hover:bg-red-600 transition-colors duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Simple Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout; 