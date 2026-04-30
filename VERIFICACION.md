# ✅ Verificación del Proyecto

Este archivo te ayuda a verificar que todos los archivos estén en su lugar y correctamente configurados.

## Checklist de Archivos

### Backend (`/back/`)

- [ ] **package.json** - Contiene dependencies: @apollo/server y graphql
- [ ] **server.js** - Crea ApolloServer y lo inicia en puerto 4000
- [ ] **src/config.js** - Define PORT = 4000 y LISTEN_OPTIONS
- [ ] **src/schema.js** - Contiene typeDefs con tipos Director, Pelicula, Query, Mutation
- [ ] **src/resolvers.js** - Contiene resolvers para queries, mutations y relaciones
- [ ] **src/data.js** - Contiene arrays de directores y películas

### Frontend (`/front/`)

- [ ] **package.json** - Contiene scripts start con http-server
- [ ] **index.html** - HTML completo con estructura, tabla y formulario
- [ ] **js/api.js** - Contiene ejecutarConsulta, obtenerPeliculas, obtenerPeliculaPorId, crearPelicula
- [ ] **js/app.js** - Contiene renderizarPeliculas, manejarSubmitFormulario, inicializar
- [ ] **js/utils.js** - Contiene getColor y getIniciales
- [ ] **css/styles.css** - Contiene estilos completos del tema oscuro

### Documentación

- [ ] **README.md** - Guía completa del proyecto
- [ ] **INSTRUCCIONES_WINDOWS.md** - Instrucciones para Windows PowerShell
- [ ] **REFERENCIA_GRAPHQL.md** - Ejemplos de queries y mutations
- [ ] **VERIFICACION.md** - Este archivo

---

## Verificación de Contenido

### Backend - server.js

Debe contener:
```javascript
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./src/schema.js";
import { resolvers } from "./src/resolvers.js";
```

### Backend - schema.js

Debe tener:
- `type Director { id, nombre }`
- `type Pelicula { id, titulo, anio, genero, director }`
- `type Query { peliculas, pelicula(id) }`
- `type Mutation { agregarPelicula(...) }`

### Backend - resolvers.js

Debe tener funciones:
- `Query.peliculas(): [Pelicula]`
- `Query.pelicula(_, {id}): Pelicula`
- `Mutation.agregarPelicula(...): Pelicula`
- `Pelicula.director(pelicula): Director`

### Frontend - app.js

Debe tener:
- Función `renderizarPeliculas()` - Carga datos del servidor
- Función `manejarSubmitFormulario(e)` - Procesa el formulario
- Función `inicializar()` - Configura todo al cargar
- Event listener en el formulario

### Frontend - api.js

Debe tener:
- Función `ejecutarConsulta(query)` - Hace fetch a GraphQL
- Función `obtenerPeliculas()` - Query para listar todas
- Función `obtenerPeliculaPorId(id)` - Query por ID
- Función `crearPelicula(params)` - Mutation para agregar

### Frontend - index.html

Debe tener:
- `<div id="lista-peliculas"></div>` - Tabla con tbody
- `<form id="form-agregar">` - Formulario para agregar
- `<input id="titulo">` - Campo de texto
- `<input id="anio">` - Campo numérico
- `<input id="genero">` - Campo de texto
- `<select id="directorId">` - Dropdown de directores
- `<script type="module" src="js/app.js"></script>`

---

## Verificación de Funcionalidades

### Cuando Node.js esté instalado:

```powershell
# Terminal 1
cd back
npm install
npm run dev
# Debe mostrar: "Servidor listo en http://localhost:4000/"
```

```powershell
# Terminal 2
cd front
npm install
npm start
# Debe mostrar: "Available on: http://localhost:5500"
```

Luego:

- [ ] Puedo acceder a http://localhost:4000
- [ ] GraphiQL muestra la interfaz interactiva
- [ ] Ejecuto query de películas y obtengo resultados
- [ ] Ejecuto mutation para agregar película
- [ ] Accedo a http://localhost:5500
- [ ] Frontend carga con tabla de películas
- [ ] Puedo ver las estadísticas (total películas, géneros)
- [ ] Completo el formulario y agrego una película
- [ ] La nueva película aparece en la tabla inmediatamente
- [ ] Las estadísticas se actualizan

---

## URLs Importantes

Cuando esté todo corriendo:

| Recurso | URL |
|---|---|
| GraphiQL (Explorar API) | http://localhost:4000 |
| Frontend Web | http://localhost:5500 |
| Backend API | http://localhost:4000/graphql |

---

## Estructura de Carpetas Final

```
tp-graphql-peliculas/
├── back/
│   ├── package.json
│   ├── server.js
│   ├── src/
│   │   ├── config.js
│   │   ├── data.js
│   │   ├── resolvers.js
│   │   └── schema.js
│   └── node_modules/ (se crea con npm install)
│
├── front/
│   ├── package.json
│   ├── index.html
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── api.js
│   │   ├── app.js
│   │   └── utils.js
│   └── node_modules/ (se crea con npm install)
│
├── README.md
├── INSTRUCCIONES_WINDOWS.md
├── REFERENCIA_GRAPHQL.md
└── VERIFICACION.md (este archivo)
```

---

## Datos Iniciales Esperados

### Directores en Data
```javascript
{ id: "1", nombre: "Christopher Nolan" }
{ id: "2", nombre: "Francis Ford Coppola" }
{ id: "3", nombre: "Bong Joon-ho" }
```

### Películas en Data
```javascript
{ id: "1", titulo: "Inception", anio: 2010, genero: "Ciencia ficción", directorId: "1" }
{ id: "2", titulo: "El Padrino", anio: 1972, genero: "Drama", directorId: "2" }
{ id: "3", titulo: "Parasite", anio: 2019, genero: "Thriller", directorId: "3" }
```

---

## Solución Rápida de Problemas

### ❌ "npm install no funciona"
→ Node.js no está instalado
→ Solución: Instala Node.js desde https://nodejs.org

### ❌ "Puerto 4000/5500 ya está en uso"
→ Otro proceso está usando ese puerto
→ Solución: Cierra aplicaciones o reinicia el sistema

### ❌ "GraphiQL no aparece en http://localhost:4000"
→ El servidor backend no está corriendo
→ Solución: Ejecuta `npm run dev` en carpeta `/back`

### ❌ "Frontend muestra tabla vacía"
→ El backend no está accesible
→ Solución: Verifica ambos servidores estén corriendo

### ❌ "El formulario no agrega películas"
→ Error en la consulta GraphQL
→ Solución: Abre DevTools (F12), ve a Consola y busca errores

---

## Información de Contacto / Ayuda

Si encuentras problemas:

1. Verifica el archivo README.md para instrucciones detalladas
2. Consulta INSTRUCCIONES_WINDOWS.md para tu sistema operativo
3. Revisa REFERENCIA_GRAPHQL.md para ejemplos de queries
4. Abre la consola del navegador (F12) para ver errores
5. Verifica los logs del servidor backend en la terminal

---

## Checklist Final Antes de Entregar

- [ ] Todos los archivos están presentes
- [ ] Node.js está instalado (node --version funciona)
- [ ] `npm install` se ejecutó en `/back`
- [ ] `npm install` se ejecutó en `/front`
- [ ] El servidor backend inicia sin errores
- [ ] GraphiQL es accesible en http://localhost:4000
- [ ] Las queries de GraphQL funcionan
- [ ] Las mutations de GraphQL funcionan
- [ ] El servidor frontend inicia sin errores
- [ ] El frontend carga en http://localhost:5500
- [ ] La tabla muestra las películas iniciales
- [ ] El formulario agrega películas correctamente
- [ ] Las estadísticas se actualizan dinámicamente
- [ ] Todo el código está comentado y es claro
- [ ] Los README.md están completos y actualizados

---

**Estado**: ✅ Proyecto completamente preparado para ejecutar

**Próximo paso**: Instalar Node.js y seguir INSTRUCCIONES_WINDOWS.md
