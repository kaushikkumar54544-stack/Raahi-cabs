import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { VehicleType, UserProfile } from '../types';
import { MapPin, Car, Bike, Truck, Users, Package, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface RideFormProps {
  user: UserProfile;
  onSuccess: () => void;
}

const RideForm: React.FC<RideFormProps> = ({ user, onSuccess }) => {
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [vehicle, setVehicle] = useState<VehicleType>('car');
  const [isShared, setIsShared] = useState(false);
  const [isDelivery, setIsDelivery] = useState(false);
  const [loading, setLoading] = useState(false);

  const bookRide = async () => {
    if (!pickup || !drop) return alert('Please enter pickup and drop locations');
    setLoading(true);
    try {
      await addDoc(collection(db, 'rides'), {
        userId: user.uid,
        userName: user.phoneNumber, // Using phone as name for now
        userPhone: user.phoneNumber,
        pickup,
        drop,
        vehicleType: vehicle,
        status: 'pending',
        isShared,
        isDelivery,
        timestamp: Date.now(),
      });
      alert('Ride booked successfully!');
      setPickup('');
      setDrop('');
      onSuccess();
    } catch (err) {
      console.error(err);
      alert('Failed to book ride');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 p-6 rounded-2xl border border-white/10 shadow-xl">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        {isDelivery ? <Package className="text-gold" /> : <Car className="text-gold" />}
        {isDelivery ? 'Book Delivery' : 'Book a Ride'}
      </h3>

      <div className="space-y-4">
        <div className="relative">
          <MapPin className="absolute left-3 top-3 text-emerald-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Pickup Location"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-gold transition-colors"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
          />
        </div>

        <div className="relative">
          <MapPin className="absolute left-3 top-3 text-red-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Drop Location"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-gold transition-colors"
            value={drop}
            onChange={(e) => setDrop(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setIsDelivery(false)}
            className={`py-2 rounded-xl border transition-all flex items-center justify-center gap-2 ${!isDelivery ? 'bg-gold text-black border-gold' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}
          >
            <Car className="w-4 h-4" /> Ride
          </button>
          <button
            onClick={() => setIsDelivery(true)}
            className={`py-2 rounded-xl border transition-all flex items-center justify-center gap-2 ${isDelivery ? 'bg-gold text-black border-gold' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}
          >
            <Package className="w-4 h-4" /> Delivery
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {(['auto', 'bike', 'smallcab', 'car'] as VehicleType[]).map((v) => (
            <button
              key={v}
              onClick={() => setVehicle(v)}
              className={`p-2 rounded-xl border text-xs font-medium capitalize transition-all ${vehicle === v ? 'bg-zinc-700 text-gold border-gold' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}
            >
              {v === 'bike' && <Bike className="mx-auto mb-1 w-5 h-5" />}
              {v === 'auto' && <Truck className="mx-auto mb-1 w-5 h-5" />}
              {v === 'smallcab' && <Car className="mx-auto mb-1 w-4 h-4" />}
              {v === 'car' && <Car className="mx-auto mb-1 w-5 h-5" />}
              {v}
            </button>
          ))}
        </div>

        {!isDelivery && (
          <label className="flex items-center gap-3 p-3 bg-zinc-800 rounded-xl cursor-pointer hover:bg-zinc-750 transition-colors">
            <input
              type="checkbox"
              checked={isShared}
              onChange={(e) => setIsShared(e.target.checked)}
              className="w-5 h-5 rounded border-zinc-700 text-gold focus:ring-gold bg-zinc-900"
            />
            <div className="flex items-center gap-2 text-zinc-300">
              <Users className="w-4 h-4" />
              <span>Share Ride (Cheaper)</span>
            </div>
          </label>
        )}

        <button
          onClick={bookRide}
          disabled={loading}
          className="w-full bg-gold text-black font-bold py-4 rounded-xl hover:bg-yellow-500 transition-all shadow-lg shadow-gold/10 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (isDelivery ? 'Book Delivery Now' : 'Book Ride Now')}
        </button>
      </div>
    </div>
  );
};

export default RideForm;
