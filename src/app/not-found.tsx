import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-300 dark:text-slate-700">404</h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400">Page not found</p>
        <Link href="/dashboard" className="mt-6 inline-block text-blue-600 hover:underline">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
