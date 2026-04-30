# tp-graphql-peliculas

TP - Catálogo de Películas con GraphQL

## Estructura del Proyecto

```
tp-graphql-peliculas/
├── back/                   # Backend - Servidor GraphQL
│   ├── package.json
│   ├── server.js          # Punto de entrada
│   └── src/
│       ├── schema.js      # Definición del schema GraphQL
│       ├── resolvers.js   # Resolvers de queries y mutations
│       ├── data.js        # Datos mockeds (directores, películas)
│       └── config.js      # Configuración del servidor
├── front/                  # Frontend - Aplicación cliente
│   ├── package.json
│   ├── index.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── app.js        # Punto de entrada (listeners, inicialización)
│       ├── api.js        # Funciones de fetch a GraphQL
│       └── utils.js      # Funciones helper (getColor, getIniciales)
└── README.md
```

## Instalación y Ejecución

> Asegúrate de tener instalado Node.js antes de continuar. El backend y el frontend local requieren Node.js para ejecutar comandos `npm` y `npx`.

### Backend

```bash
cd back
npm install
npm start          # Ejecuta: node server.js
```

El servidor estará disponible en `http://localhost:4000/`

### Frontend

El frontend es una aplicación estática (HTML + CSS + JS). Puedes abrirlo de dos formas:

**Opción 1: Directamente en el navegador**
```bash
# Abre front/index.html en tu navegador (sin servidor)
# ⚠️ Nota: Esto puede generar errores de CORS con fetch
```

**Opción 2: Con un servidor local (recomendado)**

Si tienes Python instalado:
```bash
cd front
python -m http.server 5500
# Luego abre http://localhost:5500 en el navegador
```

O si tienes Node.js:
```bash
cd front
npx http-server . -p 5500
# Luego abre http://localhost:5500 en el navegador
```

## Requisitos

- Node.js 18+ (para el backend)
- Navegador moderno con soporte para ES6 modules
- Python 3+ O Node.js (para servir el frontend)

## Tecnologías

### Backend
- **Apollo Server**: Framework GraphQL
- **GraphQL**: Lenguaje de consulta

### Frontend
- **HTML5**: Estructura
- **CSS3**: Estilos
- **JavaScript (ES6 modules)**: Lógica

## Funcionalidades

✅ Listar todas las películas
✅ Ver detalles de una película
✅ Agregar nueva película
✅ Mostrar estadísticas (total películas, géneros)
✅ Interfaz dark mode moderna

## Notas de Desarrollo

- El backend usa ES6 modules (`"type": "module"` en package.json)
- El frontend usa imports ES6 (`import`, `export`)
- Los datos están en memoria (se pierden al reiniciar el servidor)
- Para producción, considerar añadir base de datos y autenticación
