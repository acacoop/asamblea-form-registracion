// Estado global de la aplicación
const state = {
    titulares: [],
    suplentes: [],
    cartasPoder: [],
    cooperativas: [],
    cooperativaSeleccionada: null,
    maxTitulares: 6,
    maxSuplentes: 6,
    maxCartasPoder: 2
};

// Configuración del endpoint
const config = {
    // Cambia esta URL por tu endpoint real
    apiEndpoint: 'https://tu-endpoint-aqui.com/api/registro-asamblea',
    timeout: 30000 // 30 segundos
};

// Funciones de navegación entre pantallas
function mostrarRegistro() {
    document.getElementById('credenciales-screen').style.display = 'none';
    document.getElementById('registro-screen').style.display = 'block';
}

function volverCredenciales() {
    document.getElementById('registro-screen').style.display = 'none';
    document.getElementById('credenciales-screen').style.display = 'block';
}

// Cargar los datos de las cooperativas desde el CSV
async function loadCooperatives() {
    try {
        const response = await fetch('data/cooperatives_con_car.csv');
        const csvText = await response.text();
        state.cooperativas = parseCSV(csvText);
        populateCarSelect(state.cooperativas);
    } catch (error) {
        showError('Error al cargar las cooperativas: ' + error.message);
    }
}

// Función para parsear el CSV
function parseCSV(csv) {
    const lines = csv.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
            // Manejar comillas en el CSV
            const values = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    values.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            values.push(current.trim());
            
            const cooperative = {};
            headers.forEach((header, index) => {
                cooperative[header] = values[index] || '';
            });
            
            // Convertir votes y substitutes a números
            cooperative.votes = parseInt(cooperative.votes) || 0;
            cooperative.substitutes = parseInt(cooperative.substitutes) || 0;
            cooperative.CAR = parseInt(cooperative.CAR) || 0;
            
            return cooperative;
        });
}

// Poblar el select con los CARs
function populateCarSelect(cooperativas) {
    const select = document.getElementById('car-select');
    select.innerHTML = '<option value="">Seleccione un CAR</option>';
    
    // Obtener CARs únicos
    const cars = new Map();
    cooperativas.forEach(coop => {
        if (coop.CAR && coop['CAR Nombre']) {
            cars.set(coop.CAR, coop['CAR Nombre']);
        }
    });
    
    // Ordenar CARs por número
    const sortedCars = Array.from(cars.entries()).sort((a, b) => a[0] - b[0]);
    
    sortedCars.forEach(([carNumber, carName]) => {
        const option = document.createElement('option');
        option.value = carNumber;
        option.textContent = `CAR ${carNumber} - ${carName}`;
        select.appendChild(option);
    });
}

// Poblar el select con las cooperativas filtradas por CAR
function populateCooperativeSelect(cooperativas) {
    const select = document.getElementById('cooperative');
    select.innerHTML = '<option value="">Seleccione una cooperativa</option>';
    
    // Ordenar cooperativas por nombre
    cooperativas.sort((a, b) => a.name.localeCompare(b.name));
    
    cooperativas.forEach(coop => {
        const option = document.createElement('option');
        option.value = coop.code;
        option.textContent = coop.name;
        option.dataset.votes = coop.votes;
        option.dataset.substitutes = coop.substitutes;
        option.dataset.car = coop.CAR;
        option.dataset.carName = coop['CAR Nombre'];
        select.appendChild(option);
    });
}

// Filtrar cooperativas por CAR seleccionado
function filterCooperativesByCAR() {
    const carSelect = document.getElementById('car-select');
    const selectedCAR = carSelect.value;
    
    if (!selectedCAR) {
        // Si no hay CAR seleccionado, limpiar el select de cooperativas
        const cooperativeSelect = document.getElementById('cooperative');
        cooperativeSelect.innerHTML = '<option value="">Primero seleccione un CAR</option>';
        
        // Limpiar datos de cooperativa seleccionada
        clearCooperativeData();
        return;
    }
    
    // Filtrar cooperativas por CAR
    const filteredCooperativas = state.cooperativas.filter(coop => 
        parseInt(coop.CAR) === parseInt(selectedCAR)
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
    document.getElementById('code').value = '';
    document.getElementById('votes').value = '';
    
    // Limpiar contenedores
    document.getElementById('titulares-container').innerHTML = '';
    document.getElementById('suplentes-container').innerHTML = '';
    document.getElementById('cartas-poder-container').innerHTML = '';
    
    // Restaurar textos por defecto
    document.querySelector('#titulares-section h2').textContent = 'Titulares';
    document.querySelector('#suplentes-section h2').textContent = 'Suplentes';
    
    // Resetear límites
    state.maxTitulares = 6;
    state.maxSuplentes = 6;
    
    // Actualizar botones
    updateButtonStates();
    
    // Limpiar resumen
    updateResumen();
}

// Funciones de utilidad
function createUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function createTitularCard(id) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = id;
    card.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label for="nombre-${id}">Nombre completo:</label>
                <input type="text" id="nombre-${id}" pattern="[A-Za-zÀ-ÿ\s]+" title="Solo se permiten letras y espacios" required>
            </div>
            <div class="form-group">
                <label for="documento-${id}">Documento:</label>
                <input type="text" id="documento-${id}" pattern="[0-9]+" title="Solo se permiten números" required>
            </div>
            <button type="button" class="btn-remove" onclick="removeTitular('${id}')">Eliminar</button>
        </div>
    `;
    
    // Agregar validaciones en tiempo real
    const nombreInput = card.querySelector(`#nombre-${id}`);
    const documentoInput = card.querySelector(`#documento-${id}`);
    
    nombreInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^A-Za-zÀ-ÿ\s]/g, '');
    });
    
    documentoInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
    
    return card;
}

function createSuplenteCard(id) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = id;
    card.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label for="nombre-sup-${id}">Nombre completo:</label>
                <input type="text" id="nombre-sup-${id}" pattern="[A-Za-zÀ-ÿ\s]+" title="Solo se permiten letras y espacios" required>
            </div>
            <div class="form-group">
                <label for="documento-sup-${id}">Documento:</label>
                <input type="text" id="documento-sup-${id}" pattern="[0-9]+" title="Solo se permiten números" required>
            </div>
            <button type="button" class="btn-remove" onclick="removeSuplente('${id}')">Eliminar</button>
        </div>
    `;
    
    // Agregar validaciones en tiempo real
    const nombreInput = card.querySelector(`#nombre-sup-${id}`);
    const documentoInput = card.querySelector(`#documento-sup-${id}`);
    
    nombreInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^A-Za-zÀ-ÿ\s]/g, '');
    });
    
    documentoInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
    
    return card;
}

function createCartaPoderCard(id) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = id;
    card.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label for="desde-${id}">Poderdante (quien delega):</label>
                <select id="desde-${id}" required onchange="validateCartaPoder('${id}')">
                    <option value="">Seleccione un titular</option>
                </select>
            </div>
            <div class="form-group">
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
    if (!state.cooperativaSeleccionada) {
        showError('Debe seleccionar una cooperativa antes de agregar titulares');
        return;
    }
    
    if (state.titulares.length >= state.maxTitulares) {
        showError(`No se pueden agregar más titulares. Máximo permitido según votos de la cooperativa: ${state.maxTitulares}`);
        return;
    }

    const id = createUniqueId();
    state.titulares.push({ id });
    const card = createTitularCard(id);
    document.getElementById('titulares-container').appendChild(card);
    updateCartaPoderSelects();
    updateButtonStates();
}

function removeTitular(id) {
    state.titulares = state.titulares.filter(t => t.id !== id);
    document.querySelector(`[data-id="${id}"]`).remove();
    updateCartaPoderSelects();
    updateButtonStates();
}

// Funciones de gestión de suplentes
function addSuplente() {
    if (!state.cooperativaSeleccionada) {
        showError('Debe seleccionar una cooperativa antes de agregar suplentes');
        return;
    }
    
    if (state.suplentes.length >= state.maxSuplentes) {
        showError(`No se pueden agregar más suplentes. Máximo permitido según votos de la cooperativa: ${state.maxSuplentes}`);
        return;
    }

    const id = createUniqueId();
    state.suplentes.push({ id });
    const card = createSuplenteCard(id);
    document.getElementById('suplentes-container').appendChild(card);
    updateButtonStates();
}

function removeSuplente(id) {
    state.suplentes = state.suplentes.filter(s => s.id !== id);
    document.querySelector(`[data-id="${id}"]`).remove();
    updateButtonStates();
}

// Funciones de gestión de cartas poder
function addCartaPoder() {
    if (!state.cooperativaSeleccionada) {
        showError('Debe seleccionar una cooperativa antes de agregar cartas poder');
        return;
    }
    
    if (state.titulares.length < 2) {
        showError('Debe haber al menos 2 titulares para crear cartas poder');
        return;
    }
    
    const id = createUniqueId();
    state.cartasPoder.push({ id });
    const card = createCartaPoderCard(id);
    document.getElementById('cartas-poder-container').appendChild(card);
    updateCartaPoderSelects();
}

function removeCartaPoder(id) {
    state.cartasPoder = state.cartasPoder.filter(cp => cp.id !== id);
    document.querySelector(`[data-id="${id}"]`).remove();
    updateCartaPoderSelects();
}

function updateCartaPoderSelects() {
    const titulares = Array.from(document.querySelectorAll('#titulares-container .card'))
        .map(card => ({
            id: card.dataset.id,
            nombre: card.querySelector('input[id^="nombre-"]').value
        }));

    // Obtener lista de poderdantes (quienes ya delegaron su voto)
    const poderdantes = new Set();
    state.cartasPoder.forEach(cpOther => {
        const otherCard = document.querySelector(`[data-id="${cpOther.id}"]`);
        if (otherCard) {
            const desde = otherCard.querySelector(`select[id^="desde-"]`).value;
            if (desde) {
                poderdantes.add(desde);
            }
        }
    });

    state.cartasPoder.forEach(cp => {
        const card = document.querySelector(`[data-id="${cp.id}"]`);
        if (!card) return;
        
        const desdeSelect = card.querySelector(`select[id^="desde-"]`);
        const haciaSelect = card.querySelector(`select[id^="hacia-"]`);
        
        const currentDesde = desdeSelect.value;
        const currentHacia = haciaSelect.value;

        // Obtener poderdantes excluyendo el actual
        const otrosPoderdantes = new Set();
        state.cartasPoder.forEach(cpOther => {
            if (cpOther.id !== cp.id) { // Excluir la carta actual
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

        titulares.forEach(t => {
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
            desdeSelect.value = '';
        }
        
        // Solo restaurar el valor de apoderado si no es un poderdante
        if (currentHacia && !poderdantes.has(currentHacia)) {
            haciaSelect.value = currentHacia;
        } else if (currentHacia && poderdantes.has(currentHacia)) {
            // Si el apoderado seleccionado ahora es poderdante, limpiar la selección
            haciaSelect.value = '';
        }
    });
}

// Función para actualizar el estado de los botones
function updateButtonStates() {
    const addTitularBtn = document.getElementById('agregar-titular');
    const addSuplenteBtn = document.getElementById('agregar-suplente');
    const addCartaPoderBtn = document.getElementById('agregar-carta-poder');
    
    if (!state.cooperativaSeleccionada) {
        // Sin cooperativa seleccionada - botones deshabilitados y texto básico
        addTitularBtn.disabled = true;
        addTitularBtn.textContent = 'Agregar Titular';
        
        addSuplenteBtn.disabled = true;
        addSuplenteBtn.textContent = 'Agregar Suplente';
        
        addCartaPoderBtn.disabled = true;
        addCartaPoderBtn.textContent = 'Agregar Carta Poder';
    } else {
        // Con cooperativa seleccionada - mostrar contadores y límites
        addTitularBtn.disabled = state.titulares.length >= state.maxTitulares;
        addTitularBtn.textContent = state.titulares.length >= state.maxTitulares 
            ? `Máximo alcanzado (${state.maxTitulares})`
            : `Agregar Titular (${state.titulares.length}/${state.maxTitulares})`;
        
        addSuplenteBtn.disabled = state.suplentes.length >= state.maxSuplentes;
        addSuplenteBtn.textContent = state.suplentes.length >= state.maxSuplentes 
            ? `Máximo alcanzado (${state.maxSuplentes})`
            : `Agregar Suplente (${state.suplentes.length}/${state.maxSuplentes})`;
        
        // Carta poder requiere al menos 2 titulares
        addCartaPoderBtn.disabled = state.titulares.length < 2;
        addCartaPoderBtn.textContent = state.titulares.length < 2 
            ? 'Agregar Carta Poder (requiere 2+ titulares)'
            : 'Agregar Carta Poder';
    }
}

// Funciones de validación
function validateCartaPoder(id) {
    const card = document.querySelector(`[data-id="${id}"]`);
    const desde = card.querySelector(`select[id^="desde-"]`).value;
    const hacia = card.querySelector(`select[id^="hacia-"]`).value;

    if (desde && hacia && desde === hacia) {
        showError('❌ Error: Un titular no puede ser poderdante y apoderado de sí mismo');
        card.querySelector(`select[id^="hacia-"]`).value = '';
        return false;
    }

    const cartasHacia = state.cartasPoder
        .filter(cp => {
            const card = document.querySelector(`[data-id="${cp.id}"]`);
            return card && card.querySelector(`select[id^="hacia-"]`).value === hacia;
        });

    if (cartasHacia.length > state.maxCartasPoder) {
        showError(`❌ Error: Un apoderado no puede recibir más de ${state.maxCartasPoder} cartas poder`);
        card.querySelector(`select[id^="hacia-"]`).value = '';
        return false;
    }

    // Verificar que el poderdante no haya delegado ya
    const yaDelego = state.cartasPoder.some(cp => {
        const otherCard = document.querySelector(`[data-id="${cp.id}"]`);
        return otherCard && otherCard !== card && otherCard.querySelector(`select[id^="desde-"]`).value === desde;
    });

    if (yaDelego) {
        showError('❌ Error: Este poderdante ya delegó su voto a otro titular');
        card.querySelector(`select[id^="desde-"]`).value = '';
        return false;
    }

    // Verificar que el apoderado no sea ya un poderdante
    const apoderadoEsPoderdante = state.cartasPoder.some(cp => {
        const otherCard = document.querySelector(`[data-id="${cp.id}"]`);
        return otherCard && otherCard !== card && otherCard.querySelector(`select[id^="desde-"]`).value === hacia;
    });

    if (apoderadoEsPoderdante) {
        showError('❌ Error: Un titular que ya delegó su voto no puede ser apoderado');
        card.querySelector(`select[id^="hacia-"]`).value = '';
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
    console.log('validateAndSave ejecutándose...');
    const errors = [];

    // Validar selección de cooperativa
    if (!state.cooperativaSeleccionada) {
        errors.push('Debe seleccionar una cooperativa');
        showErrors(errors);
        return false;
    }

    // Validar cantidad de titulares (debe ser entre 1 y 6)
    if (state.titulares.length === 0) {
        errors.push('Debe haber al menos 1 titular');
    }
    if (state.titulares.length > 6) {
        errors.push('No puede haber más de 6 titulares');
    }
    if (state.titulares.length > state.maxTitulares) {
        errors.push(`No puede haber más de ${state.maxTitulares} titulares según los votos de la cooperativa (${state.cooperativaSeleccionada.votes} votos)`);
    }

    // Validar cantidad de suplentes
    if (state.suplentes.length > state.maxSuplentes) {
        errors.push(`No puede haber más de ${state.maxSuplentes} suplentes según los votos de la cooperativa (${state.cooperativaSeleccionada.votes} votos)`);
    }

    // Validar datos de titulares
    state.titulares.forEach((titular, index) => {
        const card = document.querySelector(`[data-id="${titular.id}"]`);
        const nombre = card.querySelector(`input[id^="nombre-"]`).value.trim();
        const documento = card.querySelector(`input[id^="documento-"]`).value.trim();
        
        if (!nombre) {
            errors.push(`El titular ${index + 1} debe tener un nombre`);
        } else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(nombre)) {
            errors.push(`El nombre del titular ${index + 1} solo puede contener letras y espacios`);
        }
        
        if (!documento) {
            errors.push(`El titular ${index + 1} debe tener un documento`);
        } else if (!/^\d+$/.test(documento)) {
            errors.push(`El documento del titular ${index + 1} solo puede contener números`);
        }
    });

    // Validar datos de suplentes
    state.suplentes.forEach((suplente, index) => {
        const card = document.querySelector(`[data-id="${suplente.id}"]`);
        const nombre = card.querySelector(`input[id^="nombre-sup-"]`).value.trim();
        const documento = card.querySelector(`input[id^="documento-sup-"]`).value.trim();
        
        if (!nombre) {
            errors.push(`El suplente ${index + 1} debe tener un nombre`);
        } else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(nombre)) {
            errors.push(`El nombre del suplente ${index + 1} solo puede contener letras y espacios`);
        }
        
        if (!documento) {
            errors.push(`El suplente ${index + 1} debe tener un documento`);
        } else if (!/^\d+$/.test(documento)) {
            errors.push(`El documento del suplente ${index + 1} solo puede contener números`);
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
            errors.push(`La carta poder ${index + 1} debe tener origen y destino completos`);
            return;
        }

        if (desde === hacia) {
            errors.push(`Error en carta poder ${index + 1}: un titular no puede ser poderdante y apoderado de sí mismo`);
            return;
        }

        if (titularesConVotoDelegado.has(desde)) {
            errors.push(`Error en carta poder ${index + 1}: cada poderdante solo puede delegar su voto una vez`);
        }
        titularesConVotoDelegado.add(desde);

        cartasPoderPorTitular[hacia] = (cartasPoderPorTitular[hacia] || 0) + 1;
        if (cartasPoderPorTitular[hacia] > state.maxCartasPoder) {
            errors.push(`Error en carta poder ${index + 1}: un apoderado no puede recibir más de ${state.maxCartasPoder} cartas poder`);
        }
    });

    if (errors.length > 0) {
        console.log('Errores encontrados:', errors);
        showErrors(errors);
        return false;
    }

    console.log('Validación exitosa, generando JSON y enviando datos...');
    
    // Generar JSON con los datos
    const formData = generateFormDataJSON();
    
    // Mostrar JSON en consola para debug
    console.log('JSON generado:', formData);
    
    // Opción para descargar JSON como backup (opcional)
    downloadJSONBackup(formData);
    
    // Mostrar loading mientras se envían los datos
    showLoadingModal();
    
    // Enviar datos al endpoint
    sendDataToEndpoint(formData).then(result => {
        if (result.success) {
            console.log('Datos enviados exitosamente');
            showSaveSuccessWithResumen();
        } else {
            console.error('Error al enviar datos:', result.error);
            showSendError(result.error);
        }
    });
    
    return true;
}

function validate() {
    const errors = [];

    // Validar selección de cooperativa
    if (!state.cooperativaSeleccionada) {
        errors.push('Debe seleccionar una cooperativa');
        showErrors(errors);
        return false;
    }

    // Validar cantidad de titulares (debe ser entre 1 y 6)
    if (state.titulares.length === 0) {
        errors.push('Debe haber al menos 1 titular');
    }
    if (state.titulares.length > 6) {
        errors.push('No puede haber más de 6 titulares');
    }
    if (state.titulares.length > state.maxTitulares) {
        errors.push(`No puede haber más de ${state.maxTitulares} titulares según los votos de la cooperativa (${state.cooperativaSeleccionada.votes} votos)`);
    }

    // Validar cantidad de suplentes
    if (state.suplentes.length > state.maxSuplentes) {
        errors.push(`No puede haber más de ${state.maxSuplentes} suplentes según los votos de la cooperativa (${state.cooperativaSeleccionada.votes} votos)`);
    }

    // Validar datos de titulares
    state.titulares.forEach((titular, index) => {
        const card = document.querySelector(`[data-id="${titular.id}"]`);
        const nombre = card.querySelector(`input[id^="nombre-"]`).value.trim();
        const documento = card.querySelector(`input[id^="documento-"]`).value.trim();
        
        if (!nombre) {
            errors.push(`El titular ${index + 1} debe tener un nombre`);
        } else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(nombre)) {
            errors.push(`El nombre del titular ${index + 1} solo puede contener letras y espacios`);
        }
        
        if (!documento) {
            errors.push(`El titular ${index + 1} debe tener un documento`);
        } else if (!/^\d+$/.test(documento)) {
            errors.push(`El documento del titular ${index + 1} solo puede contener números`);
        }
    });

    // Validar datos de suplentes
    state.suplentes.forEach((suplente, index) => {
        const card = document.querySelector(`[data-id="${suplente.id}"]`);
        const nombre = card.querySelector(`input[id^="nombre-sup-"]`).value.trim();
        const documento = card.querySelector(`input[id^="documento-sup-"]`).value.trim();
        
        if (!nombre) {
            errors.push(`El suplente ${index + 1} debe tener un nombre`);
        } else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(nombre)) {
            errors.push(`El nombre del suplente ${index + 1} solo puede contener letras y espacios`);
        }
        
        if (!documento) {
            errors.push(`El suplente ${index + 1} debe tener un documento`);
        } else if (!/^\d+$/.test(documento)) {
            errors.push(`El documento del suplente ${index + 1} solo puede contener números`);
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
            errors.push(`La carta poder ${index + 1} debe tener origen y destino completos`);
            return;
        }

        if (desde === hacia) {
            errors.push(`Error en carta poder ${index + 1}: un titular no puede ser poderdante y apoderado de sí mismo`);
            return;
        }

        if (titularesConVotoDelegado.has(desde)) {
            errors.push(`Error en carta poder ${index + 1}: cada poderdante solo puede delegar su voto una vez`);
        }
        titularesConVotoDelegado.add(desde);

        cartasPoderPorTitular[hacia] = (cartasPoderPorTitular[hacia] || 0) + 1;
        if (cartasPoderPorTitular[hacia] > state.maxCartasPoder) {
            errors.push(`Error en carta poder ${index + 1}: un apoderado no puede recibir más de ${state.maxCartasPoder} cartas poder`);
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
    modalElement.style.display = 'block';
    
    // Asegurar que el modal aparezca en la parte superior
    setTimeout(() => {
        const modalContent = modalElement.querySelector('.modal-content');
        if (modalContent) {
            modalContent.scrollTop = 0;
        }
        // Scroll suave hacia arriba de la página para mostrar el modal
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Focus en el modal para accesibilidad
        modalContent?.focus();
    }, 50);
}

function showError(message) {
    const errorModal = document.getElementById('error-modal');
    const errorList = document.getElementById('error-list');
    const modalTitle = document.getElementById('modal-title');
    const modalAccept = document.getElementById('modal-accept');
    
    modalTitle.textContent = 'Error de Validación';
    errorList.innerHTML = `<p class="error-message">❌ ${message}</p>`;
    modalAccept.style.display = 'none';
    
    showModal(errorModal);
}

function showErrors(errors) {
    const errorModal = document.getElementById('error-modal');
    const errorList = document.getElementById('error-list');
    const modalTitle = document.getElementById('modal-title');
    const modalAccept = document.getElementById('modal-accept');
    
    modalTitle.textContent = 'Errores de Validación';
    errorList.innerHTML = errors.map(error => `<p class="error-message">❌ ${error}</p>`).join('');
    modalAccept.style.display = 'none';
    
    showModal(errorModal);
}

function showConfirmation(message) {
    const errorModal = document.getElementById('error-modal');
    const errorList = document.getElementById('error-list');
    const modalTitle = document.getElementById('modal-title');
    const modalAccept = document.getElementById('modal-accept');
    
    modalTitle.textContent = 'Confirmación de Selección';
    errorList.innerHTML = `<p class="confirmation-message">${message}</p>`;
    modalAccept.style.display = 'inline-block';
    modalAccept.textContent = 'Aceptar';
    
    showModal(errorModal);
}

function showSaveSuccessWithResumen() {
    console.log('showSaveSuccessWithResumen ejecutándose...');
    const errorModal = document.getElementById('error-modal');
    const errorList = document.getElementById('error-list');
    const modalTitle = document.getElementById('modal-title');
    const modalAccept = document.getElementById('modal-accept');
    
    modalTitle.textContent = 'Registro Guardado Exitosamente';
    
    // Generar el resumen completo
    updateResumen();
    const resumenContainer = document.getElementById('resumen-container');
    const resumenHTML = resumenContainer.innerHTML;
    
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
    
    modalAccept.style.display = 'inline-block';
    modalAccept.textContent = 'Cerrar';
    errorModal.style.display = 'block';
}

// Función para generar el JSON con los datos del formulario
function generateFormDataJSON() {
    const formData = {
        timestamp: new Date().toISOString(),
        cooperativa: {
            codigo: state.cooperativaSeleccionada?.code || '',
            nombre: state.cooperativaSeleccionada?.name || '',
            votos: state.cooperativaSeleccionada?.votes || 0,
            suplentes: state.cooperativaSeleccionada?.substitutes || 0,
            car: state.cooperativaSeleccionada?.CAR || 0,
            carNombre: state.cooperativaSeleccionada?.['CAR Nombre'] || ''
        },
        titulares: [],
        suplentes: [],
        cartasPoder: [],
        resumen: {
            totalTitulares: state.titulares.length,
            totalSuplentes: state.suplentes.length,
            totalCartasPoder: state.cartasPoder.length,
            votosEfectivos: 0
        }
    };

    // Recopilar datos de titulares
    state.titulares.forEach((titular, index) => {
        const card = document.querySelector(`[data-id="${titular.id}"]`);
        const nombre = card.querySelector(`input[id^="nombre-"]`).value.trim();
        const documento = card.querySelector(`input[id^="documento-"]`).value.trim();
        
        formData.titulares.push({
            id: titular.id,
            nombre: nombre,
            documento: documento,
            orden: index + 1
        });
    });

    // Recopilar datos de suplentes
    state.suplentes.forEach((suplente, index) => {
        const card = document.querySelector(`[data-id="${suplente.id}"]`);
        const nombre = card.querySelector(`input[id^="nombre-sup-"]`).value.trim();
        const documento = card.querySelector(`input[id^="documento-sup-"]`).value.trim();
        
        formData.suplentes.push({
            id: suplente.id,
            nombre: nombre,
            documento: documento,
            orden: index + 1
        });
    });

    // Recopilar datos de cartas poder
    state.cartasPoder.forEach((cp, index) => {
        const card = document.querySelector(`[data-id="${cp.id}"]`);
        const desde = card.querySelector(`select[id^="desde-"]`).value;
        const hacia = card.querySelector(`select[id^="hacia-"]`).value;
        
        // Buscar nombres de los titulares
        const poderdante = formData.titulares.find(t => t.id === desde);
        const apoderado = formData.titulares.find(t => t.id === hacia);
        
        formData.cartasPoder.push({
            id: cp.id,
            poderdante: {
                id: desde,
                nombre: poderdante?.nombre || '',
                documento: poderdante?.documento || ''
            },
            apoderado: {
                id: hacia,
                nombre: apoderado?.nombre || '',
                documento: apoderado?.documento || ''
            },
            orden: index + 1
        });
    });

    // Calcular votos efectivos
    const titularesQueVotan = state.titulares.filter(titular => {
        return !state.cartasPoder.some(cp => {
            const card = document.querySelector(`[data-id="${cp.id}"]`);
            const desde = card.querySelector(`select[id^="desde-"]`).value;
            return desde === titular.id;
        });
    });

    const apoderados = new Set();
    state.cartasPoder.forEach(cp => {
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
        console.log('Enviando datos al endpoint:', config.apiEndpoint);
        console.log('Datos a enviar:', JSON.stringify(data, null, 2));
        
        // Crear un AbortController para manejar timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout);
        
        const response = await fetch(config.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Respuesta del servidor:', result);
        
        return {
            success: true,
            data: result
        };
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('Timeout: La solicitud tardó demasiado tiempo');
            return {
                success: false,
                error: 'La solicitud tardó demasiado tiempo. Verifique su conexión e intente nuevamente.'
            };
        }
        console.error('Error al enviar datos:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

function showValidationSuccessWithResumen() {
    console.log('Ejecutando showValidationSuccessWithResumen...');
    const errorModal = document.getElementById('error-modal');
    const errorList = document.getElementById('error-list');
    const modalTitle = document.getElementById('modal-title');
    const modalAccept = document.getElementById('modal-accept');
    
    modalTitle.textContent = 'Confirmar Registro';
    
    // Generar el resumen completo
    console.log('Llamando a updateResumen...');
    updateResumen();
    const resumenContainer = document.getElementById('resumen-container');
    const resumenHTML = resumenContainer.innerHTML;
    console.log('HTML del resumen:', resumenHTML);
    
    // Mostrar el resumen en el modal con un mensaje de confirmación
    errorList.innerHTML = `
        <div class="success-message">
            ✓ Validación exitosa. Revise el resumen y confirme si desea guardar el registro:
        </div>
        ${resumenHTML}
    `;
    
    modalAccept.style.display = 'inline-block';
    modalAccept.textContent = 'Confirmar y Habilitar Guardar';
    errorModal.style.display = 'block';
    console.log('Modal mostrado');
}

// Función para mostrar modal de loading
function showLoadingModal() {
    const errorModal = document.getElementById('error-modal');
    const errorList = document.getElementById('error-list');
    const modalTitle = document.getElementById('modal-title');
    const modalAccept = document.getElementById('modal-accept');
    
    modalTitle.textContent = 'Enviando Datos...';
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
    modalAccept.style.display = 'none';
    errorModal.style.display = 'block';
}

// Función para mostrar error de envío
function showSendError(errorMessage) {
    const errorModal = document.getElementById('error-modal');
    const errorList = document.getElementById('error-list');
    const modalTitle = document.getElementById('modal-title');
    const modalAccept = document.getElementById('modal-accept');
    
    modalTitle.textContent = 'Error al Enviar Datos';
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
    modalAccept.style.display = 'inline-block';
    modalAccept.textContent = 'Cerrar';
    errorModal.style.display = 'block';
}

// Función para descargar JSON como backup
function downloadJSONBackup(data) {
    try {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `registro-asamblea-${data.cooperativa.codigo}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('Backup JSON descargado exitosamente');
    } catch (error) {
        console.warn('No se pudo descargar el backup JSON:', error);
    }
}

function generateResumen() {
    const resumen = {
        cooperativa: state.cooperativaSeleccionada,
        titulares: state.titulares.map(t => {
            const card = document.querySelector(`[data-id="${t.id}"]`);
            return {
                id: t.id,
                nombre: card.querySelector(`input[id^="nombre-"]`).value,
                documento: card.querySelector(`input[id^="documento-"]`).value,
                votosRepresentados: []
            };
        }),
        suplentes: state.suplentes.map(s => {
            const card = document.querySelector(`[data-id="${s.id}"]`);
            return {
                id: s.id,
                nombre: card.querySelector(`input[id^="nombre-sup-"]`).value,
                documento: card.querySelector(`input[id^="documento-sup-"]`).value
            };
        }),
        delegaciones: state.cartasPoder.map(cp => {
            const card = document.querySelector(`[data-id="${cp.id}"]`);
            return {
                desde: card.querySelector(`select[id^="desde-"]`).value,
                hacia: card.querySelector(`select[id^="hacia-"]`).value
            };
        })
    };

    // Calcular votos representados
    resumen.delegaciones.forEach(d => {
        const titular = resumen.titulares.find(t => t.id === d.hacia);
        if (titular) {
            titular.votosRepresentados.push(d.desde);
        }
    });

    return resumen;
}

function updateResumen() {
    const resumen = generateResumen();
    const resumenContainer = document.getElementById('resumen-container');
    
    let html = `<div class="card">
        <h3>Cooperativa: ${resumen.cooperativa.name}</h3>
        <p><strong>Código:</strong> ${resumen.cooperativa.code}</p>
        <p><strong>CUIT:</strong> ${resumen.cooperativa.cuit}</p>
        <p><strong>Votos totales:</strong> ${resumen.cooperativa.votes}</p>
    </div>`;
    
    html += '<h3>Distribución de Votos:</h3>';
    let totalVotosEjercidos = 0;
    let titularesVotantes = 0;
    
    resumen.titulares.forEach((t, index) => {
        const votosExtra = t.votosRepresentados.length;
        const votosTotal = 1 + votosExtra;
        const tieneDelegaciones = votosExtra > 0;
        
        // Solo contar si el titular no delegó su voto
        const delegoSuVoto = resumen.delegaciones.some(d => d.desde === t.id);
        if (!delegoSuVoto) {
            totalVotosEjercidos += votosTotal;
            titularesVotantes++;
        }
        
        html += `
            <div class="card ${tieneDelegaciones ? 'delegado-receptor' : ''}">
                <p><strong>Titular ${index + 1}:</strong> ${t.nombre}</p>
                <p><strong>Documento:</strong> ${t.documento}</p>
                ${delegoSuVoto ? (() => {
                    const delegacion = resumen.delegaciones.find(d => d.desde === t.id);
                    const apoderado = resumen.titulares.find(titular => titular.id === delegacion.hacia);
                    return `<p class="delegation-sender"><strong>Estado:</strong> Poderdante - Delegó voto a ${apoderado.nombre}</p>`;
                })() :
                    `<p><strong>Votos a ejercer:</strong> ${votosTotal} ${votosTotal === 1 ? '(voto propio)' : `(propio + ${votosExtra} delegados)`}</p>`
                }
                ${tieneDelegaciones && !delegoSuVoto ? (() => {
                    const poderdantes = resumen.delegaciones
                        .filter(d => d.hacia === t.id)
                        .map(d => resumen.titulares.find(titular => titular.id === d.desde).nombre);
                    return `<p class="delegation-receiver"><strong>Estado:</strong> Apoderado - Recibe delegaciones de: ${poderdantes.join(', ')}</p>`;
                })() : 
                    ''
                }
            </div>
        `;
    });

    if (resumen.suplentes.length > 0) {
        html += '<h3>Suplentes:</h3>';
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
        html += '<h3>Cartas Poder Registradas:</h3>';
        resumen.delegaciones.forEach((d, index) => {
            const titularPoderdante = resumen.titulares.find(t => t.id === d.desde);
            const titularApoderado = resumen.titulares.find(t => t.id === d.hacia);
            html += `
                <div class="card">
                    <p><strong>Carta Poder ${index + 1}:</strong></p>
                    <p><strong>Poderdante:</strong> ${titularPoderdante?.nombre || 'Titular no encontrado'} (delega su voto)</p>
                    <p><strong>Apoderado:</strong> ${titularApoderado?.nombre || 'Titular no encontrado'} (recibe el voto)</p>
                </div>
            `;
        });
    }

    html += `
        <div class="card success-message" style="border: 2px solid var(--success-green);">
            <h3>Resumen de Votación</h3>
            <p><strong>Cooperativa:</strong> ${resumen.cooperativa.name}</p>
            <p><strong>Total votos de la cooperativa:</strong> ${resumen.cooperativa.votes}</p>
            <p><strong>Titulares registrados:</strong> ${resumen.titulares.length} (máximo: ${Math.min(resumen.cooperativa.votes, 6)})</p>
            <p><strong>Titulares que votan:</strong> ${titularesVotantes}</p>
            <p><strong>Total votos a ejercer:</strong> ${totalVotosEjercidos}</p>
            <p><strong>Suplentes designados:</strong> ${resumen.suplentes.length}</p>
            <p><strong>Delegaciones activas:</strong> ${resumen.delegaciones.length}</p>
            ${totalVotosEjercidos === resumen.cooperativa.votes ? 
                '<p class="success-message" style="color: var(--success-green); font-weight: bold;">✓ Todos los votos están representados</p>' :
                '<p style="color: var(--warning-yellow); font-weight: bold; background: rgba(255, 193, 7, 0.1); padding: 10px; border-radius: 4px;">⚠ Votos no representados: ' + (resumen.cooperativa.votes - totalVotosEjercidos) + '</p>'
            }
        </div>
    `;

    resumenContainer.innerHTML = html;
}

// Manejo de cambio de cooperativa
function handleCooperativeChange() {
    const select = document.getElementById('cooperative');
    const selectedOption = select.options[select.selectedIndex];
    
    if (selectedOption && selectedOption.value) {
        const selectedCoop = state.cooperativas.find(coop => coop.code === selectedOption.value);
        
        if (selectedCoop) {
            state.cooperativaSeleccionada = selectedCoop;
            document.getElementById('code').value = selectedCoop.code;
            document.getElementById('votes').value = selectedCoop.votes;
            
            // Limpiar titulares y suplentes existentes
            state.titulares = [];
            state.suplentes = [];
            state.cartasPoder = [];
            
            document.getElementById('titulares-container').innerHTML = '';
            document.getElementById('suplentes-container').innerHTML = '';
            document.getElementById('cartas-poder-container').innerHTML = '';
            document.getElementById('resumen-container').innerHTML = '';
            
            // Actualizar límites según los votos de la cooperativa
            state.maxTitulares = Math.min(parseInt(selectedCoop.votes), 6);
            state.maxSuplentes = parseInt(selectedCoop.substitutes || selectedCoop.votes);
            
            // Actualizar textos informativos
            document.querySelector('#titulares-section h2').textContent = 
                `Titulares (0-${state.maxTitulares}) - Máximo según votos de la cooperativa`;
            document.querySelector('#suplentes-section h2').textContent = 
                `Suplentes (0-${state.maxSuplentes}) - Máximo según configuración de la cooperativa`;
            
            // Actualizar estado de botones
            updateButtonStates();
            
            showConfirmation(`Cooperativa seleccionada: ${selectedCoop.name}
CAR ${selectedCoop.CAR} - ${selectedCoop['CAR Nombre']}

Puede agregar hasta ${selectedCoop.votes} titulares y ${selectedCoop.substitutes || selectedCoop.votes} suplentes.

Reglas de cartas poder:
• Cada poderdante puede delegar su voto UNA vez
• Cada apoderado puede recibir hasta 2 cartas poder`);
        }
    } else {
        clearCooperativeData();
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Event listener para el botón de continuar al registro
    document.getElementById('continuar-registro').addEventListener('click', mostrarRegistro);

    // Cargar cooperativas
    loadCooperatives();

    // Eventos de botones principales
    document.getElementById('agregar-titular').addEventListener('click', addTitular);
    document.getElementById('agregar-suplente').addEventListener('click', addSuplente);
    document.getElementById('agregar-carta-poder').addEventListener('click', addCartaPoder);
    // El botón guardar ahora usa onclick en el HTML

    // Evento de cambio de CAR
    document.getElementById('car-select').addEventListener('change', filterCooperativesByCAR);
    
    // Evento de cambio de cooperativa
    document.getElementById('cooperative').addEventListener('change', handleCooperativeChange);

    // Cerrar modal
    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('error-modal').style.display = 'none';
    });

    // Botón aceptar del modal
    document.getElementById('modal-accept').addEventListener('click', () => {
        document.getElementById('error-modal').style.display = 'none';
    });

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('error-modal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Inicializar estado de botones
    updateButtonStates();
});
