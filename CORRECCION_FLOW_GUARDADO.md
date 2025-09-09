# 🚨 Corrección Flow de Guardado - Filter Query

## **PROBLEMA IDENTIFICADO:**
El Flow de Guardado devuelve `{"success":false,"message":"Cooperativa no encontrada"}` pero sabemos que la cooperativa 9 SÍ existe.

## **DIAGNÓSTICO:**

### ✅ **Flows que SÍ encuentran la cooperativa 9:**
- **Flow Autenticación**: ✅ Encuentra cooperativa 9
- **Flow Consulta**: ✅ Encuentra cooperativa 9

### ❌ **Flow que NO encuentra la cooperativa 9:**
- **Flow Guardado**: ❌ Devuelve "Cooperativa no encontrada"

## **CAUSA PROBABLE:**
El **Filter Query** en el Flow de Guardado está mal configurado.

---

## 🔧 **CORRECCIÓN REQUERIDA:**

### **Verificar en Power Automate - Flow de Guardado:**

1. **Ve al Flow de Guardado** en Power Automate
2. **Busca la acción "Get Items - Buscar Cooperativa"**
3. **Verifica el Filter Query**

### **Filter Query CORRECTO debe ser:**
```
Title eq '@{triggerBody()['cooperativa']['codigo']}'
```

### **Errores comunes a verificar:**

#### ❌ **Error 1 - Campo incorrecto:**
```
// INCORRECTO - usando 'codigo' en lugar de 'Title'
codigo eq '@{triggerBody()['cooperativa']['codigo']}'
```

#### ❌ **Error 2 - Ruta incorrecta:**
```
// INCORRECTO - ruta mal formada
Title eq '@{triggerBody()['codigo']}'
```

#### ❌ **Error 3 - Sintaxis incorrecta:**
```
// INCORRECTO - comillas o sintaxis mal formada
Title = '@{triggerBody()['cooperativa']['codigo']}'
```

### **✅ Filter Query CORRECTO:**
```
Title eq '@{triggerBody()['cooperativa']['codigo']}'
```

---

## 🧪 **COMPARACIÓN CON FLOWS FUNCIONANDO:**

### **Flow de Autenticación (FUNCIONA):**
```
Title eq '@{triggerBody()['codigo_cooperativa']}' and CodVerificador eq '@{triggerBody()['codigo_verificador']}'
```

### **Flow de Consulta (FUNCIONA):**
```
Title eq '@{triggerBody()['codigo_cooperativa']}'
```

### **Flow de Guardado (DEBE SER):**
```
Title eq '@{triggerBody()['cooperativa']['codigo']}'
```

---

## 🔍 **PASOS PARA CORREGIR:**

### **1. Acceder al Flow de Guardado:**
- Ve a Power Automate
- Busca el Flow: "Guardar Datos de Registro"
- Click en **Edit**

### **2. Localizar la acción problemática:**
- Busca: **"Get Items - Buscar Cooperativa"**
- Verifica el **Filter Query**

### **3. Corregir el Filter Query:**
- Debe ser exactamente: `Title eq '@{triggerBody()['cooperativa']['codigo']}'`
- **Verificar que uses 'Title'** (no 'codigo')
- **Verificar la ruta: 'cooperativa']['codigo']'** (no solo 'codigo')

### **4. Guardar y probar:**
- **Save** el Flow
- **Probar nuevamente** con el JSON de test

---

## 🎯 **VERIFICACIÓN POST-CORRECCIÓN:**

Una vez corregido el Filter Query, el Flow de Guardado debería:

1. ✅ **Encontrar la cooperativa 9**
2. ✅ **Proceder al Update Item**
3. ✅ **Actualizar las 14 columnas**
4. ✅ **Devolver respuesta exitosa:**

```json
{
    "success": true,
    "message": "Registro actualizado exitosamente",
    "timestamp": "2025-09-06T18:50:00.000Z",
    "cooperativa": "9",
    "estado": "Completo"
}
```

---

## 📊 **DATOS PARA VERIFICACIÓN:**

### **JSON de Test (funcionando en otros flows):**
```json
{
    "cooperativa": {
        "codigo": "9"
    }
}
```

### **Cooperativa 9 en SharePoint:**
- **Title**: "9" ✅
- **CUIT**: "33533717999" ✅  
- **field_2**: "Cooperativa Agropecuaria de Armstrong Ltda." ✅
- **CodVerificador**: "CPYHX" ✅

El problema NO está en los datos, sino en el **Filter Query del Flow de Guardado**.

---

## 🚀 **ACCIÓN INMEDIATA:**

**Corregir el Filter Query en el Flow de Guardado para que coincida con los flows que SÍ funcionan.**
