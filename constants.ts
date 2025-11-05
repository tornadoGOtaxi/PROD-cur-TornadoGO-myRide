
import { RideStatus, UserRole, PaymentType } from './types';

export const RIDE_STATUS_OPTIONS = Object.values(RideStatus);
export const USER_ROLE_OPTIONS = Object.values(UserRole);
export const PAYMENT_TYPE_OPTIONS = Object.values(PaymentType);

export const RIDE_STATUS_COLORS: { [key in RideStatus]: string } = {
    [RideStatus.REQUESTED]: 'bg-blue-100 text-blue-800',
    [RideStatus.ASSIGNED]: 'bg-indigo-100 text-indigo-800',
    [RideStatus.EN_ROUTE_TO_PICKUP]: 'bg-purple-100 text-purple-800',
    [RideStatus.PICKED_UP]: 'bg-yellow-100 text-yellow-800',
    [RideStatus.IN_PROGRESS]: 'bg-cyan-100 text-cyan-800',
    [RideStatus.COMPLETED]: 'bg-green-100 text-green-800',
    [RideStatus.CANCELLED]: 'bg-red-100 text-red-800',
};
