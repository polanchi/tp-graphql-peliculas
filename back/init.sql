-- Script de creación de la base de datos y datos iniciales
-- Ejecútalo con el usuario interfaces-gq

-- Si la base de datos no existe, créala primero con:
-- createdb -U interfaces-gq interfaces-gq

-- Conecta a la base de datos interfaces-gq y ejecuta:

CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS directores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS peliculas (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  anio INT NOT NULL,
  genero VARCHAR(100) NOT NULL,
  director_id INT NOT NULL REFERENCES directores(id)
);

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  rol_id INT NOT NULL REFERENCES roles(id)
);

INSERT INTO roles (nombre)
VALUES ('admin'), ('editor'), ('usuario')
ON CONFLICT DO NOTHING;

INSERT INTO directores (nombre)
VALUES
  ('Christopher Nolan'),
  ('Francis Ford Coppola'),
  ('Bong Joon-ho')
ON CONFLICT DO NOTHING;

INSERT INTO peliculas (titulo, anio, genero, director_id)
VALUES
  ('Inception', 2010, 'Ciencia ficción', 1),
  ('El Padrino', 1972, 'Drama', 2),
  ('Parasite', 2019, 'Thriller', 3)
ON CONFLICT DO NOTHING;

INSERT INTO usuarios (nombre, email, rol_id)
VALUES
  ('Admin', 'admin@local', 1),
  ('Invitado', 'invitado@local', 3)
ON CONFLICT DO NOTHING;
