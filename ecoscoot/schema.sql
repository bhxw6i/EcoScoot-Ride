-- EcoScoot Supabase PostgreSQL Schema Script

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Roles table
CREATE TABLE IF NOT EXISTS roles (
    id SMALLINT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

INSERT INTO roles (id, name) VALUES 
(1, 'ROLE_USER'),
(2, 'ROLE_ADMIN'),
(3, 'ROLE_STAFF')
ON CONFLICT (id) DO NOTHING;

-- 2. Profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    passwords VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    gender VARCHAR(20),
    phone VARCHAR(50),
    license_number VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_of_birth DATE,
    license_validity DATE,
    role_id SMALLINT NOT NULL REFERENCES roles(id) DEFAULT 1
);

-- 3. Scooters table
CREATE TABLE IF NOT EXISTS scooters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model VARCHAR(100) NOT NULL,
    max_speed VARCHAR(50),
    range VARCHAR(50),
    battery_capacity VARCHAR(50),
    battery_level INTEGER NOT NULL DEFAULT 100,
    charging_time VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    hourly_rate NUMERIC(10, 2),
    image_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_maintenance TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    features JSONB
);

-- Sample Scooters Data
INSERT INTO scooters (model, max_speed, range, battery_capacity, battery_level, status, hourly_rate) VALUES
('EcoGlide Pro S1', '25 km/h', '45 km', '474 Wh', 100, 'AVAILABLE', 12.50),
('EcoCruiser X2', '32 km/h', '60 km', '551 Wh', 95, 'AVAILABLE', 15.00),
('EcoCity Commuter', '20 km/h', '35 km', '360 Wh', 80, 'AVAILABLE', 9.99)
ON CONFLICT DO NOTHING;

-- 4. Charging Stations table
CREATE TABLE IF NOT EXISTS charging_stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 10,
    address TEXT,
    location TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    scooter_id UUID NOT NULL REFERENCES scooters(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    pickup_date TIMESTAMP,
    dropoff_date TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    cost NUMERIC(10, 2),
    total_price NUMERIC(10, 2),
    duration INTEGER,
    start_location VARCHAR(255) NOT NULL,
    end_location VARCHAR(255),
    pickup_location VARCHAR(255),
    dropoff_location VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
    payment_type VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
