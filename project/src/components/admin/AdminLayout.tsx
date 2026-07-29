import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  LogOut,
  ShoppingBag,
  Home,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Code2 } from 'lucide-react';

const navItems = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package, end: false },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart, end: false },
];

export default function AdminLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-stone-900 text-stone-300 fixed inset-y-0 left-0 z-30">
        <div className="flex items-center gap-2 px-6 h-16 border-b border-stone-800">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <ShoppingBag className="w-4 h-4 text-stone-900" />
          </div>
          <span className="font-bold text-white tracking-tight">MERCADO</span>
          <span className="text-xs text-stone-500 ml-auto">Admin</span>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-stone-800 text-white'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800/50'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-stone-800 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-400 hover:text-white hover:bg-stone-800/50 transition-colors"
          >
            <Home className="w-5 h-5" />
            View Store
          </Link>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-400 hover:text-white hover:bg-stone-800/50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
          <a
            href="https://arshadsheikh.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 pt-3 text-[11px] text-stone-600 hover:text-amber-500 transition-colors duration-300 group"
          >
            <Code2 className="w-3 h-3 group-hover:text-amber-500 transition-colors duration-300" />
            <span>Developed by <span className="font-semibold">Arshad Sheikh</span></span>
          </a>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-64 bg-stone-900 text-stone-300 z-50 lg:hidden flex flex-col">
            <div className="flex items-center justify-between px-6 h-16 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-stone-900" />
                </div>
                <span className="font-bold text-white">Admin</span>
              </div>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>
            <nav className="flex-1 py-4 px-3 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-stone-800 text-white'
                        : 'text-stone-400 hover:text-white hover:bg-stone-800/50'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="p-3 border-t border-stone-800 space-y-1">
              <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-400 hover:text-white hover:bg-stone-800/50">
                <Home className="w-5 h-5" />
                View Store
              </Link>
              <button onClick={handleSignOut} className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-400 hover:text-white hover:bg-stone-800/50">
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
              <a
                href="https://arshadsheikh.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 pt-3 text-[11px] text-stone-600 hover:text-amber-500 transition-colors duration-300 group"
              >
                <Code2 className="w-3 h-3 group-hover:text-amber-500 transition-colors duration-300" />
                <span>Developed by <span className="font-semibold">Arshad Sheikh</span></span>
              </a>
            </div>
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-20 bg-stone-900 text-white px-4 h-14 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-semibold">Admin Dashboard</span>
          <Link to="/">
            <Home className="w-5 h-5" />
          </Link>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mb-6 hidden lg:block">
            <p className="text-sm text-stone-500">
              Signed in as <span className="font-medium text-stone-700">{profile?.full_name || 'Admin'}</span>
            </p>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
