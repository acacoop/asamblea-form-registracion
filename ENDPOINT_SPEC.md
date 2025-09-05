# Especificación del Endpoint de Autenticación

## Resumen
El frontend ahora consulta un endpoint HTTP para autenticar las cooperativas en lugar de usar un archivo CSV local. Este documento especifica cómo debe funcionar el endpoint que necesitás implementar.

## Endpoint de Autenticación

### URL
El endpoint debe configurarse en `script.js` en la variable:
```javascript
config.authEndpoint = "https://tu-dominio.com/api/auth/cooperativa"
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
  "codigo_cooperativa": "123",
  "codigo_verificador": "ABC123"
}
```

### Respuestas Esperadas

#### ✅ Autenticación Exitosa (200 OK)
```json
{
  "success": true,
  "cooperativa": {
    "code": "123",
    "cuit": "30-12345678-9",
    "name": "Cooperativa de Ejemplo",
    "votes": 15,
    "substitutes": 3,
    "CAR": "1",
    "CAR Nombre": "Región Norte",
    "codigo_verificador": "ABC123"
  }
}
```

#### ❌ Credenciales Incorrectas (401 Unauthorized)
```json
{
  "success": false,
  "message": "Credenciales incorrectas"
}
```

#### ❌ Error del Servidor (500 Internal Server Error)
```json
{
  "success": false,
  "message": "Error interno del servidor"
}
```

## Campos Requeridos de la Cooperativa

Los siguientes campos son obligatorios en la respuesta exitosa:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `code` | string | Código único de la cooperativa |
| `cuit` | string | CUIT de la cooperativa |
| `name` | string | Nombre de la cooperativa |
| `votes` | number | Cantidad de votos que tiene |
| `substitutes` | number | Cantidad de suplentes permitidos |
| `CAR` | string | Código de la región CAR |
| `CAR Nombre` | string | Nombre de la región CAR |
| `codigo_verificador` | string | Código verificador para autenticación |

## Manejo de Errores en el Frontend

El frontend ya está preparado para manejar los siguientes escenarios:

- **Error de red**: Mensaje "Error de conexión. Verifique su internet e intente nuevamente"
- **404 Not Found**: Mensaje "Servicio de autenticación no disponible"  
- **401/403**: Mensaje "Credenciales incorrectas"
- **Respuesta vacía**: Mensaje "Respuesta vacía del servidor"
- **JSON inválido**: Mensaje "Respuesta del servidor no válida"
- **Otros errores**: Mensaje personalizado con detalles del error

## Configuración

Para cambiar la URL del endpoint, modificá esta línea en `script.js`:

```javascript
const config = {
  // Endpoint de Power Automate para envío de datos
  apiEndpoint: "...",
  // Endpoint para autenticación de cooperativas (CAMBIAR ESTA URL)
  authEndpoint: "https://tu-dominio.com/api/auth/cooperativa",
  timeout: 30000,
};
```

## Seguridad

### Consideraciones de Implementación:
1. **HTTPS**: El endpoint DEBE usar HTTPS en producción
2. **CORS**: Configurar CORS para permitir peticiones desde el dominio del frontend
3. **Rate Limiting**: Implementar límites de peticiones para prevenir ataques
4. **Validación**: Validar formato de códigos de entrada
5. **Logs**: Registrar intentos de autenticación para auditoría

### Ejemplo de Headers CORS:
```
Access-Control-Allow-Origin: https://tu-frontend.com
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Accept
```

## Testing

Para probar el endpoint podés usar herramientas como:

### curl
```bash
curl -X POST https://tu-dominio.com/api/auth/cooperativa \
  -H "Content-Type: application/json" \
  -d '{"codigo_cooperativa":"123","codigo_verificador":"ABC123"}'
```

### Postman
Crear una petición POST con el JSON de prueba en el body.

## Migración desde CSV

Los datos que antes estaban en `data/cooperatives_con_car_codigos.csv` ahora deben estar en tu base de datos o sistema de backend. El formato del CSV era:

```
codigo,cuit,nombre,votos,suplentes,car,car_nombre;codigo_verificador
```

Ejemplo:
```
123,30-12345678-9,Cooperativa Ejemplo,15,3,1,Región Norte;ABC123
```

## Estado de la Implementación

✅ **Completado en el Frontend:**
- Función `autenticarConEndpoint()` implementada
- Manejo robusto de errores HTTP
- Parsing seguro de respuestas JSON
- Logging detallado para debugging
- Interfaz de usuario responsiva durante autenticación

🔄 **Pendiente de Implementación:**
- Crear el endpoint en el backend
- Configurar la URL correcta en `config.authEndpoint`
- Testing con datos reales

## Notas Adicionales

- Las funciones de carga de CSV están comentadas pero se mantienen como referencia
- El frontend no requiere más cambios una vez que tengas el endpoint funcionando
- Solo necesitás actualizar la URL en `config.authEndpoint`
