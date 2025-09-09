# Guía de Testing - Persistencia de Datos

## Resumen
Esta guía te ayuda a probar la funcionalidad completa de persistencia de datos (guardar, consultar y editar registros de cooperativas).

## Pre-requisitos

### ✅ **Ya está implementado en el Frontend:**
- Sistema de autenticación con endpoints
- Consulta automática de datos existentes
- Precarga de formularios para edición
- Indicadores visuales de modo edición
- Guardado de datos completos

### 🔄 **Necesitás configurar:**
1. Endpoint de consulta de datos en Power Automate
2. URL correcta en `consultarDatosEndpoint`
3. Sistema de almacenamiento (SharePoint/Excel/DB)

## Escenarios de Testing

### 📝 **Escenario 1: Registro Nuevo (Primera vez)**

#### Setup:
- Asegurate de que no existan datos previos para el código de cooperativa de prueba

#### Pasos:
1. **Autenticación**:
   - Ingresar código de cooperativa y verificador
   - Click en "Continuar"
   - ✅ Debe autenticar correctamente

2. **Consulta automática de datos**:
   - ✅ Debe consultar endpoint de datos automáticamente
   - ✅ Debe obtener respuesta 404 o `success: false` (sin datos previos)
   - ✅ Formulario debe aparecer en blanco (modo nuevo)
   - ✅ NO debe mostrar indicador de edición

3. **Llenar formulario completo**:
   ```
   Autoridades:
   - Secretario: "Juan Pérez"
   - Presidente: "María González"
   
   Contacto:
   - Email: "contacto@cooperativa.com"
   
   Titulares (2):
   - Titular 1: "Carlos Rodríguez" - "12345678"
   - Titular 2: "Ana Martínez" - "87654321"
   
   Suplentes (1):
   - Suplente 1: "Pedro López" - "11223344"
   
   Carta Poder (1):
   - De "Carlos Rodríguez" hacia "Ana Martínez"
   ```

4. **Guardar datos**:
   - Click en "Enviar Registración"
   - ✅ Debe enviar datos completos al endpoint principal
   - ✅ Debe mostrar mensaje de éxito
   - ✅ Datos deben guardarse en el almacenamiento

#### Resultado Esperado:
- Registro nuevo creado exitosamente
- Datos almacenados correctamente

---

### ✏️ **Escenario 2: Edición de Registro Existente**

#### Setup:
- Debe existir un registro previo del Escenario 1

#### Pasos:
1. **Autenticación**:
   - Usar el mismo código de cooperativa del Escenario 1
   - Click en "Continuar"
   - ✅ Debe autenticar correctamente

2. **Consulta y precarga automática**:
   - ✅ Debe consultar endpoint de datos automáticamente
   - ✅ Debe obtener respuesta 200 con datos completos
   - ✅ Debe mostrar **indicador de edición** en la parte superior
   - ✅ Formulario debe precargarse con todos los datos:
     * Autoridades: Secretario y Presidente
     * Contacto: Email
     * Titulares: Lista completa con nombres y documentos
     * Suplentes: Lista completa
     * Cartas Poder: Delegaciones configuradas

3. **Verificar precarga de datos**:
   ```
   ✅ Secretario: "Juan Pérez" (precargado)
   ✅ Presidente: "María González" (precargado)
   ✅ Email: "contacto@cooperativa.com" (precargado)
   ✅ Titular 1: "Carlos Rodríguez" - "12345678" (precargado)
   ✅ Titular 2: "Ana Martínez" - "87654321" (precargado)
   ✅ Suplente 1: "Pedro López" - "11223344" (precargado)
   ✅ Carta Poder: Carlos → Ana (precargada)
   ```

4. **Modificar algunos datos**:
   ```
   Cambios:
   - Cambiar email a: "nuevo-contacto@cooperativa.com"
   - Agregar un tercer titular: "Luis Fernández" - "55667788"
   - Cambiar la carta poder: de Luis hacia Ana
   ```

5. **Guardar cambios**:
   - Click en "Enviar Registración"
   - ✅ Debe enviar datos actualizados
   - ✅ Debe mostrar mensaje de éxito
   - ✅ Cambios deben persistirse

#### Resultado Esperado:
- Registro actualizado exitosamente
- Cambios reflejados en el almacenamiento

---

### 🔄 **Escenario 3: Re-edición (Verificar persistencia)**

#### Setup:
- Debe existir el registro modificado del Escenario 2

#### Pasos:
1. **Autenticación nuevamente**:
   - Usar el mismo código de cooperativa
   - ✅ Debe autenticar y consultar datos automáticamente

2. **Verificar cambios persistidos**:
   ```
   ✅ Email debe mostrar: "nuevo-contacto@cooperativa.com"
   ✅ Debe haber 3 titulares (incluyendo Luis Fernández)
   ✅ Carta poder debe ser: Luis → Ana
   ```

3. **Hacer una modificación menor**:
   - Cambiar teléfono o agregar un suplente adicional

4. **Confirmar persistencia**:
   - Guardar y volver a autenticar
   - ✅ Últimos cambios deben estar reflejados

---

## Testing de Endpoints

### 🔍 **Testing Manual con curl/Postman**

#### Endpoint de Consulta - Con datos existentes:
```bash
curl -X POST https://tu-dominio.com/api/consultar-registro \
  -H "Content-Type: application/json" \
  -d '{
    "codigo_cooperativa": "123"
  }'
```

**Respuesta esperada (200):**
```json
{
  "success": true,
  "datos": {
    "timestamp": "2025-09-05T10:30:00.000Z",
    "autoridades": {
      "secretario": "Juan Pérez",
      "presidente": "María González"
    },
    "contacto": {
      "correoElectronico": "nuevo-contacto@cooperativa.com"
    },
    "titulares": [
      {"nombre": "Carlos Rodríguez", "documento": "12345678"},
      {"nombre": "Ana Martínez", "documento": "87654321"},
      {"nombre": "Luis Fernández", "documento": "55667788"}
    ],
    "suplentes": [
      {"nombre": "Pedro López", "documento": "11223344"}
    ],
    "cartasPoder": [
      {"desde": "titular-id-3", "hacia": "titular-id-2"}
    ]
  }
}
```

#### Endpoint de Consulta - Sin datos previos:
```bash
curl -X POST https://tu-dominio.com/api/consultar-registro \
  -H "Content-Type: application/json" \
  -d '{
    "codigo_cooperativa": "999"
  }'
```

**Respuesta esperada (404 o 200 con success: false):**
```json
{
  "success": false,
  "message": "No se encontraron datos previos para esta cooperativa"
}
```

---

## Testing en el Browser

### 🌐 **Usando DevTools del Browser**

1. **Abrir DevTools** (F12)
2. **Ir a la pestaña Network**
3. **Ejecutar flujo de autenticación**
4. **Verificar peticiones HTTP**:

#### Petición de Consulta de Datos:
```
URL: [consultarDatosEndpoint]
Method: POST
Request Body: {"codigo_cooperativa": "123"}
Status: 200 (con datos) o 404/400 (sin datos)
```

#### Verificar en Console:
```javascript
// Verificar configuración
console.log(config.consultarDatosEndpoint);

// Verificar datos cargados
console.log("Cooperativa autenticada:", window.cooperativaActual);

// Verificar si está en modo edición
console.log("Modo edición:", document.querySelector('.edit-indicator') !== null);
```

---

## Debugging y Troubleshooting

### 🐛 **Problemas Comunes**

#### 1. **Endpoint retorna error 404/500**
```
Síntomas: No se precargan datos, aparece como registro nuevo
Solución: Verificar URL en consultarDatosEndpoint y implementación del endpoint
```

#### 2. **Datos no se precargan correctamente**
```
Síntomas: Indicador de edición aparece pero formulario está vacío
Solución: Verificar formato JSON de respuesta y función precargarDatosEnFormulario()
```

#### 3. **Indicador de edición no aparece**
```
Síntomas: Datos se precargan pero no hay indicador visual
Solución: Verificar función mostrarIndicadorEdicion() y CSS .edit-indicator
```

#### 4. **CORS errors**
```
Síntomas: Error de CORS en browser console
Solución: Configurar headers CORS en el endpoint
```

### 📊 **Logs Útiles**

El frontend genera logs detallados en la consola:

```javascript
// Logs de consulta de datos
"[CONSULTA] Consultando datos para cooperativa: 123"
"[CONSULTA] Datos encontrados y precargados exitosamente"
"[CONSULTA] No se encontraron datos previos - modo nuevo registro"

// Logs de errores
"[ERROR CONSULTA] Error consultando datos existentes: [detalle]"
"[ERROR PRECARGA] Error precargando datos: [detalle]"
```

---

## Checklist de Validación

### ✅ **Funcionalidad Principal**
- [ ] Autenticación funciona correctamente
- [ ] Consulta automática de datos al autenticar
- [ ] Precarga correcta de todos los campos
- [ ] Indicador visual de edición aparece
- [ ] Guardado persiste datos correctamente
- [ ] Re-autenticación muestra datos actualizados

### ✅ **Manejo de Errores**
- [ ] Endpoint no disponible (error 500/timeout)
- [ ] Cooperativa sin datos previos (404)
- [ ] JSON malformado en respuesta
- [ ] Error de CORS
- [ ] Error de red

### ✅ **UI/UX**
- [ ] Indicador de edición es visible y claro
- [ ] Formulario se precarga sin errores visuales
- [ ] Transiciones suaves entre modos
- [ ] Mensajes de error son informativos
- [ ] Loading states durante peticiones

### ✅ **Datos**
- [ ] Todos los tipos de datos se precargan (autoridades, titulares, suplentes, cartas poder)
- [ ] Modificaciones se guardan correctamente
- [ ] Datos persisten entre sesiones
- [ ] No hay pérdida de datos durante edición

---

## URLs de Configuración

Para activar completamente la funcionalidad, asegurate de configurar:

```javascript
// En script.js - config object
const config = {
  // ... otros endpoints ...
  
  // ⚠️ CAMBIAR ESTA URL por tu endpoint real
  consultarDatosEndpoint: "https://tu-dominio.com/api/consultar-registro",
  
  // ... resto de config ...
};
```

---

## Próximos Pasos

1. **Implementar endpoint de consulta en Power Automate**
2. **Configurar almacenamiento de datos (SharePoint/Excel)**
3. **Actualizar URL en consultarDatosEndpoint**
4. **Ejecutar todos los escenarios de testing**
5. **Deploy a producción**

Una vez completados estos pasos, la funcionalidad de persistencia estará completamente operativa y las cooperativas podrán editar sus registros en sesiones futuras.
