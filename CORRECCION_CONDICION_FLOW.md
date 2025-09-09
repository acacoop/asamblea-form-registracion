# 🔧 Corrección Condición Flow de Guardado

## 🚨 **PROBLEMA IDENTIFICADO:**
El Flow de Guardado ya NO devuelve "Cooperativa no encontrada" (Filter Query corregido ✅), pero ahora hay un problema en la **condición** que verifica si existe la cooperativa.

## **CONDICIÓN PROBLEMÁTICA:**
```
length(body('Get_Items_-_Buscar_Cooperativa')?['value']) is greater than 0
```

---

## 🔍 **POSIBLES PROBLEMAS EN LA CONDICIÓN:**

### **1. Nombre de Acción Incorrecto**
El nombre `'Get_Items_-_Buscar_Cooperativa'` debe coincidir **exactamente** con el nombre real de la acción en Power Automate.

#### **Nombres comunes que puede tener:**
- `'Get_items'` (nombre por defecto)
- `'Get_Items'` 
- `'Get_items_-_Buscar_Cooperativa'`
- `'Get_Items_-_Buscar_Cooperativa'`
- `'Buscar_Cooperativa'` (si renombraste la acción)

### **2. Sintaxis de la Condición**

#### **✅ SINTAXIS CORRECTA:**
```
length(body('NOMBRE_REAL_DE_LA_ACCION')?['value']) is greater than 0
```

#### **❌ SINTAXIS INCORRECTA:**
```
// Mal - nombre incorrecto
length(body('Get_Items_-_Buscar_Cooperativa')?['value']) is greater than 0

// Mal - sintaxis incorrecta  
length(body('Get_items')['value']) > 0

// Mal - falta el operador ?
length(body('Get_items')['value']) is greater than 0
```

---

## 🛠️ **SOLUCIÓN PASO A PASO:**

### **Paso 1: Verificar Nombre Real de la Acción**

1. **Ve al Flow de Guardado** en Power Automate
2. **Localiza la acción "Get Items"** (la que busca la cooperativa)
3. **Anota el nombre exacto** que aparece en la barra de título de la acción

#### **Ejemplos de nombres reales:**
- Si no la renombraste: `Get_items`
- Si la renombraste: `Get_Items_-_Buscar_Cooperativa`

### **Paso 2: Corregir la Condición**

1. **Ve a la acción "Condition"** (después del Get Items)
2. **En el campo izquierdo**, corrige la expresión:

```
length(body('NOMBRE_REAL_AQUI')?['value'])
```

3. **Operador**: `is greater than`
4. **Campo derecho**: `0`

---

## 📋 **VERIFICACIÓN CON FLOWS FUNCIONANDO:**

### **Flow de Autenticación (FUNCIONA):**
```
// Condición que SÍ funciona:
length(body('Get_items')?['value']) is greater than 0
```

### **Flow de Consulta (FUNCIONA):**
```
// Condición que SÍ funciona:
length(body('Get_items')?['value']) is greater than 0
```

### **Flow de Guardado (CORREGIR):**
```
// Debe usar el mismo patrón:
length(body('NOMBRE_REAL_DE_LA_ACCION')?['value']) is greater than 0
```

---

## 🧪 **DIAGNÓSTICO AVANZADO:**

### **Para identificar el nombre exacto:**

1. **En Power Automate**, edita el Flow de Guardado
2. **Click en la acción Get Items** 
3. **En la barra superior verás el nombre real**, ejemplo:
   - `Get items` 
   - `Get Items - Buscar Cooperativa`
4. **Usa exactamente ese nombre** en la condición, reemplazando espacios por guiones bajos

#### **Regla de conversión:**
- `Get items` → `Get_items`
- `Get Items - Buscar Cooperativa` → `Get_Items_-_Buscar_Cooperativa`

---

## ✅ **CONDICIÓN CORREGIDA:**

Una vez que identifiques el nombre real, la condición debe verse así:

```
length(body('NOMBRE_REAL')?['value']) is greater than 0
```

### **Ejemplos:**
```
// Si el nombre es "Get items":
length(body('Get_items')?['value']) is greater than 0

// Si el nombre es "Get Items - Buscar Cooperativa":
length(body('Get_Items_-_Buscar_Cooperativa')?['value']) is greater than 0

// Si renombraste a "Buscar Cooperativa":
length(body('Buscar_Cooperativa')?['value']) is greater than 0
```

---

## 🎯 **RESULTADO ESPERADO POST-CORRECCIÓN:**

Una vez corregido el nombre en la condición:

1. ✅ **Get Items encuentra la cooperativa**
2. ✅ **Condición evalúa correctamente** (`length > 0`)
3. ✅ **Flow procede al Update Item**
4. ✅ **Devuelve respuesta exitosa:**

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

## 🚀 **ACCIÓN INMEDIATA:**

**Verificar y corregir el nombre de la acción en la condición del Flow de Guardado.**
