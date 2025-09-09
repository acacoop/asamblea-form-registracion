# 🔧 Corrección: Cantidad de Suplentes = Cantidad de Votos

## 🚨 **CORRECCIÓN REQUERIDA:**

**En el Flow de Autenticación, la cantidad de suplentes debe ser igual a la cantidad de votos, no dividida por 3.**

---

## ❌ **CÓDIGO ACTUAL (INCORRECTO):**

### **Flow de Autenticación - Response Éxito:**
```json
{
    "success": true,
    "cooperativa": {
        "code": "@{outputs('Compose_-_Cooperativa_Encontrada')?['Title']}",
        "cuit": "@{outputs('Compose_-_Cooperativa_Encontrada')?['CUIT']}",
        "name": "@{outputs('Compose_-_Cooperativa_Encontrada')?['field_2']}",
        "votes": "@{int(outputs('Compose_-_Cooperativa_Encontrada')?['Total_x0020_votos'])}",
        "substitutes": "@{div(int(outputs('Compose_-_Cooperativa_Encontrada')?['Total_x0020_votos']), 3)}",  // ❌ INCORRECTO
        "CAR": "@{outputs('Compose_-_Cooperativa_Encontrada')?['field_6']}",
        "CAR Nombre": "@{outputs('Compose_-_Cooperativa_Encontrada')?['field_7']?['Value']}",
        "codigo_verificador": "@{outputs('Compose_-_Cooperativa_Encontrada')?['CodVerificador']}"
    }
}
```

---

## ✅ **CÓDIGO CORRECTO:**

### **Flow de Autenticación - Response Éxito (CORREGIDO):**
```json
{
    "success": true,
    "cooperativa": {
        "code": "@{outputs('Compose_-_Cooperativa_Encontrada')?['Title']}",
        "cuit": "@{outputs('Compose_-_Cooperativa_Encontrada')?['CUIT']}",
        "name": "@{outputs('Compose_-_Cooperativa_Encontrada')?['field_2']}",
        "votes": "@{int(outputs('Compose_-_Cooperativa_Encontrada')?['Total_x0020_votos'])}",
        "substitutes": "@{int(outputs('Compose_-_Cooperativa_Encontrada')?['Total_x0020_votos'])}",  // ✅ CORRECTO
        "CAR": "@{outputs('Compose_-_Cooperativa_Encontrada')?['field_6']}",
        "CAR Nombre": "@{outputs('Compose_-_Cooperativa_Encontrada')?['field_7']?['Value']}",
        "codigo_verificador": "@{outputs('Compose_-_Cooperativa_Encontrada')?['CodVerificador']}"
    }
}
```

---

## 📊 **COMPARACIÓN DE RESULTADOS:**

### **Cooperativa con 2 votos:**

#### **❌ ANTES (INCORRECTO):**
```json
{
    "votes": 2,
    "substitutes": 0  // div(2, 3) = 0
}
```

#### **✅ DESPUÉS (CORRECTO):**
```json
{
    "votes": 2,
    "substitutes": 2  // Mismo valor que votos
}
```

### **Cooperativa con 6 votos:**

#### **❌ ANTES (INCORRECTO):**
```json
{
    "votes": 6,
    "substitutes": 2  // div(6, 3) = 2
}
```

#### **✅ DESPUÉS (CORRECTO):**
```json
{
    "votes": 6,
    "substitutes": 6  // Mismo valor que votos
}
```

---

## 🔧 **PASOS PARA CORREGIR:**

### **1. Acceder al Flow de Autenticación:**
- Ve a Power Automate
- Busca el Flow: "Autenticación con Lista Existente"
- Click en **Edit**

### **2. Localizar la acción Response - Éxito:**
- Busca la acción **"Response - Éxito (200)"**
- En la rama **SÍ** de la condición "Credenciales Válidas"

### **3. Corregir el campo "substitutes":**

#### **Cambiar DESDE:**
```json
"substitutes": "@{div(int(outputs('Compose_-_Cooperativa_Encontrada')?['Total_x0020_votos']), 3)}"
```

#### **Cambiar HACIA:**
```json
"substitutes": "@{int(outputs('Compose_-_Cooperativa_Encontrada')?['Total_x0020_votos'])}"
```

### **4. Guardar y probar:**
- **Save** el Flow
- **Probar** con cooperativa conocida

---

## 🧪 **VERIFICACIÓN POST-CORRECCIÓN:**

### **Test con Cooperativa 9 (2 votos):**
```bash
curl -X POST "URL_FLOW_AUTH" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo_cooperativa": "9",
    "codigo_verificador": "CPYHX"
  }'
```

### **Resultado esperado:**
```json
{
    "success": true,
    "cooperativa": {
        "code": "9",
        "cuit": "33533717999",
        "name": "Cooperativa Agropecuaria de Armstrong Ltda.",
        "votes": 2,
        "substitutes": 2,  // ✅ Ahora igual a votes
        "CAR": "3",
        "CAR Nombre": "Centro y Sur de Santa Fe",
        "codigo_verificador": "CPYHX"
    }
}
```

---

## 📋 **REGLA DE NEGOCIO CORRECTA:**

### **✅ Cantidad de Suplentes = Cantidad de Votos**
- **Cooperativa con 1 voto** → 1 suplente
- **Cooperativa con 2 votos** → 2 suplentes  
- **Cooperativa con 6 votos** → 6 suplentes
- **Cooperativa con 10 votos** → 10 suplentes

### **❌ NO dividir por 3:**
La división por 3 era incorrecta y podía causar confusión en el frontend sobre cuántos suplentes puede registrar cada cooperativa.

---

## 🎯 **IMPACTO DE LA CORRECCIÓN:**

### **Frontend (script.js):**
El frontend ya usa `cooperativa.substitutes` para mostrar la cantidad máxima de suplentes permitidos. Con esta corrección, mostrará el valor correcto.

### **Validaciones:**
Las validaciones del formulario ahora permitirán registrar la cantidad correcta de suplentes (igual a la cantidad de votos).

### **Experiencia de usuario:**
Las cooperativas verán la información correcta sobre cuántos representantes pueden registrar.

---

## 🚀 **PRIORIDAD:**

**Esta corrección debe aplicarse antes de poner el sistema en producción para evitar confusiones sobre la cantidad de suplentes permitidos.**
