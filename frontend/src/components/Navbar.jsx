import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              {/* Logo */}
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                GR
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900">Get Referred</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
