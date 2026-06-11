# CineSocial - Red social de películas (GraphQL con Apollo Server)

Repositorio actualizado para la entrega de CineSocial.

## Descripción del Proyecto

Este es un trabajo práctico sobre GraphQL que implementa una **red social de películas** con:
- **Backend**: Servidor GraphQL con Apollo Server + PostgreSQL
- **Frontend**: Cliente web que consume el API con HTML, CSS y JavaScript puro
- **Autenticación**: registro y login con JWT (contraseñas hasheadas con bcrypt)
- **Roles**: solo los administradores pueden cargar/eliminar películas
- **Social**: comentarios, puntuación con estrellas (1-5), likes a películas y comentarios, perfil de usuario, búsqueda y filtros

### Cuentas de ejemplo (tras ejecutar `init.sql`)

| Rol | Email | Contraseña |
|---|---|---|
| admin | `admin@local` | `admin123` |
| usuario | `user@local` | `user123` |

> Cualquier persona puede navegar el catálogo sin loguearse. Para comentar y puntuar hay que iniciar sesión. Para cargar películas hay que ser **admin**.

## Despliegue con Docker (imagen única) y Render

La aplicación se empaqueta en **una sola imagen Docker** que sirve, desde un único
puerto, el **frontend estático**, el **API GraphQL** (`/graphql`) y las **imágenes**
(`/images`). La base de datos PostgreSQL es externa (en Render, un servicio gestionado).

### Variables de entorno

| Variable | Descripción | Por defecto |
|---|---|---|
| `PORT` | Puerto donde escucha el servidor (Render lo inyecta) | `4000` |
| `DATABASE_URL` | Cadena de conexión a PostgreSQL | (usa credenciales locales si no está) |
| `DATABASE_SSL` | `false` para desactivar SSL (Render interno no lo necesita) | SSL activado cuando hay `DATABASE_URL` |
| `JWT_SECRET` | Secreto para firmar los tokens JWT | valor de ejemplo (cambialo en producción) |

> Al arrancar, el servidor ejecuta `init.sql` automáticamente (es idempotente), así que
> la base queda creada y con datos de ejemplo sin pasos manuales.

### Probar la imagen en local

```bash
# 1) Construir la imagen
docker build -t cinesocial .

# 2) Levantar PostgreSQL (ejemplo rápido)
docker run -d --name cine-db \
  -e POSTGRES_USER=interfaces-gq -e POSTGRES_PASSWORD=interfaces-gq \
  -e POSTGRES_DB=interfaces-gq -p 5432:5432 postgres:16-alpine

# 3) Levantar la app apuntando a esa base
docker run --rm -p 4000:4000 \
  -e DATABASE_URL="postgres://interfaces-gq:interfaces-gq@host.docker.internal:5432/interfaces-gq" \
  -e DATABASE_SSL=false \
  cinesocial
```

Luego abrí **http://localhost:4000** (frontend) y **http://localhost:4000/graphql** (GraphQL).

### Desplegar en Render

**Opción A — Blueprint (recomendada).** El repo incluye `render.yaml`, que crea la web
service Docker + una base PostgreSQL y las conecta automáticamente:

1. Subí el repositorio a GitHub.
2. En Render: **New → Blueprint**, elegí el repo y confirmá.
3. Render construye la imagen, crea la base y enlaza `DATABASE_URL`. Listo.

**Opción B — Manual.**

1. **New → PostgreSQL** y copiá su *Internal Database URL*.
2. **New → Web Service**, elegí el repo y *Runtime: Docker*.
3. En **Environment** agregá:
   - `DATABASE_URL` = la URL de la base del paso 1
   - `JWT_SECRET` = un secreto propio
4. Deploy. Render asigna el puerto vía `PORT` (ya contemplado en el código).

> **Nota sobre las imágenes subidas:** los posters se guardan en disco. En el plan
> gratuito de Render el disco es **efímero** (se pierde en cada redeploy). Para
> conservarlos hay que agregar un *Persistent Disk* montado en `back/images` (planes pagos).

## Requisitos Previos

- **Node.js** (versión 18 o superior) con npm
- **PostgreSQL** instalado y disponible en localhost
- **Navegador moderno** (Chrome, Firefox, Edge, Safari)

### Instalar Node.js

1. Descarga desde [nodejs.org](https://nodejs.org) (versión LTS recomendada)
2. Ejecuta el instalador y asegúrate de seleccionar "Add to PATH"
3. Abre una **nueva terminal** PowerShell y verifica:
   ```powershell
   node --version
   npm --version
   ```

## Configuración de la Base de Datos

El backend usa PostgreSQL con estas credenciales fijas:

- Usuario: `interfaces-gq`
- Contraseña: `interfaces-gq`
- Base de datos: `interfaces-gq`
- Host: `localhost`
- Puerto: `5432`

El archivo de inicialización está disponible en `back/init.sql`. Incluye las tablas nuevas
(`comentarios`, `calificaciones`, `pelicula_likes`, `comentario_likes`, `generos`) y columnas nuevas
(`usuarios.password_hash`, `usuarios.bio`). El script es **idempotente**: podés correrlo sobre una
base existente y solo agrega lo que falte (usa `CREATE TABLE IF NOT EXISTS` y `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`).

> Los **géneros** son una **lista predeterminada y fija** que vive en la tabla `generos`. No se pueden
> cargar géneros nuevos desde la app: al agregar una película solo se puede elegir uno de los géneros
> existentes. Una clave foránea (`peliculas.genero` → `generos.nombre`) garantiza esto a nivel de base de datos.

Para crear la base y cargar datos de ejemplo, ejecuta:

```powershell
cd back
psql -U interfaces-gq -h localhost -d interfaces-gq -f init.sql
```

> **Importante**: si ya tenías la base de una versión anterior, volvé a correr `init.sql` para
> aplicar la migración. De lo contrario verás errores como `column "bio" does not exist`.

Si aún no existe la base de datos, usa:

```powershell
createdb -U interfaces-gq interfaces-gq
```

Si no puedes usar `createdb`, crea la base desde `psql`:

```sql
CREATE DATABASE "interfaces-gq";
```

---

## Estructura del Proyecto

```
tp-graphql-peliculas/
├── back/                    # Servidor GraphQL
│   ├── package.json
│   ├── server.js           # Punto de entrada (Express: GraphQL + estáticos de imágenes)
│   ├── images/peliculas/   # Posters subidos (guardados en disco)
│   └── src/
│       ├── config.js       # Configuración (puerto, opciones, Postgres, imágenes)
│       ├── db.js           # Cliente PostgreSQL y función query
│       ├── uploads.js      # Guarda imágenes en disco y arma su URL pública
│       ├── schema.js       # Esquema GraphQL principal
│       ├── resolvers.js    # Resolvers principales
│       ├── entities/       # Módulos por entidad
│       │   ├── directores.js
│       │   ├── peliculas.js
│       │   ├── roles.js
│       │   └── usuarios.js
│
└── front/                   # Cliente web
    ├── package.json
    ├── index.html          # Estructura HTML
    └── js/
    │   ├── api.js          # Funciones para consultas GraphQL
    │   ├── app.js          # Lógica principal y manejo del DOM
    │   └── utils.js        # Funciones auxiliares
    └── css/
        └── styles.css      # Estilos (tema oscuro)
```

## Instalación y Ejecución

### 1. Instalar dependencias del Backend

```powershell
cd back
npm install
```

### 2. Iniciar el Servidor GraphQL

```powershell
npm run dev
```

O para modo normal:
```powershell
npm start
```

**Salida esperada:**
```
Servidor listo en http://localhost:4000/
```

> El backend ahora sirve **todo en un solo puerto**: el frontend en la raíz
> (**http://localhost:4000/**), el API GraphQL en **/graphql** y las imágenes en **/images**.
> Ya no hace falta levantar un servidor aparte para el frontend.

### 3. Probar GraphiQL (Explorador GraphQL)

Abre tu navegador en: **http://localhost:4000/graphql**

Aquí puedes escribir y probar consultas GraphQL directamente.

#### Ejemplos de Consultas para GraphiQL

**Obtener todas las películas:**
```graphql
query {
  peliculas {
    id
    titulo
    anio
    genero
    director {
      id
      nombre
    }
  }
}
```

**Obtener una película específica:**
```graphql
query {
  pelicula(id: "1") {
    id
    titulo
    anio
    genero
    director {
      nombre
    }
  }
}
```

**Agregar una nueva película:**
```graphql
mutation {
  agregarPelicula(
    titulo: "The Matrix"
    anio: 1999
    genero: "Ciencia ficción"
    directorId: "1"
  ) {
    id
    titulo
    director {
      nombre
    }
  }
}
```

### 4. Abrir la Aplicación

El mismo servidor del backend sirve el frontend. Abre tu navegador en:

**http://localhost:4000**

> Si preferís servir el frontend desde otro host/puerto (por ejemplo con `http-server`
> en `front/`), definí la variable `PUBLIC_BASE_URL` en el backend (por ej.
> `http://localhost:4000`) para que las URLs de las imágenes sigan apuntando al backend.

## Funcionalidades de la Interfaz

### Panel de Control (Dashboard)
- **Total películas**: Contador dinámico actualizado
- **Directores**: Total de directores (3)
- **Géneros**: Cantidad de géneros diferentes

### Tabla de Películas
- Listado completo de películas con:
  - ID
  - Título
  - Año de estreno
  - Género (con badge de color codificado)
  - Director (con avatar con iniciales)

### Formulario para Agregar Películas
- **Título**: Campo de texto obligatorio
- **Año**: Campo numérico obligatorio
- **Género**: Dropdown con la lista fija de géneros (no se pueden crear nuevos)
- **Director**: Dropdown con directores disponibles
- **Botón Agregar**: Envía la mutación GraphQL

Después de agregar, la película aparece inmediatamente en la tabla y se actualizan las estadísticas.

## Esquema GraphQL

### Tipos principales

```graphql
type Pelicula {
  id: ID!
  titulo: String!
  anio: Int!
  genero: String!
  poster: String           # URL pública del poster subido (o null si no tiene)
  director: Director!
  comentarios: [Comentario!]!
  cantidadComentarios: Int!
  promedioEstrellas: Float!
  cantidadVotos: Int!
  miCalificacion: Int        # estrellas que puso el usuario logueado
  cantidadLikes: Int!
  meGusta: Boolean!
}

type Usuario {
  id: ID!
  nombre: String!
  email: String!
  bio: String
  rol: Rol!
  comentarios: [Comentario!]!
  calificaciones: [Calificacion!]!
}

type Comentario {
  id: ID!
  texto: String!
  creadoEn: String!
  usuario: Usuario!
  pelicula: Pelicula!
  cantidadLikes: Int!
  meGusta: Boolean!
}

type AuthPayload { token: String!  usuario: Usuario! }
```

### Queries (Consultas)

```graphql
type Query {
  peliculas(busqueda: String, genero: String, directorId: ID, ordenarPor: OrdenPelicula): [Pelicula]
  pelicula(id: ID!): Pelicula
  generos: [String!]!
  me: Usuario                 # usuario logueado (requiere token)
  usuario(id: ID!): Usuario
}

enum OrdenPelicula { TITULO  ANIO  MEJOR_PUNTUADAS  MAS_COMENTADAS }
```

### Mutations (Mutaciones)

```graphql
type Mutation {
  # Auth
  registrar(nombre: String!, email: String!, password: String!): AuthPayload!
  login(email: String!, password: String!): AuthPayload!
  actualizarPerfil(nombre: String, bio: String): Usuario!

  # Películas (agregar/eliminar: solo admin)
  # El poster se envía como Data URL en base64 (la imagen real, no un enlace)
  agregarPelicula(titulo: String!, anio: Int!, genero: String!, directorId: ID!, poster: String): Pelicula
  eliminarPelicula(id: ID!): Boolean!
  toggleLikePelicula(peliculaId: ID!): Pelicula!

  # Social (requiere login)
  calificarPelicula(peliculaId: ID!, estrellas: Int!): Pelicula!
  agregarComentario(peliculaId: ID!, texto: String!): Comentario!
  eliminarComentario(id: ID!): Boolean!
  toggleLikeComentario(comentarioId: ID!): Comentario!
}
```

### Posters de películas (subida de imágenes)

Al cargar una película, un **admin** puede subir el **poster como archivo de imagen real**
(no un enlace). El flujo es:

1. El frontend lee el archivo y lo convierte a **Data URL en base64**.
2. Se envía en el argumento `poster` de la mutación `agregarPelicula`.
3. El backend decodifica la imagen y la **guarda en disco** en `back/images/peliculas/`
   con su formato original (jpg, png, webp, gif o avif) y un nombre único.
4. En la base de datos solo se guarda la **ruta relativa** (columna `peliculas.poster`).
5. Las imágenes se sirven como **archivos estáticos desde el mismo servidor** (puerto 4000)
   bajo la ruta `http://localhost:4000/images/`, y el campo `poster` de GraphQL devuelve la
   **URL pública** lista para usar en un `<img>`.

> Formatos aceptados: JPG, PNG, WEBP, GIF y AVIF. Al eliminar una película también se borra
> su archivo de poster del disco. Las imágenes subidas se ignoran en git (ver `back/.gitignore`).

### Autenticación

El login/registro devuelven un **token JWT**. El frontend lo guarda en `localStorage` y lo envía
en cada request en el header `Authorization: Bearer <token>`. El servidor lo decodifica en el
`context` de Apollo y expone el usuario actual a los resolvers.

## Tecnologías Utilizadas

### Backend
- **Node.js**: Runtime de JavaScript
- **Express**: Servidor HTTP (GraphQL + estáticos de imágenes en un solo puerto)
- **Apollo Server**: Servidor GraphQL (middleware sobre Express)
- **GraphQL**: Lenguaje de queries
- **PostgreSQL** (`pg`): Base de datos
- **bcryptjs**: Hash de contraseñas
- **jsonwebtoken**: Tokens JWT para la sesión

### Frontend
- **HTML5**: Estructura semántica
- **CSS3**: Diseño responsive (tema oscuro moderno)
- **JavaScript (ES6+)**: Lógica y comunicación con API
- **Fetch API**: Peticiones HTTP

## Archivos Principales

### Backend (`back/`)

**`server.js`**
- Punto de entrada del servidor
- Inicializa Apollo Server en modo standalone
- Escucha en puerto 4000

**`src/schema.js`**
- Define el esquema GraphQL completo
- Tipos: Director, Pelicula, Usuario, Rol
- Query: peliculas, pelicula, directores, usuario, usuarios, roles
- Mutation: agregarPelicula, agregarUsuario

**`src/resolvers.js`**
- Lógica principal de resolvers
- Importa resolvers por entidad
- Agrega búsquedas por ID
- Resuelve relaciones (Director, Rol)
- Agrega nuevas películas y usuarios

**`src/db.js`**
- Cliente PostgreSQL con `pg`
- Función `query()` reutilizable

**`src/config.js`**
- Configuración del puerto (4000)
- Opciones de escucha
- Credenciales de conexión a PostgreSQL

**`src/entities/`**
- Módulos separados por entidad
- `peliculas.js`, `directores.js`, `usuarios.js`, `roles.js`
- Tipos y resolvers específicos de cada entidad

**`back/init.sql`**
- Script SQL para crear tablas y cargar datos iniciales

### Frontend (`front/`)

**`index.html`**
- Estructura HTML completa
- Tabla con datos dinámicos
- Formulario para agregar películas
- Links a CSS y JS

**`js/api.js`**
- Abstracción de llamadas GraphQL
- Función `ejecutarConsulta()` central
- `obtenerPeliculas()`: Query para listar
- `obtenerPeliculaPorId()`: Query por ID
- `crearPelicula()`: Mutation para agregar
- Sanitización de entradas

**`js/app.js`**
- `renderizarPeliculas()`: Rellena la tabla
- `manejarSubmitFormulario()`: Procesa form
- `inicializar()`: Carga inicial
- Actualiza estadísticas dinámicamente

**`js/utils.js`**
- `getColor()`: Asigna color al género
- `getIniciales()`: Extrae iniciales del director

**`css/styles.css`**
- Tema oscuro moderno (#09090b)
- Color acentuado: púrpura (#a78bfa)
- Responsivo con CSS Grid
- Animaciones hover suaves
- Badges de colores por género

## Datos Iniciales

### Directores
| ID | Nombre |
|---|---|
| 1 | Christopher Nolan |
| 2 | Francis Ford Coppola |
| 3 | Bong Joon-ho |

### Películas
| ID | Título | Año | Género | Director |
|---|---|---|---|---|
| 1 | Inception | 2010 | Ciencia ficción | Christopher Nolan |
| 2 | El Padrino | 1972 | Drama | Francis Ford Coppola |
| 3 | Parasite | 2019 | Thriller | Bong Joon-ho |

## Flujo de Operaciones

### 1. Cargar Películas (Query)

```
1. App.js → inicializar() → renderizarPeliculas()
2. renderizarPeliculas() → api.js → obtenerPeliculas()
3. obtenerPeliculas() → fetch(GraphQL) → backend
4. Backend Query → Resolvers → data.js
5. Respuesta → Frontend renderiza tabla
```

### 2. Agregar Película (Mutation)

```
1. Usuario completa formulario y hace click
2. manejarSubmitFormulario() → crearPelicula()
3. crearPelicula() → fetch(GraphQL mutation) → backend
4. Backend Mutation → Resolvers → data.js (push)
5. Respuesta con película creada
6. renderizarPeliculas() actualiza tabla
```

## Solución de Problemas

### ❌ "No se puede acceder a http://localhost:4000"

**Solución:**
- Asegúrate de ejecutar `npm run dev` en la carpeta `back/`
- Verifica que el puerto 4000 esté disponible

### ❌ "Cannot find module '@apollo/server'"

**Solución:**
```powershell
cd back
npm install
```

### ❌ El frontend no se actualiza

**Solución:**
- Limpia cache: Ctrl+Shift+Delete
- Abre en incógnito: Ctrl+Shift+N
- Recarga con Ctrl+F5

### ❌ El formulario no agrega películas

**Solución:**
- Abre DevTools: F12 → Consola
- Verifica el error mostrado
- Confirma que ambos servidores estén corriendo

### ❌ CORS Error

**Solución:**
Apollo Server standalone permite CORS por defecto. Si ves error de CORS:
- Verifica que el backend esté en http://localhost:4000
- Verifica que el frontend sea en http://localhost:5500

## Recursos Adicionales

- [Apollo Server Docs](https://www.apollographql.com/docs/apollo-server)
- [GraphQL Learn](https://graphql.org/learn/)
- [How to GraphQL](https://www.howtographql.com/)
- [GraphiQL Editor](https://github.com/graphql/graphiql)

## Notas para Desarrolladores

### Características del Schema

✅ **Type Safety**: Tipos GraphQL bien definidos
✅ **Resolvers Simples**: Lógica clara y pequeña
✅ **Relaciones**: Director ligado a Película
✅ **Queries**: Listar todas y por ID
✅ **Mutations**: Agregar nuevas películas

### Mejoras Futuras Posibles

- Agregar base de datos (MongoDB, PostgreSQL)
- Implementar autenticación
- Agregar más mutations (editar, eliminar)
- Paginación de resultados
- Filtrado y búsqueda
- Validaciones más robustas
- Tests unitarios

---

**Última actualización**: Abril 2026
**Versión**: 1.0.0
