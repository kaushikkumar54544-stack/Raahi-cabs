export type VehicleType = 'auto' | 'bike' | 'smallcab' | 'car';
export type RideStatus = 'pending' | 'accepted' | 'completed' | 'cancelled';
export type UserRole = 'admin' | 'user' | 'driver';

export interface UserProfile {
  uid: string;
  phoneNumber: string;
  email?: string;
  role: UserRole;
  createdAt: string;
}

export interface Ride {
  id?: string;
  userId: string;
  pickup: string;
  drop: string;
  vehicleType: VehicleType;
  status: RideStatus;
  isShared: boolean;
  isDelivery: boolean;
  timestamp: number;
  driverId?: string;
  bonus?: number;
  userName?: string;
  userPhone?: string;
}
