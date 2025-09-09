# Flow de Consulta de Datos - Configuración Completa Corregida

## 🔍 **Flow 2: Consulta de Datos Existentes - VERSIÓN CORREGIDA**

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
{
    "timestamp": "@{utcNow()}",
    "autoridades": {
        "secretario": "@{first(body('Get_items')?['value'])?['SecretarioNombre']}",
        "presidente": "@{first(body('Get_items')?['value'])?['PresidenteNombre']}"
    },
    "contacto": {
        "correoElectronico": "@{first(body('Get_items')?['value'])?['CorreoRegistro']}"
    },
    "titulares": "@{first(body('Get_items')?['value'])?['TitularesJSON']}",
    "suplentes": "@{first(body('Get_items')?['value'])?['SuplentesJSON']}",
    "cartasPoder": "@{first(body('Get_items')?['value'])?['CartasPoderJSON']}",
    "registroCompleto": "@{first(body('Get_items')?['value'])?['RegistroCompleto']}"
}
```

##### **Acción 3.2: Condition - Tiene Registro Completo**
```
@{outputs('Compose_-_Datos_Cooperativa')?['registroCompleto']} is equal to "True"
```

###### **SUB-RAMA SÍ - Tiene Datos de Registro:**

**Acción 3.2.1: Compose - Parsear Titulares**
```json
@json(outputs('Compose_-_Datos_Cooperativa')?['titulares'])
```

**Acción 3.2.2: Compose - Parsear Suplentes**
```json
@json(outputs('Compose_-_Datos_Cooperativa')?['suplentes'])
```

**Acción 3.2.3: Compose - Parsear Cartas Poder**
```json
@json(outputs('Compose_-_Datos_Cooperativa')?['cartasPoder'])
```

**Acción 3.2.4: Response - Datos Encontrados (200)**
```json
{
    "success": true,
    "datos": {
        "timestamp": "@{outputs('Compose_-_Datos_Cooperativa')?['timestamp']}",
        "autoridades": {
            "secretario": "@{first(body('Get_items')?['value'])?['SecretarioNombre']}",
            "presidente": "@{first(body('Get_items')?['value'])?['PresidenteNombre']}"
        },
        "contacto": {
            "correoElectronico": "@{first(body('Get_items')?['value'])?['CorreoRegistro']}"
        },
        "titulares": "@{string(outputs('Compose_-_Parsear_Titulares'))}",
        "suplentes": "@{string(outputs('Compose_-_Parsear_Suplentes'))}",
        "cartasPoder": "@{string(outputs('Compose_-_Parsear_Cartas_Poder'))}"
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

## 🔑 **Cambios Críticos Aplicados:**

### ✅ **1. Compose - Datos Cooperativa:**
- ✅ **Agregado**: `"registroCompleto": "@{first(body('Get_items')?['value'])?['RegistroCompleto']}"`
- ✅ **Objetos directos**: `autoridades` y `contacto` como objetos, no strings

### ✅ **2. Condition - Registro Completo:**
- ✅ **Corregido**: `is equal to "True"` (string, no boolean)

### ✅ **3. Compose - Parsear (Simplificados):**
- ✅ **Titulares**: `@json(outputs('Compose_-_Datos_Cooperativa')?['titulares'])`
- ✅ **Suplentes**: `@json(outputs('Compose_-_Datos_Cooperativa')?['suplentes'])`
- ✅ **Cartas Poder**: `@json(outputs('Compose_-_Datos_Cooperativa')?['cartasPoder'])`

### ✅ **4. Response Final:**
- ✅ **Autoridades**: Extraer propiedades → `"@{outputs('Compose_-_Datos_Cooperativa')?['autoridades']?['secretario']}"`
- ✅ **Contacto**: Extraer propiedades → `"@{outputs('Compose_-_Datos_Cooperativa')?['contacto']?['correoElectronico']}"`
- ✅ **Arrays**: CON `string()` → `"@{string(outputs('Compose_-_Parsear_Titulares'))}"`

---

## 🎯 **Resultado Esperado:**

```json
{
    "success": true,
    "datos": {
        "timestamp": "2025-09-06T21:30:00.000Z",
        "autoridades": {
            "secretario": "asd",
            "presidente": "asd"
        },
        "contacto": {
            "correoElectronico": "ebourdajorge@acacoop.com.ar"
        },
        "titulares": "[{\"id\":\"mf8qqwh5y795htjgzj\",\"nombre\":\"zxc\",\"documento\":\"123\",\"orden\":1},{\"id\":\"mf8qqybnaa2ljtn81o\",\"nombre\":\"zxczxczxc\",\"documento\":\"123123123\",\"orden\":2}]",
        "suplentes": "[{\"id\":\"mf8qr08p5bs4gg4ya4i\",\"nombre\":\"zxczxczx\",\"documento\":\"12312313\",\"orden\":1}]",
        "cartasPoder": "[{\"id\":\"mf8qr2fay1hrnv471hc\",\"poderdante\":{\"id\":\"mf8qqwh5y795htjgzj\",\"nombre\":\"zxc\",\"documento\":\"123\"},\"apoderado\":{\"id\":\"mf8qqybnaa2ljtn81o\",\"nombre\":\"zxczxczxc\",\"documento\":\"123123123\"},\"orden\":1}]"
    }
}
```

---

## 📋 **Checklist de Configuración:**

- [ ] **Compose - Datos Cooperativa**: Incluye `registroCompleto`
- [ ] **Condition**: Usa `"True"` como string
- [ ] **Parsear Titulares**: `@json(...['titulares'])`
- [ ] **Parsear Suplentes**: `@json(...['suplentes'])`
- [ ] **Parsear Cartas Poder**: `@json(...['cartasPoder'])`
- [ ] **Response autoridades**: Extraer propiedades individuales
- [ ] **Response contacto**: Extraer propiedades individuales
- [ ] **Response arrays**: CON `string()`

¡Con esta configuración el Flow debería funcionar perfectamente! 🎯
