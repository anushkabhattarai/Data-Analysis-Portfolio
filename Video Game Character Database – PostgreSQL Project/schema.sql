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
