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
