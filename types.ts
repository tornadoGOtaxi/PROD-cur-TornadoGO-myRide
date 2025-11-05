
export enum UserRole {
    PASSENGER = "PASSENGER",
    DRIVER = "DRIVER",
    ADMIN = "ADMIN"
}

export enum RideStatus {
    REQUESTED = "REQUESTED",
    ASSIGNED = "ASSIGNED",
    EN_ROUTE_TO_PICKUP = "EN_ROUTE_TO_PICKUP",
    PICKED_UP = "PICKED_UP",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}

export enum PaymentType {
    CASH = "Cash",
    CARD = "Card",
    INVOICE = "Invoice"
}

export enum EventType {
    RIDE_REQUESTED = "RIDE_REQUESTED",
    DRIVER_ASSIGNED = "DRIVER_ASSIGNED",
    PICKUP_CONFIRMED = "PICKUP_CONFIRMED",
    DROPOFF_CONFIRMED = "DROPOFF_CONFIRMED",
    STATUS_UPDATED = "STATUS_UPDATED",
    MESSAGE_SENT = "MESSAGE_SENT",
    RIDE_CANCELLED = "RIDE_CANCELLED",
    DRIVER_EN_ROUTE = "DRIVER_EN_ROUTE"
}

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    carrier?: string;
    role: UserRole;
    password_hash: string;
    created_at: string;
    updated_at: string;
    preferences_json?: string;
    active: boolean;
}

export interface Stop {
    id: string;
    description: string;
}

export interface Ride {
    id: string;
    public_token: string;
    requester_user_id: string | null;
    guest_name: string | null;
    guest_email: string | null;
    guest_phone: string | null;
    guest_carrier?: string | null;
    pickup_details: string;
    dropoff_details: string;
    additional_stops_json: string; // JSON string of Stop[]
    ride_date_time: string;
    num_passengers: number;
    payment_type: PaymentType;
    status: RideStatus;
    assigned_driver_id: string | null;
    created_at: string;
    updated_at: string;
    is_sharing_location?: boolean;
}

export interface RideActivityLog {
    id: string;
    ride_id: string;
    actor_user_id: string | null;
    event_type: EventType;
    event_description: string;
    created_at: string;
}

export interface Message {
    id: string;
    ride_id: string | null;
    sender_id: string;
    receiver_id: string;
    message_text: string;
    is_system: boolean;
    created_at: string;
}

export interface DriverAvailability {
    id: string;
    driver_id: string;
    available_from: string | null;
    available_to: string | null;
    is_available_now: boolean;
    created_at: string;
    updated_at: string;
}

export interface DriverLocation {
    id: string;
    driver_id: string;
    last_lat: number;
    last_lng: number;
    last_updated_at: string;
}