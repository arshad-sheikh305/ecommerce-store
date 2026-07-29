import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, Search, User, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export default function StoreHeader() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setMenuOpen(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-stone-900 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-stone-900 hidden sm:block">
              MERCADO
            </span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-stone-100 rounded-full border border-transparent focus:border-stone-300 focus:bg-white focus:outline-none transition-colors"
              />
            </div>
          </form>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/shop"
              className="px-3 py-2 text-sm font-medium text-stone-700 hover:text-stone-900 transition-colors"
            >
              Shop
            </Link>
            <Link
              to="/categories"
              className="px-3 py-2 text-sm font-medium text-stone-700 hover:text-stone-900 transition-colors"
            >
              Categories
            </Link>
            {user && (
              <Link
                to="/orders"
                className="px-3 py-2 text-sm font-medium text-stone-700 hover:text-stone-900 transition-colors"
              >
                My Orders
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-stone-700 hover:text-stone-900 transition-colors"
                title="Admin Dashboard"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden lg:inline">Admin</span>
              </Link>
            )}

            <Link
              to="/cart"
              className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-stone-100 transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-stone-700" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-stone-900 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/account"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-stone-700 hover:text-stone-900 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="max-w-24 truncate">{profile?.full_name || 'Account'}</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-stone-100 transition-colors text-stone-700"
                  title="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-stone-900 rounded-full hover:bg-stone-800 transition-colors"
              >
                <User className="w-4 h-4" />
                Sign In
              </Link>
            )}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-stone-100 transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-stone-200 py-4 space-y-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-stone-100 rounded-lg focus:outline-none"
                />
              </div>
            </form>
            <Link to="/shop" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-stone-700">
              Shop
            </Link>
            <Link to="/categories" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-stone-700">
              Categories
            </Link>
            {user && (
              <Link to="/orders" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-stone-700">
                My Orders
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-stone-700">
                Admin Dashboard
              </Link>
            )}
            {user ? (
              <>
                <Link to="/account" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-stone-700">
                  My Account
                </Link>
                <button onClick={handleSignOut} className="block w-full text-left px-3 py-2 text-sm font-medium text-stone-700">
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-stone-700">
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
