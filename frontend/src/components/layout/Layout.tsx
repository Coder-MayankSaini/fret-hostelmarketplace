import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Plus, User, Package, LogOut, Menu, X, BarChart3 } from 'lucide-react';
import { applyUniversityTheme, detectUniversityTheme, getCurrentTheme } from '../../utils/theme';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Apply university theme on mount and user change
  useEffect(() => {
    if (user?.hostel?.university) {
      const themeKey = detectUniversityTheme(user.hostel.university);
      applyUniversityTheme(themeKey);
    } else {
      const currentTheme = getCurrentTheme();
      applyUniversityTheme(currentTheme);
    }
  }, [user]);

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
    <div className="min-h-screen bg-secondary-50">
      <header className="bg-white shadow-soft border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-university-600 rounded-xl flex items-center justify-center shadow-university">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-display font-bold text-secondary-900">Fretio</span>
                {user?.hostel?.university && (
                  <p className="text-xs text-university-600 font-medium">{user.hostel.university}</p>
                )}
              </div>
            </Link>

            <nav className="hidden lg:flex items-center space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActivePath(item.path)
                      ? 'text-university-700 bg-university-50 shadow-card'
                      : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden xl:block">{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-secondary-900">{user?.hostel?.name}</p>
                <p className="text-xs text-secondary-500">Room {user?.roomNumber}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden xl:block">Logout</span>
              </button>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 transition-all duration-200"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-secondary-200 bg-white shadow-soft">
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActivePath(item.path)
                      ? 'text-university-700 bg-university-50 shadow-card'
                      : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
              
              {/* Mobile User Info */}
              <div className="pt-4 mt-4 border-t border-secondary-200">
                <div className="px-4 py-2">
                  <p className="text-sm font-medium text-secondary-900">{user?.hostel?.name}</p>
                  <p className="text-xs text-secondary-500">Room {user?.roomNumber}</p>
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center space-x-3 px-4 py-3 w-full text-left rounded-lg text-base font-medium text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 transition-all duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout; 