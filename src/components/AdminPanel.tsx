import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { Ride, UserRole } from '../types';
import { CheckCircle, XCircle, Trash2, Gift, User, MapPin, Clock } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'rides'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ridesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ride));
      setRides(ridesData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (rideId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'rides', rideId), { status });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteRide = async (rideId: string) => {
    if (!window.confirm('Are you sure you want to delete this ride?')) return;
    try {
      await deleteDoc(doc(db, 'rides', rideId));
    } catch (err) {
      console.error(err);
    }
  };

  const addBonus = async (rideId: string) => {
    const bonus = prompt('Enter bonus amount:');
    if (!bonus) return;
    try {
      await updateDoc(doc(db, 'rides', rideId), { bonus: Number(bonus) });
      alert('Bonus added!');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-10 text-zinc-500">Loading rides...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gold">Admin Dashboard</h2>
      
      <div className="grid gap-4">
        {rides.map((ride) => (
          <div key={ride.id} className="bg-zinc-900 p-5 rounded-2xl border border-white/10 shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-gold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-white">{ride.userPhone || 'Anonymous'}</p>
                  <p className="text-xs text-zinc-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(ride.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                ride.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                ride.status === 'pending' ? 'bg-gold/10 text-gold' :
                ride.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                'bg-blue-500/10 text-blue-500'
              }`}>
                {ride.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div className="space-y-1">
                <p className="text-zinc-500 flex items-center gap-1"><MapPin className="w-3 h-3 text-emerald-500" /> Pickup</p>
                <p className="text-zinc-300">{ride.pickup}</p>
              </div>
              <div className="space-y-1">
                <p className="text-zinc-500 flex items-center gap-1"><MapPin className="w-3 h-3 text-red-500" /> Drop</p>
                <p className="text-zinc-300">{ride.drop}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-white/5 pt-4">
              <button
                onClick={() => updateStatus(ride.id!, 'accepted')}
                className="flex items-center gap-1 px-3 py-2 bg-blue-600/20 text-blue-400 rounded-xl text-xs font-bold hover:bg-blue-600/30 transition-colors"
              >
                <CheckCircle className="w-4 h-4" /> Accept
              </button>
              <button
                onClick={() => updateStatus(ride.id!, 'completed')}
                className="flex items-center gap-1 px-3 py-2 bg-emerald-600/20 text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-600/30 transition-colors"
              >
                <CheckCircle className="w-4 h-4" /> Complete
              </button>
              <button
                onClick={() => updateStatus(ride.id!, 'cancelled')}
                className="flex items-center gap-1 px-3 py-2 bg-red-600/20 text-red-400 rounded-xl text-xs font-bold hover:bg-red-600/30 transition-colors"
              >
                <XCircle className="w-4 h-4" /> Cancel
              </button>
              <button
                onClick={() => addBonus(ride.id!)}
                className="flex items-center gap-1 px-3 py-2 bg-gold/20 text-gold rounded-xl text-xs font-bold hover:bg-gold/30 transition-colors"
              >
                <Gift className="w-4 h-4" /> {ride.bonus ? `Bonus: ₹${ride.bonus}` : 'Add Bonus'}
              </button>
              <button
                onClick={() => deleteRide(ride.id!)}
                className="ml-auto p-2 text-zinc-500 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
        {rides.length === 0 && <p className="text-center text-zinc-600 py-10">No rides found.</p>}
      </div>
    </div>
  );
};

export default AdminPanel;
