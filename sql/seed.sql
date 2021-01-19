BEGIN;
INSERT INTO users (username, password_hash)
VALUES  ('dee', 'password');
COMMIT;

BEGIN;
INSERT INTO rooms (name, description, north, east, south, west)
VALUES  ('entrance-hall', 'the entrance hall', 'room-1', 'null', 'null', 'null'),
        ('room-1', 'the first room', 'null', 'null', 'entrance-hall', 'null' );
COMMIT;

BEGIN;
INSERT INTO items (name, description, actions, room_id)
VALUES  ('first-aid', 'You notice a first-aid package sitting on one of the tables in front of you', '{'hold', 'use'}', 2),
        ('grenade', 'You notice a crate of grenades to your left', '{'hold', 'use'}', 2),
        ('cash', 'In the back corner on a table you notice wads of cash', '{'pick up', 'use'}', 2);
COMMIT;

BEGIN;
INSERT INTO game_instances (game_completed)
VALUES (false);
COMMIT;

BEGIN;
INSERT INTO game_users (game_id, game_user_id, socket_uuid, current_location, hp, base_atk, inventory)
VALUES  (1, 1, 1, 'entrance-hall', 20, 1, '{}'),
        (1, 1, 2, 'entrance-hall', 20, 1, '{}'),
        (1, 1, 3, 'entrance-hall', 20, 1, '{}'),
        (1, 1, 4, 'entrance-hall', 20, 1, '{}');
COMMIT;

BEGIN;
INSERT INTO game_items (item_id, game_id, room_id)
VALUES  (1, 1, 2),
        (2, 1, 2),
        (3, 1, 2);
COMMIT;

BEGIN;
INSERT INTO game_npcs (npc_id, game_id, room_id, dialogue_exhausted, alive_or_dead)
VALUES  (1, 1, 2, false, true),
        (2, 1, 2, false, true);
COMMIT;

