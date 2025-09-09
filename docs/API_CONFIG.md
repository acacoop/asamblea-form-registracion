# Configuración de API - Registro de Asamblea

## Configuración del Endpoint

Para configurar el endpoint donde se enviarán los datos del formulario, sigue estos pasos:

### 1. Modificar la configuración en script.js

Abre el archivo `script.js` y busca la configuración al inicio del archivo:

```javascript
// Configuración del endpoint
const config = {
    // Cambia esta URL por tu endpoint real
    apiEndpoint: 'https://tu-endpoint-aqui.com/api/registro-asamblea',
    timeout: 30000 // 30 segundos
};
```

Reemplaza `'https://tu-endpoint-aqui.com/api/registro-asamblea'` por la URL de tu endpoint real.

### 2. Estructura del JSON que se envía

El sistema genera un JSON con la siguiente estructura:

```json
{
    "timestamp": "2025-09-01T12:00:00.000Z",
    "cooperativa": {
        "codigo": "123",
        "nombre": "Cooperativa Ejemplo",
        "votos": 5,
        "suplentes": 5,
        "car": 4,
        "carNombre": "Norte de Buenos Aires"
    },
    "titulares": [
        {
            "id": "unique_id_1",
            "nombre": "Juan Pérez",
            "documento": "12345678",
            "orden": 1
        }
    ],
    "suplentes": [
        {
            "id": "unique_id_2",
            "nombre": "María García",
            "documento": "87654321",
            "orden": 1
        }
    ],
    "cartasPoder": [
        {
            "id": "unique_id_3",
            "poderdante": {
                "id": "unique_id_1",
                "nombre": "Juan Pérez",
                "documento": "12345678"
            },
            "apoderado": {
                "id": "unique_id_4",
                "nombre": "Carlos López",
                "documento": "11223344"
            },
            "orden": 1
        }
    ],
    "resumen": {
        "totalTitulares": 6,
        "totalSuplentes": 3,
        "totalCartasPoder": 2,
        "votosEfectivos": 5
    }
}
```

### 3. Especificaciones del Endpoint

Tu endpoint debe:

- **Método**: POST
- **Content-Type**: application/json
- **Accept**: application/json
- **Timeout**: 30 segundos

#### Respuesta esperada del servidor

**Respuesta exitosa (HTTP 200):**
```json
{
    "status": "success",
    "message": "Registro guardado exitosamente",
    "id": "unique_registration_id",
    "timestamp": "2025-09-01T12:00:00.000Z"
}
```

**Respuesta de error (HTTP 4xx/5xx):**
```json
{
    "status": "error",
    "message": "Descripción del error",
    "code": "ERROR_CODE"
}
```

### 4. Funcionalidades adicionales

#### Backup automático
El sistema descarga automáticamente un archivo JSON con los datos como backup local antes de enviar al servidor.

#### Logs de consola
Todos los datos y respuestas se registran en la consola del navegador para debugging.

#### Manejo de errores
- Timeout de conexión
- Errores HTTP
- Errores de red
- Validación de respuesta

### 5. Ejemplo de implementación del servidor (Node.js/Express)

```javascript
app.post('/api/registro-asamblea', (req, res) => {
    try {
        const registroData = req.body;
        
        // Validar datos
        if (!registroData.cooperativa || !registroData.titulares) {
            return res.status(400).json({
                status: 'error',
                message: 'Datos incompletos'
            });
        }
        
        // Guardar en base de datos
        const savedRecord = await saveToDatabase(registroData);
        
        // Respuesta exitosa
        res.json({
            status: 'success',
            message: 'Registro guardado exitosamente',
            id: savedRecord.id,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error al procesar registro:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
});
```

### 6. Consideraciones de seguridad

- Implementa autenticación si es necesario
- Valida todos los datos en el servidor
- Usa HTTPS en producción
- Implementa rate limiting para prevenir spam
- Registra los accesos para auditoría

### 7. Testing

Para probar la integración, puedes usar herramientas como:
- Postman
- curl
- Thunder Client (VS Code)

Ejemplo con curl:
```bash
curl -X POST \
  https://tu-endpoint.com/api/registro-asamblea \
  -H 'Content-Type: application/json' \
  -d '{"timestamp":"2025-09-01T12:00:00.000Z","cooperativa":{"codigo":"123","nombre":"Test","votos":1,"suplentes":1,"car":4,"carNombre":"Norte de Buenos Aires"},"titulares":[{"id":"test","nombre":"Test User","documento":"12345678","orden":1}],"suplentes":[],"cartasPoder":[],"resumen":{"totalTitulares":1,"totalSuplentes":0,"totalCartasPoder":0,"votosEfectivos":1}}'
```
