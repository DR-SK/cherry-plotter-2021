DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS events;

CREATE TABLE users (
    user_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL
);

CREATE TABLE events (
    event_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_name TEXT NOT NULL,
    description TEXT NOT NULL
    -- side_effects 
    -- room_id BIGINT REFERENCES rooms(room_id)
);