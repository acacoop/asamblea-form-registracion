# Formulario de Registro para Asamblea General Ordinaria 2025

Sistema web para el registro de delegados titulares, suplentes y cartas poder para la Asamblea General Ordinaria de la Asociación de Cooperativas Argentinas.

## Características

- **Selección de Cooperativa**: Carga automática desde archivo CSV con validación de datos
- **Gestión de Delegados**: Registro de titulares y suplentes con validación en tiempo real
- **Cartas Poder**: Sistema completo de delegación de votos con validaciones
- **Validación Integral**: Verificación de documentos, límites y reglas de negocio
- **Envío a API**: Generación de JSON y envío automático a endpoint HTTP
- **Backup Local**: Descarga automática de respaldo en formato JSON
- **Interfaz Responsive**: Diseño adaptable con logo oficial de ACA para dispositivos móviles y desktop

## Estructura del Proyecto

```
├── index.html               # Página principal con formularios
├── styles.css               # Estilos CSS con tema ACA
├── script.js                # Lógica JavaScript y validaciones
├── background.jpg           # Imagen de fondo
├── listado-cooperativas-actual.csv # Lista actual de cooperativas
├── data/                    # Datos del sistema
│   ├── cooperatives.csv           # Base de datos original (deprecated)
│   ├── cooperatives_con_car.csv   # Base de datos con información de CARs
│   └── cooperatives_con_car_codigos.csv # Base con códigos adicionales
├── docs/                    # Documentación técnica
│   ├── API_CONFIG.md              # Configuración de la API
│   ├── ENDPOINT_SPEC.md           # Especificación de endpoints
│   ├── SHAREPOINT_STRUCTURE.md    # Estructura de SharePoint
│   ├── EXCEL_STRUCTURE.md         # Estructura de Excel
│   ├── POWER_AUTOMATE_FLOWS.md    # Flujos de Power Automate
│   └── CONSULTA_DATOS_SPEC.md     # Especificación de consulta de datos
├── examples/                # Archivos de ejemplo
│   ├── ejemplo-json.json          # Ejemplo de estructura JSON
│   ├── ejemplo-lista-adaptada.csv # Ejemplo de lista adaptada
│   └── ejemplo-sharepoint-import.csv # Ejemplo de importación a SharePoint
├── tests/                   # Archivos de prueba
│   ├── test-consulta*.json        # Pruebas de consulta
│   ├── test-guardado*.json        # Pruebas de guardado
│   └── test-consulta-frontend.html # Prueba de frontend
├── fonts/                   # Fuentes tipográficas
└── README.md               # Este archivo
```

## Funcionalidades Principales

### 1. Gestión de Cooperativas
- Carga automática desde CSV con datos de CAR
- **Filtro por CAR**: Selector para filtrar cooperativas por región
- Validación de código, votos y suplentes disponibles
- Restricciones basadas en cantidad de votos y suplentes configurados

### 2. Registro de Delegados
- **Titulares**: Hasta 6 delegados por cooperativa (limitado por votos)
- **Suplentes**: Hasta el número configurado por cooperativa
- Validación de nombres (solo letras) y documentos (solo números)
- Verificación de duplicados

### 3. Sistema de Cartas Poder
- Delegación de votos entre titulares
- Máximo 2 cartas poder por apoderado
- Validaciones de ciclos y conflictos
- Cálculo automático de votos efectivos

### 4. Integración API
- Generación automática de JSON estructurado
- Envío HTTP POST con manejo de errores
- Timeout configurable (30 segundos)
- Backup automático antes del envío

## Configuración

### Endpoint API

Para configurar el endpoint donde se enviarán los datos:

1. Edita `script.js` y modifica la configuración:
```javascript
const config = {
    apiEndpoint: 'https://tu-servidor.com/api/registro-asamblea',
    timeout: 30000
};
```

2. Consulta `API_CONFIG.md` para detalles completos de implementación

### Estructura de Datos

El sistema genera JSON con esta estructura:
- `timestamp`: Marca de tiempo ISO
- `cooperativa`: Datos completos incluyendo CAR y límites de suplentes
- `titulares`: Array de delegados titulares
- `suplentes`: Array de delegados suplentes
- `cartasPoder`: Array de delegaciones de voto
- `resumen`: Totales y votos efectivos

Ver `ejemplo-json.json` para un ejemplo completo.

## Uso

1. **Seleccionar CAR**: Elegir la región de la lista desplegable
2. **Seleccionar Cooperativa**: Elegir de las cooperativas filtradas por CAR
3. **Agregar Titulares**: Mínimo 1, máximo según votos disponibles
4. **Agregar Suplentes**: Opcional, máximo según configuración de la cooperativa
5. **Configurar Cartas Poder**: Opcional, para delegación de votos
6. **Validar y Guardar**: El sistema valida y envía a la API

## Validaciones

- **CAR**: Obligatorio para filtrar cooperativas
- **Cooperativa**: Obligatoria para habilitar funciones
- **Titulares**: Nombres válidos, documentos únicos
- **Suplentes**: Sin duplicados con titulares, límite por configuración
- **Cartas Poder**: Sin ciclos, límites respetados
- **Límites**: Basados en votos y configuración de suplentes de la cooperativa

## Tecnologías

- **HTML5**: Estructura semántica
- **CSS3**: Diseño responsive con variables CSS
- **JavaScript ES6+**: Lógica de aplicación y validaciones
- **Fetch API**: Comunicación HTTP
- **CSV**: Base de datos de cooperativas

## Requisitos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexión a internet para envío de datos
- JavaScript habilitado

## Desarrollo

Para modificar o extender el sistema:

1. **Estilos**: Editar `styles.css` (variables CSS en `:root`)
2. **Lógica**: Modificar `script.js` (funciones modulares)
3. **Cooperativas**: Actualizar `data/cooperatives_con_car.csv`
4. **API**: Configurar según documentación en `API_CONFIG.md`

## Notas Técnicas

- **Backup Automático**: Se descarga JSON antes del envío
- **Logs de Consola**: Información detallada para debugging
- **Manejo de Errores**: Mensajes de usuario amigables
- **Performance**: Validaciones en tiempo real sin bloqueos
