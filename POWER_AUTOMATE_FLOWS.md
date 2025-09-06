# Power Automate - Flow para Consulta de Datos

## Resumen
Este documento proporciona la configuración paso a paso para crear el Flow de Power Automate que maneja la consulta de datos existentes de cooperativas.

## 📋 **Flow: "Consultar Datos Cooperativa"**

### **1. Trigger - HTTP Request**
```json
{
    "type": "object",
    "properties": {
        "codigo_cooperativa": {
            "type": "string",
            "title": "Código de Cooperativa",
            "description": "Código único de la cooperativa"
        }
    },
    "required": ["codigo_cooperativa"]
}
```

### **2. Acción: Get Items (SharePoint)**
- **Sitio**: Tu sitio de SharePoint
- **Lista**: `RegistrosAsambleaCooperativas`
- **Filtro Query**: `CodigoCoop eq '@{triggerBody()['codigo_cooperativa']}'`
- **Límite**: 1
- **Ordenar por**: TimestampRegistro (descendente)

### **3. Condición: Verificar si existen datos**
```
length(body('Get_items')?['value']) is greater than 0
```

#### **RAMA SÍ - Datos Encontrados:**

##### **3.1 Compose - Obtener Primer Item**
```json
@first(body('Get_items')?['value'])
```

##### **3.2 Compose - Parsear Titulares JSON**
```json
@json(outputs('Compose_-_Obtener_Primer_Item')?['TitularesJSON'])
```

##### **3.3 Compose - Parsear Suplentes JSON**
```json
@if(empty(outputs('Compose_-_Obtener_Primer_Item')?['SuplentesJSON']), json('[]'), json(outputs('Compose_-_Obtener_Primer_Item')?['SuplentesJSON']))
```

##### **3.4 Compose - Parsear Cartas Poder JSON**
```json
@if(empty(outputs('Compose_-_Obtener_Primer_Item')?['CartasPoderJSON']), json('[]'), json(outputs('Compose_-_Obtener_Primer_Item')?['CartasPoderJSON']))
```

##### **3.5 Response - Datos Encontrados (200)**
```json
{
    "success": true,
    "datos": {
        "timestamp": "@{outputs('Compose_-_Obtener_Primer_Item')?['TimestampRegistro']}",
        "autoridades": {
            "secretario": "@{outputs('Compose_-_Obtener_Primer_Item')?['SecretarioNombre']}",
            "presidente": "@{outputs('Compose_-_Obtener_Primer_Item')?['PresidenteNombre']}"
        },
        "contacto": {
            "correoElectronico": "@{outputs('Compose_-_Obtener_Primer_Item')?['CorreoElectronico']}"
        },
        "titulares": "@{outputs('Compose_-_Parsear_Titulares_JSON')}",
        "suplentes": "@{outputs('Compose_-_Parsear_Suplentes_JSON')}",
        "cartasPoder": "@{outputs('Compose_-_Parsear_Cartas_Poder_JSON')}"
    }
}
```

#### **RAMA NO - Sin Datos Previos:**

##### **3.6 Response - Sin Datos (404)**
```json
{
    "success": false,
    "message": "No se encontraron datos previos para esta cooperativa"
}
```

**Status Code**: 404

---

## 📋 **Flow: "Guardar Datos Cooperativa"**

### **1. Trigger - HTTP Request**
```json
{
    "type": "object",
    "properties": {
        "timestamp": {"type": "string"},
        "cooperativa": {
            "type": "object",
            "properties": {
                "codigo": {"type": "string"},
                "nombre": {"type": "string"},
                "votos": {"type": "integer"},
                "suplentes": {"type": "integer"},
                "car": {"type": "string"},
                "carNombre": {"type": "string"}
            }
        },
        "autoridades": {
            "type": "object", 
            "properties": {
                "secretario": {"type": "string"},
                "presidente": {"type": "string"}
            }
        },
        "contacto": {
            "type": "object",
            "properties": {
                "correoElectronico": {"type": "string"}
            }
        },
        "titulares": {"type": "array"},
        "suplentes": {"type": "array"},
        "cartasPoder": {"type": "array"},
        "resumen": {
            "type": "object",
            "properties": {
                "votosEfectivos": {"type": "integer"}
            }
        }
    }
}
```

### **2. Acción: Get Items (Verificar si existe)**
- **Sitio**: Tu sitio de SharePoint
- **Lista**: `RegistrosAsambleaCooperativas`
- **Filtro Query**: `CodigoCoop eq '@{triggerBody()['cooperativa']['codigo']}'`
- **Límite**: 1

### **3. Compose - Convertir Arrays a JSON**

#### **3.1 Titulares JSON String**
```json
@string(triggerBody()['titulares'])
```

#### **3.2 Suplentes JSON String**
```json
@string(triggerBody()['suplentes'])
```

#### **3.3 Cartas Poder JSON String**
```json
@string(triggerBody()['cartasPoder'])
```

### **4. Condición: Registro Existe**
```
length(body('Get_items')?['value']) is greater than 0
```

#### **RAMA SÍ - Actualizar Registro:**

##### **4.1 Update Item (SharePoint)**
- **Sitio**: Tu sitio de SharePoint
- **Lista**: `RegistrosAsambleaCooperativas`
- **ID**: `@{first(body('Get_items')?['value'])?['ID']}`
- **Campos**:
```json
{
    "Title": "@{triggerBody()['cooperativa']['codigo']}",
    "TimestampRegistro": "@{triggerBody()['timestamp']}",
    "EstadoRegistro": "Actualizado",
    "CodigoCoop": "@{triggerBody()['cooperativa']['codigo']}",
    "NombreCoop": "@{triggerBody()['cooperativa']['nombre']}",
    "VotosAsignados": "@{triggerBody()['cooperativa']['votos']}",
    "SuplentesPermitidos": "@{triggerBody()['cooperativa']['suplentes']}",
    "CodigoCAR": "@{triggerBody()['cooperativa']['car']}",
    "NombreCAR": "@{triggerBody()['cooperativa']['carNombre']}",
    "SecretarioNombre": "@{triggerBody()['autoridades']['secretario']}",
    "PresidenteNombre": "@{triggerBody()['autoridades']['presidente']}",
    "CorreoElectronico": "@{triggerBody()['contacto']['correoElectronico']}",
    "TitularesJSON": "@{outputs('Compose_-_Titulares_JSON_String')}",
    "SuplentesJSON": "@{outputs('Compose_-_Suplentes_JSON_String')}",
    "CartasPoderJSON": "@{outputs('Compose_-_Cartas_Poder_JSON_String')}",
    "VotosEfectivos": "@{triggerBody()['resumen']['votosEfectivos']}",
    "TotalTitulares": "@{length(triggerBody()['titulares'])}",
    "TotalSuplentes": "@{length(triggerBody()['suplentes'])}",
    "TotalCartasPoder": "@{length(triggerBody()['cartasPoder'])}"
}
```

#### **RAMA NO - Crear Nuevo Registro:**

##### **4.2 Create Item (SharePoint)**
- **Sitio**: Tu sitio de SharePoint
- **Lista**: `RegistrosAsambleaCooperativas`
- **Campos**: (Los mismos que en Update, pero con `EstadoRegistro: "Nuevo"`)

### **5. Response - Éxito (200)**
```json
{
    "success": true,
    "message": "Registro guardado exitosamente",
    "timestamp": "@{triggerBody()['timestamp']}",
    "cooperativa": "@{triggerBody()['cooperativa']['codigo']}"
}
```

---

## 🔧 **Configuración de URLs**

### **URLs de los Flows:**
Una vez creados los flows, obtendrás URLs como:

#### **Flow de Consulta:**
```
https://prod-xx.westus.logic.azure.com:443/workflows/xxxxxxxx/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxx
```

#### **Flow de Guardado:**
```
https://prod-xx.westus.logic.azure.com:443/workflows/yyyyyyyy/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=yyyyyyyyy
```

### **Actualizar en script.js:**
```javascript
const config = {
  // Flow para guardar datos (ya existente)
  apiEndpoint: "https://prod-xx.westus.logic.azure.com:443/workflows/yyyyyyyy/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=yyyyyyyyy",
  
  // Flow para autenticación (ya existente)
  authEndpoint: "https://prod-xx.westus.logic.azure.com:443/workflows/zzzzzzzz/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=zzzzzzzzz",
  
  // Flow para consulta de datos (NUEVO)
  consultarDatosEndpoint: "https://prod-xx.westus.logic.azure.com:443/workflows/xxxxxxxx/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxx",
  
  timeout: 30000,
};
```

---

## 🧪 **Testing de los Flows**

### **Test del Flow de Consulta:**

#### **Request de Prueba:**
```bash
curl -X POST "https://tu-flow-consulta-url" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo_cooperativa": "123"
  }'
```

#### **Respuesta Esperada (Con Datos):**
```json
{
    "success": true,
    "datos": {
        "timestamp": "2025-09-05T10:30:00.000Z",
        "autoridades": {
            "secretario": "Juan Carlos Pérez",
            "presidente": "María Elena González"
        },
        "contacto": {
            "correoElectronico": "contacto@cooperativaandes.com"
        },
        "titulares": [
            {
                "id": "titular-1",
                "nombre": "Carlos Rodríguez", 
                "documento": "12345678",
                "orden": 1
            }
        ],
        "suplentes": [],
        "cartasPoder": []
    }
}
```

#### **Respuesta Esperada (Sin Datos):**
```json
{
    "success": false,
    "message": "No se encontraron datos previos para esta cooperativa"
}
```

### **Test del Flow de Guardado:**

#### **Request de Prueba:**
```bash
curl -X POST "https://tu-flow-guardado-url" \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2025-09-05T14:30:00.000Z",
    "cooperativa": {
        "codigo": "123",
        "nombre": "Cooperativa Test",
        "votos": 10,
        "suplentes": 2,
        "car": "1",
        "carNombre": "Región Norte"
    },
    "autoridades": {
        "secretario": "Test Secretario",
        "presidente": "Test Presidente"
    },
    "contacto": {
        "correoElectronico": "test@test.com"
    },
    "titulares": [
        {
            "id": "titular-1",
            "nombre": "Test Titular",
            "documento": "12345678",
            "orden": 1
        }
    ],
    "suplentes": [],
    "cartasPoder": [],
    "resumen": {
        "votosEfectivos": 10
    }
  }'
```

---

## ⚠️ **Consideraciones Importantes**

### **Manejo de Errores:**
- Agregar `Try-Catch` scope en ambos flows
- Response con status 500 en caso de error
- Logging detallado para debugging

### **Seguridad:**
- Los flows solo aceptan HTTPS
- Validar formato de JSON en input
- Sanitizar strings antes de guardar en SharePoint

### **Performance:**
- Índice en `CodigoCoop` para búsquedas rápidas
- Límite de 1 item en consultas de verificación
- Timeout configurado en 30 segundos

### **Backup y Monitoreo:**
- Logs automáticos en Power Automate
- Alertas en caso de fallos
- Exportación periódica de SharePoint

---

## 🚀 **Pasos para Implementación**

1. **Crear la lista de SharePoint** usando `SHAREPOINT_STRUCTURE.md`
2. **Importar datos de ejemplo** usando `ejemplo-sharepoint-import.csv`
3. **Crear Flow de Consulta** siguiendo este documento
4. **Crear Flow de Guardado** siguiendo este documento
5. **Actualizar URLs** en `script.js`
6. **Testing completo** usando `TESTING_PERSISTENCE.md`
7. **Deploy a producción**

Una vez completados estos pasos, tendrás un sistema completamente funcional de persistencia de datos con SharePoint como backend.
