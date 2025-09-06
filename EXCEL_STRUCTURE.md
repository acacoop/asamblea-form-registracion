# Estructura de Excel para Registros de Cooperativas

## Resumen
Como alternativa a SharePoint, puedes usar Excel Online para almacenar los registros. Esta opción es más simple de configurar y mantiene la misma funcionalidad.

## 📊 **Estructura del Archivo Excel**

### **Información del Archivo:**
- **Nombre**: `RegistrosAsambleaCooperativas.xlsx`
- **Ubicación**: OneDrive for Business o SharePoint Document Library
- **Formato**: Tabla de Excel (no rango normal)

### **Estructura de la Tabla Excel:**

#### **Nombre de la Tabla**: `TablaRegistros`

| Columna | Tipo | Ejemplo | Descripción |
|---------|------|---------|-------------|
| **A** - `CodigoCoop` | Texto | "123" | Código único de cooperativa |
| **B** - `NombreCoop` | Texto | "Cooperativa Los Andes" | Nombre completo |
| **C** - `CUITCoop` | Texto | "30-12345678-9" | CUIT de la cooperativa |
| **D** - `VotosAsignados` | Número | 15 | Votos asignados |
| **E** - `SuplentesPermitidos` | Número | 3 | Suplentes máximos |
| **F** - `CodigoCAR` | Texto | "1" | Código del CAR |
| **G** - `NombreCAR` | Texto | "Región Norte" | Nombre del CAR |
| **H** - `SecretarioNombre` | Texto | "Juan Pérez" | Nombre del secretario |
| **I** - `PresidenteNombre` | Texto | "María González" | Nombre del presidente |
| **J** - `CorreoElectronico` | Texto | "contacto@coop.com" | Email de contacto |
| **K** - `TitularesJSON` | Texto | "[{...}]" | Array JSON de titulares |
| **L** - `SuplentesJSON` | Texto | "[{...}]" | Array JSON de suplentes |
| **M** - `CartasPoderJSON` | Texto | "[{...}]" | Array JSON de cartas poder |
| **N** - `VotosEfectivos` | Número | 15 | Votos efectivos calculados |
| **O** - `TotalTitulares` | Número | 3 | Cantidad de titulares |
| **P** - `TotalSuplentes` | Número | 2 | Cantidad de suplentes |
| **Q** - `TotalCartasPoder` | Número | 1 | Cantidad de cartas poder |
| **R** - `TimestampRegistro` | Fecha/Hora | "2025-09-05 10:30" | Última actualización |
| **S** - `EstadoRegistro` | Texto | "Actualizado" | Estado del registro |

## 📋 **Archivo Excel de Ejemplo**

### **Fila 1 (Headers):**
```
CodigoCoop | NombreCoop | CUITCoop | VotosAsignados | SuplentesPermitidos | CodigoCAR | NombreCAR | SecretarioNombre | PresidenteNombre | CorreoElectronico | TitularesJSON | SuplentesJSON | CartasPoderJSON | VotosEfectivos | TotalTitulares | TotalSuplentes | TotalCartasPoder | TimestampRegistro | EstadoRegistro
```

### **Fila 2 (Ejemplo de registro completo):**
```
123 | Cooperativa de Trabajo Los Andes Ltda. | 30-12345678-9 | 15 | 3 | 1 | Región Norte | Juan Carlos Pérez | María Elena González | contacto@cooperativaandes.com | [{"id":"titular-1","nombre":"Carlos Rodríguez","documento":"12345678","orden":1},{"id":"titular-2","nombre":"Ana Martínez","documento":"87654321","orden":2}] | [{"id":"suplente-1","nombre":"Pedro López","documento":"11223344","orden":1}] | [{"id":"carta-1","poderdante":{"id":"titular-1","nombre":"Carlos Rodríguez","documento":"12345678"},"apoderado":{"id":"titular-2","nombre":"Ana Martínez","documento":"87654321"},"orden":1}] | 15 | 2 | 1 | 1 | 2025-09-05 10:30:00 | Actualizado
```

### **Fila 3 (Ejemplo registro nuevo sin titulares):**
```
456 | Cooperativa del Sur | 30-98765432-1 | 8 | 2 | 2 | Región Sur | Luis Fernández | Carmen Torres | info@coopsur.com | [] | [] | [] | 0 | 0 | 0 | 0 | 2025-09-05 11:15:00 | Nuevo
```

## 🔧 **Configuración en Excel Online**

### **1. Crear el archivo Excel:**
1. Abrir Excel Online en OneDrive
2. Crear nuevo libro en blanco
3. Nombrar: `RegistrosAsambleaCooperativas.xlsx`

### **2. Configurar la tabla:**
1. Ingresar headers en fila 1 (A1:S1)
2. Seleccionar rango A1:S1
3. Ir a **Insertar > Tabla**
4. Marcar "La tabla tiene encabezados"
5. Nombrar la tabla: `TablaRegistros`

### **3. Configurar formatos:**
- **Columnas D, E, N, O, P, Q**: Formato número entero
- **Columna R**: Formato fecha/hora personalizado: `dd/mm/yyyy hh:mm:ss`
- **Columnas K, L, M**: Texto (para JSON)
- **Resto**: Texto general

### **4. Agregar datos de ejemplo:**
Copiar las filas de ejemplo del archivo `ejemplo-sharepoint-import.csv` adaptadas al formato Excel.

## ⚙️ **Power Automate con Excel**

### **Ventajas de Excel vs SharePoint:**
- ✅ Más fácil de configurar
- ✅ Mejor para ver/editar datos manualmente
- ✅ Formato familiar para administradores
- ✅ Export/Import directo con CSV
- ⚠️ Menos opciones de consulta avanzada
- ⚠️ Límite de 1M filas (más que suficiente)

### **Acciones de Power Automate para Excel:**

#### **Para Consultar (Flow de Consulta):**
1. **List rows present in a table**
   - **Location**: OneDrive for Business
   - **Document Library**: OneDrive
   - **File**: `RegistrosAsambleaCooperativas.xlsx`
   - **Table**: `TablaRegistros`
   - **Filter Query**: `CodigoCoop eq '@{triggerBody()['codigo_cooperativa']}'`

#### **Para Guardar (Flow de Guardado):**
1. **List rows present in a table** (verificar si existe)
2. **Update a row** (si existe) O **Add a row** (si no existe)
   - Mismos parámetros que arriba
   - **Key Column**: `CodigoCoop`
   - **Key Value**: `@{triggerBody()['cooperativa']['codigo']}`

## 📋 **Flow de Consulta con Excel**

### **1. Trigger - HTTP Request**
(Igual que SharePoint)

### **2. List rows present in a table**
- **Location**: OneDrive for Business
- **Document Library**: OneDrive  
- **File**: `/RegistrosAsambleaCooperativas.xlsx`
- **Table**: `TablaRegistros`
- **Filter Query**: `CodigoCoop eq '@{triggerBody()['codigo_cooperativa']}'`

### **3. Condición: Verificar si existen datos**
```
length(body('List_rows_present_in_a_table')?['value']) greater than 0
```

#### **RAMA SÍ - Datos Encontrados:**

##### **3.1 Compose - Obtener Primer Item**
```json
@first(body('List_rows_present_in_a_table')?['value'])
```

##### **3.2 Compose - Parsear JSONs**
(Igual que SharePoint)

##### **3.3 Response - Datos Encontrados**
```json
{
    "success": true,
    "datos": {
        "timestamp": "@{outputs('Compose_-_Obtener_Primer_Item')?['TimestampRegistro']}",
        "autoridades": {
            "secretario": "@{outputs('Compose_-_Obtener_Primer_Item')?['SecretarioNombre']}",
            "presidente": "@{outputs('Compose_-_Obtener_Primer_Item')?['PresidenteNombre']}"
        },
        "contacto": {
            "correoElectronico": "@{outputs('Compose_-_Obtener_Primer_Item')?['CorreoElectronico']}"
        },
        "titulares": "@{outputs('Compose_-_Parsear_Titulares_JSON')}",
        "suplentes": "@{outputs('Compose_-_Parsear_Suplentes_JSON')}",
        "cartasPoder": "@{outputs('Compose_-_Parsear_Cartas_Poder_JSON')}"
    }
}
```

#### **RAMA NO - Sin Datos:**
(Igual que SharePoint)

## 📋 **Flow de Guardado con Excel**

### **1. Trigger - HTTP Request**
(Igual que SharePoint)

### **2. List rows present in a table (Verificar)**
(Mismos parámetros que consulta)

### **3. Condición: Registro Existe**
```
length(body('List_rows_present_in_a_table')?['value']) greater than 0
```

#### **RAMA SÍ - Actualizar:**

##### **3.1 Update a row**
- **Location**: OneDrive for Business
- **Document Library**: OneDrive
- **File**: `/RegistrosAsambleaCooperativas.xlsx`
- **Table**: `TablaRegistros`
- **Key Column**: `CodigoCoop`
- **Key Value**: `@{triggerBody()['cooperativa']['codigo']}`
- **Campos**: (Ver abajo)

#### **RAMA NO - Crear:**

##### **3.2 Add a row**
- **Location**: OneDrive for Business
- **Document Library**: OneDrive
- **File**: `/RegistrosAsambleaCooperativas.xlsx`
- **Table**: `TablaRegistros`
- **Campos**: (Ver abajo)

### **Mapeo de Campos (Update/Add):**
```json
{
    "CodigoCoop": "@{triggerBody()['cooperativa']['codigo']}",
    "NombreCoop": "@{triggerBody()['cooperativa']['nombre']}",
    "CUITCoop": "@{triggerBody()['cooperativa']['cuit']}",
    "VotosAsignados": "@{triggerBody()['cooperativa']['votos']}",
    "SuplentesPermitidos": "@{triggerBody()['cooperativa']['suplentes']}",
    "CodigoCAR": "@{triggerBody()['cooperativa']['car']}",
    "NombreCAR": "@{triggerBody()['cooperativa']['carNombre']}",
    "SecretarioNombre": "@{triggerBody()['autoridades']['secretario']}",
    "PresidenteNombre": "@{triggerBody()['autoridades']['presidente']}",
    "CorreoElectronico": "@{triggerBody()['contacto']['correoElectronico']}",
    "TitularesJSON": "@{string(triggerBody()['titulares'])}",
    "SuplentesJSON": "@{string(triggerBody()['suplentes'])}",
    "CartasPoderJSON": "@{string(triggerBody()['cartasPoder'])}",
    "VotosEfectivos": "@{triggerBody()['resumen']['votosEfectivos']}",
    "TotalTitulares": "@{length(triggerBody()['titulares'])}",
    "TotalSuplentes": "@{length(triggerBody()['suplentes'])}",
    "TotalCartasPoder": "@{length(triggerBody()['cartasPoder'])}",
    "TimestampRegistro": "@{triggerBody()['timestamp']}",
    "EstadoRegistro": "@{if(greater(length(body('List_rows_present_in_a_table')?['value']), 0), 'Actualizado', 'Nuevo')}"
}
```

## 🧪 **Testing y Validación**

### **Verificar la tabla en Excel:**
1. Abrir archivo en Excel Online
2. Ir a la tabla `TablaRegistros`
3. Verificar que los datos se insertan correctamente
4. Comprobar formato de fechas y JSON

### **Testing de Conectores:**
- Power Automate > Conectores > Excel Online (Business)
- Probar conexión al archivo
- Verificar permisos de lectura/escritura

## 📊 **Ejemplo de Archivo Excel Completo**

Puedes descargar el archivo de ejemplo desde:
- Crear el archivo manualmente siguiendo esta estructura
- Importar datos desde `ejemplo-sharepoint-import.csv`
- Convertir a tabla de Excel

### **Fórmulas Útiles (opcional):**

#### **Para validar JSON en columna K (Titulares):**
```excel
=IF(LEFT(K2,1)="[", "✅ JSON Válido", "❌ Error JSON")
```

#### **Para contar caracteres en JSON:**
```excel
=LEN(K2)
```

#### **Para verificar registros completos:**
```excel
=IF(O2>0, "✅ Completo", "⚠️ Pendiente")
```

## 🚀 **Decisión: SharePoint vs Excel**

### **Recomienda SharePoint si:**
- Necesitas consultas complejas
- Múltiples usuarios editando
- Integración con otros sistemas
- Auditoría detallada

### **Recomienda Excel si:**
- Configuración más simple
- Pocos registros (< 10,000)
- Necesitas edición manual frecuente
- Familiaridad con Excel

## 📝 **Próximos Pasos con Excel**

1. **Crear archivo Excel** con la estructura definida
2. **Configurar tabla** `TablaRegistros`
3. **Importar datos de ejemplo**
4. **Crear flows** siguiendo esta guía
5. **Actualizar URLs** en `script.js`
6. **Testing completo**

La funcionalidad será **idéntica** independientemente de si usas SharePoint o Excel como backend.
