import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-gray-900 text-white">
      <div className="max-w-2xl w-full p-8 border border-gray-800 bg-gray-800 rounded-xl shadow-xl space-y-6">
        <h1 className="text-4xl font-extrabold text-brand-500 tracking-tight">Welcome to ClassFlow</h1>
        <p className="text-lg text-gray-300">
          Responsive timetable and attendance management system tailored for Kenyan institutions.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          {session ? (
            <Link 
              href="/dashboard"
              className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-lg transition-colors"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link 
                href="/auth/login"
                className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/register"
                className="px-6 py-3 bg-transparent border border-gray-600 hover:border-gray-400 text-gray-300 font-semibold rounded-lg transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
