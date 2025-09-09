# 🔧 Corrección: Error HTTP 400 en Flow de Guardado

## 🚨 **PROBLEMA IDENTIFICADO:**

**El Flow de Guardado devuelve HTTP 400 (Bad Request) y no aparece actividad en Power Automate.**

---

## 📊 **ANÁLISIS DEL ERROR:**

### **Síntomas:**
- ✅ Frontend genera el JSON correctamente
- ✅ Flow de Autenticación funciona (cooperativa 162 autenticada)
- ❌ Flow de Guardado devuelve HTTP 400
- ❌ No hay actividad visible en Power Automate

### **JSON Problemático Enviado:**
```json
{
  "cooperativa": {
    "codigo": "162",
    "nombre": "La Alianza, Agrícola Ganadera Ltda.",
    "votos": "2",      // ❌ STRING - debería ser NUMBER
    "suplentes": "2",  // ❌ STRING - debería ser NUMBER
    "car": "6",        // ❌ STRING - debería ser NUMBER
    "carNombre": "SO Bs. Aires, La Pampa y Río Negro"
  }
}
```

### **Causa Raíz:**
El **schema del Flow de Guardado** espera estos campos como **integers**:

```json
{
  "cooperativa": {
    "votos": {"type": "integer"},      // ❌ Recibiendo string
    "suplentes": {"type": "integer"},  // ❌ Recibiendo string
    "car": {"type": "integer"}         // ❌ Recibiendo string
  }
}
```

---

## ✅ **SOLUCIÓN APLICADA:**

### **Corrección en script.js - Función generateFormDataJSON():**

#### **❌ ANTES (INCORRECTO):**
```javascript
cooperativa: {
  codigo: state.cooperativaSeleccionada?.code || "",
  nombre: state.cooperativaSeleccionada?.name || "",
  votos: state.cooperativaSeleccionada?.votes || 0,        // String
  suplentes: state.cooperativaSeleccionada?.substitutes || 0, // String
  car: state.cooperativaSeleccionada?.CAR || 0,           // String
  carNombre: state.cooperativaSeleccionada?.["CAR Nombre"] || "",
}
```

#### **✅ DESPUÉS (CORRECTO):**
```javascript
cooperativa: {
  codigo: state.cooperativaSeleccionada?.code || "",
  nombre: state.cooperativaSeleccionada?.name || "",
  votos: parseInt(state.cooperativaSeleccionada?.votes) || 0,        // Integer ✅
  suplentes: parseInt(state.cooperativaSeleccionada?.substitutes) || 0, // Integer ✅
  car: parseInt(state.cooperativaSeleccionada?.CAR) || 0,           // Integer ✅
  carNombre: state.cooperativaSeleccionada?.["CAR Nombre"] || "",
}
```

---

## 📋 **JSON CORRECTO ESPERADO:**

### **Después de la corrección, el JSON enviado será:**
```json
{
  "timestamp": "2025-09-06T19:33:28.494Z",
  "cooperativa": {
    "codigo": "162",
    "nombre": "La Alianza, Agrícola Ganadera Ltda.",
    "votos": 2,      // ✅ NUMBER
    "suplentes": 2,  // ✅ NUMBER
    "car": 6,        // ✅ NUMBER
    "carNombre": "SO Bs. Aires, La Pampa y Río Negro"
  },
  "autoridades": {
    "secretario": "Elias",
    "presidente": "Bourda"
  },
  "contacto": {
    "correoElectronico": "ebourdajorge@acacoop.com.ar"
  },
  "titulares": [...],
  "suplentes": [...],
  "cartasPoder": [...],
  "resumen": {
    "totalTitulares": 2,
    "totalSuplentes": 1,
    "totalCartasPoder": 1,
    "votosEfectivos": 2
  }
}
```

---

## 🎯 **CAUSA DEL PROBLEMA:**

### **Flujo de datos problemático:**
1. **Flow de Autenticación** devuelve campos como strings:
   ```json
   {"votes": "2", "substitutes": "2", "CAR": "6"}
   ```

2. **Frontend** usa estos valores directamente sin conversión

3. **Flow de Guardado** recibe tipos incorrectos y rechaza con HTTP 400

### **¿Por qué el Flow de Autenticación devuelve strings?**

En Power Automate, los campos numéricos de SharePoint a veces se devuelven como strings, especialmente cuando se usan funciones como `int()` dentro de expresiones de string.

---

## 🧪 **VERIFICACIÓN POST-CORRECCIÓN:**

### **Pasos para probar:**
1. ✅ **Refrescar la página** para cargar el script.js corregido
2. ✅ **Autenticar cooperativa 162** nuevamente
3. ✅ **Completar formulario** con datos
4. ✅ **Intentar guardar** los datos

### **Resultado esperado:**
- ✅ **HTTP 200** en lugar de HTTP 400
- ✅ **Actividad visible** en Power Automate
- ✅ **Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Registro actualizado exitosamente",
  "timestamp": "2025-09-06T19:33:28.494Z",
  "cooperativa": "162",
  "estado": "Completo"
}
```

---

## 📚 **LECCIONES APRENDIDAS:**

### **1. Tipos de datos en Power Automate:**
- Los schemas deben coincidir exactamente
- Los campos numéricos de SharePoint pueden devolver strings
- Siempre convertir tipos en el frontend antes de enviar

### **2. Debugging de HTTP 400:**
- HTTP 400 + sin actividad en Power Automate = problema de schema
- Verificar tipos de datos en el payload JSON
- Comparar con el schema esperado del trigger

### **3. Conversión de tipos en JavaScript:**
- Usar `parseInt()` para convertir a enteros
- Usar `parseFloat()` para decimales
- Incluir valores por defecto con `|| 0`

---

## 🚀 **ESTADO ACTUAL:**

**Problema resuelto en el código. Próximo paso: probar con cooperativa 162 para verificar que el guardado ahora funciona correctamente.**
