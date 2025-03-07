'use client'
import Link from 'next/link';
import { FaWallet, FaUser } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  username: string;
  email: string;
  id: string;
}

const Navbar = () => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for user data in localStorage when component mounts
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 shadow-lg backdrop-blur-sm relative z-[100]">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <Link href="/" className="text-white text-xl md:text-2xl font-bold flex items-center gap-2 hover:scale-105 transition-transform">
            <FaWallet className="text-yellow-300" />
            <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              ExpenseTracker
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative group">
                <div className="text-white hover:text-blue-200 transition-all cursor-pointer py-2 px-4 rounded-lg hover:bg-white/10 flex items-center gap-2">
                  <FaUser />
                  <span>{user.username}</span>
                  <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl py-2 invisible group-hover:visible transition-all opacity-0 group-hover:opacity-100">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm text-gray-500">Signed in as</p>
                    <p className="text-sm font-medium text-gray-900">{user.email}</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-white hover:text-blue-200 transition-all py-2 px-4 rounded-lg hover:bg-white/10"
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="bg-white text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-50 transition-all"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-lg md:hidden z-[101]">
            <div className="p-4 space-y-3">
              {user ? (
                <>
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm text-gray-500">Signed in as</p>
                    <p className="text-sm font-medium text-gray-900">{user.email}</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors rounded-lg"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-lg"
                  >
                    Login
                  </Link>
                  <Link 
                    href="/register" 
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-lg"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
