# Power Automate Flows - Adaptados a Lista Existente

## Resumen
Estos flows están adaptados específicamente para trabajar con tu lista existente de SharePoint, conservando todos los campos actuales y agregando la funcionalidad de registro.

## 🔐 **Flow 1: Autenticación con Lista Existente**

### **Trigger: HTTP Request**
```json
{
    "type": "object",
    "properties": {
        "codigo_cooperativa": {
            "type": "string",
            "title": "Código de Cooperativa"
        },
        "codigo_verificador": {
            "type": "string", 
            "title": "Código Verificador"
        }
    },
    "required": ["codigo_cooperativa", "codigo_verificador"]
}
```

### **Acción 1: Get Items - Verificar Credenciales**
- **Site Address**: [Tu sitio SharePoint]
- **List Name**: [Listado de cooperativas]
- **Filter Query**: 
```
Title eq '@{triggerBody()['codigo_cooperativa']}' and CodVerificador eq '@{triggerBody()['codigo_verificador']}'
```
- **Top Count**: 1

### **Acción 2: Condition - Credenciales Válidas**
```
length(body('Get_items')?['value']) is greater than 0
```

#### **RAMA SÍ - Autenticación Exitosa:**

##### **Acción 3.1: Compose - Cooperativa Encontrada**
```json
@first(body('Get_items')?['value'])
```

##### **Acción 3.2: Response - Éxito (200)**
```json
{
    "success": true,
    "cooperativa": {
        "code": "@{outputs('Compose_-_Cooperativa_Encontrada')?['Title']}",
        "cuit": "@{outputs('Compose_-_Cooperativa_Encontrada')?['CUIT']}",
        "name": "@{outputs('Compose_-_Cooperativa_Encontrada')?['Nombre_x0020_completo']}",
        "votes": "@{int(outputs('Compose_-_Cooperativa_Encontrada')?['Total_x0020_votos'])}",
        "substitutes": "@{div(int(outputs('Compose_-_Cooperativa_Encontrada')?['Total_x0020_votos']), 3)}",
        "CAR": "@{outputs('Compose_-_Cooperativa_Encontrada')?['CAR']}",
        "CAR Nombre": "@{outputs('Compose_-_Cooperativa_Encontrada')?['CAR_x0020_Nombre']}",
        "codigo_verificador": "@{outputs('Compose_-_Cooperativa_Encontrada')?['CodVerificador']}"
    }
}
```

#### **RAMA NO - Credenciales Incorrectas:**

##### **Acción 3.3: Response - Error (401)**
```json
{
    "success": false,
    "message": "Credenciales incorrectas"
}
```
**Status Code**: 401

---

## 🔍 **Flow 2: Consulta de Datos Existentes**

### **Trigger: HTTP Request**
```json
{
    "type": "object",
    "properties": {
        "codigo_cooperativa": {
            "type": "string",
            "title": "Código de Cooperativa"
        }
    },
    "required": ["codigo_cooperativa"]
}
```

### **Acción 1: Get Items - Buscar Cooperativa**
- **Site Address**: [Tu sitio SharePoint]
- **List Name**: [Listado de cooperativas]
- **Filter Query**:
```
Title eq '@{triggerBody()['codigo_cooperativa']}'
```
- **Top Count**: 1

### **Acción 2: Condition - Cooperativa Existe**
```
length(body('Get_items')?['value']) is greater than 0
```

#### **RAMA SÍ - Cooperativa Encontrada:**

##### **Acción 3.1: Compose - Datos Cooperativa**
```json
@first(body('Get_items')?['value'])
```

##### **Acción 3.2: Condition - Tiene Registro Completo**
```
outputs('Compose_-_Datos_Cooperativa')?['RegistroCompleto'] is equal to true
```

###### **SUB-RAMA SÍ - Tiene Datos de Registro:**

**Acción 3.2.1: Compose - Parsear Titulares**
```json
@if(empty(outputs('Compose_-_Datos_Cooperativa')?['TitularesJSON']), json('[]'), json(outputs('Compose_-_Datos_Cooperativa')?['TitularesJSON']))
```

**Acción 3.2.2: Compose - Parsear Suplentes**
```json
@if(empty(outputs('Compose_-_Datos_Cooperativa')?['SuplentesJSON']), json('[]'), json(outputs('Compose_-_Datos_Cooperativa')?['SuplentesJSON']))
```

**Acción 3.2.3: Compose - Parsear Cartas Poder**
```json
@if(empty(outputs('Compose_-_Datos_Cooperativa')?['CartasPoderJSON']), json('[]'), json(outputs('Compose_-_Datos_Cooperativa')?['CartasPoderJSON']))
```

**Acción 3.2.4: Response - Datos Encontrados (200)**
```json
{
    "success": true,
    "datos": {
        "timestamp": "@{outputs('Compose_-_Datos_Cooperativa')?['FechaUltimaActualizacion']}",
        "autoridades": {
            "secretario": "@{coalesce(outputs('Compose_-_Datos_Cooperativa')?['SecretarioNombre'], '')}",
            "presidente": "@{coalesce(outputs('Compose_-_Datos_Cooperativa')?['PresidenteNombre'], '')}"
        },
        "contacto": {
            "correoElectronico": "@{coalesce(outputs('Compose_-_Datos_Cooperativa')?['CorreoRegistro'], outputs('Compose_-_Datos_Cooperativa')?['Mail_x0020_principal'])}"
        },
        "titulares": "@{outputs('Compose_-_Parsear_Titulares')}",
        "suplentes": "@{outputs('Compose_-_Parsear_Suplentes')}",
        "cartasPoder": "@{outputs('Compose_-_Parsear_Cartas_Poder')}"
    }
}
```

###### **SUB-RAMA NO - No Tiene Datos de Registro:**

**Acción 3.3.1: Response - Sin Datos Previos (404)**
```json
{
    "success": false,
    "message": "No se encontraron datos previos para esta cooperativa"
}
```
**Status Code**: 404

#### **RAMA NO - Cooperativa No Encontrada:**

##### **Acción 4.1: Response - Cooperativa No Existe (404)**
```json
{
    "success": false,
    "message": "Cooperativa no encontrada"
}
```
**Status Code**: 404

---

## 💾 **Flow 3: Guardar Datos de Registro**

### **Trigger: HTTP Request**
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

### **Acción 1: Get Items - Buscar Cooperativa**
- **Site Address**: [Tu sitio SharePoint]
- **List Name**: [Listado de cooperativas]
- **Filter Query**:
```
Title eq '@{triggerBody()['cooperativa']['codigo']}'
```
- **Top Count**: 1

### **Acción 2: Compose - Convertir Arrays a JSON**

#### **Acción 2.1: Titulares JSON String**
```json
@string(triggerBody()['titulares'])
```

#### **Acción 2.2: Suplentes JSON String**
```json
@string(triggerBody()['suplentes'])
```

#### **Acción 2.3: Cartas Poder JSON String**
```json
@string(triggerBody()['cartasPoder'])
```

### **Acción 3: Condition - Cooperativa Existe**
```
length(body('Get_items')?['value']) is greater than 0
```

#### **RAMA SÍ - Actualizar Registro:**

##### **Acción 4.1: Update Item**
- **Site Address**: [Tu sitio SharePoint]
- **List Name**: [Listado de cooperativas]
- **Id**: `@{first(body('Get_items')?['value'])?['ID']}`
- **Campos a actualizar**:

```json
{
    "RegistroCompleto": true,
    "FechaRegistro": "@{if(empty(first(body('Get_items')?['value'])?['FechaRegistro']), triggerBody()['timestamp'], first(body('Get_items')?['value'])?['FechaRegistro'])}",
    "FechaUltimaActualizacion": "@{triggerBody()['timestamp']}",
    "EstadoRegistro": "@{if(empty(first(body('Get_items')?['value'])?['FechaRegistro']), 'Completo', 'Actualizado')}",
    "SecretarioNombre": "@{triggerBody()['autoridades']['secretario']}",
    "PresidenteNombre": "@{triggerBody()['autoridades']['presidente']}",
    "CorreoRegistro": "@{triggerBody()['contacto']['correoElectronico']}",
    "TitularesJSON": "@{outputs('Compose_-_Titulares_JSON_String')}",
    "SuplentesJSON": "@{outputs('Compose_-_Suplentes_JSON_String')}",
    "CartasPoderJSON": "@{outputs('Compose_-_Cartas_Poder_JSON_String')}",
    "VotosEfectivos": "@{triggerBody()['resumen']['votosEfectivos']}",
    "TotalTitulares": "@{length(triggerBody()['titulares'])}",
    "TotalSuplentes": "@{length(triggerBody()['suplentes'])}",
    "TotalCartasPoder": "@{length(triggerBody()['cartasPoder'])}"
}
```

##### **Acción 4.2: Response - Éxito Actualización (200)**
```json
{
    "success": true,
    "message": "Registro actualizado exitosamente",
    "timestamp": "@{triggerBody()['timestamp']}",
    "cooperativa": "@{triggerBody()['cooperativa']['codigo']}",
    "estado": "Actualizado"
}
```

#### **RAMA NO - Cooperativa No Encontrada:**

##### **Acción 5.1: Response - Error Cooperativa No Existe (404)**
```json
{
    "success": false,
    "message": "Cooperativa no encontrada en el sistema"
}
```
**Status Code**: 404

---

## 🔧 **Configuración de Nombres de Columnas**

### **Mapeo de Nombres SharePoint:**
Cuando agregues las columnas a SharePoint, se generarán nombres internos. Aquí el mapeo:

| Nombre Columna | Nombre Interno SharePoint |
|----------------|---------------------------|
| `Title` | `Title` |
| `Nombre completo` | `Nombre_x0020_completo` |
| `D.E.` | `D_x002e_E_x002e_` |
| `D.E. Nombre` | `D_x002e_E_x002e__x0020_Nombre` |
| `CAR Nombre` | `CAR_x0020_Nombre` |
| `Ctro Contacto` | `Ctro_x0020_Contacto` |
| `Votos Consec` | `Votos_x0020_Consec` |
| `Votos Asoc` | `Votos_x0020_Asoc` |
| `Total votos` | `Total_x0020_votos` |
| `Mail principal` | `Mail_x0020_principal` |
| `Mail copia` | `Mail_x0020_copia` |
| `RegistroCompleto` | `RegistroCompleto` |
| `FechaRegistro` | `FechaRegistro` |
| `FechaUltimaActualizacion` | `FechaUltimaActualizacion` |
| `EstadoRegistro` | `EstadoRegistro` |
| `SecretarioNombre` | `SecretarioNombre` |
| `PresidenteNombre` | `PresidenteNombre` |
| `CorreoRegistro` | `CorreoRegistro` |
| `TitularesJSON` | `TitularesJSON` |
| `SuplentesJSON` | `SuplentesJSON` |
| `CartasPoderJSON` | `CartasPoderJSON` |
| `VotosEfectivos` | `VotosEfectivos` |
| `TotalTitulares` | `TotalTitulares` |
| `TotalSuplentes` | `TotalSuplentes` |
| `TotalCartasPoder` | `TotalCartasPoder` |

---

## 🧪 **Testing de los Flows**

### **Test Flow de Autenticación:**
```bash
curl -X POST "https://tu-flow-auth-url" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo_cooperativa": "3",
    "codigo_verificador": "51CYD"
  }'
```

**Respuesta esperada:**
```json
{
    "success": true,
    "cooperativa": {
        "code": "3",
        "cuit": "30529717233",
        "name": "Cooperativa Agropecuaria de Alcorta Ltda.",
        "votes": 1,
        "substitutes": 0,
        "CAR": "3",
        "CAR Nombre": "Centro y Sur de Santa Fe",
        "codigo_verificador": "51CYD"
    }
}
```

### **Test Flow de Consulta:**
```bash
curl -X POST "https://tu-flow-consulta-url" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo_cooperativa": "9"
  }'
```

### **Test Flow de Guardado:**
```bash
curl -X POST "https://tu-flow-guardado-url" \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2025-09-05T15:30:00.000Z",
    "cooperativa": {
        "codigo": "3",
        "nombre": "Cooperativa Agropecuaria de Alcorta Ltda.",
        "votos": 1,
        "suplentes": 0,
        "car": "3",
        "carNombre": "Centro y Sur de Santa Fe"
    },
    "autoridades": {
        "secretario": "Juan Carlos Pérez",
        "presidente": "María Elena González"
    },
    "contacto": {
        "correoElectronico": "contacto@alcorta.com"
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
    "cartasPoder": [],
    "resumen": {
        "votosEfectivos": 1
    }
  }'
```

---

## 📊 **Monitoreo y Reportes**

### **Consultas Útiles para Reportes:**

#### **Cooperativas con registro completo:**
```
RegistroCompleto eq true
```

#### **Registros por estado:**
```
EstadoRegistro eq 'Completo'
EstadoRegistro eq 'Actualizado' 
EstadoRegistro eq 'Pendiente'
```

#### **Registros por región CAR:**
```
CAR eq '3' and RegistroCompleto eq true
```

#### **Registros recientes (último día):**
```
FechaUltimaActualizacion gt datetime'2025-09-04T00:00:00Z'
```

#### **Cooperativas con más titulares:**
```
TotalTitulares gt 5
```

#### **Cooperativas con cartas poder:**
```
TotalCartasPoder gt 0
```

---

## 🚀 **Configuración Completada - URLs Actualizadas**

### ✅ **Flows Creados y URLs Configuradas:**

Los 3 flows de Power Automate han sido creados exitosamente y las URLs ya están actualizadas en el frontend:

```javascript
// En script.js - URLs YA CONFIGURADAS:
const config = {
    // Flow de Autenticación
    authEndpoint: "https://defaulta7cad06884854149bb950f323bdfa8.9e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/d4951cc773a048c9964ef65dfdd3c69c/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=tG24Qxrd_AUtjKiQR8D1lt2yvbOtZZNBtkYEXn9_aZI",
    
    // Flow de Consulta de Datos
    consultarDatosEndpoint: "https://defaulta7cad06884854149bb950f323bdfa8.9e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/e980d91152364b8abdaf074cc89333f6/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=SaU4EI--DvquBrXGb3DhTqSnTbb_8BGpse6Y6AImsUY",
    
    // Flow de Guardado de Datos
    apiEndpoint: "https://defaulta7cad06884854149bb950f323bdfa8.9e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/5c5268b7ca894a09be1fb41effc24156/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=_QA3lITPQ59jUXF-4byKGSQ_vce0Xb5vO3uHmLTf9f8",
    
    timeout: 30000,
};
```

### 🎯 **Próximos Pasos - Ready for Testing:**

1. ✅ **Flows creados** - Completado
2. ✅ **URLs configuradas** - Completado  
3. ✅ **Frontend actualizado** - Completado
4. 🔄 **Testing con datos reales** - Siguiente paso
5. 🔄 **Verificar funcionalidad completa** - Siguiente paso

¡Con esta adaptación conservas toda tu infraestructura existente y agregas la funcionalidad de registro de manera organizada!
