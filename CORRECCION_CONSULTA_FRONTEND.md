# 🔧 Corrección: Flow de Consulta no recibe requests del frontend

## 🚨 **PROBLEMA IDENTIFICADO:**

**El frontend intenta consultar datos después de la autenticación, pero el Flow de Consulta no muestra actividad en Power Automate.**

---

## 📊 **SÍNTOMAS OBSERVADOS:**

### **✅ Lo que SÍ funciona:**
- Autenticación de cooperativa 162 exitosa
- Información básica se muestra correctamente
- Flow de Guardado funciona (después de corrección)

### **❌ Lo que NO funciona:**
- Flow de Consulta no recibe requests del frontend
- Sin actividad visible en Power Automate
- Formularios no se pre-cargan con datos existentes

---

## 🔍 **POSIBLES CAUSAS:**

### **1. Problema de Encoding (más probable):**
Similar al problema del Flow de Guardado, las requests pueden fallar por encoding de caracteres.

### **2. Secuencia de Timing:**
El frontend puede estar enviando la consulta antes de que se complete la actualización de `RegistroCompleto`.

### **3. Error en el JSON de consulta:**
La estructura del JSON puede no coincidir con el schema esperado.

---

## ✅ **CORRECCIONES APLICADAS:**

### **1. Normalización de datos en consulta:**
```javascript
// ANTES:
body: JSON.stringify({
  codigo_cooperativa: codigoCooperativa
})

// DESPUÉS:
const consultaData = { codigo_cooperativa: codigoCooperativa };
const normalizedData = normalizeObject(consultaData);
body: JSON.stringify(normalizedData)
```

### **2. Content-Type mejorado:**
```javascript
headers: {
  'Content-Type': 'application/json; charset=utf-8',  // Charset explícito
  'Accept': 'application/json'
}
```

### **3. Logging mejorado:**
```javascript
console.log('📤 Enviando consulta:', JSON.stringify(normalizedData));
```

---

## 🧪 **TESTING PARALELO:**

### **Test 1: PowerShell (verificar Flow directamente)**
```powershell
$consultaBody = '{"codigo_cooperativa": "162"}'
Invoke-WebRequest -Uri "URL_FLOW_CONSULTA" -Method POST -Body $consultaBody -ContentType "application/json; charset=utf-8"
```

### **Test 2: Frontend (con correcciones aplicadas)**
1. Refrescar página para cargar script.js corregido
2. Autenticar cooperativa 162
3. Verificar logs de consola:
   - `🔍 Consultando datos existentes para cooperativa: 162`
   - `📤 Enviando consulta: {"codigo_cooperativa":"162"}`
   - `🌐 Respuesta de consulta de datos:`

---

## 📋 **RESULTADOS ESPERADOS:**

### **Si PowerShell funciona:**
```json
{
  "success": true,
  "datos": {
    "timestamp": "2025-09-06T19:37:23.681Z",
    "autoridades": {
      "secretario": "Secretario",
      "presidente": "Presidente"
    },
    "contacto": {
      "correoElectronico": "ebourdajorge@acacoop.com.ar"
    },
    "titulares": [...],
    "suplentes": [...],
    "cartasPoder": [...]
  }
}
```

### **Si PowerShell aún falla:**
- Verificar que `RegistroCompleto = true` se actualizó correctamente
- Re-ejecutar Flow de Guardado si es necesario

### **Si Frontend funciona:**
- Formularios se pre-cargan automáticamente
- Usuario ve datos existentes para editar
- Campos de autoridades, titulares, suplentes ya poblados

---

## 🎯 **DIAGNÓSTICO EN PROGRESO:**

### **Paso 1: ✅ Correcciones aplicadas al frontend**
- Normalización de encoding
- Content-Type mejorado
- Logging detallado

### **Paso 2: 🔄 Testing con PowerShell**
- Verificar si Flow de Consulta funciona directamente
- Confirmar estado de `RegistroCompleto`

### **Paso 3: 🔄 Testing con Frontend**
- Probar autenticación con correcciones
- Verificar logs de consola
- Confirmar pre-carga de datos

---

## 🚀 **OBJETIVO FINAL:**

**Una vez resuelto, el flujo completo será:**

1. **Autenticación** → ✅ Cooperativa validada
2. **Consulta automática** → ✅ Datos existentes recuperados
3. **Pre-carga** → ✅ Formularios poblados
4. **Edición** → ✅ Usuario puede modificar
5. **Guardado** → ✅ Datos actualizados

**¡Estamos muy cerca del sistema 100% funcional!** 🎯
