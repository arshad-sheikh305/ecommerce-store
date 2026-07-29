import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, LogOut, Shield, Package } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button, Badge } from '@/components/ui';
import { formatDate } from '@/lib/format';

export default function AccountPage() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-stone-900 tracking-tight mb-8">My Account</h1>

      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center">
            <User className="w-8 h-8 text-stone-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-stone-900">
                {profile?.full_name || 'Customer'}
              </h2>
              {profile?.role === 'admin' && (
                <Badge color="stone">
                  <Shield className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
              )}
            </div>
            <p className="text-sm text-stone-500">Member since {formatDate(profile?.created_at ?? user.created_at)}</p>
          </div>
        </div>

        <div className="space-y-4 border-t border-stone-200 pt-6">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-stone-400" />
            <div>
              <p className="text-xs text-stone-500">Email</p>
              <p className="text-sm font-medium text-stone-900">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-stone-400" />
            <div>
              <p className="text-xs text-stone-500">Full Name</p>
              <p className="text-sm font-medium text-stone-900">{profile?.full_name || 'Not set'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-stone-400" />
            <div>
              <p className="text-xs text-stone-500">Account Type</p>
              <p className="text-sm font-medium text-stone-900 capitalize">{profile?.role ?? 'customer'}</p>
            </div>
          </div>
        </div>

        {profile?.role === 'admin' && (
          <div className="mt-6 p-4 bg-stone-50 rounded-xl border border-stone-200">
            <p className="text-sm text-stone-600">
              You have admin access. Visit the dashboard to manage products and orders.
            </p>
            <a href="/admin" className="mt-3 inline-block">
              <Button variant="outline" size="sm">Go to Dashboard</Button>
            </a>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-stone-200">
          <Button variant="outline" onClick={handleSignOut} disabled={signingOut}>
            <LogOut className="w-4 h-4" />
            {signingOut ? 'Signing out...' : 'Sign Out'}
          </Button>
        </div>
      </div>
    </div>
  );
}
