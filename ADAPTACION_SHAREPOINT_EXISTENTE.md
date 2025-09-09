# Adaptación de Lista SharePoint Existente para Registros de Asamblea

## Resumen
Basado en tu lista actual de cooperativas, voy a crear una adaptación que conserve todos los campos existentes y agregue las columnas necesarias para almacenar los datos de registro de la asamblea.

## 📊 **Análisis de la Estructura Actual**

### **Campos Existentes en tu Lista:**
| Columna Actual | Tipo | Descripción | Mantener |
|----------------|------|-------------|----------|
| `Numero de coop` | Texto | Código único de cooperativa | ✅ Usar como identificador |
| `CUIT` | Texto | CUIT de la cooperativa | ✅ |
| `Población` | Texto | Ciudad de la cooperativa | ✅ |
| `Nombre completo` | Texto | Nombre completo oficial | ✅ |
| `Cod_Nombre` | Texto | Código + Nombre concatenado | ✅ |
| `Nombre_corto` | Texto | Nombre abreviado | ✅ |
| `D.E.` | Texto | Código delegación electoral | ✅ |
| `D.E. Nombre` | Texto | Nombre delegación electoral | ✅ |
| `CAR` | Texto | Código CAR | ✅ |
| `CAR Nombre` | Texto | Nombre CAR | ✅ |
| `Ctro Contacto` | Texto | Centro de contacto | ✅ |
| `Votos Consec` | Número | Votos consecutivos | ✅ |
| `Votos Asoc` | Número | Votos asociados | ✅ |
| `Total votos` | Número | Total de votos | ✅ **USAR PARA VALIDAR** |
| `Mail principal` | Texto | Email principal | ✅ |
| `Mail copia` | Texto | Email copia | ✅ |
| `Invitacion` | Texto | Estado invitación | ✅ |
| `CodVerificador` | Texto | Código verificador | ✅ **USAR PARA AUTH** |

## 🔧 **Columnas NUEVAS a Agregar para Registros**

### **A. Control de Registro:**
| Nueva Columna | Tipo | Descripción | Ejemplo |
|---------------|------|-------------|---------|
| `RegistroCompleto` | Sí/No | Indica si completó el registro | Verdadero |
| `FechaRegistro` | Fecha/Hora | Fecha y hora del registro | 2025-09-05 10:30:00 |
| `FechaUltimaActualizacion` | Fecha/Hora | Última modificación | 2025-09-05 14:15:00 |
| `EstadoRegistro` | Opción | Estado (Pendiente, Completo, Actualizado) | "Completo" |
| `VotosEfectivos` | Número | Votos efectivos calculados | 15 |

### **B. Autoridades:**
| Nueva Columna | Tipo | Descripción | Ejemplo |
|---------------|------|-------------|---------|
| `SecretarioNombre` | Texto | Nombre del secretario | "Juan Carlos Pérez" |
| `PresidenteNombre` | Texto | Nombre del presidente | "María Elena González" |

### **C. Contacto de Registro:**
| Nueva Columna | Tipo | Descripción | Ejemplo |
|---------------|------|-------------|---------|
| `CorreoRegistro` | Texto | Email específico para la asamblea | "contacto@cooperativa.com" |

### **D. Representantes (JSON):**
| Nueva Columna | Tipo | Descripción | Ejemplo |
|---------------|------|-------------|---------|
| `TitularesJSON` | Texto (múltiples líneas) | Array JSON de titulares | `[{"id":"titular-1","nombre":"Carlos Rodríguez",...}]` |
| `SuplentesJSON` | Texto (múltiples líneas) | Array JSON de suplentes | `[{"id":"suplente-1","nombre":"Pedro López",...}]` |
| `CartasPoderJSON` | Texto (múltiples líneas) | Array JSON de cartas poder | `[{"id":"carta-1","poderdante":{...},...}]` |

### **E. Contadores:**
| Nueva Columna | Tipo | Descripción | Ejemplo |
|---------------|------|-------------|---------|
| `TotalTitulares` | Número | Cantidad de titulares registrados | 3 |
| `TotalSuplentes` | Número | Cantidad de suplentes registrados | 2 |
| `TotalCartasPoder` | Número | Cantidad de cartas poder | 1 |

## 📋 **Estructura Final de la Lista Adaptada**

### **Sección 1: Información Base (EXISTENTE)**
- Numero de coop → **Usar como CodigoCoop**
- CUIT → **Usar como CUITCoop**
- Nombre completo → **Usar como NombreCoop**
- Total votos → **Usar para validar VotosAsignados**
- CAR + CAR Nombre → **Usar para región**
- CodVerificador → **Usar para autenticación**
- Mail principal → **Usar como respaldo**

### **Sección 2: Registro de Asamblea (NUEVO)**
- RegistroCompleto (Sí/No)
- FechaRegistro (Fecha/Hora)
- FechaUltimaActualizacion (Fecha/Hora)
- EstadoRegistro (Opción: Pendiente, Completo, Actualizado)
- SecretarioNombre (Texto)
- PresidenteNombre (Texto)
- CorreoRegistro (Texto)
- TitularesJSON (Texto múltiples líneas)
- SuplentesJSON (Texto múltiples líneas)
- CartasPoderJSON (Texto múltiples líneas)
- VotosEfectivos (Número)
- TotalTitulares (Número)
- TotalSuplentes (Número)
- TotalCartasPoder (Número)

## 🔄 **Script de Power Automate Adaptado**

### **Para Consulta de Datos:**

#### **Get Items - Buscar por código:**
```javascript
// Filter Query:
Title eq '@{triggerBody()['codigo_cooperativa']}'
// O si usas "Numero de coop":
[Numero_x0020_de_x0020_coop] eq '@{triggerBody()['codigo_cooperativa']}'
```

#### **Response cuando hay datos:**
```json
{
    "success": true,
    "datos": {
        "timestamp": "@{outputs('Get_Item')?['FechaUltimaActualizacion']}",
        "autoridades": {
            "secretario": "@{outputs('Get_Item')?['SecretarioNombre']}",
            "presidente": "@{outputs('Get_Item')?['PresidenteNombre']}"
        },
        "contacto": {
            "correoElectronico": "@{coalesce(outputs('Get_Item')?['CorreoRegistro'], outputs('Get_Item')?['Mail_x0020_principal'])}"
        },
        "titulares": "@{if(empty(outputs('Get_Item')?['TitularesJSON']), json('[]'), json(outputs('Get_Item')?['TitularesJSON']))}",
        "suplentes": "@{if(empty(outputs('Get_Item')?['SuplentesJSON']), json('[]'), json(outputs('Get_Item')?['SuplentesJSON']))}",
        "cartasPoder": "@{if(empty(outputs('Get_Item')?['CartasPoderJSON']), json('[]'), json(outputs('Get_Item')?['CartasPoderJSON']))}"
    }
}
```

### **Para Autenticación (Usar datos existentes):**

#### **Get Items - Verificar credenciales:**
```javascript
// Filter Query:
[Numero_x0020_de_x0020_coop] eq '@{triggerBody()['codigo_cooperativa']}' and CodVerificador eq '@{triggerBody()['codigo_verificador']}'
```

#### **Response exitosa:**
```json
{
    "success": true,
    "cooperativa": {
        "code": "@{outputs('Get_Item')?['Numero_x0020_de_x0020_coop']}",
        "cuit": "@{outputs('Get_Item')?['CUIT']}",
        "name": "@{outputs('Get_Item')?['Nombre_x0020_completo']}",
        "votes": "@{outputs('Get_Item')?['Total_x0020_votos']}",
        "substitutes": "@{div(outputs('Get_Item')?['Total_x0020_votos'], 5)}", // Estimación 1 suplente cada 5 votos
        "CAR": "@{outputs('Get_Item')?['CAR']}",
        "CAR Nombre": "@{outputs('Get_Item')?['CAR_x0020_Nombre']}",
        "codigo_verificador": "@{outputs('Get_Item')?['CodVerificador']}"
    }
}
```

### **Para Guardado (Actualizar registro existente):**

#### **Update Item - Guardar datos de asamblea:**
```json
{
    "RegistroCompleto": true,
    "FechaRegistro": "@{if(empty(outputs('Get_Item')?['FechaRegistro']), triggerBody()['timestamp'], outputs('Get_Item')?['FechaRegistro'])}",
    "FechaUltimaActualizacion": "@{triggerBody()['timestamp']}",
    "EstadoRegistro": "Completo",
    "SecretarioNombre": "@{triggerBody()['autoridades']['secretario']}",
    "PresidenteNombre": "@{triggerBody()['autoridades']['presidente']}",
    "CorreoRegistro": "@{triggerBody()['contacto']['correoElectronico']}",
    "TitularesJSON": "@{string(triggerBody()['titulares'])}",
    "SuplentesJSON": "@{string(triggerBody()['suplentes'])}",
    "CartasPoderJSON": "@{string(triggerBody()['cartasPoder'])}",
    "VotosEfectivos": "@{triggerBody()['resumen']['votosEfectivos']}",
    "TotalTitulares": "@{length(triggerBody()['titulares'])}",
    "TotalSuplentes": "@{length(triggerBody()['suplentes'])}",
    "TotalCartasPoder": "@{length(triggerBody()['cartasPoder'])}"
}
```

## 📊 **Ejemplo de Registro Completo**

Tomando la primera cooperativa de tu lista como ejemplo:

### **Datos Existentes:**
```
Numero de coop: "3"
CUIT: "30529717233"
Nombre completo: "Cooperativa Agropecuaria de Alcorta Ltda."
Total votos: 1
CAR: "3"
CAR Nombre: "Centro y Sur de Santa Fe"
CodVerificador: "51CYD"
Mail principal: "unionalcorta@gmail.com"
```

### **Datos NUEVOS después del registro:**
```
RegistroCompleto: Verdadero
FechaRegistro: 2025-09-05 10:30:00
FechaUltimaActualizacion: 2025-09-05 10:30:00
EstadoRegistro: "Completo"
SecretarioNombre: "Juan Carlos Pérez"
PresidenteNombre: "María Elena González"
CorreoRegistro: "contacto@alcorta.com"
TitularesJSON: "[{\"id\":\"titular-1\",\"nombre\":\"Carlos Rodríguez\",\"documento\":\"12345678\",\"orden\":1}]"
SuplentesJSON: "[]"
CartasPoderJSON: "[]"
VotosEfectivos: 1
TotalTitulares: 1
TotalSuplentes: 0
TotalCartasPoder: 0
```

## 🎯 **Ventajas de esta Adaptación**

### ✅ **Conserva todo lo existente:**
- No se pierden datos actuales
- Sistema de autenticación funciona igual
- Códigos verificadores siguen válidos
- Emails de contacto se mantienen

### ✅ **Agrega funcionalidad nueva:**
- Registros de asamblea por cooperativa
- Historial de cambios con timestamps
- Estados de registro claros
- Datos estructurados en JSON

### ✅ **Facilita gestión:**
- Un solo lugar para toda la información
- Reportes combinados fáciles
- Backup unificado
- Permisos centralizados

## 🔧 **Pasos para Implementar**

### **1. Agregar Columnas Nuevas:**
En tu lista de SharePoint, agregar las 14 columnas nuevas:
```
- RegistroCompleto (Sí/No)
- FechaRegistro (Fecha y Hora)
- FechaUltimaActualizacion (Fecha y Hora) 
- EstadoRegistro (Opción: Pendiente, Completo, Actualizado)
- SecretarioNombre (Texto, 100 caracteres)
- PresidenteNombre (Texto, 100 caracteres)
- CorreoRegistro (Texto, 100 caracteres)
- TitularesJSON (Texto múltiples líneas)
- SuplentesJSON (Texto múltiples líneas)
- CartasPoderJSON (Texto múltiples líneas)
- VotosEfectivos (Número)
- TotalTitulares (Número)
- TotalSuplentes (Número)
- TotalCartasPoder (Número)
```

### **2. Crear Flows de Power Automate:**
- Flow de Autenticación (usando datos existentes)
- Flow de Consulta (para precarga)
- Flow de Guardado (actualizar con datos nuevos)

### **3. Actualizar Frontend:**
```javascript
// En script.js, mapear campos existentes:
config.authEndpoint = "https://tu-flow-auth-url";
config.consultarDatosEndpoint = "https://tu-flow-consulta-url";
config.apiEndpoint = "https://tu-flow-guardado-url";
```

### **4. Testing:**
- Probar autenticación con códigos verificadores existentes
- Verificar que la consulta funciona con cooperativas existentes
- Confirmar guardado de registros nuevos

## 🔍 **Consultas Útiles**

### **Ver registros completados:**
```
RegistroCompleto eq true
```

### **Ver registros pendientes:**
```
RegistroCompleto ne true or EstadoRegistro eq 'Pendiente'
```

### **Ver registros por CAR:**
```
CAR eq '3' and RegistroCompleto eq true
```

### **Ver registros recientes:**
```
FechaUltimaActualizacion gt datetime'2025-09-05T00:00:00Z'
```

Esta adaptación te permite aprovechar toda la infraestructura existente mientras agregas la funcionalidad nueva de manera organizada y eficiente. ¡Los códigos verificadores que ya tienes funcionarán directamente con el sistema de autenticación!
