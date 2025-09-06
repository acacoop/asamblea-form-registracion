// Estado global de la aplicación
const state = {
  titulares: [],
  suplentes: [],
  cartasPoder: [],
  cooperativas: [],
  cooperativaSeleccionada: null,
  usuarioAutenticado: false,
  maxTitulares: 6,
  maxSuplentes: 6,
  maxCartasPoder: 2,
};

// Configuración del endpoint
const config = {
  // Endpoint de Power Automate para envío de datos
  apiEndpoint: "https://defaulta7cad06884854149bb950f323bdfa8.9e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/de424a7251e74d6e861544b4c6c41352/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=si_BRNHv_4rn9mFJysIEFomXlAtPaqOUq-D-jWl74Og",
  // Endpoint de Power Automate para autenticación de cooperativas
  authEndpoint: "https://defaulta7cad06884854149bb950f323bdfa8.9e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/d4951cc773a048c9964ef65dfdd3c69c/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=tG24Qxrd_AUtjKiQR8D1lt2yvbOtZZNBtkYEXn9_aZI",
  // Endpoint de Power Automate para consultar datos existentes (REEMPLAZAR CON TU ENDPOINT)
  consultarDatosEndpoint: "https://tu-dominio.com/api/consultar-registro",
  timeout: 30000, // 30 segundos
};

// Funciones de autenticación
async function intentarLogin() {
  const codigoCooperativa = document.getElementById('codigo-cooperativa').value.trim();
  const codigoVerificador = document.getElementById('codigo-verificador').value.trim();
  const errorElement = document.getElementById('login-error');
  const loginBtn = document.getElementById('btn-login');
  
  // Limpiar error anterior
  if (errorElement) {
    errorElement.style.display = 'none';
  }
  
  // Validar campos
  if (!codigoCooperativa || !codigoVerificador) {
    mostrarErrorLogin('Por favor complete ambos campos');
    return;
  }
  
  // Deshabilitar botón durante la validación
  loginBtn.disabled = true;
  loginBtn.textContent = 'Verificando...';
  
  try {
    console.log('🔐 Intentando autenticación con endpoint:', { codigoCooperativa, codigoVerificador });
    
    // Llamar al endpoint de autenticación
    const cooperativa = await autenticarConEndpoint(codigoCooperativa, codigoVerificador);
    
    if (cooperativa) {
      // Autenticación exitosa
      state.usuarioAutenticado = true;
      state.cooperativaSeleccionada = cooperativa;
      
      console.log('✅ Autenticación exitosa para:', cooperativa.name);
      
      // Ocultar pantalla de credenciales y mostrar pantalla de registro
      const credencialesScreen = document.getElementById('credenciales-screen');
      const registroScreen = document.getElementById('registro-screen');
      
      if (credencialesScreen && registroScreen) {
        credencialesScreen.style.display = 'none';
        registroScreen.style.display = 'block';
        
        // Mostrar información de cooperativa
        mostrarInformacionCooperativa(cooperativa);
        
        // Actualizar estados de botones después del login
        updateButtonStates();
      } else {
        console.error('❌ No se encontraron las pantallas de credenciales o registro');
        mostrarErrorLogin('Error al cambiar de pantalla');
      }
      
    } else {
      mostrarErrorLogin('Código de cooperativa o código verificador incorrecto');
    }
  } catch (error) {
    console.error('❌ Error en autenticación:', error);
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      mostrarErrorLogin('Error de conexión. Verifique su internet e intente nuevamente');
    } else if (error.message.includes('404')) {
      mostrarErrorLogin('Servicio de autenticación no disponible');
    } else if (error.message.includes('401') || error.message.includes('403')) {
      mostrarErrorLogin('Credenciales incorrectas');
    } else {
      mostrarErrorLogin('Error al verificar credenciales: ' + error.message);
    }
  } finally {
    // Rehabilitar botón
    loginBtn.disabled = false;
    loginBtn.textContent = 'Acceder';
  }
}

// Nueva función para autenticar contra el endpoint
async function autenticarConEndpoint(codigoCooperativa, codigoVerificador) {
  try {
    const response = await fetch(config.authEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        codigo_cooperativa: codigoCooperativa,
        codigo_verificador: codigoVerificador
      })
    });
    
    console.log('🌐 Respuesta del endpoint de autenticación:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // Credenciales incorrectas
        return null;
      } else {
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
      }
    }
    
    const responseText = await response.text();
    console.log('📝 Contenido de respuesta:', responseText);
    
    if (!responseText.trim()) {
      throw new Error('Respuesta vacía del servidor');
    }
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Error al parsear JSON:', parseError);
      throw new Error('Respuesta del servidor no válida');
    }
    
    // Verificar que la respuesta tenga la estructura esperada
    if (data && data.cooperativa) {
      console.log('✅ Datos de cooperativa recibidos:', data.cooperativa);
      return data.cooperativa;
    } else if (data && data.success === false) {
      // El endpoint indica que las credenciales son incorrectas
      return null;
    } else {
      console.error('❌ Estructura de respuesta inesperada:', data);
      throw new Error('Estructura de respuesta del servidor no válida');
    }
    
  } catch (error) {
    console.error('❌ Error en autenticarConEndpoint:', error);
    throw error;
  }
}

function mostrarErrorLogin(mensaje) {
  let errorElement = document.getElementById('login-error');
  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.id = 'login-error';
    errorElement.className = 'login-error';
    const loginForm = document.getElementById('login-form');
    loginForm.appendChild(errorElement);
  }
  
  errorElement.textContent = mensaje;
  errorElement.style.display = 'block';
}

function mostrarInformacionCooperativa(cooperativa) {
  console.log('🔄 Mostrando información de cooperativa:', cooperativa.name);
  
  // Actualizar datos de la cooperativa autenticada con verificación de existencia
  const nombreElement = document.getElementById('cooperativa-nombre');
  const codigoElement = document.getElementById('cooperativa-codigo');
  const carElement = document.getElementById('cooperativa-car');
  const votosElement = document.getElementById('cooperativa-votos');
  const suplentesElement = document.getElementById('cooperativa-suplentes');
  
  if (nombreElement) {
    nombreElement.textContent = cooperativa.name;
    console.log('✅ Nombre actualizado:', cooperativa.name);
  } else {
    console.warn('⚠️ Elemento cooperativa-nombre no encontrado');
  }
  
  if (codigoElement) {
    codigoElement.textContent = cooperativa.code;
    console.log('✅ Código actualizado:', cooperativa.code);
  } else {
    console.warn('⚠️ Elemento cooperativa-codigo no encontrado');
  }
  
  if (carElement) {
    carElement.textContent = `CAR ${cooperativa.CAR} - ${cooperativa['CAR Nombre'] || 'No disponible'}`;
    console.log('✅ CAR actualizado');
  } else {
    console.warn('⚠️ Elemento cooperativa-car no encontrado');
  }
  
  if (votosElement) {
    votosElement.textContent = cooperativa.votes;
    console.log('✅ Votos actualizados:', cooperativa.votes);
  } else {
    console.warn('⚠️ Elemento cooperativa-votos no encontrado');
  }
  
  if (suplentesElement) {
    suplentesElement.textContent = cooperativa.substitutes;
    console.log('✅ Suplentes actualizados:', cooperativa.substitutes);
  } else {
    console.warn('⚠️ Elemento cooperativa-suplentes no encontrado');
  }
  
  console.log('✅ Información de cooperativa procesada exitosamente');
  
  // Preparar los límites según los votos de la cooperativa
  state.maxTitulares = cooperativa.votes || 6;
  state.maxSuplentes = cooperativa.substitutes || 6;
  
  // Limpiar datos anteriores
  state.titulares = [];
  state.suplentes = [];
  state.cartasPoder = [];
}

// Nueva función para consultar datos existentes
async function consultarDatosExistentes(codigoCooperativa) {
  try {
    console.log('🔍 Consultando datos existentes para cooperativa:', codigoCooperativa);
    
    const response = await fetch(config.consultarDatosEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        codigo_cooperativa: codigoCooperativa
      })
    });
    
    console.log('🌐 Respuesta de consulta de datos:', {
      status: response.status,
      statusText: response.statusText
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        // No hay datos previos, es normal
        console.log('ℹ️ No se encontraron datos previos para esta cooperativa');
        return null;
      } else {
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
      }
    }
    
    const responseText = await response.text();
    console.log('📝 Contenido de respuesta consulta:', responseText);
    
    if (!responseText.trim()) {
      console.log('ℹ️ Respuesta vacía - no hay datos previos');
      return null;
    }
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Error al parsear JSON de consulta:', parseError);
      throw new Error('Respuesta del servidor no válida');
    }
    
    // Verificar que la respuesta tenga la estructura esperada
    if (data && data.success === true && data.datos) {
      console.log('✅ Datos existentes encontrados:', data.datos);
      return data.datos;
    } else if (data && data.success === false) {
      // No hay datos previos
      console.log('ℹ️ No hay datos previos guardados');
      return null;
    } else {
      console.error('❌ Estructura de respuesta inesperada:', data);
      return null;
    }
    
  } catch (error) {
    console.error('❌ Error en consultarDatosExistentes:', error);
    // No es un error crítico, simplemente no hay datos previos
    return null;
  }
}

// Función para precargar datos existentes en el formulario
function precargarDatosEnFormulario(datos) {
  console.log('📋 Precargando datos en formulario:', datos);
  
  try {
    // Precargar autoridades
    if (datos.autoridades) {
      const secretarioInput = document.getElementById('secretario');
      const presidenteInput = document.getElementById('presidente');
      
      if (secretarioInput && datos.autoridades.secretario) {
        secretarioInput.value = datos.autoridades.secretario;
        console.log('✅ Secretario precargado:', datos.autoridades.secretario);
      }
      
      if (presidenteInput && datos.autoridades.presidente) {
        presidenteInput.value = datos.autoridades.presidente;
        console.log('✅ Presidente precargado:', datos.autoridades.presidente);
      }
    }
    
    // Precargar correo
    if (datos.contacto && datos.contacto.correoElectronico) {
      const correoInput = document.getElementById('correo-electronico');
      if (correoInput) {
        correoInput.value = datos.contacto.correoElectronico;
        console.log('✅ Correo precargado:', datos.contacto.correoElectronico);
      }
    }
    
    // Precargar titulares
    if (datos.titulares && Array.isArray(datos.titulares)) {
      datos.titulares.forEach((titular, index) => {
        addTitular();
        const titularCard = document.querySelector(`[data-id="${state.titulares[index].id}"]`);
        if (titularCard) {
          const nombreInput = titularCard.querySelector(`input[id^="nombre-"]`);
          const documentoInput = titularCard.querySelector(`input[id^="documento-"]`);
          
          if (nombreInput) nombreInput.value = titular.nombre || '';
          if (documentoInput) documentoInput.value = titular.documento || '';
        }
      });
      console.log('✅ Titulares precargados:', datos.titulares.length);
    }
    
    // Precargar suplentes
    if (datos.suplentes && Array.isArray(datos.suplentes)) {
      datos.suplentes.forEach((suplente, index) => {
        addSuplente();
        const suplenteCard = document.querySelector(`[data-id="${state.suplentes[index].id}"]`);
        if (suplenteCard) {
          const nombreInput = suplenteCard.querySelector(`input[id^="nombre-sup-"]`);
          const documentoInput = suplenteCard.querySelector(`input[id^="documento-sup-"]`);
          
          if (nombreInput) nombreInput.value = suplente.nombre || '';
          if (documentoInput) documentoInput.value = suplente.documento || '';
        }
      });
      console.log('✅ Suplentes precargados:', datos.suplentes.length);
    }
    
    // Precargar cartas poder
    if (datos.cartasPoder && Array.isArray(datos.cartasPoder)) {
      datos.cartasPoder.forEach((carta, index) => {
        addCartaPoder();
        const cartaCard = document.querySelector(`[data-id="${state.cartasPoder[index].id}"]`);
        if (cartaCard) {
          const desdeSelect = cartaCard.querySelector(`select[id^="desde-"]`);
          const haciaSelect = cartaCard.querySelector(`select[id^="hacia-"]`);
          
          // Necesitamos esperar a que los selects se actualicen
          setTimeout(() => {
            if (desdeSelect) desdeSelect.value = carta.desde || '';
            if (haciaSelect) haciaSelect.value = carta.hacia || '';
          }, 100);
        }
      });
      console.log('✅ Cartas poder precargadas:', datos.cartasPoder.length);
    }
    
    // Mostrar indicador de edición
    mostrarIndicadorEdicion();
    
    // Actualizar resumen
    setTimeout(() => {
      updateResumen();
      updateButtonStates();
    }, 200);
    
  } catch (error) {
    console.error('❌ Error al precargar datos:', error);
  }
}

// Función para mostrar indicador de que se están editando datos existentes
function mostrarIndicadorEdicion() {
  const autoridadesSection = document.getElementById('autoridades-section');
  if (autoridadesSection) {
    const indicador = document.createElement('div');
    indicador.className = 'edit-indicator';
    indicador.innerHTML = `
      <div class="edit-notice">
        <span class="edit-icon">✏️</span>
        <strong>Editando registro existente</strong>
        <p>Se han cargado los datos previamente guardados. Puede modificarlos y guardar nuevamente.</p>
      </div>
    `;
    
    // Insertar al principio de la sección
    autoridadesSection.insertBefore(indicador, autoridadesSection.firstChild);
  }
}

async function continuarAlFormulario() {
  if (!state.usuarioAutenticado || !state.cooperativaSeleccionada) {
    mostrarErrorLogin('Error: No hay una sesión válida');
    return;
  }
  
  // Cambiar a la pantalla de registro
  mostrarRegistro();
  
  // Actualizar la información de la cooperativa en el formulario de registro
  actualizarDatosCooperativaEnFormulario();
  
  // Actualizar títulos con información de la cooperativa
  actualizarTitulosConLimites();
  
  // Consultar si hay datos existentes y precargarlos
  try {
    console.log('🔍 Consultando datos existentes...');
    const datosExistentes = await consultarDatosExistentes(state.cooperativaSeleccionada.code);
    
    if (datosExistentes) {
      console.log('📋 Precargando datos existentes...');
      precargarDatosEnFormulario(datosExistentes);
    } else {
      console.log('ℹ️ No hay datos previos, formulario en blanco');
    }
  } catch (error) {
    console.error('❌ Error al consultar datos existentes:', error);
    // No es crítico, continuar con formulario vacío
  }
}

function actualizarDatosCooperativaEnFormulario() {
  if (!state.cooperativaSeleccionada) return;
  
  const coop = state.cooperativaSeleccionada;
  
  // No necesitamos campos de selección, la cooperativa ya está determinada
  // Solo actualizamos la información visible si hay campos específicos
  const codeField = document.getElementById("code");
  const votesField = document.getElementById("votes");
  
  if (codeField) codeField.value = coop.code;
  if (votesField) votesField.value = coop.votes;
}

function actualizarTitulosConLimites() {
  if (!state.cooperativaSeleccionada) return;
  
  const coop = state.cooperativaSeleccionada;
  
  // Actualizar títulos de las secciones con los límites
  const titularesTitle = document.querySelector("#titulares-section h2");
  const suplentesTitle = document.querySelector("#suplentes-section h2");
  
  if (titularesTitle) {
    titularesTitle.textContent = `Titulares (máximo ${coop.votes})`;
  }
  
  if (suplentesTitle) {
    suplentesTitle.textContent = `Suplentes (máximo ${coop.substitutes})`;
  }
}

function cerrarSesion() {
  console.log('🔄 Cerrando sesión...');
  
  // Limpiar estado de autenticación
  state.usuarioAutenticado = false;
  state.cooperativaSeleccionada = null;
  state.titulares = [];
  state.suplentes = [];
  state.cartasPoder = [];
  
  // Limpiar campos del formulario de login
  const codigoCooperativa = document.getElementById('codigo-cooperativa');
  const codigoVerificador = document.getElementById('codigo-verificador');
  
  if (codigoCooperativa) codigoCooperativa.value = '';
  if (codigoVerificador) codigoVerificador.value = '';
  
  // Ocultar error de login
  const errorElement = document.getElementById('login-error');
  if (errorElement) {
    errorElement.style.display = 'none';
  }
  
  // Cambiar de pantalla: ocultar registro y mostrar credenciales
  const credencialesScreen = document.getElementById('credenciales-screen');
  const registroScreen = document.getElementById('registro-screen');
  
  if (credencialesScreen && registroScreen) {
    credencialesScreen.style.display = 'block';
    registroScreen.style.display = 'none';
    console.log('✅ Sesión cerrada, volviendo a pantalla de login');
  } else {
    console.error('❌ No se encontraron las pantallas para cerrar sesión');
  }
}

// Funciones de navegación entre pantallas
function mostrarRegistro() {
  // Verificar que el usuario esté autenticado
  if (!state.usuarioAutenticado || !state.cooperativaSeleccionada) {
    alert('Debe iniciar sesión con los códigos de su cooperativa antes de continuar');
    return;
  }
  
  document.getElementById("credenciales-screen").style.display = "none";
  document.getElementById("registro-screen").style.display = "block";
}

function volverCredenciales() {
  document.getElementById("registro-screen").style.display = "none";
  document.getElementById("credenciales-screen").style.display = "block";
  
  // Limpiar formularios cuando volvemos
  clearCooperativeData();
}

// NOTA: Las siguientes funciones de carga de CSV ya no son necesarias
// porque ahora la autenticación se hace contra un endpoint
// Se mantienen comentadas por si se necesitan como referencia

/*
// Cargar los datos de las cooperativas desde el CSV
async function loadCooperatives() {
  try {
    console.log('🔄 Intentando cargar CSV...');
    const response = await fetch("data/cooperatives_con_car_codigos.csv");
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    console.log('✅ CSV cargado, tamaño:', csvText.length, 'caracteres');
    console.log('🔍 Primeros 200 caracteres:', csvText.substring(0, 200));
    
    state.cooperativas = parseCSV(csvText);
    console.log("Cooperativas cargadas:", state.cooperativas.length);
    console.log("Primera cooperativa:", state.cooperativas[0]);
    
    // Debug: mostrar todos los códigos disponibles
    console.log("Códigos disponibles:", state.cooperativas.map(c => c.code).slice(0, 10));
    
    // Debug: buscar cooperativa 9 de diferentes formas
    console.log("Cooperativa 9 (string):", state.cooperativas.find(c => c.code === "9"));
    console.log("Cooperativa 9 (number):", state.cooperativas.find(c => c.code === 9));
    console.log("Cooperativa 9 (parseInt):", state.cooperativas.find(c => parseInt(c.code) === 9));
    
    // Debug: mostrar cooperativas que empiecen con 9
    console.log("Cooperativas con código que incluye 9:", state.cooperativas.filter(c => c.code?.toString().includes('9')).slice(0, 3));
  } catch (error) {
    console.error('❌ Error cargando CSV:', error);
    showError("Error al cargar las cooperativas: " + error.message);
  }
}

// Función para parsear el CSV
function parseCSV(csv) {
  console.log('🔍 Parseando CSV...');
  console.log('📊 CSV recibido (primeras 200 chars):', csv.substring(0, 200));
  console.log('📏 Longitud total del CSV:', csv.length);
  
  if (!csv || csv.length === 0) {
    console.error('❌ CSV vacío o undefined');
    return [];
  }
  
  const lines = csv.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  console.log('📝 Líneas válidas encontradas:', lines.length);
  console.log('📋 Primera línea (header):', lines[0]);
  console.log('📋 Segunda línea (primera coop):', lines[1]);
  
  if (lines.length < 2) {
    console.error('❌ CSV sin datos válidos');
    return [];
  }
  
  const cooperativas = [];
  
  // Procesar desde línea 1 (saltar header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    
    try {
      // Parser específico para el formato: "campo1,campo2,campo3,campo4,campo5,campo6,campo7;campo8"
      let values = [];
      
      // Primero separar por punto y coma para obtener el código verificador
      const parts = line.split(';');
      if (parts.length === 2) {
        // Los primeros 7 campos separados por coma
        const firstSevenFields = parts[0].split(',');
        // El último campo (código verificador)
        const codigoVerificador = parts[1].trim().replace(/^"|"$/g, '');
        
        // Combinar todos los campos
        values = [...firstSevenFields.map(v => v.trim().replace(/^"|"$/g, '')), codigoVerificador];
      } else {
        // Fallback: si no hay punto y coma, intentar parsing normal
        values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      }
      
      if (values.length >= 8) {
        const cooperativa = {
          code: values[0],
          cuit: values[1],
          name: values[2],
          votes: parseInt(values[3]) || 0,
          substitutes: parseInt(values[4]) || 0,
          CAR: values[5],
          'CAR Nombre': values[6],
          codigo_verificador: values[7]
        };
        
        cooperativas.push(cooperativa);
        
        if (cooperativa.code === '9') {
          console.log('🎯 ENCONTRADA Cooperativa 9:', cooperativa);
        }
        
        // Solo mostrar las primeras 3 para no saturar el log
        if (i <= 3) {
          console.log(`✅ Cooperativa ${i} cargada:`, cooperativa);
        }
      } else {
        console.log(`⚠️ Línea ${i} formato incorrecto (${values.length} campos):`, values);
      }
    } catch (error) {
      console.error(`❌ Error línea ${i}:`, error, line);
    }
  }
  
  console.log(`🎉 Total cooperativas parseadas: ${cooperativas.length}`);
  return cooperativas;
}
*/

// Función auxiliar para parsing normal
function parseLineNormal(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

// Poblar el select con los CARs
function populateCarSelect(cooperativas) {
  const select = document.getElementById("car-select");
  select.innerHTML = '<option value="">Seleccione un CAR</option>';

  // Obtener CARs únicos
  const cars = new Map();
  cooperativas.forEach((coop) => {
    if (coop.CAR && coop["CAR Nombre"]) {
      cars.set(coop.CAR, coop["CAR Nombre"]);
    }
  });

  // Ordenar CARs por número
  const sortedCars = Array.from(cars.entries()).sort((a, b) => a[0] - b[0]);

  sortedCars.forEach(([carNumber, carName]) => {
    const option = document.createElement("option");
    option.value = carNumber;
    option.textContent = `CAR ${carNumber} - ${carName}`;
    select.appendChild(option);
  });
}

// Poblar el select con las cooperativas filtradas por CAR
function populateCooperativeSelect(cooperativas) {
  const select = document.getElementById("cooperative");
  select.innerHTML = '<option value="">Seleccione una cooperativa</option>';

  // Ordenar cooperativas por nombre
  cooperativas.sort((a, b) => a.name.localeCompare(b.name));

  cooperativas.forEach((coop) => {
    const option = document.createElement("option");
    option.value = coop.code;
    option.textContent = coop.name;
    option.dataset.votes = coop.votes;
    option.dataset.substitutes = coop.substitutes;
    option.dataset.car = coop.CAR;
    option.dataset.carName = coop["CAR Nombre"];
    select.appendChild(option);
  });
}

// Filtrar cooperativas por CAR seleccionado
function filterCooperativesByCAR() {
  const carSelect = document.getElementById("car-select");
  const selectedCAR = carSelect.value;

  if (!selectedCAR) {
    // Si no hay CAR seleccionado, limpiar el select de cooperativas
    const cooperativeSelect = document.getElementById("cooperative");
    cooperativeSelect.innerHTML =
      '<option value="">Primero seleccione un CAR</option>';

    // Limpiar datos de cooperativa seleccionada
    clearCooperativeData();
    return;
  }

  // Filtrar cooperativas por CAR
  const filteredCooperativas = state.cooperativas.filter(
    (coop) => parseInt(coop.CAR) === parseInt(selectedCAR)
  );

  // Poblar el select con las cooperativas filtradas
  populateCooperativeSelect(filteredCooperativas);

  // Limpiar datos de cooperativa anteriormente seleccionada
  clearCooperativeData();
}

// Limpiar datos de cooperativa y formulario
function clearCooperativeData() {
  state.cooperativaSeleccionada = null;
  state.titulares = [];
  state.suplentes = [];
  state.cartasPoder = [];

  // Limpiar campos de información de cooperativa
  document.getElementById("code").value = "";
  document.getElementById("votes").value = "";

  // Limpiar contenedores
  // Limpiar contenedores de forma segura
  safeSetInnerHTML("titulares-container", "");
  safeSetInnerHTML("suplentes-container", "");
  safeSetInnerHTML("cartas-poder-container", "");

  // Ocultar sección de resumen
  const resumenSection = document.getElementById("resumen-section");
  if (resumenSection) {
    resumenSection.style.display = "none";
  }

  // Restaurar textos por defecto
  document.querySelector("#titulares-section h2").textContent = "Titulares";
  document.querySelector("#suplentes-section h2").textContent = "Suplentes";

  // Resetear límites
  state.maxTitulares = 6;
  state.maxSuplentes = 6;

  // Actualizar botones
  updateButtonStates();

  // Limpiar resumen
  updateResumen();
}

// Funciones de utilidad
function safeSetInnerHTML(elementId, content) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = content;
  }
}

function createUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function createTitularCard(id) {
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.id = id;
  card.innerHTML = `
        <div class="form-row">
            <div class="formGroup">
                <label for="nombre-${id}">Nombre completo:</label>
                <input type="text" id="nombre-${id}" pattern="[A-Za-zÀ-ÿ\s]+" title="Solo se permiten letras y espacios" required>
            </div>
            <div class="formGroup">
                <label for="documento-${id}">Documento:</label>
                <input type="text" id="documento-${id}" pattern="[0-9]+" title="Solo se permiten números" required>
            </div>
            <button type="button" class="btn-remove" onclick="removeTitular('${id}')">Eliminar</button>
        </div>
    `;

  // Agregar validaciones en tiempo real
  const nombreInput = card.querySelector(`#nombre-${id}`);
  const documentoInput = card.querySelector(`#documento-${id}`);

  nombreInput.addEventListener("input", function () {
    this.value = this.value.replace(/[^A-Za-zÀ-ÿ\s]/g, "");
  });

  documentoInput.addEventListener("input", function () {
    this.value = this.value.replace(/[^0-9]/g, "");
  });

  return card;
}

function createSuplenteCard(id) {
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.id = id;
  card.innerHTML = `
        <div class="form-row">
            <div class="formGroup">
                <label for="nombre-sup-${id}">Nombre completo:</label>
                <input type="text" id="nombre-sup-${id}" pattern="[A-Za-zÀ-ÿ\s]+" title="Solo se permiten letras y espacios" required>
            </div>
            <div class="formGroup">
                <label for="documento-sup-${id}">Documento:</label>
                <input type="text" id="documento-sup-${id}" pattern="[0-9]+" title="Solo se permiten números" required>
            </div>
            <button type="button" class="btn-remove" onclick="removeSuplente('${id}')">Eliminar</button>
        </div>
    `;

  // Agregar validaciones en tiempo real
  const nombreInput = card.querySelector(`#nombre-sup-${id}`);
  const documentoInput = card.querySelector(`#documento-sup-${id}`);

  nombreInput.addEventListener("input", function () {
    this.value = this.value.replace(/[^A-Za-zÀ-ÿ\s]/g, "");
  });

  documentoInput.addEventListener("input", function () {
    this.value = this.value.replace(/[^0-9]/g, "");
  });

  return card;
}

function createCartaPoderCard(id) {
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.id = id;
  card.innerHTML = `
        <div class="form-row">
            <div class="formGroup">
                <label for="desde-${id}">Poderdante (quien delega):</label>
                <select id="desde-${id}" required onchange="validateCartaPoder('${id}')">
                    <option value="">Seleccione un titular</option>
                </select>
            </div>
            <div class="formGroup">
                <label for="hacia-${id}">Apoderado (quien recibe):</label>
                <select id="hacia-${id}" required onchange="validateCartaPoder('${id}')">
                    <option value="">Seleccione un titular</option>
                </select>
            </div>
            <button type="button" class="btn-remove" onclick="removeCartaPoder('${id}')">Eliminar</button>
        </div>
    `;
  return card;
}

// Funciones de gestión de titulares
function addTitular() {
  console.log('🔄 Intentando agregar titular...');
  console.log('📊 Estado actual:', {
    cooperativaSeleccionada: state.cooperativaSeleccionada?.name,
    titularesActuales: state.titulares.length,
    maxTitulares: state.maxTitulares,
    usuarioAutenticado: state.usuarioAutenticado
  });
  
  if (!state.cooperativaSeleccionada) {
    console.error('❌ No hay cooperativa seleccionada');
    showError("Debe seleccionar una cooperativa antes de agregar titulares");
    return;
  }

  if (state.titulares.length >= state.maxTitulares) {
    console.error('❌ Límite de titulares alcanzado');
    showError(
      `No se pueden agregar más titulares. Máximo permitido según votos de la cooperativa: ${state.maxTitulares}`
    );
    return;
  }

  const id = createUniqueId();
  state.titulares.push({ id });
  console.log('✅ Titular agregado con ID:', id);
  
  const card = createTitularCard(id);
  const container = document.getElementById("titulares-container");
  
  if (container) {
    container.appendChild(card);
    console.log('✅ Card agregada al contenedor');
  } else {
    console.error('❌ No se encontró el contenedor de titulares');
  }
  
  updateCartaPoderSelects();
  updateButtonStates();
}

function removeTitular(id) {
  state.titulares = state.titulares.filter((t) => t.id !== id);
  document.querySelector(`[data-id="${id}"]`).remove();
  updateCartaPoderSelects();
  updateButtonStates();
}

// Funciones de gestión de suplentes
function addSuplente() {
  console.log('🔄 Intentando agregar suplente...');
  console.log('📊 Estado actual:', {
    cooperativaSeleccionada: state.cooperativaSeleccionada?.name,
    suplentesActuales: state.suplentes.length,
    maxSuplentes: state.maxSuplentes,
    usuarioAutenticado: state.usuarioAutenticado
  });
  
  if (!state.cooperativaSeleccionada) {
    console.error('❌ No hay cooperativa seleccionada');
    showError("Debe seleccionar una cooperativa antes de agregar suplentes");
    return;
  }

  if (state.suplentes.length >= state.maxSuplentes) {
    console.error('❌ Límite de suplentes alcanzado');
    showError(
      `No se pueden agregar más suplentes. Máximo permitido según votos de la cooperativa: ${state.maxSuplentes}`
    );
    return;
  }

  const id = createUniqueId();
  state.suplentes.push({ id });
  console.log('✅ Suplente agregado con ID:', id);
  
  const card = createSuplenteCard(id);
  const container = document.getElementById("suplentes-container");
  
  if (container) {
    container.appendChild(card);
    console.log('✅ Card agregada al contenedor');
  } else {
    console.error('❌ No se encontró el contenedor de suplentes');
  }
  
  updateButtonStates();
}

function removeSuplente(id) {
  state.suplentes = state.suplentes.filter((s) => s.id !== id);
  document.querySelector(`[data-id="${id}"]`).remove();
  updateButtonStates();
}

// Funciones de gestión de cartas poder
function addCartaPoder() {
  if (!state.cooperativaSeleccionada) {
    showError("Debe seleccionar una cooperativa antes de agregar cartas poder");
    return;
  }

  if (state.titulares.length < 2) {
    showError("Debe haber al menos 2 titulares para crear cartas poder");
    return;
  }

  const id = createUniqueId();
  state.cartasPoder.push({ id });
  const card = createCartaPoderCard(id);
  document.getElementById("cartas-poder-container").appendChild(card);
  updateCartaPoderSelects();
}

function removeCartaPoder(id) {
  state.cartasPoder = state.cartasPoder.filter((cp) => cp.id !== id);
  document.querySelector(`[data-id="${id}"]`).remove();
  updateCartaPoderSelects();
}

function updateCartaPoderSelects() {
  const titulares = Array.from(
    document.querySelectorAll("#titulares-container .card")
  ).map((card) => ({
    id: card.dataset.id,
    nombre: card.querySelector('input[id^="nombre-"]').value,
  }));

  // Obtener lista de poderdantes (quienes ya delegaron su voto)
  const poderdantes = new Set();
  state.cartasPoder.forEach((cpOther) => {
    const otherCard = document.querySelector(`[data-id="${cpOther.id}"]`);
    if (otherCard) {
      const desde = otherCard.querySelector(`select[id^="desde-"]`).value;
      if (desde) {
        poderdantes.add(desde);
      }
    }
  });

  state.cartasPoder.forEach((cp) => {
    const card = document.querySelector(`[data-id="${cp.id}"]`);
    if (!card) return;

    const desdeSelect = card.querySelector(`select[id^="desde-"]`);
    const haciaSelect = card.querySelector(`select[id^="hacia-"]`);

    const currentDesde = desdeSelect.value;
    const currentHacia = haciaSelect.value;

    // Obtener poderdantes excluyendo el actual
    const otrosPoderdantes = new Set();
    state.cartasPoder.forEach((cpOther) => {
      if (cpOther.id !== cp.id) {
        // Excluir la carta actual
        const otherCard = document.querySelector(`[data-id="${cpOther.id}"]`);
        if (otherCard) {
          const desde = otherCard.querySelector(`select[id^="desde-"]`).value;
          if (desde) {
            otrosPoderdantes.add(desde);
          }
        }
      }
    });

    desdeSelect.innerHTML = '<option value="">Seleccione un titular</option>';
    haciaSelect.innerHTML = '<option value="">Seleccione un titular</option>';

    titulares.forEach((t) => {
      // Solo los titulares que NO son poderdantes en OTRAS cartas pueden ser poderdantes
      if (!otrosPoderdantes.has(t.id)) {
        desdeSelect.add(new Option(t.nombre || `Titular ${t.id}`, t.id));
      }

      // Solo los titulares que NO son poderdantes en NINGUNA carta pueden ser apoderados
      if (!poderdantes.has(t.id)) {
        haciaSelect.add(new Option(t.nombre || `Titular ${t.id}`, t.id));
      }
    });

    // Restaurar valores solo si siguen siendo válidos
    if (currentDesde && !otrosPoderdantes.has(currentDesde)) {
      desdeSelect.value = currentDesde;
    } else if (currentDesde && otrosPoderdantes.has(currentDesde)) {
      // Si el poderdante seleccionado ya es poderdante en otra carta, limpiar la selección
      desdeSelect.value = "";
    }

    // Solo restaurar el valor de apoderado si no es un poderdante
    if (currentHacia && !poderdantes.has(currentHacia)) {
      haciaSelect.value = currentHacia;
    } else if (currentHacia && poderdantes.has(currentHacia)) {
      // Si el apoderado seleccionado ahora es poderdante, limpiar la selección
      haciaSelect.value = "";
    }
  });
}

// Función para actualizar el estado de los botones
function updateButtonStates() {
  console.log('🔄 Actualizando estados de botones...');
  console.log('📊 Estado actual:', {
    cooperativaSeleccionada: state.cooperativaSeleccionada?.name,
    usuarioAutenticado: state.usuarioAutenticado,
    titulares: state.titulares.length,
    maxTitulares: state.maxTitulares,
    suplentes: state.suplentes.length,
    maxSuplentes: state.maxSuplentes
  });
  
  const addTitularBtn = document.getElementById("agregar-titular");
  const addSuplenteBtn = document.getElementById("agregar-suplente");
  const addCartaPoderBtn = document.getElementById("agregar-carta-poder");

  console.log('🔍 Botones encontrados:', {
    titular: !!addTitularBtn,
    suplente: !!addSuplenteBtn,
    cartaPoder: !!addCartaPoderBtn
  });

  // Si los botones no existen (estamos en pantalla de credenciales), salir
  if (!addTitularBtn || !addSuplenteBtn || !addCartaPoderBtn) {
    console.log('⚠️ Algunos botones no existen, saliendo de updateButtonStates');
    return;
  }

  if (!state.cooperativaSeleccionada) {
    console.log('❌ Sin cooperativa seleccionada - deshabilitando botones');
    // Sin cooperativa seleccionada - botones deshabilitados y texto básico
    addTitularBtn.disabled = true;
    addTitularBtn.textContent = "Agregar Titular";

    addSuplenteBtn.disabled = true;
    addSuplenteBtn.textContent = "Agregar Suplente";

    addCartaPoderBtn.disabled = true;
    addCartaPoderBtn.textContent = "Agregar Carta Poder";
  } else {
    console.log('✅ Con cooperativa seleccionada - habilitando botones');
    // Con cooperativa seleccionada - mostrar contadores y límites
    addTitularBtn.disabled = state.titulares.length >= state.maxTitulares;
    addTitularBtn.textContent =
      state.titulares.length >= state.maxTitulares
        ? `Máximo alcanzado (${state.maxTitulares})`
        : `Agregar Titular (${state.titulares.length}/${state.maxTitulares})`;

    addSuplenteBtn.disabled = state.suplentes.length >= state.maxSuplentes;
    addSuplenteBtn.textContent =
      state.suplentes.length >= state.maxSuplentes
        ? `Máximo alcanzado (${state.maxSuplentes})`
        : `Agregar Suplente (${state.suplentes.length}/${state.maxSuplentes})`;

    // Carta poder requiere al menos 2 titulares
    addCartaPoderBtn.disabled = state.titulares.length < 2;
    addCartaPoderBtn.textContent =
      state.titulares.length < 2
        ? "Agregar Carta Poder (requiere 2+ titulares)"
        : "Agregar Carta Poder";
  }
}

// Funciones de validación
function validateCartaPoder(id) {
  const card = document.querySelector(`[data-id="${id}"]`);
  const desde = card.querySelector(`select[id^="desde-"]`).value;
  const hacia = card.querySelector(`select[id^="hacia-"]`).value;

  if (desde && hacia && desde === hacia) {
    showError(
      "❌ Error: Un titular no puede ser poderdante y apoderado de sí mismo"
    );
    card.querySelector(`select[id^="hacia-"]`).value = "";
    return false;
  }

  const cartasHacia = state.cartasPoder.filter((cp) => {
    const card = document.querySelector(`[data-id="${cp.id}"]`);
    return card && card.querySelector(`select[id^="hacia-"]`).value === hacia;
  });

  if (cartasHacia.length > state.maxCartasPoder) {
    showError(
      `❌ Error: Un apoderado no puede recibir más de ${state.maxCartasPoder} cartas poder`
    );
    card.querySelector(`select[id^="hacia-"]`).value = "";
    return false;
  }

  // Verificar que el poderdante no haya delegado ya
  const yaDelego = state.cartasPoder.some((cp) => {
    const otherCard = document.querySelector(`[data-id="${cp.id}"]`);
    return (
      otherCard &&
      otherCard !== card &&
      otherCard.querySelector(`select[id^="desde-"]`).value === desde
    );
  });

  if (yaDelego) {
    showError("❌ Error: Este poderdante ya delegó su voto a otro titular");
    card.querySelector(`select[id^="desde-"]`).value = "";
    return false;
  }

  // Verificar que el apoderado no sea ya un poderdante
  const apoderadoEsPoderdante = state.cartasPoder.some((cp) => {
    const otherCard = document.querySelector(`[data-id="${cp.id}"]`);
    return (
      otherCard &&
      otherCard !== card &&
      otherCard.querySelector(`select[id^="desde-"]`).value === hacia
    );
  });

  if (apoderadoEsPoderdante) {
    showError(
      "❌ Error: Un titular que ya delegó su voto no puede ser apoderado"
    );
    card.querySelector(`select[id^="hacia-"]`).value = "";
    updateCartaPoderSelects();
    return false;
  }

  // Actualizar los selects para reflejar los cambios cuando se selecciona un nuevo poderdante
  if (desde) {
    updateCartaPoderSelects();
  }

  return true;
}

function validateAndSave() {
  console.log("validateAndSave ejecutándose...");
  const errors = [];

  // Validar selección de cooperativa
  if (!state.cooperativaSeleccionada) {
    errors.push("Debe seleccionar una cooperativa");
    showErrors(errors);
    return false;
  }

  // Validar campos de autoridades
  const secretarioInput = document.getElementById("secretario");
  const presidenteInput = document.getElementById("presidente");
  
  if (!secretarioInput || !secretarioInput.value.trim()) {
    errors.push("Debe ingresar el nombre del secretario");
  } else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(secretarioInput.value.trim())) {
    errors.push("El nombre del secretario solo puede contener letras y espacios");
  }
  
  if (!presidenteInput || !presidenteInput.value.trim()) {
    errors.push("Debe ingresar el nombre del presidente");
  } else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(presidenteInput.value.trim())) {
    errors.push("El nombre del presidente solo puede contener letras y espacios");
  }

  // Validar campo de correo electrónico
  const correoInput = document.getElementById("correo-electronico");
  if (!correoInput || !correoInput.value.trim()) {
    errors.push("Debe ingresar un correo electrónico de contacto");
  } else {
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
    if (!emailRegex.test(correoInput.value.trim())) {
      errors.push("El correo electrónico no tiene un formato válido");
    }
  }

  // Validar cantidad de titulares (debe ser entre 1 y 6)
  if (state.titulares.length === 0) {
    errors.push("Debe haber al menos 1 titular");
  }
  if (state.titulares.length > 6) {
    errors.push("No puede haber más de 6 titulares");
  }
  if (state.titulares.length > state.maxTitulares) {
    errors.push(
      `No puede haber más de ${state.maxTitulares} titulares según los votos de la cooperativa (${state.cooperativaSeleccionada.votes} votos)`
    );
  }

  // Validar cantidad de suplentes
  if (state.suplentes.length > state.maxSuplentes) {
    errors.push(
      `No puede haber más de ${state.maxSuplentes} suplentes según los votos de la cooperativa (${state.cooperativaSeleccionada.votes} votos)`
    );
  }

  // Validar datos de titulares
  state.titulares.forEach((titular, index) => {
    const card = document.querySelector(`[data-id="${titular.id}"]`);
    const nombre = card.querySelector(`input[id^="nombre-"]`).value.trim();
    const documento = card
      .querySelector(`input[id^="documento-"]`)
      .value.trim();

    if (!nombre) {
      errors.push(`El titular ${index + 1} debe tener un nombre`);
    } else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(nombre)) {
      errors.push(
        `El nombre del titular ${
          index + 1
        } solo puede contener letras y espacios`
      );
    }

    if (!documento) {
      errors.push(`El titular ${index + 1} debe tener un documento`);
    } else if (!/^\d+$/.test(documento)) {
      errors.push(
        `El documento del titular ${index + 1} solo puede contener números`
      );
    }
  });

  // Validar datos de suplentes
  state.suplentes.forEach((suplente, index) => {
    const card = document.querySelector(`[data-id="${suplente.id}"]`);
    const nombre = card.querySelector(`input[id^="nombre-sup-"]`).value.trim();
    const documento = card
      .querySelector(`input[id^="documento-sup-"]`)
      .value.trim();

    if (!nombre) {
      errors.push(`El suplente ${index + 1} debe tener un nombre`);
    } else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(nombre)) {
      errors.push(
        `El nombre del suplente ${
          index + 1
        } solo puede contener letras y espacios`
      );
    }

    if (!documento) {
      errors.push(`El suplente ${index + 1} debe tener un documento`);
    } else if (!/^\d+$/.test(documento)) {
      errors.push(
        `El documento del suplente ${index + 1} solo puede contener números`
      );
    }
  });

  // Validar cartas poder
  const cartasPoderPorTitular = {};
  const titularesConVotoDelegado = new Set();

  state.cartasPoder.forEach((cp, index) => {
    const card = document.querySelector(`[data-id="${cp.id}"]`);
    const desde = card.querySelector(`select[id^="desde-"]`).value;
    const hacia = card.querySelector(`select[id^="hacia-"]`).value;

    if (!desde || !hacia) {
      errors.push(
        `La carta poder ${index + 1} debe tener origen y destino completos`
      );
      return;
    }

    if (desde === hacia) {
      errors.push(
        `Error en carta poder ${
          index + 1
        }: un titular no puede ser poderdante y apoderado de sí mismo`
      );
      return;
    }

    if (titularesConVotoDelegado.has(desde)) {
      errors.push(
        `Error en carta poder ${
          index + 1
        }: cada poderdante solo puede delegar su voto una vez`
      );
    }
    titularesConVotoDelegado.add(desde);

    cartasPoderPorTitular[hacia] = (cartasPoderPorTitular[hacia] || 0) + 1;
    if (cartasPoderPorTitular[hacia] > state.maxCartasPoder) {
      errors.push(
        `Error en carta poder ${
          index + 1
        }: un apoderado no puede recibir más de ${
          state.maxCartasPoder
        } cartas poder`
      );
    }
  });

  if (errors.length > 0) {
    console.log("Errores encontrados:", errors);
    showErrors(errors);
    return false;
  }

  console.log("Validación exitosa, generando JSON y enviando datos...");

  // Generar JSON con los datos
  const formData = generateFormDataJSON();

  // Mostrar JSON en consola para debug
  console.log("JSON generado:", formData);

  // Opción para descargar JSON como backup (opcional)
  downloadJSONBackup(formData);

  // Mostrar loading mientras se envían los datos
  showLoadingModal();

  // Enviar datos al endpoint
  sendDataToEndpoint(formData).then((result) => {
    if (result.success) {
      console.log("Datos enviados exitosamente");
      showSaveSuccessWithResumen();
    } else {
      console.error("Error al enviar datos:", result.error);
      showSendError(result.error);
    }
  });

  return true;
}

function validate() {
  const errors = [];

  // Validar selección de cooperativa
  if (!state.cooperativaSeleccionada) {
    errors.push("Debe seleccionar una cooperativa");
    showErrors(errors);
    return false;
  }

  // Validar campos de autoridades
  const secretarioInput = document.getElementById("secretario");
  const presidenteInput = document.getElementById("presidente");
  
  if (!secretarioInput || !secretarioInput.value.trim()) {
    errors.push("Debe ingresar el nombre del secretario");
  } else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(secretarioInput.value.trim())) {
    errors.push("El nombre del secretario solo puede contener letras y espacios");
  }
  
  if (!presidenteInput || !presidenteInput.value.trim()) {
    errors.push("Debe ingresar el nombre del presidente");
  } else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(presidenteInput.value.trim())) {
    errors.push("El nombre del presidente solo puede contener letras y espacios");
  }

  // Validar campo de correo electrónico
  const correoInput = document.getElementById("correo-electronico");
  if (!correoInput || !correoInput.value.trim()) {
    errors.push("Debe ingresar un correo electrónico de contacto");
  } else {
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
    if (!emailRegex.test(correoInput.value.trim())) {
      errors.push("El correo electrónico no tiene un formato válido");
    }
  }

  // Validar cantidad de titulares (debe ser entre 1 y 6)
  if (state.titulares.length === 0) {
    errors.push("Debe haber al menos 1 titular");
  }
  if (state.titulares.length > 6) {
    errors.push("No puede haber más de 6 titulares");
  }
  if (state.titulares.length > state.maxTitulares) {
    errors.push(
      `No puede haber más de ${state.maxTitulares} titulares según los votos de la cooperativa (${state.cooperativaSeleccionada.votes} votos)`
    );
  }

  // Validar cantidad de suplentes
  if (state.suplentes.length > state.maxSuplentes) {
    errors.push(
      `No puede haber más de ${state.maxSuplentes} suplentes según los votos de la cooperativa (${state.cooperativaSeleccionada.votes} votos)`
    );
  }

  // Validar datos de titulares
  state.titulares.forEach((titular, index) => {
    const card = document.querySelector(`[data-id="${titular.id}"]`);
    const nombre = card.querySelector(`input[id^="nombre-"]`).value.trim();
    const documento = card
      .querySelector(`input[id^="documento-"]`)
      .value.trim();

    if (!nombre) {
      errors.push(`El titular ${index + 1} debe tener un nombre`);
    } else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(nombre)) {
      errors.push(
        `El nombre del titular ${
          index + 1
        } solo puede contener letras y espacios`
      );
    }

    if (!documento) {
      errors.push(`El titular ${index + 1} debe tener un documento`);
    } else if (!/^\d+$/.test(documento)) {
      errors.push(
        `El documento del titular ${index + 1} solo puede contener números`
      );
    }
  });

  // Validar datos de suplentes
  state.suplentes.forEach((suplente, index) => {
    const card = document.querySelector(`[data-id="${suplente.id}"]`);
    const nombre = card.querySelector(`input[id^="nombre-sup-"]`).value.trim();
    const documento = card
      .querySelector(`input[id^="documento-sup-"]`)
      .value.trim();

    if (!nombre) {
      errors.push(`El suplente ${index + 1} debe tener un nombre`);
    } else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(nombre)) {
      errors.push(
        `El nombre del suplente ${
          index + 1
        } solo puede contener letras y espacios`
      );
    }

    if (!documento) {
      errors.push(`El suplente ${index + 1} debe tener un documento`);
    } else if (!/^\d+$/.test(documento)) {
      errors.push(
        `El documento del suplente ${index + 1} solo puede contener números`
      );
    }
  });

  // Validar cartas poder
  const cartasPoderPorTitular = {};
  const titularesConVotoDelegado = new Set();

  state.cartasPoder.forEach((cp, index) => {
    const card = document.querySelector(`[data-id="${cp.id}"]`);
    const desde = card.querySelector(`select[id^="desde-"]`).value;
    const hacia = card.querySelector(`select[id^="hacia-"]`).value;

    if (!desde || !hacia) {
      errors.push(
        `La carta poder ${index + 1} debe tener origen y destino completos`
      );
      return;
    }

    if (desde === hacia) {
      errors.push(
        `Error en carta poder ${
          index + 1
        }: un titular no puede ser poderdante y apoderado de sí mismo`
      );
      return;
    }

    if (titularesConVotoDelegado.has(desde)) {
      errors.push(
        `Error en carta poder ${
          index + 1
        }: cada poderdante solo puede delegar su voto una vez`
      );
    }
    titularesConVotoDelegado.add(desde);

    cartasPoderPorTitular[hacia] = (cartasPoderPorTitular[hacia] || 0) + 1;
    if (cartasPoderPorTitular[hacia] > state.maxCartasPoder) {
      errors.push(
        `Error en carta poder ${
          index + 1
        }: un apoderado no puede recibir más de ${
          state.maxCartasPoder
        } cartas poder`
      );
    }
  });

  if (errors.length > 0) {
    showErrors(errors);
    return false;
  }

  // Si la validación es exitosa, mostrar el resumen para confirmación
  showValidationSuccessWithResumen();
  return true;
}

// Funciones de UI
function showModal(modalElement) {
  modalElement.style.display = "block";

  // Asegurar que el modal aparezca en la parte superior
  setTimeout(() => {
    const modalContent = modalElement.querySelector(".modal-content");
    if (modalContent) {
      modalContent.scrollTop = 0;
    }
    // Scroll suave hacia arriba de la página para mostrar el modal
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Focus en el modal para accesibilidad
    modalContent?.focus();
  }, 50);
}

function showError(message) {
  const errorModal = document.getElementById("error-modal");
  const errorList = document.getElementById("error-list");
  const modalTitle = document.getElementById("modal-title");
  const modalAccept = document.getElementById("modal-accept");

  modalTitle.textContent = "Error de Validación";
  errorList.innerHTML = `<p class="error-message">❌ ${message}</p>`;
  modalAccept.style.display = "none";

  showModal(errorModal);
}

function showErrors(errors) {
  const errorModal = document.getElementById("error-modal");
  const errorList = document.getElementById("error-list");
  const modalTitle = document.getElementById("modal-title");
  const modalAccept = document.getElementById("modal-accept");

  modalTitle.textContent = "Errores de Validación";
  errorList.innerHTML = errors
    .map((error) => `<p class="error-message">❌ ${error}</p>`)
    .join("");
  modalAccept.style.display = "none";

  showModal(errorModal);
}

function showConfirmation(message) {
  const errorModal = document.getElementById("error-modal");
  const errorList = document.getElementById("error-list");
  const modalTitle = document.getElementById("modal-title");
  const modalAccept = document.getElementById("modal-accept");

  modalTitle.textContent = "Confirmación de Selección";
  errorList.innerHTML = `<p class="confirmation-message">${message}</p>`;
  modalAccept.style.display = "inline-block";
  modalAccept.textContent = "Aceptar";

  showModal(errorModal);
}

function showSaveSuccessWithResumen() {
  console.log("showSaveSuccessWithResumen ejecutándose...");
  const errorModal = document.getElementById("error-modal");
  const errorList = document.getElementById("error-list");
  const modalTitle = document.getElementById("modal-title");
  const modalAccept = document.getElementById("modal-accept");

  modalTitle.textContent = "Registro Guardado Exitosamente";

  // Mostrar la sección de resumen en la página
  const resumenSection = document.getElementById("resumen-section");
  if (resumenSection) {
    resumenSection.style.display = "block";
  }

  // Generar el resumen completo
  updateResumen();
  const resumenContainer = document.getElementById("resumen-container");
  const resumenHTML = resumenContainer ? resumenContainer.innerHTML : "";

  // Mostrar el resumen en el modal con un mensaje de éxito
  errorList.innerHTML = `
        <div class="success-message">
            ✅ ¡Registro guardado exitosamente!
        </div>
        <div class="info-message">
            <strong>Resumen de lo guardado:</strong>
        </div>
        ${resumenHTML}
    `;

  modalAccept.style.display = "inline-block";
  modalAccept.textContent = "Cerrar";
  errorModal.style.display = "block";
}

// Función para generar el JSON con los datos del formulario
function generateFormDataJSON() {
  const secretarioInput = document.getElementById("secretario");
  const presidenteInput = document.getElementById("presidente");
  const correoInput = document.getElementById("correo-electronico");
  
  const formData = {
    timestamp: new Date().toISOString(),
    cooperativa: {
      codigo: state.cooperativaSeleccionada?.code || "",
      nombre: state.cooperativaSeleccionada?.name || "",
      votos: state.cooperativaSeleccionada?.votes || 0,
      suplentes: state.cooperativaSeleccionada?.substitutes || 0,
      car: state.cooperativaSeleccionada?.CAR || 0,
      carNombre: state.cooperativaSeleccionada?.["CAR Nombre"] || "",
    },
    autoridades: {
      secretario: secretarioInput?.value?.trim() || "",
      presidente: presidenteInput?.value?.trim() || "",
    },
    contacto: {
      correoElectronico: correoInput?.value?.trim() || "",
    },
    titulares: [],
    suplentes: [],
    cartasPoder: [],
    resumen: {
      totalTitulares: state.titulares.length,
      totalSuplentes: state.suplentes.length,
      totalCartasPoder: state.cartasPoder.length,
      votosEfectivos: 0,
    },
  };

  // Recopilar datos de titulares
  state.titulares.forEach((titular, index) => {
    const card = document.querySelector(`[data-id="${titular.id}"]`);
    const nombre = card.querySelector(`input[id^="nombre-"]`).value.trim();
    const documento = card
      .querySelector(`input[id^="documento-"]`)
      .value.trim();

    formData.titulares.push({
      id: titular.id,
      nombre: nombre,
      documento: documento,
      orden: index + 1,
    });
  });

  // Recopilar datos de suplentes
  state.suplentes.forEach((suplente, index) => {
    const card = document.querySelector(`[data-id="${suplente.id}"]`);
    const nombre = card.querySelector(`input[id^="nombre-sup-"]`).value.trim();
    const documento = card
      .querySelector(`input[id^="documento-sup-"]`)
      .value.trim();

    formData.suplentes.push({
      id: suplente.id,
      nombre: nombre,
      documento: documento,
      orden: index + 1,
    });
  });

  // Recopilar datos de cartas poder
  state.cartasPoder.forEach((cp, index) => {
    const card = document.querySelector(`[data-id="${cp.id}"]`);
    const desde = card.querySelector(`select[id^="desde-"]`).value;
    const hacia = card.querySelector(`select[id^="hacia-"]`).value;

    // Buscar nombres de los titulares
    const poderdante = formData.titulares.find((t) => t.id === desde);
    const apoderado = formData.titulares.find((t) => t.id === hacia);

    formData.cartasPoder.push({
      id: cp.id,
      poderdante: {
        id: desde,
        nombre: poderdante?.nombre || "",
        documento: poderdante?.documento || "",
      },
      apoderado: {
        id: hacia,
        nombre: apoderado?.nombre || "",
        documento: apoderado?.documento || "",
      },
      orden: index + 1,
    });
  });

  // Calcular votos efectivos
  const titularesQueVotan = state.titulares.filter((titular) => {
    return !state.cartasPoder.some((cp) => {
      const card = document.querySelector(`[data-id="${cp.id}"]`);
      const desde = card.querySelector(`select[id^="desde-"]`).value;
      return desde === titular.id;
    });
  });

  const apoderados = new Set();
  state.cartasPoder.forEach((cp) => {
    const card = document.querySelector(`[data-id="${cp.id}"]`);
    const hacia = card.querySelector(`select[id^="hacia-"]`).value;
    apoderados.add(hacia);
  });

  formData.resumen.votosEfectivos = titularesQueVotan.length + apoderados.size;

  return formData;
}

// Función para enviar los datos al endpoint
async function sendDataToEndpoint(data) {
  try {
    console.log("Enviando datos al endpoint:", config.apiEndpoint);
    console.log("Datos a enviar:", JSON.stringify(data, null, 2));

    // Crear un AbortController para manejar timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    const response = await fetch(config.apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log("Status de la respuesta:", response.status);
    console.log("Headers de la respuesta:", [...response.headers.entries()]);

    if (!response.ok) {
      throw new Error(
        `Error HTTP: ${response.status} - ${response.statusText}`
      );
    }

    // Obtener el texto de la respuesta primero
    const responseText = await response.text();
    console.log("Texto de la respuesta:", responseText);

    // Intentar parsear como JSON solo si hay contenido
    let result;
    if (responseText.trim()) {
      try {
        result = JSON.parse(responseText);
        console.log("Respuesta parseada como JSON:", result);
      } catch (jsonError) {
        console.log("La respuesta no es JSON válido, usando texto plano");
        result = { message: responseText };
      }
    } else {
      console.log("Respuesta vacía del servidor - asumiendo éxito");
      result = { message: "Datos enviados correctamente" };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    if (error.name === "AbortError") {
      console.error("Timeout: La solicitud tardó demasiado tiempo");
      return {
        success: false,
        error:
          "La solicitud tardó demasiado tiempo. Verifique su conexión e intente nuevamente.",
      };
    }
    console.error("Error detallado al enviar datos:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return {
      success: false,
      error: `Error al conectar con el servidor: ${error.message}`,
    };
  }
}

function showValidationSuccessWithResumen() {
  console.log("Ejecutando showValidationSuccessWithResumen...");
  const errorModal = document.getElementById("error-modal");
  const errorList = document.getElementById("error-list");
  const modalTitle = document.getElementById("modal-title");
  const modalAccept = document.getElementById("modal-accept");

  modalTitle.textContent = "Confirmar Registro";

  // Generar el resumen completo
  console.log("Llamando a updateResumen...");
  updateResumen();
  const resumenContainer = document.getElementById("resumen-container");
  const resumenHTML = resumenContainer.innerHTML;
  console.log("HTML del resumen:", resumenHTML);

  // Mostrar el resumen en el modal con un mensaje de confirmación
  errorList.innerHTML = `
        <div class="success-message">
            ✓ Validación exitosa. Revise el resumen y confirme si desea guardar el registro:
        </div>
        ${resumenHTML}
    `;

  modalAccept.style.display = "inline-block";
  modalAccept.textContent = "Confirmar y Habilitar Guardar";
  errorModal.style.display = "block";
  console.log("Modal mostrado");
}

// Función para mostrar modal de loading
function showLoadingModal() {
  const errorModal = document.getElementById("error-modal");
  const errorList = document.getElementById("error-list");
  const modalTitle = document.getElementById("modal-title");
  const modalAccept = document.getElementById("modal-accept");

  modalTitle.textContent = "Enviando Datos...";
  errorList.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <div style="color: var(--aca-blue); font-weight: bold; margin-bottom: 15px;">
                📤 Enviando registro al servidor...
            </div>
            <div style="margin: 15px 0;">
                <div style="border: 3px solid #f3f3f3; border-top: 3px solid var(--aca-blue); border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto;"></div>
            </div>
            <div style="color: var(--text-gray); font-size: 0.9em;">
                Por favor, espere mientras se procesa la información...
            </div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
  modalAccept.style.display = "none";
  errorModal.style.display = "block";
}

// Función para mostrar error de envío
function showSendError(errorMessage) {
  const errorModal = document.getElementById("error-modal");
  const errorList = document.getElementById("error-list");
  const modalTitle = document.getElementById("modal-title");
  const modalAccept = document.getElementById("modal-accept");

  modalTitle.textContent = "Error al Enviar Datos";
  errorList.innerHTML = `
        <div style="color: var(--error-red); font-weight: bold; margin-bottom: 15px;">
            ❌ Error al enviar los datos al servidor
        </div>
        <div style="background-color: #fff5f5; border: 1px solid #fed7d7; border-radius: 6px; padding: 15px; margin: 15px 0;">
            <strong>Detalles del error:</strong><br>
            ${errorMessage}
        </div>
        <div style="color: var(--text-gray); font-size: 0.9em; margin-top: 15px;">
            Por favor, verifique su conexión a internet e intente nuevamente. Si el problema persiste, contacte al administrador del sistema.
        </div>
    `;
  modalAccept.style.display = "inline-block";
  modalAccept.textContent = "Cerrar";
  errorModal.style.display = "block";
}

// Función para descargar JSON como backup
function downloadJSONBackup(data) {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `registro-asamblea-${data.cooperativa.codigo}-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log("Backup JSON descargado exitosamente");
  } catch (error) {
    console.warn("No se pudo descargar el backup JSON:", error);
  }
}

function generateResumen() {
  const resumen = {
    cooperativa: state.cooperativaSeleccionada,
    autoridades: {
      secretario: "",
      presidente: ""
    },
    contacto: {
      correoElectronico: ""
    },
    titulares: state.titulares.map((t) => {
      const card = document.querySelector(`[data-id="${t.id}"]`);
      return {
        id: t.id,
        nombre: card.querySelector(`input[id^="nombre-"]`).value,
        documento: card.querySelector(`input[id^="documento-"]`).value,
        votosRepresentados: [],
      };
    }),
    suplentes: state.suplentes.map((s) => {
      const card = document.querySelector(`[data-id="${s.id}"]`);
      return {
        id: s.id,
        nombre: card.querySelector(`input[id^="nombre-sup-"]`).value,
        documento: card.querySelector(`input[id^="documento-sup-"]`).value,
      };
    }),
    delegaciones: state.cartasPoder.map((cp) => {
      const card = document.querySelector(`[data-id="${cp.id}"]`);
      return {
        desde: card.querySelector(`select[id^="desde-"]`).value,
        hacia: card.querySelector(`select[id^="hacia-"]`).value,
      };
    }),
  };

  // Obtener datos de autoridades
  const secretarioInput = document.getElementById("secretario");
  const presidenteInput = document.getElementById("presidente");
  const correoInput = document.getElementById("correo-electronico");
  if (secretarioInput) {
    resumen.autoridades.secretario = secretarioInput.value.trim();
  }
  if (presidenteInput) {
    resumen.autoridades.presidente = presidenteInput.value.trim();
  }
  if (correoInput) {
    resumen.contacto.correoElectronico = correoInput.value.trim();
  }

  // Calcular votos representados
  resumen.delegaciones.forEach((d) => {
    const titular = resumen.titulares.find((t) => t.id === d.hacia);
    if (titular) {
      titular.votosRepresentados.push(d.desde);
    }
  });

  return resumen;
}

function updateResumen() {
  const resumen = generateResumen();
  const resumenContainer = document.getElementById("resumen-container");
  
  // Si el contenedor no existe (estamos en pantalla de credenciales), salir
  if (!resumenContainer) {
    return;
  }
  
  // Si no hay cooperativa seleccionada, mostrar mensaje vacío
  if (!resumen.cooperativa) {
    resumenContainer.innerHTML = `
      <div class="card" style="text-align: center; color: #666;">
        <p>Seleccione una cooperativa para ver el resumen de votación</p>
      </div>
    `;
    return;
  }

  let html = `<div class="card">
        <h3>Cooperativa: ${resumen.cooperativa.name}</h3>
        <p><strong>Código:</strong> ${resumen.cooperativa.code}</p>
        <p><strong>CUIT:</strong> ${resumen.cooperativa.cuit}</p>
        <p><strong>Votos totales:</strong> ${resumen.cooperativa.votes}</p>
    </div>`;

  // Mostrar información de autoridades si está disponible
  if (resumen.autoridades && (resumen.autoridades.secretario || resumen.autoridades.presidente)) {
    html += `<div class="card">
        <h3>Autoridades de la Cooperativa</h3>
        ${resumen.autoridades.secretario ? `<p><strong>Secretario:</strong> ${resumen.autoridades.secretario}</p>` : ''}
        ${resumen.autoridades.presidente ? `<p><strong>Presidente:</strong> ${resumen.autoridades.presidente}</p>` : ''}
    </div>`;
  }

  // Mostrar información de contacto si está disponible
  if (resumen.contacto && resumen.contacto.correoElectronico) {
    html += `<div class="card">
        <h3>Información de Contacto</h3>
        <p><strong>Correo Electrónico:</strong> ${resumen.contacto.correoElectronico}</p>
        <p><small>Se enviará toda la información de la votación a esta dirección</small></p>
    </div>`;
  }

  html += "<h3>Distribución de Votos:</h3>";
  let totalVotosEjercidos = 0;
  let titularesVotantes = 0;

  resumen.titulares.forEach((t, index) => {
    const votosExtra = t.votosRepresentados.length;
    const votosTotal = 1 + votosExtra;
    const tieneDelegaciones = votosExtra > 0;

    // Solo contar si el titular no delegó su voto
    const delegoSuVoto = resumen.delegaciones.some((d) => d.desde === t.id);
    if (!delegoSuVoto) {
      totalVotosEjercidos += votosTotal;
      titularesVotantes++;
    }

    html += `
            <div class="card ${tieneDelegaciones ? "delegado-receptor" : ""}">
                <p><strong>Titular ${index + 1}:</strong> ${t.nombre}</p>
                <p><strong>Documento:</strong> ${t.documento}</p>
                ${
                  delegoSuVoto
                    ? (() => {
                        const delegacion = resumen.delegaciones.find(
                          (d) => d.desde === t.id
                        );
                        const apoderado = resumen.titulares.find(
                          (titular) => titular.id === delegacion.hacia
                        );
                        return `<p class="delegation-sender"><strong>Estado:</strong> Poderdante - Delegó voto a ${apoderado.nombre}</p>`;
                      })()
                    : `<p><strong>Votos a ejercer:</strong> ${votosTotal} ${
                        votosTotal === 1
                          ? "(voto propio)"
                          : `(propio + ${votosExtra} delegados)`
                      }</p>`
                }
                ${
                  tieneDelegaciones && !delegoSuVoto
                    ? (() => {
                        const poderdantes = resumen.delegaciones
                          .filter((d) => d.hacia === t.id)
                          .map(
                            (d) =>
                              resumen.titulares.find(
                                (titular) => titular.id === d.desde
                              ).nombre
                          );
                        return `<p class="delegation-receiver"><strong>Estado:</strong> Apoderado - Recibe delegaciones de: ${poderdantes.join(
                          ", "
                        )}</p>`;
                      })()
                    : ""
                }
            </div>
        `;
  });

  if (resumen.suplentes.length > 0) {
    html += "<h3>Suplentes:</h3>";
    resumen.suplentes.forEach((s, index) => {
      html += `
                <div class="card">
                    <p><strong>Suplente ${index + 1}:</strong> ${s.nombre}</p>
                    <p><strong>Documento:</strong> ${s.documento}</p>
                </div>
            `;
    });
  }

  if (resumen.delegaciones.length > 0) {
    html += "<h3>Cartas Poder Registradas:</h3>";
    resumen.delegaciones.forEach((d, index) => {
      const titularPoderdante = resumen.titulares.find((t) => t.id === d.desde);
      const titularApoderado = resumen.titulares.find((t) => t.id === d.hacia);
      html += `
                <div class="card">
                    <p><strong>Carta Poder ${index + 1}:</strong></p>
                    <p><strong>Poderdante:</strong> ${
                      titularPoderdante?.nombre || "Titular no encontrado"
                    } (delega su voto)</p>
                    <p><strong>Apoderado:</strong> ${
                      titularApoderado?.nombre || "Titular no encontrado"
                    } (recibe el voto)</p>
                </div>
            `;
    });
  }

  html += `
        <div class="card success-message" style="border: 2px solid var(--success-green);">
            <h3>Resumen de Votación</h3>
            <p><strong>Cooperativa:</strong> ${resumen.cooperativa.name}</p>
            <p><strong>Total votos de la cooperativa:</strong> ${
              resumen.cooperativa.votes
            }</p>
            <p><strong>Titulares registrados:</strong> ${
              resumen.titulares.length
            } (máximo: ${Math.min(resumen.cooperativa.votes, 6)})</p>
            <p><strong>Titulares que votan:</strong> ${titularesVotantes}</p>
            <p><strong>Total votos a ejercer:</strong> ${totalVotosEjercidos}</p>
            <p><strong>Suplentes designados:</strong> ${
              resumen.suplentes.length
            }</p>
            <p><strong>Delegaciones activas:</strong> ${
              resumen.delegaciones.length
            }</p>
            ${
              totalVotosEjercidos === resumen.cooperativa.votes
                ? '<p class="success-message" style="color: var(--success-green); font-weight: bold;">✓ Todos los votos están representados</p>'
                : '<p style="color: var(--warning-yellow); font-weight: bold; background: rgba(255, 193, 7, 0.1); padding: 10px; border-radius: 4px;">⚠ Votos no representados: ' +
                  (resumen.cooperativa.votes - totalVotosEjercidos) +
                  "</p>"
            }
        </div>
    `;

  resumenContainer.innerHTML = html;
}

// Manejo de cambio de cooperativa
function handleCooperativeChange() {
  const select = document.getElementById("cooperative");
  const selectedOption = select.options[select.selectedIndex];

  if (selectedOption && selectedOption.value) {
    const selectedCoop = state.cooperativas.find(
      (coop) => coop.code === selectedOption.value
    );

    if (selectedCoop) {
      state.cooperativaSeleccionada = selectedCoop;
      document.getElementById("code").value = selectedCoop.code;
      document.getElementById("votes").value = selectedCoop.votes;

      // Limpiar titulares y suplentes existentes
      state.titulares = [];
      state.suplentes = [];
      state.cartasPoder = [];

      safeSetInnerHTML("titulares-container", "");
      safeSetInnerHTML("suplentes-container", "");
      safeSetInnerHTML("cartas-poder-container", "");
      safeSetInnerHTML("resumen-container", "");

      // Ocultar sección de resumen al cambiar cooperativa
      const resumenSection = document.getElementById("resumen-section");
      if (resumenSection) {
        resumenSection.style.display = "none";
      }

      // Actualizar límites según los votos de la cooperativa
      state.maxTitulares = Math.min(parseInt(selectedCoop.votes), 6);
      state.maxSuplentes = parseInt(
        selectedCoop.substitutes || selectedCoop.votes
      );

      // Actualizar textos informativos
      document.querySelector("#titulares-section h2").textContent = "Titulares";
      document.querySelector("#suplentes-section h2").textContent = "Suplentes";

      // Actualizar estado de botones
      updateButtonStates();

      showConfirmation(`Cooperativa seleccionada: ${selectedCoop.name}
CAR ${selectedCoop.CAR} - ${selectedCoop["CAR Nombre"]}

Puede agregar hasta ${selectedCoop.votes} titulares y ${
        selectedCoop.substitutes || selectedCoop.votes
      } suplentes.

Reglas de cartas poder:
• Cada poderdante puede delegar su voto UNA vez
• Cada apoderado puede recibir hasta 2 cartas poder`);
    }
  } else {
    clearCooperativeData();
  }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", async () => {
  console.log('🚀 DOM cargado, iniciando aplicación...');
  
  // NOTA: Ya no cargamos cooperativas desde CSV porque ahora usamos endpoint
  // await loadCooperatives();

  // Event listeners para el sistema de autenticación
  const loginBtn = document.getElementById("btn-login");
  if (loginBtn) {
    loginBtn.addEventListener("click", intentarLogin);
  }

  // Event listener para campos de login (Enter para submit)
  const codigoCooperativaInput = document.getElementById("codigo-cooperativa");
  const codigoVerificadorInput = document.getElementById("codigo-verificador");
  
  if (codigoCooperativaInput) {
    codigoCooperativaInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        intentarLogin();
      }
    });
  }
  
  if (codigoVerificadorInput) {
    codigoVerificadorInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        intentarLogin();
      }
    });
  }

  // Event listener para continuar al formulario
  const continuarFormularioBtn = document.getElementById("btn-continuar-formulario");
  if (continuarFormularioBtn) {
    continuarFormularioBtn.addEventListener("click", continuarAlFormulario);
  }

  // Event listener para cerrar sesión
  const logoutBtn = document.getElementById("btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", cerrarSesion);
  }

  // Event listener para el botón de continuar al registro (legacy - ya no se usa)
  const continuarBtn = document.getElementById("continuar-registro");
  if (continuarBtn) {
    continuarBtn.addEventListener("click", mostrarRegistro);
  }

  // Eventos de botones principales - solo si existen
  const agregarTitularBtn = document.getElementById("agregar-titular");
  if (agregarTitularBtn) {
    agregarTitularBtn.addEventListener("click", addTitular);
  }
  
  const agregarSuplenteBtn = document.getElementById("agregar-suplente");
  if (agregarSuplenteBtn) {
    agregarSuplenteBtn.addEventListener("click", addSuplente);
  }
  
  const agregarCartaPoderBtn = document.getElementById("agregar-carta-poder");
  if (agregarCartaPoderBtn) {
    agregarCartaPoderBtn.addEventListener("click", addCartaPoder);
  }
  // El botón guardar ahora usa onclick en el HTML

  // Evento de cambio de CAR - solo si existe (legacy - ya no se usa)
  const carSelect = document.getElementById("car-select");
  if (carSelect) {
    carSelect.addEventListener("change", filterCooperativesByCAR);
  }

  // Evento de cambio de cooperativa - solo si existe (legacy - ya no se usa)
  const cooperativeSelect = document.getElementById("cooperative");
  if (cooperativeSelect) {
    cooperativeSelect.addEventListener("change", handleCooperativeChange);
  }

  // Cerrar modal - solo si existe
  const closeBtn = document.querySelector(".close");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      const modal = document.getElementById("error-modal");
      if (modal) {
        modal.style.display = "none";
      }
    });
  }

  // Botón aceptar del modal - solo si existe
  const modalAcceptBtn = document.getElementById("modal-accept");
  if (modalAcceptBtn) {
    modalAcceptBtn.addEventListener("click", () => {
      const modal = document.getElementById("error-modal");
      if (modal) {
        modal.style.display = "none";
      }
    });
  }

  // Cerrar modal al hacer clic fuera
  window.addEventListener("click", (event) => {
    const modal = document.getElementById("error-modal");
    if (modal && event.target === modal) {
      modal.style.display = "none";
    }
  });

  // Event listeners para campos de autoridades
  const secretarioInput = document.getElementById("secretario");
  if (secretarioInput) {
    secretarioInput.addEventListener("input", function () {
      this.value = this.value.replace(/[^A-Za-zÀ-ÿ\s]/g, "");
    });
  }

  const presidenteInput = document.getElementById("presidente");
  if (presidenteInput) {
    presidenteInput.addEventListener("input", function () {
      this.value = this.value.replace(/[^A-Za-zÀ-ÿ\s]/g, "");
    });
  }

  // Event listener para el campo de correo electrónico
  const correoInput = document.getElementById("correo-electronico");
  if (correoInput) {
    correoInput.addEventListener("input", function () {
      // Convertir a minúsculas y eliminar espacios
      this.value = this.value.toLowerCase().replace(/\s/g, "");
    });
  }

  // Inicializar estado de botones
  updateButtonStates();
});
