# ⚡ INICIO RÁPIDO

## 📋 Resumen del Proyecto

✅ **Servidor GraphQL** - Apollo Server en puerto 4000  
✅ **Cliente Web** - HTML + CSS + JavaScript en puerto 5500  
✅ **Catálogo de Películas** - Listar, ver detalles y agregar películas  
✅ **GraphQL Explorer** - GraphiQL para probar operaciones  

---

## 🚀 Empezar en 5 Minutos

### Paso 0: Instala Node.js (si no lo tienes)

**Si ya lo tienes**, salta al Paso 1.

1. Descarga: https://nodejs.org (versión LTS)
2. Ejecuta el instalador
3. Marca "Add to PATH" durante la instalación
4. Abre una **NUEVA** terminal PowerShell

Verifica:
```powershell
node --version
npm --version
```

### Paso 1: Instala Backend

```powershell
cd back
npm install
```

### Paso 2: Inicia Backend

```powershell
npm run dev
```

**Debes ver:**
```
Servidor listo en http://localhost:4000/
```

### Paso 3: En OTRA terminal, instala Frontend

```powershell
cd front
npm install
```

### Paso 4: Inicia Frontend

```powershell
npm start
```

**Debes ver:**
```
Available on:
  http://localhost:5500
```

### Paso 5: Abre en el navegador

- **GraphQL Editor**: http://localhost:4000
- **Aplicación Web**: http://localhost:5500

---

## 📚 Archivos Importantes

| Archivo | Propósito |
|---|---|
| **README.md** | Documentación completa del proyecto |
| **INSTRUCCIONES_WINDOWS.md** | Instrucciones detalladas para Windows |
| **REFERENCIA_GRAPHQL.md** | Ejemplos de queries y mutations |
| **VERIFICACION.md** | Checklist de verificación |

---

## 🔥 Comandos Básicos

**Backend:**
```powershell
cd back
npm install       # Instala dependencias
npm run dev       # Inicia con auto-reload
npm start         # Inicia sin auto-reload
```

**Frontend:**
```powershell
cd front
npm install       # Instala dependencias
npm start         # Inicia servidor http en puerto 5500
```

---

## ✨ Funcionalidades

### GraphQL (GraphiQL)
- ✅ Ver todas las películas
- ✅ Ver película por ID
- ✅ Agregar nueva película
- ✅ Información del director

### Aplicación Web
- ✅ Tabla dinámica de películas
- ✅ Estadísticas (total, géneros)
- ✅ Formulario para agregar
- ✅ Actualización en tiempo real

---

## 🛠️ Tecnologías

- **Node.js** - Runtime
- **Apollo Server** - GraphQL server
- **GraphQL** - Query language
- **HTML5 + CSS3 + JS** - Frontend

---

## 📞 Ayuda Rápida

**P: npm no funciona**
R: Instala Node.js de https://nodejs.org

**P: Puerto 4000 en uso**
R: Cierra otras aplicaciones o cambia el puerto en `src/config.js`

**P: Tabla vacía en el navegador**
R: Verifica que ambos servidores estén corriendo

**P: Botón no agrega película**
R: Abre F12 → Consola y busca errores

---

## 📖 Para Aprender Más

- [GraphQL.org](https://graphql.org)
- [Apollo Docs](https://www.apollographql.com/docs/apollo-server)
- [How to GraphQL](https://www.howtographql.com)

---

**¡Listo! Ahora ejecuta los comandos de arriba.** 🎉
