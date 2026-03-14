import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile, Ride } from './types';
import Auth from './components/Auth';
import RideForm from './components/RideForm';
import Map from './components/Map';
import AdminPanel from './components/AdminPanel';
import { LogOut, User, Car, History, Shield, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'book' | 'history' | 'admin'>('book');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as UserProfile);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gold animate-pulse text-2xl font-bold">Raahi Cabs...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black py-20 px-4">
        <div className="max-w-md mx-auto text-center mb-12">
          <h1 className="text-5xl font-black text-gold mb-4 tracking-tighter italic">RAAHI CABS</h1>
          <p className="text-zinc-400">Your trusted partner for rides and deliveries.</p>
        </div>
        <Auth onLogin={(profile) => setUser(profile)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans pb-24">
      {/* Header */}
      <header className="bg-zinc-900/50 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-black text-gold italic tracking-tighter">RAAHI</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-zinc-800 px-3 py-1.5 rounded-full border border-white/5">
              <User className="w-4 h-4 text-gold" />
              <span className="text-sm font-medium text-white">{user.phoneNumber}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'book' && (
            <motion.div 
              key="book"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <Map />
              <RideForm user={user} onSuccess={() => setActiveTab('history')} />
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="text-center py-20"
            >
              <History className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white">Ride History</h2>
              <p className="text-zinc-500 mt-2">Your recent rides will appear here.</p>
              <button 
                onClick={() => setActiveTab('book')}
                className="mt-6 bg-zinc-800 text-gold px-6 py-2 rounded-xl font-bold hover:bg-zinc-700 transition-colors"
              >
                Book a Ride
              </button>
            </motion.div>
          )}

          {activeTab === 'admin' && user.role === 'admin' && (
            <motion.div 
              key="admin"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <AdminPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex items-center gap-2 shadow-2xl z-50">
        <button
          onClick={() => setActiveTab('book')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'book' ? 'bg-gold text-black' : 'text-zinc-500 hover:text-white'}`}
        >
          <Car className="w-5 h-5" />
          <span className="hidden sm:inline">Book</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'history' ? 'bg-gold text-black' : 'text-zinc-500 hover:text-white'}`}
        >
          <History className="w-5 h-5" />
          <span className="hidden sm:inline">History</span>
        </button>
        {user.role === 'admin' && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'admin' ? 'bg-gold text-black' : 'text-zinc-500 hover:text-white'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        )}
      </nav>
    </div>
  );
}
