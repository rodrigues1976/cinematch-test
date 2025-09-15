INSERT INTO movies (title, genres, year, global_rating, image_url) VALUES
('Mad Max: Fury Road', ARRAY['Ação', 'Aventura'], 2015, 4.5, '/placeholder.svg?height=400&width=300'),
('John Wick', ARRAY['Ação', 'Thriller'], 2014, 4.2, '/placeholder.svg?height=400&width=300'),
('The Dark Knight', ARRAY['Ação', 'Crime', 'Drama'], 2008, 4.8, '/placeholder.svg?height=400&width=300'),
('Avengers: Endgame', ARRAY['Ação', 'Aventura', 'Ficção Científica'], 2019, 4.6, '/placeholder.svg?height=400&width=300'),
('Die Hard', ARRAY['Ação', 'Thriller'], 1988, 4.3, '/placeholder.svg?height=400&width=300'),

('The Grand Budapest Hotel', ARRAY['Comédia', 'Drama'], 2014, 4.4, '/placeholder.svg?height=400&width=300'),
('Superbad', ARRAY['Comédia'], 2007, 3.9, '/placeholder.svg?height=400&width=300'),
('Anchorman', ARRAY['Comédia'], 2004, 3.8, '/placeholder.svg?height=400&width=300'),
('The Hangover', ARRAY['Comédia'], 2009, 4.0, '/placeholder.svg?height=400&width=300'),
('Borat', ARRAY['Comédia'], 2006, 3.7, '/placeholder.svg?height=400&width=300'),

('The Shawshank Redemption', ARRAY['Drama'], 1994, 4.9, '/placeholder.svg?height=400&width=300'),
('Forrest Gump', ARRAY['Drama', 'Romance'], 1994, 4.7, '/placeholder.svg?height=400&width=300'),
('The Godfather', ARRAY['Crime', 'Drama'], 1972, 4.8, '/placeholder.svg?height=400&width=300'),
('Schindler''s List', ARRAY['Drama', 'História'], 1993, 4.8, '/placeholder.svg?height=400&width=300'),
('12 Years a Slave', ARRAY['Drama', 'História'], 2013, 4.5, '/placeholder.svg?height=400&width=300'),

('The Notebook', ARRAY['Romance', 'Drama'], 2004, 4.1, '/placeholder.svg?height=400&width=300'),
('Titanic', ARRAY['Romance', 'Drama'], 1997, 4.4, '/placeholder.svg?height=400&width=300'),
('Casablanca', ARRAY['Romance', 'Drama'], 1942, 4.6, '/placeholder.svg?height=400&width=300'),
('When Harry Met Sally', ARRAY['Romance', 'Comédia'], 1989, 4.2, '/placeholder.svg?height=400&width=300'),
('La La Land', ARRAY['Romance', 'Musical'], 2016, 4.3, '/placeholder.svg?height=400&width=300'),

('Blade Runner 2049', ARRAY['Ficção Científica', 'Drama'], 2017, 4.4, '/placeholder.svg?height=400&width=300'),
('Interstellar', ARRAY['Ficção Científica', 'Drama'], 2014, 4.6, '/placeholder.svg?height=400&width=300'),
('The Matrix', ARRAY['Ficção Científica', 'Ação'], 1999, 4.5, '/placeholder.svg?height=400&width=300'),
('Star Wars: A New Hope', ARRAY['Ficção Científica', 'Aventura'], 1977, 4.7, '/placeholder.svg?height=400&width=300'),
('Arrival', ARRAY['Ficção Científica', 'Drama'], 2016, 4.3, '/placeholder.svg?height=400&width=300'),

('The Exorcist', ARRAY['Terror'], 1973, 4.2, '/placeholder.svg?height=400&width=300'),
('Halloween', ARRAY['Terror'], 1978, 4.0, '/placeholder.svg?height=400&width=300'),
('A Quiet Place', ARRAY['Terror', 'Thriller'], 2018, 4.1, '/placeholder.svg?height=400&width=300'),
('Hereditary', ARRAY['Terror', 'Drama'], 2018, 3.9, '/placeholder.svg?height=400&width=300'),
('Get Out', ARRAY['Terror', 'Thriller'], 2017, 4.3, '/placeholder.svg?height=400&width=300'),

('Toy Story', ARRAY['Animação', 'Família'], 1995, 4.5, '/placeholder.svg?height=400&width=300'),
('Spirited Away', ARRAY['Animação', 'Família'], 2001, 4.7, '/placeholder.svg?height=400&width=300'),
('The Lion King', ARRAY['Animação', 'Família'], 1994, 4.6, '/placeholder.svg?height=400&width=300'),
('Finding Nemo', ARRAY['Animação', 'Família'], 2003, 4.4, '/placeholder.svg?height=400&width=300'),
('WALL-E', ARRAY['Animação', 'Ficção Científica'], 2008, 4.5, '/placeholder.svg?height=400&width=300');

INSERT INTO users (id, username, email) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'testuser', 'test@cinematch.com')
ON CONFLICT (email) DO NOTHING;
