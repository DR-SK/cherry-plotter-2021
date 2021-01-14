DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS rooms;

CREATE TABLE users (
    user_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    socket_id TEXT NOT NULL,
    current_location TEXT NOT NULL,
    location_completed BOOLEAN,
    inventory TEXT[],
    events TEXT[],
    current_hp INTEGER NOT NULL,
    base_atk INTEGER
);

CREATE TABLE rooms (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    room_id TEXT NOT NULL,
    description TEXT NOT NULL,
    events TEXT,
    actions TEXT,
    items TEXT,
    img TEXT
);

