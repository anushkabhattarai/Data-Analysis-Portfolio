# Video Game Character Relational Database Project

## Project Description

This project is a relational database built using PostgreSQL that stores and manages information about video game characters. It covers fundamental concepts of relational database design, including creating tables, defining relationships between tables, inserting data, and querying data.

The project helped me learn how to:

- Design database schemas with multiple related tables.
- Implement primary keys, foreign keys, and constraints to ensure data integrity.
- Model one-to-one and many-to-many relationships using SQL.
- Write SQL queries to insert, update, delete, and retrieve data.
- Use JOIN operations to combine data from related tables.

## Database Schema and Relationships

The database consists of the following tables:

### `characters`

- **character_id** (Primary Key, SERIAL): Unique identifier for each character.
- **name** (VARCHAR(30), NOT NULL): Name of the character.
- **homeland** (VARCHAR(60)): Origin or home region of the character.
- **favorite_color** (VARCHAR(30)): Character's favorite color.


### `more_info`

- **more_info_id** (Primary Key, SERIAL): Unique identifier for additional info entries.
- **birthday** (DATE): Character's birthday.
- **height_in_cm** (INTEGER): Character’s height in centimeters.
- **weight_in_kg** (NUMERIC(4,1)): Character’s weight in kilograms.
- **character_id** (INTEGER, NOT NULL, UNIQUE, Foreign Key): References `characters(character_id)`. This enforces a **one-to-one relationship** with the `characters` table, meaning each character has exactly one entry in `more_info`.

### `sounds`

- **sound_id** (Primary Key, SERIAL): Unique identifier for each sound.
- **filename** (VARCHAR(40), UNIQUE, NOT NULL): Name of the sound file.
- **character_id** (INTEGER, NOT NULL, Foreign Key): References `characters(character_id)`. Each sound is linked to one character.

### `actions`

- **action_id** (Primary Key, SERIAL): Unique identifier for each action.
- **action** (VARCHAR(20), UNIQUE, NOT NULL): Name of the action (e.g., run, jump).

### `character_actions`

- Composite Primary Key: (`character_id`, `action_id`)
- **character_id** (Foreign Key): References `characters(character_id)`.
- **action_id** (Foreign Key): References `actions(action_id)`.

This table represents a **many-to-many relationship** between characters and actions, allowing each character to perform multiple actions and each action to be performed by multiple characters.

## Summary of Relationships

- **One-to-One:** Each character has one corresponding entry in `more_info`.
- **One-to-Many:** Each character can have multiple sounds.
- **Many-to-Many:** Characters can perform multiple actions via the `character_actions` table.

---
## Contact

Anushka Bhattarai

https://www.linkedin.com/in/anushka-bhattarai-789aa5238/

Feel free to explore the SQL files and run queries to deepen your understanding of relational databases.
