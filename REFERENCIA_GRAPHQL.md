# 📖 Referencia GraphQL - Comandos para Usar en GraphiQL

## ⚙️ Conectarte a GraphiQL

1. Inicia el servidor backend: `npm run dev` (en `/back`)
2. Abre en tu navegador: **http://localhost:4000**
3. Verás la interfaz de GraphiQL

---

## 🔍 QUERIES (Consultas - Lectura de datos)

### 1. Obtener TODAS las películas con todos los datos

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

**Resultado esperado:**
```json
{
  "data": {
    "peliculas": [
      {
        "id": "1",
        "titulo": "Inception",
        "anio": 2010,
        "genero": "Ciencia ficción",
        "director": {
          "id": "1",
          "nombre": "Christopher Nolan"
        }
      },
      ...
    ]
  }
}
```

---

### 2. Obtener SOLO información simple

```graphql
query {
  peliculas {
    titulo
    anio
  }
}
```

Puedes seleccionar qué campos quieres.

---

### 3. Obtener UNA película por ID

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

**Resultado:**
```json
{
  "data": {
    "pelicula": {
      "id": "1",
      "titulo": "Inception",
      "anio": 2010,
      "genero": "Ciencia ficción",
      "director": {
        "nombre": "Christopher Nolan"
      }
    }
  }
}
```

---

### 4. Obtener película 2

```graphql
query {
  pelicula(id: "2") {
    titulo
    director {
      nombre
    }
  }
}
```

---

### 5. Obtener película 3

```graphql
query {
  pelicula(id: "3") {
    titulo
    anio
    genero
  }
}
```

---

## ✏️ MUTATIONS (Mutaciones - Modificar datos)

### 1. Agregar una nueva película - Ejemplo 1

```graphql
mutation {
  agregarPelicula(
    titulo: "The Shawshank Redemption"
    anio: 1994
    genero: "Drama"
    directorId: "2"
  ) {
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

**Resultado:**
```json
{
  "data": {
    "agregarPelicula": {
      "id": "4",
      "titulo": "The Shawshank Redemption",
      "anio": 1994,
      "genero": "Drama",
      "director": {
        "nombre": "Francis Ford Coppola"
      }
    }
  }
}
```

---

### 2. Agregar película - Ejemplo 2

```graphql
mutation {
  agregarPelicula(
    titulo: "Interstellar"
    anio: 2014
    genero: "Ciencia ficción"
    directorId: "1"
  ) {
    id
    titulo
  }
}
```

---

### 3. Agregar película - Ejemplo 3

```graphql
mutation {
  agregarPelicula(
    titulo: "Memoria"
    anio: 2021
    genero: "Drama"
    directorId: "3"
  ) {
    titulo
    director {
      nombre
    }
  }
}
```

---

### 4. Agregar película con director Christopher Nolan

```graphql
mutation {
  agregarPelicula(
    titulo: "Oppenheimer"
    anio: 2023
    genero: "Drama"
    directorId: "1"
  ) {
    id
    titulo
    anio
    director {
      nombre
    }
  }
}
```

---

### 5. Agregar película con director Bong Joon-ho

```graphql
mutation {
  agregarPelicula(
    titulo: "Okja"
    anio: 2017
    genero: "Aventura"
    directorId: "3"
  ) {
    titulo
    director {
      nombre
    }
  }
}
```

---

## 📋 IDs de Directores (para usar en mutaciones)

| directorId | Nombre |
|---|---|
| "1" | Christopher Nolan |
| "2" | Francis Ford Coppola |
| "3" | Bong Joon-ho |

---

## 💡 Tips Útiles

### Usar Variables en Queries

En lugar de hardcodear valores, puedes usar variables:

```graphql
query ObtenerPelicula($id: ID!) {
  pelicula(id: $id) {
    titulo
    anio
    director {
      nombre
    }
  }
}
```

En la sección **QUERY VARIABLES** (abajo a la izquierda):
```json
{
  "id": "1"
}
```

---

### Usar Variables en Mutations

```graphql
mutation AgregarNuevaPelicula(
  $titulo: String!
  $anio: Int!
  $genero: String!
  $directorId: ID!
) {
  agregarPelicula(
    titulo: $titulo
    anio: $anio
    genero: $genero
    directorId: $directorId
  ) {
    id
    titulo
    director {
      nombre
    }
  }
}
```

**Variables:**
```json
{
  "titulo": "Avatar",
  "anio": 2009,
  "genero": "Ciencia ficción",
  "directorId": "1"
}
```

---

### Explorar el Schema

En GraphiQL, en la esquina superior derecha, verás un botón **"< Docs"**.

Click para ver toda la documentación del schema automáticamente generada.

---

## 🧪 Flujo de Pruebas Recomendado

1. **Primero**: Ejecuta Query para obtener todas las películas
2. **Luego**: Ejecuta Query para obtener una película por ID
3. **Después**: Ejecuta una Mutation para agregar una película
4. **Finalmente**: Vuelve a ejecutar Query para ver la película añadida

---

## ⚠️ Errores Comunes

### Error: "Variable $id of type ID! was not provided"

- Olvida­ste proporcionar las variables
- Ve a QUERY VARIABLES y asegúrate de llenarlas correctamente

### Error: "Expected value to be a string"

- Olvidaste las comillas en argumentos string
- Correcto: `titulo: "Inception"`
- Incorrecto: `titulo: Inception`

### Error: "Invalid ID"

- El ID que proporcionaste no existe
- Intenta con IDs: "1", "2" o "3"

### Error: "Unknown field"

- Pediste un campo que no existe
- Consulta los Docs para ver qué campos están disponibles

---

## 🔗 URLs Importantes

- **GraphiQL Sandbox**: http://localhost:4000
- **Frontend Web**: http://localhost:5500
- **Documentación GraphQL**: https://graphql.org/learn/

---

**¡Ahora estás listo para explorar GraphQL!** 🚀
