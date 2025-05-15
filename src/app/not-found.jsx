import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const NotFound = () => {
  return (
    <div className="flex items-center justify-center bg-gray-100 px-4" style={{minHeight:"80vh"}}>
      <div className="text-center">
        <h1 className="text-7xl font-bold text-indigo-600">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-gray-800">Page Not Found</h2>
        <p className="mt-2 text-gray-600">
          Sorry, the page you’re looking for doesn’t exist.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
        >
          <ArrowLeft size={16} /> Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
