# Estructura de SharePoint para Registros de Cooperativas

## Resumen
Este documento define la estructura de la lista de SharePoint para almacenar todos los registros de cooperativas, incluyendo columnas, tipos de datos y formato CSV para importación inicial.

## Estructura de la Lista de SharePoint

### 📋 **Información de la Lista**
- **Nombre de la Lista**: `RegistrosAsambleaCooperativas`
- **Tipo**: Lista personalizada de SharePoint
- **Descripción**: Almacena los registros completos de participación en asamblea por cooperativa

### 🗂️ **Columnas de la Lista**

#### **A. Información Básica y Identificación**
| Columna | Tipo | Descripción | Requerido | Ejemplo |
|---------|------|-------------|-----------|---------|
| `Title` | Texto | Código de la cooperativa (Título por defecto) | ✅ | "123" |
| `TimestampRegistro` | Fecha y Hora | Fecha y hora del registro/última actualización | ✅ | "2025-09-05 10:30:00" |
| `EstadoRegistro` | Opción | Estado del registro (Nuevo, Actualizado, Borrador) | ✅ | "Actualizado" |

#### **B. Datos de la Cooperativa**
| Columna | Tipo | Descripción | Requerido | Ejemplo |
|---------|------|-------------|-----------|---------|
| `CodigoCoop` | Texto | Código único de la cooperativa | ✅ | "123" |
| `NombreCoop` | Texto | Nombre completo de la cooperativa | ✅ | "Cooperativa de Trabajo Los Andes Ltda." |
| `CUITCoop` | Texto | CUIT de la cooperativa | ✅ | "30-12345678-9" |
| `VotosAsignados` | Número | Cantidad de votos asignados | ✅ | 15 |
| `SuplentesPermitidos` | Número | Cantidad máxima de suplentes | ✅ | 3 |
| `CodigoCAR` | Texto | Código del CAR | ✅ | "1" |
| `NombreCAR` | Texto | Nombre del CAR | ✅ | "Región Norte" |

#### **C. Autoridades**
| Columna | Tipo | Descripción | Requerido | Ejemplo |
|---------|------|-------------|-----------|---------|
| `SecretarioNombre` | Texto | Nombre completo del secretario | ✅ | "Juan Carlos Pérez" |
| `PresidenteNombre` | Texto | Nombre completo del presidente | ✅ | "María Elena González" |

#### **D. Información de Contacto**
| Columna | Tipo | Descripción | Requerido | Ejemplo |
|---------|------|-------------|-----------|---------|
| `CorreoElectronico` | Texto | Email de contacto | ✅ | "contacto@cooperativa.com" |

#### **E. Representantes Titulares (JSON)**
| Columna | Tipo | Descripción | Requerido | Ejemplo |
|---------|------|-------------|-----------|---------|
| `TitularesJSON` | Texto (Múltiples líneas) | Array JSON con titulares | ✅ | Ver formato abajo |

#### **F. Representantes Suplentes (JSON)**
| Columna | Tipo | Descripción | Requerido | Ejemplo |
|---------|------|-------------|-----------|---------|
| `SuplentesJSON` | Texto (Múltiples líneas) | Array JSON con suplentes | ⬜ | Ver formato abajo |

#### **G. Cartas Poder (JSON)**
| Columna | Tipo | Descripción | Requerido | Ejemplo |
|---------|------|-------------|-----------|---------|
| `CartasPoderJSON` | Texto (Múltiples líneas) | Array JSON con cartas poder | ⬜ | Ver formato abajo |

#### **H. Campos de Control**
| Columna | Tipo | Descripción | Requerido | Ejemplo |
|---------|------|-------------|-----------|---------|
| `VotosEfectivos` | Número | Total de votos efectivos calculados | ✅ | 15 |
| `TotalTitulares` | Número | Cantidad total de titulares registrados | ✅ | 15 |
| `TotalSuplentes` | Número | Cantidad total de suplentes registrados | ⬜ | 3 |
| `TotalCartasPoder` | Número | Cantidad total de cartas poder | ⬜ | 2 |

## 📄 **Formato JSON para Campos Complejos**

### **TitularesJSON - Formato:**
```json
[
  {
    "id": "titular-1",
    "nombre": "Carlos Rodríguez",
    "documento": "12345678",
    "orden": 1
  },
  {
    "id": "titular-2", 
    "nombre": "Ana Martínez",
    "documento": "87654321",
    "orden": 2
  }
]
```

### **SuplentesJSON - Formato:**
```json
[
  {
    "id": "suplente-1",
    "nombre": "Pedro López",
    "documento": "11223344",
    "orden": 1
  }
]
```

### **CartasPoderJSON - Formato:**
```json
[
  {
    "id": "carta-1",
    "poderdante": {
      "id": "titular-1",
      "nombre": "Carlos Rodríguez",
      "documento": "12345678"
    },
    "apoderado": {
      "id": "titular-2", 
      "nombre": "Ana Martínez",
      "documento": "87654321"
    },
    "orden": 1
  }
]
```

## 📊 **Formato CSV para Importación/Exportación**

### **Estructura del Archivo CSV:**
```csv
CodigoCoop,NombreCoop,CUITCoop,VotosAsignados,SuplentesPermitidos,CodigoCAR,NombreCAR,SecretarioNombre,PresidenteNombre,CorreoElectronico,TitularesJSON,SuplentesJSON,CartasPoderJSON,VotosEfectivos,TotalTitulares,TotalSuplentes,TotalCartasPoder,TimestampRegistro,EstadoRegistro
```

### **Ejemplo de Registro Completo en CSV:**
```csv
"123","Cooperativa de Trabajo Los Andes Ltda.","30-12345678-9",15,3,"1","Región Norte","Juan Carlos Pérez","María Elena González","contacto@cooperativa.com","[{""id"":""titular-1"",""nombre"":""Carlos Rodríguez"",""documento"":""12345678"",""orden"":1},{""id"":""titular-2"",""nombre"":""Ana Martínez"",""documento"":""87654321"",""orden"":2}]","[{""id"":""suplente-1"",""nombre"":""Pedro López"",""documento"":""11223344"",""orden"":1}]","[{""id"":""carta-1"",""poderdante"":{""id"":""titular-1"",""nombre"":""Carlos Rodríguez"",""documento"":""12345678""},""apoderado"":{""id"":""titular-2"",""nombre"":""Ana Martínez"",""documento"":""87654321""},""orden"":1}]",15,2,1,1,"2025-09-05T10:30:00.000Z","Actualizado"
```

### **Ejemplo de Registro Mínimo (Solo Autoridades):**
```csv
"456","Cooperativa del Sur","30-98765432-1",8,2,"2","Región Sur","Luis Fernández","Carmen Torres","info@coopsur.com","[]","[]","[]",0,0,0,0,"2025-09-05T11:15:00.000Z","Nuevo"
```

## 🔧 **Script de Power Automate - Parseo de Datos**

### **Para consultar datos existentes:**
```javascript
// En Power Automate - Acción "Compose" para parsear JSON
// Variable: TitularesArray
json(triggerBody()['TitularesJSON'])

// Variable: SuplentesArray  
json(triggerBody()['SuplentesJSON'])

// Variable: CartasPoderArray
json(triggerBody()['CartasPoderJSON'])
```

### **Para guardar datos desde el frontend:**
```javascript
// En Power Automate - Convertir arrays a JSON string
// Variable: TitularesString
string(triggerBody()['titulares'])

// Variable: SuplentesString
string(triggerBody()['suplentes'])

// Variable: CartasPoderString  
string(triggerBody()['cartasPoder'])
```

## 📋 **Configuración en SharePoint**

### **1. Crear la Lista:**
1. Ir a SharePoint Online
2. Crear nueva lista personalizada
3. Nombrar: `RegistrosAsambleaCooperativas`

### **2. Agregar Columnas (en orden):**

#### **Columnas de Texto Simple:**
- `CodigoCoop` (Texto, 50 caracteres)
- `NombreCoop` (Texto, 255 caracteres)  
- `CUITCoop` (Texto, 15 caracteres)
- `CodigoCAR` (Texto, 10 caracteres)
- `NombreCAR` (Texto, 100 caracteres)
- `SecretarioNombre` (Texto, 100 caracteres)
- `PresidenteNombre` (Texto, 100 caracteres)
- `CorreoElectronico` (Texto, 100 caracteres)
- `EstadoRegistro` (Opción: Nuevo, Actualizado, Borrador)

#### **Columnas Numéricas:**
- `VotosAsignados` (Número, 0 decimales)
- `SuplentesPermitidos` (Número, 0 decimales)
- `VotosEfectivos` (Número, 0 decimales)
- `TotalTitulares` (Número, 0 decimales)
- `TotalSuplentes` (Número, 0 decimales)
- `TotalCartasPoder` (Número, 0 decimales)

#### **Columnas de Texto Múltiples Líneas:**
- `TitularesJSON` (Texto múltiples líneas, sin formato)
- `SuplentesJSON` (Texto múltiples líneas, sin formato)
- `CartasPoderJSON` (Texto múltiples líneas, sin formato)

#### **Columnas de Fecha:**
- `TimestampRegistro` (Fecha y Hora, incluir hora)

### **3. Configurar Vistas:**

#### **Vista "Todos los Registros":**
- Mostrar: CodigoCoop, NombreCoop, EstadoRegistro, TimestampRegistro, VotosEfectivos
- Ordenar por: TimestampRegistro (descendente)

#### **Vista "Registros Completos":**
- Filtrar: TotalTitulares > 0
- Mostrar: CodigoCoop, NombreCoop, TotalTitulares, TotalSuplentes, VotosEfectivos

#### **Vista "Pendientes":**
- Filtrar: EstadoRegistro = "Borrador" O TotalTitulares = 0
- Mostrar: CodigoCoop, NombreCoop, EstadoRegistro, TimestampRegistro

## 🔍 **Queries de Ejemplo para Power Automate**

### **Buscar registro por código de cooperativa:**
```
Filter: CodigoCoop eq '123'
```

### **Obtener registros completos (con titulares):**
```
Filter: TotalTitulares gt 0
```

### **Registros actualizados hoy:**
```
Filter: TimestampRegistro gt datetime'2025-09-05T00:00:00Z'
```

## ⚠️ **Consideraciones Importantes**

### **Límites de SharePoint:**
- **Texto simple**: Máximo 255 caracteres
- **Texto múltiples líneas**: Máximo 63,999 caracteres (suficiente para JSON)
- **Elementos por lista**: Hasta 30 millones (más que suficiente)

### **Indexación recomendada:**
- `CodigoCoop` (índice único)
- `TimestampRegistro` (para ordenamiento)
- `EstadoRegistro` (para filtros)

### **Backup y Versionado:**
- SharePoint mantiene versiones automáticamente
- Configurar retención según políticas organizacionales
- Exportar CSV periódicamente como backup

### **Seguridad:**
- Configurar permisos de solo lectura/escritura según roles
- Logs de auditoría automáticos en SharePoint
- Encriptación en tránsito y reposo (nativo de O365)

## 🚀 **Próximos Pasos**

1. **Crear la lista en SharePoint** con las columnas especificadas
2. **Configurar Power Automate** para leer/escribir en esta lista
3. **Actualizar URLs** en `config.consultarDatosEndpoint` y `config.apiEndpoint`
4. **Testing completo** con datos reales
5. **Importar datos** existentes si los hay (usando CSV)

Esta estructura permite almacenar **toda la información** que puede proporcionar una cooperativa y es completamente compatible con el frontend ya implementado.
