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

-- Lista predeterminada de géneros. No se cargan géneros nuevos desde la app.
CREATE TABLE IF NOT EXISTS generos (
  nombre VARCHAR(100) PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS peliculas (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  anio INT NOT NULL,
  genero VARCHAR(100) NOT NULL,
  poster VARCHAR(255),
  director_id INT NOT NULL REFERENCES directores(id)
);

-- Para bases ya existentes: ruta relativa al poster guardado en disco.
ALTER TABLE peliculas ADD COLUMN IF NOT EXISTS poster VARCHAR(255);

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  bio TEXT,
  rol_id INT NOT NULL REFERENCES roles(id)
);

-- Para bases ya existentes (agrega columnas nuevas sin romper datos)
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS bio TEXT;

-- Comentarios de usuarios sobre películas
CREATE TABLE IF NOT EXISTS comentarios (
  id SERIAL PRIMARY KEY,
  texto TEXT NOT NULL,
  usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  pelicula_id INT NOT NULL REFERENCES peliculas(id) ON DELETE CASCADE,
  creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Calificaciones con estrellas (1 a 5). Un voto por usuario y película.
CREATE TABLE IF NOT EXISTS calificaciones (
  id SERIAL PRIMARY KEY,
  estrellas INT NOT NULL CHECK (estrellas BETWEEN 1 AND 5),
  usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  pelicula_id INT NOT NULL REFERENCES peliculas(id) ON DELETE CASCADE,
  creado_en TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (usuario_id, pelicula_id)
);

-- Likes a películas (uno por usuario y película)
CREATE TABLE IF NOT EXISTS pelicula_likes (
  usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  pelicula_id INT NOT NULL REFERENCES peliculas(id) ON DELETE CASCADE,
  creado_en TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (usuario_id, pelicula_id)
);

-- Likes a comentarios (uno por usuario y comentario)
CREATE TABLE IF NOT EXISTS comentario_likes (
  usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  comentario_id INT NOT NULL REFERENCES comentarios(id) ON DELETE CASCADE,
  creado_en TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (usuario_id, comentario_id)
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

-- Géneros predeterminados (lista fija, no editable desde la app)
INSERT INTO generos (nombre)
VALUES
  ('Acción'),
  ('Aventura'),
  ('Animación'),
  ('Ciencia ficción'),
  ('Comedia'),
  ('Documental'),
  ('Drama'),
  ('Fantasía'),
  ('Misterio'),
  ('Musical'),
  ('Romance'),
  ('Suspenso'),
  ('Terror'),
  ('Thriller')
ON CONFLICT DO NOTHING;

-- Garantiza a nivel de base de datos que cada película use un género válido.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'peliculas_genero_fkey'
  ) THEN
    ALTER TABLE peliculas
      ADD CONSTRAINT peliculas_genero_fkey
      FOREIGN KEY (genero) REFERENCES generos(nombre);
  END IF;
END $$;

INSERT INTO peliculas (titulo, anio, genero, director_id)
VALUES
  ('Inception', 2010, 'Ciencia ficción', 1),
  ('El Padrino', 1972, 'Drama', 2),
  ('Parasite', 2019, 'Thriller', 3)
ON CONFLICT DO NOTHING;

-- Usuarios de ejemplo (las contraseñas están hasheadas con bcrypt)
-- admin@local  -> contraseña: admin123  (rol admin)
-- user@local   -> contraseña: user123   (rol usuario)
INSERT INTO usuarios (nombre, email, password_hash, rol_id)
VALUES
  ('Admin', 'admin@local', '$2b$10$uxQqD/iWatbEWZdQ1IIzw.JZbxLd1.9kArKOj9Kj4xN4W8.lIT5ua', 1),
  ('Usuario Demo', 'user@local', '$2b$10$RQMbq84NHotjwgaKymQC0ezXnEKHVwlBb8ZDwo8ydFx2kwNFvFyza', 3)
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;
