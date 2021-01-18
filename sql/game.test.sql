    -- // inventory needs...
    -- // at least one game_item (tied to game_instance, room_id)

BEGIN;
-- create one user
INSERT INTO users (username, password_hash)
VALUES ('username', 'password');
COMMIT;

BEGIN;
-- create one item
INSERT INTO rooms (name, description, north, east, south, west)
VALUES  ('entrance-hall', 'the entrance hall', 'room-1', 'null', 'null', 'null');
COMMIT;

BEGIN;
-- create one event
INSERT INTO events (event_name, description, room_id)
VALUES ('break chair', 'you broke a chair', 1);
COMMIT;

BEGIN;
-- create one npc
INSERT INTO npcs (name, description, dialogue, actions, hp, room_id)
VALUES ('rird', 'rird desc', 'hello', '{one, two}', 3, 1);
COMMIT;

BEGIN;
-- create one item
INSERT INTO items (name, description, actions, room_id)
VALUES  ('key', 'a key', '{hold, use}', 1);
COMMIT;

BEGIN;
-- ensure that the item belongs to to the correct room by room_id
UPDATE items
SET (room_id) = (SELECT room_id FROM rooms
WHERE rooms.name = 'entrance-hall');
COMMIT;
