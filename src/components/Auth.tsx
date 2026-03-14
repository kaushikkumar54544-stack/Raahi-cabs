import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserProfile } from '../types';
import { Phone, ShieldCheck, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthProps {
  onLogin: (user: UserProfile) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }
  }, []);

  const sendOtp = async () => {
    if (!phoneNumber) return setError('Please enter phone number');
    setLoading(true);
    setError('');
    try {
      const appVerifier = (window as any).recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) return setError('Please enter OTP');
    setLoading(true);
    setError('');
    try {
      const result = await confirmationResult!.confirm(otp);
      const user = result.user;
      
      // Check if user profile exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      let profile: UserProfile;
      
      if (userDoc.exists()) {
        profile = userDoc.data() as UserProfile;
      } else {
        // Create new profile
        // Special check for admin
        const isAdmin = user.phoneNumber === '+919155252300' || user.email === 'skanishk608@gmail.com';
        profile = {
          uid: user.uid,
          phoneNumber: user.phoneNumber || '',
          email: user.email || '',
          role: isAdmin ? 'admin' : 'user',
          createdAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'users', user.uid), profile);
      }
      onLogin(profile);
    } catch (err: any) {
      console.error(err);
      setError('Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-zinc-900 rounded-2xl border border-white/10 shadow-xl">
      <h2 className="text-2xl font-bold text-gold mb-6 text-center">Login to Raahi Cabs</h2>
      
      <div id="recaptcha-container"></div>

      {!confirmationResult ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="relative mb-4">
            <Phone className="absolute left-3 top-3 text-zinc-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Enter Phone Number (with +91)"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-gold transition-colors"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          <button
            onClick={sendOtp}
            disabled={loading}
            className="w-full bg-gold text-black font-bold py-3 rounded-xl hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Send OTP'}
          </button>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="relative mb-4">
            <ShieldCheck className="absolute left-3 top-3 text-zinc-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-gold transition-colors"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
          <button
            onClick={verifyOtp}
            disabled={loading}
            className="w-full bg-gold text-black font-bold py-3 rounded-xl hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Verify OTP'}
          </button>
          <button 
            onClick={() => setConfirmationResult(null)}
            className="w-full mt-4 text-zinc-400 text-sm hover:text-white transition-colors"
          >
            Change Phone Number
          </button>
        </motion.div>
      )}

      {error && <p className="mt-4 text-red-500 text-sm text-center font-medium">{error}</p>}
    </div>
  );
};

export default Auth;
