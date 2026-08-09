-- CricV Initial Database Seed Data (International Teams & Rosters)

-- Insert Australia
WITH aust_team AS (
    INSERT INTO teams (name, short_name) 
    VALUES ('Australia', 'AUS') 
    RETURNING id
)
INSERT INTO players (name, role, team_id) VALUES
('David Warner', 'Opening Batter', (SELECT id FROM aust_team)),
('Travis Head', 'Opening Batter', (SELECT id FROM aust_team)),
('Mitchell Marsh', 'All-Rounder', (SELECT id FROM aust_team)),
('Glenn Maxwell', 'All-Rounder', (SELECT id FROM aust_team)),
('Marcus Stoinis', 'All-Rounder', (SELECT id FROM aust_team)),
('Tim David', 'Batter', (SELECT id FROM aust_team)),
('Matthew Wade', 'Wicketkeeper-Batter', (SELECT id FROM aust_team)),
('Mitchell Starc', 'Bowler', (SELECT id FROM aust_team)),
('Pat Cummins', 'Bowler', (SELECT id FROM aust_team)),
('Josh Hazlewood', 'Bowler', (SELECT id FROM aust_team)),
('Adam Zampa', 'Bowler', (SELECT id FROM aust_team));

-- Insert Sri Lanka
WITH sl_team AS (
    INSERT INTO teams (name, short_name) 
    VALUES ('Sri Lanka', 'SL') 
    RETURNING id
)
INSERT INTO players (name, role, team_id) VALUES
('Pathum Nissanka', 'Opening Batter', (SELECT id FROM sl_team)),
('Kusal Mendis', 'Wicketkeeper-Batter', (SELECT id FROM sl_team)),
('Kusal Perera', 'Wicketkeeper-Batter', (SELECT id FROM sl_team)),
('Charith Asalanka', 'Batter', (SELECT id FROM sl_team)),
('Bhanuka Rajapaksa', 'Batter', (SELECT id FROM sl_team)),
('Wanindu Hasaranga', 'All-Rounder', (SELECT id FROM sl_team)),
('Dasun Shanaka', 'All-Rounder', (SELECT id FROM sl_team)),
('Chamika Karunaratne', 'All-Rounder', (SELECT id FROM sl_team)),
('Maheesh Theekshana', 'Bowler', (SELECT id FROM sl_team)),
('Dunith Wellalage', 'Bowler', (SELECT id FROM sl_team)),
('Matheesha Pathirana', 'Bowler', (SELECT id FROM sl_team));

-- Insert India
WITH ind_team AS (
    INSERT INTO teams (name, short_name) 
    VALUES ('India', 'IND') 
    RETURNING id
)
INSERT INTO players (name, role, team_id) VALUES
('Rohit Sharma', 'Opening Batter', (SELECT id FROM ind_team)),
('Yashasvi Jaiswal', 'Opening Batter', (SELECT id FROM ind_team)),
('Virat Kohli', 'Batter', (SELECT id FROM ind_team)),
('Suryakumar Yadav', 'Batter', (SELECT id FROM ind_team)),
('Rishabh Pant', 'Wicketkeeper-Batter', (SELECT id FROM ind_team)),
('Hardik Pandya', 'All-Rounder', (SELECT id FROM ind_team)),
('Ravindra Jadeja', 'All-Rounder', (SELECT id FROM ind_team)),
('Axar Patel', 'All-Rounder', (SELECT id FROM ind_team)),
('Kuldeep Yadav', 'Bowler', (SELECT id FROM ind_team)),
('Jasprit Bumrah', 'Bowler', (SELECT id FROM ind_team)),
('Arshdeep Singh', 'Bowler', (SELECT id FROM ind_team));
