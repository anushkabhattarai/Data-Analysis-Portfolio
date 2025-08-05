-- Insert data into characters
INSERT INTO characters(name, homeland, favorite_color) 
VALUES 
  ('Mario', 'Mushroom Kingdom', 'Red'),
  ('Luigi', 'Mushroom Kingdom', 'Green'),
  ('Peach', 'Mushroom Kingdom', 'Pink'),
  ('Toad', 'Mushroom Kingdom', 'Blue'),
  ('Bowser', 'Koopa Kingdom', 'Yellow'),
  ('Daisy', 'Sarasaland', 'Orange'),
  ('Yoshi', 'Dinosaur Land', 'Green');

-- Insert data into more_info
INSERT INTO more_info(birthday, height_in_cm, weight_in_kg, character_id) 
VALUES 
  ('1981-07-09', 155, 64.5, 1),
  ('1983-07-14', 175, 48.8, 2),
  ('1985-10-18', 173, 52.2, 3),
  ('1950-01-10', 66, 35.6, 4),
  ('1990-10-29', 258, 300.0, 5),
  ('1989-07-31', NULL, NULL, 6),
  ('1990-04-13', 162, 59.1, 7);

-- Insert data into sounds
INSERT INTO sounds(filename, character_id) 
VALUES 
  ('its-a-me.wav', 1),
  ('yippee.wav', 1),
  ('ha-ha.wav', 2),
  ('oh-yeah.wav', 2),
  ('yay.wav', 3),
  ('woo-hoo.wav', 3),
  ('mm-hmm.wav', 3),
  ('yahoo.wav', 1);

-- Insert data into actions
INSERT INTO actions(action) VALUES ('run'), ('jump'), ('duck');

-- Insert data into character_actions
INSERT INTO character_actions(character_id, action_id) 
VALUES 
  (7,1), (7,2), (7,3),
  (6,1), (6,2), (6,3),
  (5,1), (5,2), (5,3),
  (4,1), (4,2), (4,3),
  (3,1), (3,2), (3,3),
  (2,1), (2,2), (2,3),
  (1,1), (1,2), (1,3);


-- Select all characters
SELECT * FROM characters;

-- Select character IDs and names
SELECT character_id, name FROM characters;

-- Select characters ordered by id
SELECT * FROM characters ORDER BY character_id;

-- Select all more_info records
SELECT * FROM more_info;

-- Select all sounds
SELECT * FROM sounds;

-- Select all actions
SELECT * FROM actions;

-- Select all character_actions
SELECT * FROM character_actions;

-- Select specific characters by name
SELECT character_id, name FROM characters WHERE name = 'Toad';
SELECT character_id, name FROM characters WHERE name = 'Bowser';
SELECT character_id, name FROM characters WHERE name = 'Daisy';
SELECT character_id, name FROM characters WHERE name = 'Yoshi';

-- Join characters with their more_info
SELECT * FROM characters FULL JOIN more_info ON characters.character_id = more_info.character_id;

-- Join characters with their sounds
SELECT * FROM characters FULL JOIN sounds ON characters.character_id = sounds.character_id;

-- Join character_actions with characters and actions
SELECT * FROM character_actions 
  FULL JOIN characters ON character_actions.character_id = characters.character_id 
  FULL JOIN actions ON character_actions.action_id = actions.action_id;


-- Create databases (run outside psql or once in your environment)
CREATE DATABASE first_database;
CREATE DATABASE second_database;
ALTER DATABASE first_database RENAME TO mario_database;

-- Tables creation
CREATE TABLE characters (
    character_id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    homeland VARCHAR(60),
    favorite_color VARCHAR(30)
);

CREATE TABLE more_info (
    more_info_id SERIAL PRIMARY KEY,
    birthday DATE,
    height_in_cm INT,
    weight_in_kg NUMERIC(4,1),
    character_id INT UNIQUE NOT NULL REFERENCES characters(character_id)
);

CREATE TABLE sounds (
    sound_id SERIAL PRIMARY KEY,
    filename VARCHAR(40) NOT NULL UNIQUE,
    character_id INT NOT NULL REFERENCES characters(character_id)
);

CREATE TABLE actions (
    action_id SERIAL PRIMARY KEY,
    action VARCHAR(20) UNIQUE NOT NULL
);

CREATE TABLE character_actions (
    character_id INT NOT NULL,
    action_id INT NOT NULL,
    PRIMARY KEY(character_id, action_id),
    FOREIGN KEY(character_id) REFERENCES characters(character_id),
    FOREIGN KEY(action_id) REFERENCES actions(action_id)
);
