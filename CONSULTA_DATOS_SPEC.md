# Especificación del Endpoint de Consulta de Datos

## Resumen
Esta funcionalidad permite que las cooperativas editen sus registros previamente guardados. Cuando una cooperativa se autentica, el sistema consulta si ya tiene datos guardados y los precarga en el formulario para edición.

## Endpoint de Consulta de Datos Existentes

### URL
El endpoint debe configurarse en `script.js` en la variable:
```javascript
config.consultarDatosEndpoint = "https://tu-dominio.com/api/consultar-registro"
```

### Método HTTP
`POST`

### Headers de la Petición
```
Content-Type: application/json
Accept: application/json
```

### Cuerpo de la Petición
```json
{
  "codigo_cooperativa": "123"
}
```

### Respuestas Esperadas

#### ✅ Datos Encontrados (200 OK)
```json
{
  "success": true,
  "datos": {
    "timestamp": "2025-09-05T10:30:00.000Z",
    "autoridades": {
      "secretario": "Juan Pérez",
      "presidente": "María González"
    },
    "contacto": {
      "correoElectronico": "contacto@cooperativa.com"
    },
    "titulares": [
      {
        "nombre": "Carlos Rodríguez",
        "documento": "12345678"
      },
      {
        "nombre": "Ana Martínez",
        "documento": "87654321"
      }
    ],
    "suplentes": [
      {
        "nombre": "Pedro López",
        "documento": "11223344"
      }
    ],
    "cartasPoder": [
      {
        "desde": "titular-id-1",
        "hacia": "titular-id-2"
      }
    ]
  }
}
```

#### ℹ️ Sin Datos Previos (404 Not Found O 200 con success: false)
```json
{
  "success": false,
  "message": "No se encontraron datos previos para esta cooperativa"
}
```

#### ❌ Error del Servidor (500 Internal Server Error)
```json
{
  "success": false,
  "message": "Error interno del servidor"
}
```

## Flujo de Trabajo

### 1. **Autenticación Exitosa**
- Usuario ingresa código de cooperativa y verificador
- Sistema valida credenciales contra el endpoint de autenticación
- Si es exitoso, procede al paso 2

### 2. **Consulta de Datos Existentes**
- Sistema envía código de cooperativa al endpoint de consulta
- Si hay datos previos → Precarga formulario (modo edición)
- Si no hay datos → Formulario en blanco (modo nuevo registro)

### 3. **Precarga de Datos (si existen)**
- Autoridades: Secretario y Presidente
- Contacto: Correo electrónico
- Titulares: Lista completa con nombres y documentos
- Suplentes: Lista completa con nombres y documentos
- Cartas Poder: Delegaciones entre titulares
- Muestra indicador visual de "Editando registro existente"

### 4. **Guardado/Actualización**
- Usuario modifica datos según necesite
- Al guardar, envía datos completos al endpoint principal
- Sistema actualiza o crea nuevo registro

## Estructura de Datos Completa

### Objeto `datos` en la respuesta:

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `timestamp` | string | Fecha y hora del último guardado | No |
| `autoridades` | object | Datos de autoridades | Sí |
| `autoridades.secretario` | string | Nombre del secretario | Sí |
| `autoridades.presidente` | string | Nombre del presidente | Sí |
| `contacto` | object | Información de contacto | Sí |
| `contacto.correoElectronico` | string | Email de contacto | Sí |
| `titulares` | array | Lista de titulares | Sí |
| `titulares[].nombre` | string | Nombre del titular | Sí |
| `titulares[].documento` | string | Documento del titular | Sí |
| `suplentes` | array | Lista de suplentes | No |
| `suplentes[].nombre` | string | Nombre del suplente | Sí |
| `suplentes[].documento` | string | Documento del suplente | Sí |
| `cartasPoder` | array | Lista de cartas poder | No |
| `cartasPoder[].desde` | string | ID del titular que delega | Sí |
| `cartasPoder[].hacia` | string | ID del titular que recibe | Sí |

## Implementación en Power Automate

### Flujo Sugerido:

1. **Trigger**: HTTP Request (POST)
2. **Parse JSON**: Parsear `codigo_cooperativa`
3. **Condition**: Verificar si existe registro para esa cooperativa
4. **Get Data**: Obtener datos desde SharePoint/Excel/DB
5. **Response**: Devolver datos o "sin datos previos"

### Ejemplo de Almacenamiento en Excel:

| Columna A | Columna B | Columna C | ... |
|-----------|-----------|-----------|-----|
| codigo_cooperativa | timestamp | secretario | presidente |
| 123 | 2025-09-05T10:30:00.000Z | Juan Pérez | María González |

### O en SharePoint List:
- **Título**: Código de cooperativa
- **Timestamp**: Fecha y hora
- **DatosJSON**: JSON completo como texto
- **Secretario**: Texto
- **Presidente**: Texto
- **CorreoElectronico**: Texto

## Configuración

Para cambiar la URL del endpoint, modificá esta línea en `script.js`:

```javascript
const config = {
  // ... otros endpoints ...
  consultarDatosEndpoint: "https://tu-dominio.com/api/consultar-registro",
  // ... resto de configuración ...
};
```

## Ejemplo de Testing

### Con curl:
```bash
# Consultar datos existentes
curl -X POST https://tu-dominio.com/api/consultar-registro \
  -H "Content-Type: application/json" \
  -d '{"codigo_cooperativa":"123"}'
```

### Respuesta esperada (con datos):
```json
{
  "success": true,
  "datos": {
    "autoridades": {
      "secretario": "Juan Pérez",
      "presidente": "María González"
    },
    "contacto": {
      "correoElectronico": "contacto@cooperativa.com"
    },
    "titulares": [...],
    "suplentes": [...],
    "cartasPoder": [...]
  }
}
```

## Estado de la Implementación

✅ **Completado en el Frontend:**
- Función `consultarDatosExistentes()` implementada
- Función `precargarDatosEnFormulario()` completa
- Indicador visual de edición
- Integración con flujo de autenticación
- Manejo de errores robusto
- Precarga de todos los tipos de datos

🔄 **Pendiente de Implementación:**
- Crear el endpoint en Power Automate
- Configurar almacenamiento de datos (SharePoint/Excel/DB)
- Configurar la URL correcta en `config.consultarDatosEndpoint`
- Testing con datos reales

## Notas Adicionales

- El frontend maneja graciosamente cuando no hay datos previos
- Los errores de consulta no afectan el flujo principal
- Los datos se precargan automáticamente al acceder al formulario
- El usuario puede ver claramente que está editando datos existentes
- Todos los campos son editables independientemente de los datos precargados
