# Guía de Testing - Flows Configurados y Listos

## 🔧 **Actualización Importante: Uso de Campo Title**

### ⚠️ **CORRECCIÓN NECESARIA EN TODOS LOS FLOWS:**

**Problema detectado**: En los flows se estaba usando `[Numero_x0020_de_x0020_coop]` pero debe usarse **`Title`** que es el campo estándar de SharePoint.

### 📝 **Cambios Requeridos en Power Automate:**

#### **Flow 1 - Autenticación: Filter Query a corregir:**
```
CAMBIAR DE:
[Numero_x0020_de_x0020_coop] eq '@{triggerBody()['codigo_cooperativa']}' and CodVerificador eq '@{triggerBody()['codigo_verificador']}'

CAMBIAR A:
Title eq '@{triggerBody()['codigo_cooperativa']}' and CodVerificador eq '@{triggerBody()['codigo_verificador']}'
```

#### **Flow 2 - Consulta: Filter Query a corregir:**
```
CAMBIAR DE:
[Numero_x0020_de_x0020_coop] eq '@{triggerBody()['codigo_cooperativa']}'

CAMBIAR A:
Title eq '@{triggerBody()['codigo_cooperativa']}'
```

#### **Flow 3 - Guardado: Filter Query a corregir:**
```
CAMBIAR DE:
[Numero_x0020_de_x0020_coop] eq '@{triggerBody()['cooperativa']['codigo']}'

CAMBIAR A:
Title eq '@{triggerBody()['cooperativa']['codigo']}'
```

#### **Flow 1 - Respuesta: Campo en JSON a corregir:**
```
CAMBIAR DE:
"code": "@{outputs('Compose_-_Cooperativa_Encontrada')?['Numero_x0020_de_x0020_coop']}"

CAMBIAR A:
"code": "@{outputs('Compose_-_Cooperativa_Encontrada')?['Title']}"
```

---

Los 3 flows de Power Automate están creados y las URLs ya están configuradas en el frontend:

### **Flows Activos:**
- **🔐 Autenticación**: `d4951cc773a048c9964ef65dfdd3c69c` ✅
- **🔍 Consulta de Datos**: `e980d91152364b8abdaf074cc89333f6` ✅  
- **💾 Guardado de Datos**: `5c5268b7ca894a09be1fb41effc24156` ✅

### **Frontend Actualizado:**
- ✅ URLs configuradas en `script.js`
- ✅ Funciones de consulta implementadas
- ✅ Precarga de datos lista
- ✅ Indicadores de edición implementados

## 🧪 **Plan de Testing Paso a Paso**

### **Fase 1: Verificar Flows con curl/Postman**

#### **Test 1.1: Flow de Autenticación**
```bash
curl -X POST "https://defaulta7cad06884854149bb950f323bdfa8.9e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/d4951cc773a048c9964ef65dfdd3c69c/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=tG24Qxrd_AUtjKiQR8D1lt2yvbOtZZNBtkYEXn9_aZI" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo_cooperativa": "3",
    "codigo_verificador": "51CYD"
  }'
```

**✅ Respuesta Esperada (200):**
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

**❌ Si hay error:**
- Verificar que la lista SharePoint existe
- Verificar Filter Query en el flow
- Verificar permisos del flow

#### **Test 1.2: Flow de Consulta (Sin datos previos)**
```bash
curl -X POST "https://defaulta7cad06884854149bb950f323bdfa8.9e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/e980d91152364b8abdaf074cc89333f6/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=SaU4EI--DvquBrXGb3DhTqSnTbb_8BGpse6Y6AImsUY" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo_cooperativa": "3"
  }'
```

**✅ Respuesta Esperada (404 - No hay datos previos):**
```json
{
    "success": false,
    "message": "No se encontraron datos previos para esta cooperativa"
}
```

#### **Test 1.3: Flow de Guardado**
```bash
curl -X POST "https://defaulta7cad06884854149bb950f323bdfa8.9e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/5c5268b7ca894a09be1fb41effc24156/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=_QA3lITPQ59jUXF-4byKGSQ_vce0Xb5vO3uHmLTf9f8" \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2025-09-06T10:00:00.000Z",
    "cooperativa": {
        "codigo": "3",
        "nombre": "Cooperativa Agropecuaria de Alcorta Ltda.",
        "votos": 1,
        "suplentes": 0,
        "car": "3",
        "carNombre": "Centro y Sur de Santa Fe"
    },
    "autoridades": {
        "secretario": "Juan Carlos Pérez TEST",
        "presidente": "María Elena González TEST"
    },
    "contacto": {
        "correoElectronico": "test@alcorta.com"
    },
    "titulares": [
        {
            "id": "titular-1",
            "nombre": "Carlos Rodríguez TEST",
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

**✅ Respuesta Esperada (200):**
```json
{
    "success": true,
    "message": "Registro actualizado exitosamente",
    "timestamp": "2025-09-06T10:00:00.000Z",
    "cooperativa": "3",
    "estado": "Completo"
}
```

#### **Test 1.4: Flow de Consulta (Con datos guardados)**
Repetir Test 1.2 después del guardado:

**✅ Respuesta Esperada (200 - Con datos):**
```json
{
    "success": true,
    "datos": {
        "timestamp": "2025-09-06T10:00:00.000Z",
        "autoridades": {
            "secretario": "Juan Carlos Pérez TEST",
            "presidente": "María Elena González TEST"
        },
        "contacto": {
            "correoElectronico": "test@alcorta.com"
        },
        "titulares": [
            {
                "id": "titular-1",
                "nombre": "Carlos Rodríguez TEST",
                "documento": "12345678",
                "orden": 1
            }
        ],
        "suplentes": [],
        "cartasPoder": []
    }
}
```

---

### **Fase 2: Testing en el Frontend**

#### **Test 2.1: Autenticación en la App**
1. **Abrir** `index.html` en el navegador
2. **Ingresar credenciales** de prueba:
   - Código: `3`
   - Verificador: `51CYD`
3. **Click** en "Continuar"

**✅ Resultado esperado:**
- Autenticación exitosa
- Muestra datos de la cooperativa
- Consulta automática de datos existentes
- Si hay datos previos → precarga y muestra indicador de edición
- Si no hay datos → formulario en blanco

#### **Test 2.2: Primer Registro (Modo Nuevo)**
Si no hay datos previos:
1. **Llenar autoridades**:
   - Secretario: "Juan Pérez Prueba"
   - Presidente: "María González Prueba"
2. **Llenar contacto**:
   - Email: "prueba@cooperativa.com"
3. **Agregar titular**:
   - Nombre: "Carlos Test"
   - Documento: "11111111"
4. **Enviar registro**

**✅ Resultado esperado:**
- Datos se envían correctamente
- Mensaje de éxito
- Datos se guardan en SharePoint

#### **Test 2.3: Edición de Registro (Modo Edición)**
1. **Salir** y volver a autenticarse con las mismas credenciales
2. **Verificar precarga**:
   - Autoridades precargadas
   - Email precargado
   - Titulares precargados
   - Indicador de "Editando registro existente" visible
3. **Modificar datos**:
   - Cambiar email a: "nuevo-email@cooperativa.com"
   - Agregar segundo titular
4. **Enviar cambios**

**✅ Resultado esperado:**
- Precarga funciona correctamente
- Indicador de edición visible
- Cambios se guardan
- Estado cambia a "Actualizado"

---

### **Fase 3: Verificación en SharePoint**

#### **Test 3.1: Verificar Datos en Lista**
1. **Ir a SharePoint** → Tu lista de cooperativas
2. **Buscar cooperativa código "3"**
3. **Verificar campos nuevos**:
   - `RegistroCompleto`: Verdadero
   - `FechaRegistro`: Fecha del primer registro
   - `FechaUltimaActualizacion`: Fecha del último cambio
   - `EstadoRegistro`: "Completo" o "Actualizado"
   - `SecretarioNombre`: Datos ingresados
   - `PresidenteNombre`: Datos ingresados
   - `CorreoRegistro`: Email actualizado
   - `TitularesJSON`: JSON con titulares
   - `VotosEfectivos`: Número correcto
   - `TotalTitulares`: Contador correcto

#### **Test 3.2: Verificar JSON**
Copiar contenido de `TitularesJSON` y verificar en JSON validator:

**✅ Formato esperado:**
```json
[
    {
        "id": "titular-1",
        "nombre": "Carlos Test",
        "documento": "11111111",
        "orden": 1
    }
]
```

---

### **Fase 4: Testing de Edge Cases**

#### **Test 4.1: Cooperativa Inexistente**
```bash
curl -X POST "[authEndpoint]" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo_cooperativa": "99999",
    "codigo_verificador": "XXXXX"
  }'
```

**✅ Esperado:** Error 401 "Credenciales incorrectas"

#### **Test 4.2: Código Verificador Incorrecto**
```bash
curl -X POST "[authEndpoint]" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo_cooperativa": "3",
    "codigo_verificador": "WRONG"
  }'
```

**✅ Esperado:** Error 401 "Credenciales incorrectas"

#### **Test 4.3: Múltiples Titulares y Suplentes**
Probar en frontend con:
- 5 titulares
- 3 suplentes  
- 2 cartas poder

**✅ Esperado:** Todos los datos se guardan correctamente en JSON

---

## 🔍 **Checklist de Validación**

### **Frontend:**
- [ ] Autenticación funciona con credenciales reales
- [ ] Consulta automática tras autenticación
- [ ] Precarga de datos cuando existen
- [ ] Indicador de edición visible
- [ ] Formularios se llenan correctamente
- [ ] Guardado envía datos completos
- [ ] Mensajes de error apropiados

### **Power Automate:**
- [ ] Flow de autenticación responde correctamente
- [ ] Flow de consulta maneja casos con/sin datos
- [ ] Flow de guardado actualiza SharePoint
- [ ] Logs de flows sin errores
- [ ] Timeouts configurados apropiadamente

### **SharePoint:**
- [ ] Columnas nuevas agregadas correctamente
- [ ] Datos se escriben en campos correctos
- [ ] JSON es válido y parseable
- [ ] Fechas se formatean correctamente
- [ ] Contadores se calculan bien

### **Integración:**
- [ ] Flujo completo: Login → Consulta → Precarga → Edición → Guardado
- [ ] Múltiples sesiones no interfieren
- [ ] Datos persisten entre sesiones
- [ ] Performance aceptable (< 5 segundos por operación)

---

## 🚨 **Troubleshooting**

### **Error: "CORS"**
- Verificar headers en Power Automate
- Configurar `Access-Control-Allow-Origin`

### **Error: "Flow not found"**
- Verificar URLs no tienen caracteres extra
- Verificar permisos del flow

### **Error: "Invalid JSON"**
- Verificar estructura del JSON enviado
- Revisar escapes de comillas en Power Automate

### **Error: "List not found"**
- Verificar nombre de la lista en flows
- Verificar permisos de SharePoint

### **Datos no se precargan:**
- Verificar flow de consulta
- Verificar nombres de columnas SharePoint
- Verificar parsing de JSON

---

## 🎯 **Próximo Paso**

**¡Ready for Testing!** Ejecutar Fase 1 (Tests con curl) para verificar que los flows funcionan correctamente antes de probar en el frontend.

¿Todo configurado? ¡Vamos a probarlo! 🚀
