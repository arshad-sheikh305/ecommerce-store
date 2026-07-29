import { Link } from 'react-router-dom';
import { ShoppingBag, Twitter, Instagram, Facebook } from 'lucide-react';
import DeveloperSignature from './DeveloperSignature';

export default function StoreFooter() {
  return (
    <footer className="bg-stone-900 text-stone-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-stone-900" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">MERCADO</span>
            </Link>
            <p className="text-sm text-stone-400 leading-relaxed">
              Thoughtfully designed products for everyday life. Quality you can feel, built to last.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shop" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/categories" className="hover:text-white transition-colors">Categories</Link></li>
              <li><Link to="/shop?sort=newest" className="hover:text-white transition-colors">New Arrivals</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Account</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/account" className="hover:text-white transition-colors">My Account</Link></li>
              <li><Link to="/orders" className="hover:text-white transition-colors">My Orders</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Shopping Cart</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Connect</h3>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-stone-800 flex items-center justify-center hover:bg-stone-700 transition-colors" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-stone-800 flex items-center justify-center hover:bg-stone-700 transition-colors" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-stone-800 flex items-center justify-center hover:bg-stone-700 transition-colors" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-10 pt-6 flex flex-col items-center gap-4">
          <DeveloperSignature />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
            <p className="text-xs text-stone-500">
              (c) {new Date().getFullYear()} Mercado. All rights reserved.
            </p>
            <p className="text-xs text-stone-500">
              Free shipping over $75 - 30-day returns
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
