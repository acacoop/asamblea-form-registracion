# 🔧 Corrección Urgente: Cambiar a Campo Title en Flows

## ⚠️ **Problema Identificado**

Se detectó que los 3 flows de Power Automate están usando el campo `[Numero_x0020_de_x0020_coop]` pero deben usar **`Title`** que es el campo estándar de SharePoint para el código de cooperativa.

## 🎯 **Acción Requerida Inmediata**

### **Flow 1: Autenticación (d4951cc773a048c9964ef65dfdd3c69c)**

#### **📍 Ubicación**: Acción "Get Items - Verificar Credenciales"
#### **🔄 Filter Query - Cambiar:**

**❌ ACTUAL (Incorrecto):**
```
[Numero_x0020_de_x0020_coop] eq '@{triggerBody()['codigo_cooperativa']}' and CodVerificador eq '@{triggerBody()['codigo_verificador']}'
```

**✅ CORRECTO:**
```
Title eq '@{triggerBody()['codigo_cooperativa']}' and CodVerificador eq '@{triggerBody()['codigo_verificador']}'
```

#### **📍 Ubicación**: Acción "Response - Éxito"
#### **🔄 JSON Response - Cambiar:**

**❌ ACTUAL (Incorrecto):**
```json
"code": "@{outputs('Compose_-_Cooperativa_Encontrada')?['Numero_x0020_de_x0020_coop']}"
```

**✅ CORRECTO:**
```json
"code": "@{outputs('Compose_-_Cooperativa_Encontrada')?['Title']}"
```

---

### **Flow 2: Consulta de Datos (e980d91152364b8abdaf074cc89333f6)**

#### **📍 Ubicación**: Acción "Get Items - Buscar Cooperativa"
#### **🔄 Filter Query - Cambiar:**

**❌ ACTUAL (Incorrecto):**
```
[Numero_x0020_de_x0020_coop] eq '@{triggerBody()['codigo_cooperativa']}'
```

**✅ CORRECTO:**
```
Title eq '@{triggerBody()['codigo_cooperativa']}'
```

---

### **Flow 3: Guardado de Datos (5c5268b7ca894a09be1fb41effc24156)**

#### **📍 Ubicación**: Acción "Get Items - Buscar Cooperativa"
#### **🔄 Filter Query - Cambiar:**

**❌ ACTUAL (Incorrecto):**
```
[Numero_x0020_de_x0020_coop] eq '@{triggerBody()['cooperativa']['codigo']}'
```

**✅ CORRECTO:**
```
Title eq '@{triggerBody()['cooperativa']['codigo']}'
```

---

## 📋 **Pasos para Realizar la Corrección**

### **1. Abrir Power Automate**
1. Ir a [make.powerautomate.com](https://make.powerautomate.com)
2. Buscar cada flow por su ID

### **2. Para cada Flow:**

#### **🔐 Flow de Autenticación (d4951cc7...):**
1. **Editar** el flow
2. **Expandir** acción "Get Items - Verificar Credenciales"
3. **Modificar** Filter Query: cambiar `[Numero_x0020_de_x0020_coop]` por `Title`
4. **Expandir** acción "Response - Éxito"
5. **Modificar** JSON: cambiar referencia del campo en "code"
6. **Guardar** el flow

#### **🔍 Flow de Consulta (e980d911...):**
1. **Editar** el flow
2. **Expandir** acción "Get Items - Buscar Cooperativa"
3. **Modificar** Filter Query: cambiar `[Numero_x0020_de_x0020_coop]` por `Title`
4. **Guardar** el flow

#### **💾 Flow de Guardado (5c5268b7...):**
1. **Editar** el flow
2. **Expandir** acción "Get Items - Buscar Cooperativa"
3. **Modificar** Filter Query: cambiar `[Numero_x0020_de_x0020_coop]` por `Title`
4. **Guardar** el flow

### **3. Verificar Cambios**
Después de cada corrección, hacer un test rápido con curl para verificar que funciona.

---

## 🧪 **Testing Post-Corrección**

### **Test Rápido - Flow Autenticación:**
```bash
curl -X POST "https://defaulta7cad06884854149bb950f323bdfa8.9e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/d4951cc773a048c9964ef65dfdd3c69c/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=tG24Qxrd_AUtjKiQR8D1lt2yvbOtZZNBtkYEXn9_aZI" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo_cooperativa": "3",
    "codigo_verificador": "51CYD"
  }'
```

**✅ Si está corregido correctamente, deberías ver:**
```json
{
    "success": true,
    "cooperativa": {
        "code": "3",
        "cuit": "30529717233",
        "name": "Cooperativa Agropecuaria de Alcorta Ltda.",
        ...
    }
}
```

**❌ Si sigue fallando:**
- Verificar que el campo `Title` existe en SharePoint
- Verificar que contiene el código de cooperativa
- Verificar que no hay espacios extra en el Filter Query

---

## 📊 **¿Por Qué Title en lugar de Numero_x0020_de_x0020_coop?**

### **Ventajas del campo Title:**
1. ✅ **Estándar**: Es el campo nativo de SharePoint
2. ✅ **Confiable**: Siempre existe en cualquier lista
3. ✅ **Indexado**: Mejor performance en consultas
4. ✅ **Limpio**: No tiene caracteres codificados
5. ✅ **Consistente**: Funciona igual en todas las versiones

### **Problemas del campo codificado:**
1. ❌ **Complejo**: Nombre con caracteres especiales codificados
2. ❌ **Frágil**: Puede cambiar si se modifica la columna
3. ❌ **Confuso**: Difícil de leer y mantener
4. ❌ **Propenso a errores**: Fácil de escribir mal

---

## ⏰ **Orden de Corrección Sugerido**

### **Prioridad Alta:**
1. 🔐 **Flow Autenticación** (más crítico)
2. 🔍 **Flow Consulta** 
3. 💾 **Flow Guardado**

### **Tiempo estimado:** 15-20 minutos total

---

## 🚨 **Checklist de Verificación Post-Corrección**

- [ ] **Flow 1** - Filter Query corregido
- [ ] **Flow 1** - JSON Response corregido  
- [ ] **Flow 2** - Filter Query corregido
- [ ] **Flow 3** - Filter Query corregido
- [ ] **Test Auth** - Respuesta 200 OK
- [ ] **Test Consulta** - Respuesta correcta
- [ ] **Test Guardado** - Respuesta correcta
- [ ] **Frontend** - Login funciona
- [ ] **SharePoint** - Datos se guardan

---

## 🎯 **Resultado Final**

Después de esta corrección:
- ✅ Todos los flows funcionarán de manera más confiable
- ✅ Las consultas serán más rápidas
- ✅ El código será más mantenible
- ✅ Menor probabilidad de errores

¡Una vez completada esta corrección, el sistema estará 100% optimizado!
