# 🔧 Corrección: Flow de Guardado no actualiza RegistroCompleto

## 🚨 **PROBLEMA IDENTIFICADO:**

**El Flow de Guardado guarda los datos exitosamente PERO no actualiza el campo `RegistroCompleto` a `true`.**

---

## 📊 **SÍNTOMAS:**

### **✅ Lo que SÍ funciona:**
- Flow de Guardado devuelve: `{"success": true, "estado": "Actualizado"}`
- Los datos se guardan en las columnas JSON
- No hay errores de timeout ni HTTP 400

### **❌ Lo que NO funciona:**
- `RegistroCompleto` permanece en `false`
- Flow de Consulta devuelve: `"No se encontraron datos previos"`
- La cooperativa aparece como "sin datos" aunque tenga datos guardados

---

## 🔍 **DIAGNÓSTICO:**

### **Secuencia problemática:**
1. **Flow de Guardado ejecuta Update Item** ✅
2. **Guarda datos en columnas JSON** ✅
3. **NO actualiza `RegistroCompleto = true`** ❌
4. **Flow de Consulta verifica `RegistroCompleto`** → encuentra `false`
5. **Flow de Consulta devuelve "sin datos"** ❌

### **Causa probable:**
La acción **Update Item** en el Flow de Guardado no incluye el campo `RegistroCompleto` o lo está configurando incorrectamente.

---

## 🛠️ **CORRECCIÓN REQUERIDA:**

### **Verificar en Power Automate - Flow de Guardado:**

1. **Ve al Flow de Guardado** en Power Automate
2. **Busca la acción "Update Item"** (dentro de la rama SÍ)
3. **Verifica que incluya estos campos:**

#### **✅ Campos que DEBE actualizar:**
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

### **🎯 Campo CRÍTICO que debe estar presente:**
```json
"RegistroCompleto": true
```

---

## 🔧 **PASOS PARA CORREGIR:**

### **1. Acceder a la acción Update Item:**
- **Flow de Guardado** → **Editar**
- **Rama SÍ** (Cooperativa Existe)
- **Acción "Update Item"**

### **2. Verificar el campo RegistroCompleto:**
En la configuración de Update Item, debe haber:
- **Field Name**: `RegistroCompleto`
- **Value**: `true` (boolean, no string)

### **3. Si falta el campo RegistroCompleto:**
- **Click "Add new parameter"**
- **Buscar**: `RegistroCompleto`
- **Value**: `true`

### **4. Verificar otros campos críticos:**
Asegúrate de que también estén configurados:
- `EstadoRegistro`
- `FechaRegistro`
- `FechaUltimaActualizacion`
- Todos los campos JSON

---

## 🧪 **VERIFICACIÓN POST-CORRECCIÓN:**

### **Test después de la corrección:**

#### **1. Probar Flow de Guardado:**
```powershell
$body = Get-Content "test-guardado-162-sin-acentos.json" -Raw -Encoding UTF8
Invoke-WebRequest -Uri "URL_FLOW_GUARDADO" -Method POST -Body $body -ContentType "application/json; charset=utf-8"
```

#### **2. Verificar respuesta:**
```json
{
    "success": true,
    "message": "Registro actualizado exitosamente",
    "cooperativa": "162",
    "estado": "Actualizado"
}
```

#### **3. Probar Flow de Consulta:**
```powershell
$consultaBody = '{"codigo_cooperativa": "162"}'
Invoke-WebRequest -Uri "URL_FLOW_CONSULTA" -Method POST -Body $consultaBody -ContentType "application/json; charset=utf-8"
```

#### **4. Resultado esperado:**
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

---

## 📋 **CONFIRMACIONES NECESARIAS:**

### **En SharePoint después de la corrección:**
La cooperativa 162 debe tener:
- `RegistroCompleto`: `true` ✅
- `EstadoRegistro`: `"Completo"` o `"Actualizado"` ✅
- Datos JSON en todas las columnas ✅

### **En Power Automate:**
- Update Item debe incluir **14 campos** (incluyendo `RegistroCompleto`)
- Todos los campos deben tener **valores válidos**
- No debe haber **errores de mapping**

---

## 🎯 **OBJETIVO:**

**Una vez corregido, el ciclo completo funcionará:**

1. **Guardado** → `RegistroCompleto = true` ✅
2. **Consulta** → Devuelve datos reales ✅
3. **Edición** → Permite modificar registros ✅
4. **Estado** → Sincronización perfecta ✅

---

## 🚀 **PRIORIDAD ALTA:**

**Esta corrección es CRÍTICA para el funcionamiento completo del sistema. Sin ella, las cooperativas no podrán consultar ni editar sus datos guardados.**
