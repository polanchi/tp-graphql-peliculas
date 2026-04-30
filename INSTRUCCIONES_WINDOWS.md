# 🚀 Instrucciones para Ejecutar el Proyecto (Windows)

## Prerequisitos: Instalar Node.js

### 1️⃣ Descarga Node.js

1. Visita: **https://nodejs.org**
2. Descarga la versión **LTS** (Long Term Support)
3. Ejecuta el instalador `.msi`

### 2️⃣ Durante la Instalación

- ✅ Acepta los términos
- ✅ **IMPORTANTE**: Marca la opción **"Add to PATH"**
- ✅ Acepta todas las opciones por defecto
- ✅ Completa la instalación

### 3️⃣ Verifica la Instalación

**Abre PowerShell (Nueva ventana)**:
- Windows + X → Windows PowerShell
- O busca "PowerShell" en el menú Inicio

Ejecuta:
```powershell
node --version
npm --version
```

Deberías ver algo como:
```
v20.11.0
10.5.0
```

---

## Paso 1: Clonar o Descargar el Proyecto

Si aún no lo tienes, descarga/clona el proyecto en tu escritorio.

```powershell
cd Desktop
cd "TP INTERFACES\tp-graphql-peliculas"
```

---

## Paso 2: Configurar el Backend

```powershell
# Entra a la carpeta del backend
cd back

# Instala las dependencias
npm install

# Inicia el servidor (modo desarrollo con auto-reload)
npm run dev
```

**Resultado esperado:**
```
Servidor listo en http://localhost:4000/
```

**NO CIERRES ESTA VENTANA.** Mantén el servidor corriendo.

---

## Paso 3: Probar GraphQL con GraphiQL

1. Abre tu navegador en: **http://localhost:4000**
2. Verás una interfaz llamada **GraphiQL**
3. En el panel izquierdo, escribe una consulta

### Ejemplo 1: Obtener todas las películas

```graphql
query {
  peliculas {
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

Click en el botón ▶️ para ejecutar.

### Ejemplo 2: Agregar una película

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
    director {
      nombre
    }
  }
}
```

Verás la película agregada en la respuesta.

---

## Paso 4: Configurar el Frontend

**Abre otra terminal PowerShell (NO cierres la anterior)**

```powershell
# Navega al proyecto
cd Desktop
cd "TP INTERFACES\tp-graphql-peliculas"

# Entra a la carpeta del frontend
cd front

# Instala las dependencias
npm install

# Inicia el servidor frontend
npm start
```

**Resultado esperado:**
```
Starting up http-server, serving ./
Hit CTRL-C to stop the server
Available on:
  http://localhost:5500
```

**NO CIERRES ESTA VENTANA.**

---

## Paso 5: Abre la Aplicación

1. Abre tu navegador
2. Ve a: **http://localhost:5500**
3. Verás la aplicación con:
   - Panel de estadísticas
   - Tabla de películas
   - Formulario para agregar películas

---

## ✨ Funcionalidades

### Ver Películas
- La tabla se carga automáticamente
- Muestra: ID, Título, Año, Género, Director

### Agregar Película
1. Completa los campos del formulario
2. Selecciona un director
3. Click en "Agregar película"
4. La película aparece en la tabla automáticamente

---

## 🔥 Línea de Comandos Rápida

Si quieres ejecutar todo de nuevo:

**Terminal 1 (Backend):**
```powershell
cd Desktop/"TP INTERFACES/tp-graphql-peliculas"/back
npm run dev
```

**Terminal 2 (Frontend):**
```powershell
cd Desktop/"TP INTERFACES/tp-graphql-peliculas"/front
npm start
```

Luego abre: **http://localhost:5500**

---

## 🛠️ Solución de Problemas

### ❌ "npm no es reconocido"
- Cierra PowerShell completamente
- Abre UNA NUEVA ventana de PowerShell
- Node.js debe estar en el PATH

### ❌ Puerto 4000 o 5500 en uso
- Otro proceso está usando ese puerto
- Cierra aplicaciones que usen esos puertos
- O cambia el puerto en el código

### ❌ Error de CORS
- Asegúrate de que el backend esté en http://localhost:4000
- Apollo Server permite CORS por defecto
- Recarga la página del navegador

### ❌ La tabla está vacía
- Abre la consola del navegador (F12)
- Busca mensajes de error
- Verifica que ambos servidores estén corriendo

### ❌ El formulario no funciona
- Abre F12 → Consola
- Agrega una película
- Deberías ver errores si los hay
- Verifica que el backend esté accesible

---

## 📚 Recursos

- **GraphQL Learning**: https://graphql.org/learn/
- **Apollo Docs**: https://www.apollographql.com/docs/apollo-server
- **How to GraphQL**: https://www.howtographql.com/
- **GraphiQL Docs**: https://github.com/graphql/graphiql

---

## ✅ Checklist Final

- [ ] Node.js instalado (`node --version` funciona)
- [ ] `npm install` ejecutado en `/back`
- [ ] `npm install` ejecutado en `/front`
- [ ] Servidor backend corriendo en puerto 4000
- [ ] GraphiQL accesible en http://localhost:4000
- [ ] Servidor frontend corriendo en puerto 5500
- [ ] Aplicación visible en http://localhost:5500
- [ ] Tabla cargada con películas iniciales
- [ ] Formulario agrega películas correctamente

---

**¡Listo para trabajar!** 🎉
