# Agregar Columnas Nuevas a SharePoint

## 🚨 **PROBLEMA IDENTIFICADO - ACTUALIZADO**
El Flow de Guardado está fallando con timeout porque faltan **13 columnas** en la lista de SharePoint. 

### ✅ **COLUMNA YA EXISTENTE:**
- `RegistroCompleto` - **YA EXISTE** (confirmado en Get Items: `"RegistroCompleto": false`)

### ❌ **COLUMNAS FALTANTES (13):**
El Flow intenta actualizar estos campos que **NO EXISTEN** en SharePoint:

## 📋 **COLUMNAS REQUERIDAS PARA EL FLOW DE GUARDADO**

### **Instrucciones para agregar en SharePoint:**

1. Ve a tu lista de SharePoint: **Listado de cooperativas**
2. Click en **⚙️ Settings** → **List settings**
3. En la sección **Columns**, click **Create column** para cada una:

### **Columnas a Crear:**

#### **✅ 1. RegistroCompleto - YA EXISTE**
- **Status**: ✅ **CONFIRMADO - YA EXISTE** 
- **Valor actual**: `false` para cooperativa 9
- **No requiere acción**

#### **❌ 2. FechaRegistro - FALTANTE**
- **Column name**: `FechaRegistro`
- **Type**: `Date and Time`
- **Date and Time Format**: `Date & Time`
- **Default value**: `(None)`
- **Description**: Fecha del primer registro

#### **❌ 3. FechaUltimaActualizacion - FALTANTE**
- **Column name**: `FechaUltimaActualizacion` 
- **Type**: `Date and Time`
- **Date and Time Format**: `Date & Time`
- **Default value**: `(None)`
- **Description**: Fecha de la última actualización

#### **4. EstadoRegistro**
- **Column name**: `EstadoRegistro`
- **Type**: `Choice`
- **Choices**: 
  - `Pendiente`
  - `Completo` 
  - `Actualizado`
- **Default value**: `Pendiente`
- **Description**: Estado actual del registro

#### **5. SecretarioNombre**
- **Column name**: `SecretarioNombre`
- **Type**: `Single line of text`
- **Maximum number of characters**: `255`
- **Description**: Nombre del secretario

#### **6. PresidenteNombre**
- **Column name**: `PresidenteNombre`
- **Type**: `Single line of text`
- **Maximum number of characters**: `255`
- **Description**: Nombre del presidente

#### **7. CorreoRegistro**
- **Column name**: `CorreoRegistro`
- **Type**: `Single line of text`
- **Maximum number of characters**: `255`
- **Description**: Correo electrónico del registro

#### **8. TitularesJSON**
- **Column name**: `TitularesJSON`
- **Type**: `Multiple lines of text`
- **Type of text**: `Plain text`
- **Description**: Datos de titulares en formato JSON

#### **9. SuplentesJSON**
- **Column name**: `SuplentesJSON`
- **Type**: `Multiple lines of text`
- **Type of text**: `Plain text`
- **Description**: Datos de suplentes en formato JSON

#### **10. CartasPoderJSON**
- **Column name**: `CartasPoderJSON`
- **Type**: `Multiple lines of text`
- **Type of text**: `Plain text`
- **Description**: Datos de cartas poder en formato JSON

#### **11. VotosEfectivos**
- **Column name**: `VotosEfectivos`
- **Type**: `Number`
- **Min/Max**: `0` a `999`
- **Default value**: `0`
- **Description**: Total de votos efectivos

#### **12. TotalTitulares**
- **Column name**: `TotalTitulares`
- **Type**: `Number`
- **Min/Max**: `0` a `999`
- **Default value**: `0`
- **Description**: Cantidad de titulares registrados

#### **13. TotalSuplentes**
- **Column name**: `TotalSuplentes`
- **Type**: `Number`
- **Min/Max**: `0` a `999`
- **Default value**: `0`
- **Description**: Cantidad de suplentes registrados

#### **14. TotalCartasPoder**
- **Column name**: `TotalCartasPoder`
- **Type**: `Number`
- **Min/Max**: `0` a `999`
- **Default value**: `0`
- **Description**: Cantidad de cartas poder registradas

---

## ✅ **VERIFICACIÓN POST-CREACIÓN**

Una vez agregadas todas las columnas, verifica:

1. **Lista de Columnas**: Asegúrate de que todas las 14 columnas aparezcan en **List settings** → **Columns**
2. **Nombres exactos**: Los nombres deben coincidir exactamente (case-sensitive)
3. **Tipos correctos**: Cada columna debe tener el tipo correcto

---

## 🧪 **TEST DESPUÉS DE AGREGAR COLUMNAS**

Una vez agregadas las columnas, podrás probar el Flow de Guardado nuevamente:

```powershell
$body = Get-Content "test-guardado.json" -Raw -Encoding UTF8
Invoke-WebRequest -Uri "https://defaulta7cad06884854149bb950f323bdfa8.9e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/5c5268b7ca894a09be1fb41effc24156/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=_QA3lITPQ59jUXF-4byKGSQ_vce0Xb5vO3uHmLTf9f8" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 60
```

**Resultado esperado después de agregar columnas:**
```json
{
    "success": true,
    "message": "Registro actualizado exitosamente",
    "timestamp": "2025-09-06T10:30:00.000Z",
    "cooperativa": "9",
    "estado": "Completo"
}
```

---

## 🎯 **RESUMEN DE ACCIONES**

1. ✅ **Flow Autenticación**: Funcionando correctamente
2. ✅ **Flow Consulta**: Funcionando correctamente (muestra "sin datos" cuando RegistroCompleto=false)
3. ❌ **Flow Guardado**: Falla por **COLUMNAS FALTANTES**
4. 🔄 **Acción requerida**: **AGREGAR LAS 14 COLUMNAS LISTADAS ARRIBA**
5. ✅ **Después**: El Flow de Guardado funcionará correctamente

El problema está claramente identificado: **faltan las columnas en SharePoint que el Flow necesita para actualizar**.
