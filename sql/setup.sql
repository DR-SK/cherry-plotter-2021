DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS npcs CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS game_instances;

CREATE TABLE users (
    user_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL
);

CREATE TABLE events (
    event_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_name TEXT NOT NULL,
    description TEXT NOT NULL
    -- side_effects (STRETCH)
    room_id BIGINT REFERENCES rooms(room_id)
);

CREATE TABLE items (
    item_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    actions TEXT[]
    room_id BIGINT REFERENCES rooms(room_id)
);

CREATE TABLE npcs (
    npc_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL, 
    description TEXT NOT NULL,
    dialogue TEXT NOT NULL,
    actions TEXT[] NOT NULL,
    hp INTEGER NOT NULL
    room_id BIGINT REFERENCES rooms(room_id)
);

CREATE TABLE rooms (
    room_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL, 
    description TEXT NOT NULL,
    img TEXT,
    north TEXT NOT NULL, 
    east TEXT NOT NULL,
    south TEXT NOT NULL,
    west TEXT NOT NULL
);

CREATE TABLE game_instances (
    game_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    game_completed BOOLEAN NOT NULL
);