'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Hero from '@/components/Hero';
import HumanBody from './HumanBody';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const [workoutMuscle, setWorkoutMuscle] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#111] to-[#1a1a1a] text-white flex flex-col items-center px-4 sm:px-6 lg:px-8 py-16">
      <div className="w-full max-w-6xl space-y-16">

        {/* Main Panel */}
        <div className="flex flex-col lg:flex-row justify-center items-center gap-12">
          <HumanBody highlight={workoutMuscle} />

          {/* Hero Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-xl"
          >
            <Hero setWorkoutMuscle={setWorkoutMuscle} />
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-5">
          <Link
            href="/workout"
            className="px-6 py-4 flex items-center gap-2 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-all duration-200 shadow-xl shadow-purple-700/30 hover:scale-105"
          >
            <Plus className="w-5 h-5" /> Add Workout
          </Link>

          <Link
            href="/diet"
            className="px-6 py-4 flex items-center gap-2 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-all duration-200 shadow-xl shadow-green-500/30 hover:scale-105"
          >
            🥗 Add Diet
          </Link>
        </div>
      </div>
    </main>
  );
}
