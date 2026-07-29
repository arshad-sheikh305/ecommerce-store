import { Link } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui';

export default function AccessDeniedPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-4xl font-bold text-stone-900 tracking-tight">403</h1>
        <h2 className="text-xl font-semibold text-stone-700 mt-2">Access Denied</h2>
        <p className="mt-3 text-stone-500 leading-relaxed">
          You don't have permission to access this page. This area is restricted to
          administrators only. If you believe this is an error, please contact support.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button size="lg">
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          <Link to="/shop">
            <Button variant="outline" size="lg">
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
