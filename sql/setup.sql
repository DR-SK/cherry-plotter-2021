DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS inventories CASCADE;
DROP TABLE IF EXISTS items;

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
    actions TEXT[],
    items TEXT[],
    img TEXT
);

CREATE TABLE inventories (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id REFERENCES user.user_id,
    inventory TEXT[]
);

CREATE TABLE items (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    room_id REFERENCES rooms.room_id,
    interactions TEXT[]
);
