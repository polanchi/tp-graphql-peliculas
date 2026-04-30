# Catálogo de Películas - GraphQL con Apollo Server

## Descripción del Proyecto

Este es un trabajo práctico sobre GraphQL que implementa un catálogo de películas con:
- **Backend**: Servidor GraphQL con Apollo Server
- **Frontend**: Cliente web que consume el API con HTML, CSS y JavaScript puro

## Requisitos Previos

- **Node.js** (versión 18 o superior) con npm
- **Navegador moderno** (Chrome, Firefox, Edge, Safari)

### Instalar Node.js

1. Descarga desde [nodejs.org](https://nodejs.org) (versión LTS recomendada)
2. Ejecuta el instalador y asegúrate de seleccionar "Add to PATH"
3. Abre una **nueva terminal** PowerShell y verifica:
   ```powershell
   node --version
   npm --version
   ```

## Estructura del Proyecto

```
tp-graphql-peliculas/
├── back/                    # Servidor GraphQL
│   ├── package.json
│   ├── server.js           # Punto de entrada
│   └── src/
│       ├── config.js       # Configuración (puerto, opciones)
│       ├── schema.js       # Esquema GraphQL (tipos, queries, mutations)
│       ├── resolvers.js    # Resolvers (lógica de las queries/mutations)
│       └── data.js         # Datos mockados
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

### 3. Probar GraphiQL (Explorador GraphQL)

Abre tu navegador en: **http://localhost:4000/**

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

### 4. Instalar dependencias del Frontend

En otra terminal (sin cerrar la del backend):

```powershell
cd front
npm install
```

### 5. Iniciar el Servidor Frontend

```powershell
npm start
```

**Salida esperada:**
```
Starting up http-server, serving ./
Hit CTRL-C to stop the server
Available on:
  http://localhost:5500
```

### 6. Abrir la Aplicación

Abre tu navegador en: **http://localhost:5500**

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
- **Género**: Campo de texto obligatorio
- **Director**: Dropdown con directores disponibles
- **Botón Agregar**: Envía la mutación GraphQL

Después de agregar, la película aparece inmediatamente en la tabla y se actualizan las estadísticas.

## Esquema GraphQL

### Tipos

```graphql
type Director {
  id: ID!
  nombre: String!
}

type Pelicula {
  id: ID!
  titulo: String!
  anio: Int!
  genero: String!
  director: Director!
}
```

### Queries (Consultas)

```graphql
type Query {
  peliculas: [Pelicula]        # Obtiene todas las películas
  pelicula(id: ID!): Pelicula  # Obtiene una película por ID
}
```

### Mutations (Mutaciones)

```graphql
type Mutation {
  agregarPelicula(
    titulo: String!
    anio: Int!
    genero: String!
    directorId: ID!
  ): Pelicula  # Agrega una nueva película
}
```

## Tecnologías Utilizadas

### Backend
- **Node.js**: Runtime de JavaScript
- **Apollo Server**: Servidor GraphQL standalone
- **GraphQL**: Lenguaje de queries

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
- Tipos: Director, Pelicula
- Query: peliculas, pelicula
- Mutation: agregarPelicula

**`src/resolvers.js`**
- Lógica de las queries y mutations
- Implementa búsquedas por ID
- Resuelve relaciones (Director)
- Agrega nuevas películas

**`src/data.js`**
- Almacenamiento en memoria
- 3 directores iniciales
- 3 películas iniciales

**`src/config.js`**
- Configuración del puerto (4000)
- Opciones de escucha

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
