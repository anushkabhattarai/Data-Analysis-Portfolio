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
