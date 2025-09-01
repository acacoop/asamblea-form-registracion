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
        const response = await fetch('data/cooperatives.csv');
        const csvText = await response.text();
        state.cooperativas = parseCSV(csvText);
        populateCooperativeSelect(state.cooperativas);
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
            
            // Convertir votes a número
            cooperative.votes = parseInt(cooperative.votes) || 0;
            
            return cooperative;
        });
}

// Poblar el select con las cooperativas
function populateCooperativeSelect(cooperativas) {
    const select = document.getElementById('cooperative');
    select.innerHTML = '<option value="">Seleccione una cooperativa</option>';
    
    // Ordenar cooperativas por nombre
    cooperativas.sort((a, b) => a.name.localeCompare(b.name));
    
    cooperativas.forEach(coop => {
        const option = document.createElement('option');
        option.value = coop.code;
        option.textContent = coop.name;
        option.dataset.cuit = coop.cuit;
        option.dataset.votes = coop.votes;
        select.appendChild(option);
    });
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
                <label for="desde-${id}">Poderante (quien delega):</label>
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

    // Obtener lista de poderantes (quienes ya delegaron su voto)
    const poderantes = new Set();
    state.cartasPoder.forEach(cpOther => {
        const otherCard = document.querySelector(`[data-id="${cpOther.id}"]`);
        if (otherCard) {
            const desde = otherCard.querySelector(`select[id^="desde-"]`).value;
            if (desde) {
                poderantes.add(desde);
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

        // Obtener poderantes excluyendo el actual
        const otrosPoderantes = new Set();
        state.cartasPoder.forEach(cpOther => {
            if (cpOther.id !== cp.id) { // Excluir la carta actual
                const otherCard = document.querySelector(`[data-id="${cpOther.id}"]`);
                if (otherCard) {
                    const desde = otherCard.querySelector(`select[id^="desde-"]`).value;
                    if (desde) {
                        otrosPoderantes.add(desde);
                    }
                }
            }
        });

        desdeSelect.innerHTML = '<option value="">Seleccione un titular</option>';
        haciaSelect.innerHTML = '<option value="">Seleccione un titular</option>';

        titulares.forEach(t => {
            // Solo los titulares que NO son poderantes en OTRAS cartas pueden ser poderantes
            if (!otrosPoderantes.has(t.id)) {
                desdeSelect.add(new Option(t.nombre || `Titular ${t.id}`, t.id));
            }
            
            // Solo los titulares que NO son poderantes en NINGUNA carta pueden ser apoderados
            if (!poderantes.has(t.id)) {
                haciaSelect.add(new Option(t.nombre || `Titular ${t.id}`, t.id));
            }
        });

        // Restaurar valores solo si siguen siendo válidos
        if (currentDesde && !otrosPoderantes.has(currentDesde)) {
            desdeSelect.value = currentDesde;
        } else if (currentDesde && otrosPoderantes.has(currentDesde)) {
            // Si el poderante seleccionado ya es poderante en otra carta, limpiar la selección
            desdeSelect.value = '';
        }
        
        // Solo restaurar el valor de apoderado si no es un poderante
        if (currentHacia && !poderantes.has(currentHacia)) {
            haciaSelect.value = currentHacia;
        } else if (currentHacia && poderantes.has(currentHacia)) {
            // Si el apoderado seleccionado ahora es poderante, limpiar la selección
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
        showError('❌ Error: Un titular no puede ser poderante y apoderado de sí mismo');
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

    // Verificar que el poderante no haya delegado ya
    const yaDelego = state.cartasPoder.some(cp => {
        const otherCard = document.querySelector(`[data-id="${cp.id}"]`);
        return otherCard && otherCard !== card && otherCard.querySelector(`select[id^="desde-"]`).value === desde;
    });

    if (yaDelego) {
        showError('❌ Error: Este poderante ya delegó su voto a otro titular');
        card.querySelector(`select[id^="desde-"]`).value = '';
        return false;
    }

    // Verificar que el apoderado no sea ya un poderante
    const apoderadoEsPoderante = state.cartasPoder.some(cp => {
        const otherCard = document.querySelector(`[data-id="${cp.id}"]`);
        return otherCard && otherCard !== card && otherCard.querySelector(`select[id^="desde-"]`).value === hacia;
    });

    if (apoderadoEsPoderante) {
        showError('❌ Error: Un titular que ya delegó su voto no puede ser apoderado');
        card.querySelector(`select[id^="hacia-"]`).value = '';
        updateCartaPoderSelects();
        return false;
    }

    // Actualizar los selects para reflejar los cambios cuando se selecciona un nuevo poderante
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
            errors.push(`Error en carta poder ${index + 1}: un titular no puede ser poderante y apoderado de sí mismo`);
            return;
        }

        if (titularesConVotoDelegado.has(desde)) {
            errors.push(`Error en carta poder ${index + 1}: cada poderante solo puede delegar su voto una vez`);
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

    console.log('Validación exitosa, mostrando resumen...');
    // Si la validación es exitosa, mostrar resumen y guardar
    showSaveSuccessWithResumen();
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
            errors.push(`Error en carta poder ${index + 1}: un titular no puede ser poderante y apoderado de sí mismo`);
            return;
        }

        if (titularesConVotoDelegado.has(desde)) {
            errors.push(`Error en carta poder ${index + 1}: cada poderante solo puede delegar su voto una vez`);
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
function showError(message) {
    const errorModal = document.getElementById('error-modal');
    const errorList = document.getElementById('error-list');
    const modalTitle = document.getElementById('modal-title');
    const modalAccept = document.getElementById('modal-accept');
    
    modalTitle.textContent = 'Errores de Validación';
    errorList.innerHTML = `<p class="error-message">${message}</p>`;
    modalAccept.style.display = 'none';
    errorModal.style.display = 'block';
}

function showErrors(errors) {
    const errorModal = document.getElementById('error-modal');
    const errorList = document.getElementById('error-list');
    const modalTitle = document.getElementById('modal-title');
    const modalAccept = document.getElementById('modal-accept');
    
    modalTitle.textContent = 'Errores de Validación';
    errorList.innerHTML = errors.map(error => `<p class="error-message">${error}</p>`).join('');
    modalAccept.style.display = 'none';
    errorModal.style.display = 'block';
}

function showConfirmation(message) {
    const errorModal = document.getElementById('error-modal');
    const errorList = document.getElementById('error-list');
    const modalTitle = document.getElementById('modal-title');
    const modalAccept = document.getElementById('modal-accept');
    
    modalTitle.textContent = 'Confirmación de Selección';
    errorList.innerHTML = `<p style="color: #4caf50; font-weight: bold;">${message}</p>`;
    modalAccept.style.display = 'inline-block';
    errorModal.style.display = 'block';
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
        <div style="color: #4caf50; font-weight: bold; margin-bottom: 15px;">
            ✅ ¡Registro guardado exitosamente!
        </div>
        <div style="margin-bottom: 15px;">
            <strong>Resumen de lo guardado:</strong>
        </div>
        ${resumenHTML}
    `;
    
    modalAccept.style.display = 'inline-block';
    modalAccept.textContent = 'Cerrar';
    errorModal.style.display = 'block';
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
        <div style="color: #4caf50; font-weight: bold; margin-bottom: 15px;">
            ✓ Validación exitosa. Revise el resumen y confirme si desea guardar el registro:
        </div>
        ${resumenHTML}
    `;
    
    modalAccept.style.display = 'inline-block';
    modalAccept.textContent = 'Confirmar y Habilitar Guardar';
    errorModal.style.display = 'block';
    console.log('Modal mostrado');
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
                    return `<p style="color: #ff9800;"><strong>Estado:</strong> Poderante - Delegó voto a ${apoderado.nombre}</p>`;
                })() :
                    `<p><strong>Votos a ejercer:</strong> ${votosTotal} ${votosTotal === 1 ? '(voto propio)' : `(propio + ${votosExtra} delegados)`}</p>`
                }
                ${tieneDelegaciones && !delegoSuVoto ? (() => {
                    const poderantes = resumen.delegaciones
                        .filter(d => d.hacia === t.id)
                        .map(d => resumen.titulares.find(titular => titular.id === d.desde).nombre);
                    return `<p style="color: #4caf50;"><strong>Estado:</strong> Apoderado - Recibe delegaciones de: ${poderantes.join(', ')}</p>`;
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
            const titularPoderante = resumen.titulares.find(t => t.id === d.desde);
            const titularApoderado = resumen.titulares.find(t => t.id === d.hacia);
            html += `
                <div class="card">
                    <p><strong>Carta Poder ${index + 1}:</strong></p>
                    <p><strong>Poderante:</strong> ${titularPoderante?.nombre || 'Titular no encontrado'} (delega su voto)</p>
                    <p><strong>Apoderado:</strong> ${titularApoderado?.nombre || 'Titular no encontrado'} (recibe el voto)</p>
                </div>
            `;
        });
    }

    html += `
        <div class="card" style="background-color: #e8f5e8; border: 2px solid #4caf50;">
            <h3>Resumen de Votación</h3>
            <p><strong>Cooperativa:</strong> ${resumen.cooperativa.name}</p>
            <p><strong>Total votos de la cooperativa:</strong> ${resumen.cooperativa.votes}</p>
            <p><strong>Titulares registrados:</strong> ${resumen.titulares.length} (máximo: ${Math.min(resumen.cooperativa.votes, 6)})</p>
            <p><strong>Titulares que votan:</strong> ${titularesVotantes}</p>
            <p><strong>Total votos a ejercer:</strong> ${totalVotosEjercidos}</p>
            <p><strong>Suplentes designados:</strong> ${resumen.suplentes.length}</p>
            <p><strong>Delegaciones activas:</strong> ${resumen.delegaciones.length}</p>
            ${totalVotosEjercidos === resumen.cooperativa.votes ? 
                '<p style="color: #4caf50; font-weight: bold;">✓ Todos los votos están representados</p>' :
                '<p style="color: #ff9800; font-weight: bold;">⚠ Votos no representados: ' + (resumen.cooperativa.votes - totalVotosEjercidos) + '</p>'
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
            document.getElementById('cuit').value = selectedCoop.cuit;
            document.getElementById('votes').value = selectedCoop.votes;
            
            // Limpiar titulares y suplentes existentes
            state.titulares = [];
            state.suplentes = [];
            state.cartasPoder = [];
            
            document.getElementById('titulares-container').innerHTML = '';
            document.getElementById('suplentes-container').innerHTML = '';
            document.getElementById('cartas-poder-container').innerHTML = '';
            document.getElementById('resumen-container').innerHTML = '';
            
            // Actualizar límites según los votos de la cooperativa (máximo 6 titulares)
            state.maxTitulares = Math.min(parseInt(selectedCoop.votes), 6);
            state.maxSuplentes = parseInt(selectedCoop.votes);
            
            // Actualizar textos informativos
            document.querySelector('#titulares-section h2').textContent = 
                `Titulares (0-${state.maxTitulares}) - Máximo según votos de la cooperativa`;
            
            // Actualizar estado de botones
            updateButtonStates();
            
            showConfirmation(`Cooperativa seleccionada: ${selectedCoop.name}. 
            
Puede agregar hasta ${selectedCoop.votes} titulares y ${selectedCoop.votes} suplentes.

Reglas de cartas poder:
• Cada poderante puede delegar su voto UNA vez
• Cada apoderado puede recibir hasta 2 cartas poder`);
        }
    } else {
        // Limpiar selección
        state.cooperativaSeleccionada = null;
        document.getElementById('code').value = '';
        document.getElementById('cuit').value = '';
        document.getElementById('votes').value = '';
        
        // Limpiar todo
        state.titulares = [];
        state.suplentes = [];
        state.cartasPoder = [];
        
        document.getElementById('titulares-container').innerHTML = '';
        document.getElementById('suplentes-container').innerHTML = '';
        document.getElementById('cartas-poder-container').innerHTML = '';
        document.getElementById('resumen-container').innerHTML = '';
        
        // Restaurar textos por defecto
        document.querySelector('#titulares-section h2').textContent = 'Titulares';
        
        // Resetear límites
        state.maxTitulares = 6;
        state.maxSuplentes = 6;
        updateButtonStates();
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
