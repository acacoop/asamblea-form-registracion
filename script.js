// Estado global de la aplicación
const //Poblar el select con las cooperativas
function populateCooperativeSelect(cooperativas) {
    const select = document.getElementById('cooperative');
    select.innerHTML = '<option value="">Seleccione una cooperativa</option>';
    
    // Ordenar cooperativas por nombre
    cooperativas.sort((a, b) => a.name.localeCompare(b.name));
    
    cooperativas.forEach(coop => {
        const option = document.createElement('option');
        option.value = coop.code;
        option.textContent = `${coop.name} (${coop.votes} votos)`;
        option.dataset.cuit = coop.cuit;
        option.dataset.votes = coop.votes;
        select.appendChild(option);
    });
}   titulares: [],
    suplentes: [],
    cartasPoder: [],
    cooperativas: [],
    cooperativaSeleccionada: null,
    maxTitulares: 6,
    maxSuplentes: 6,
    maxCartasPoder: 2
};

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
    const headers = lines[0].split(',');
    
    return lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
            const values = line.split(',');
            const cooperative = {};
            headers.forEach((header, index) => {
                cooperative[header.trim()] = values[index]?.trim();
            });
            return cooperative;
        });
}

// Poblar el select con las cooperativas
function populateCooperativeSelect(cooperativas) {
    const select = document.getElementById('cooperative');
    select.innerHTML = '<option value="">Seleccione una cooperativa</option>';
    
    cooperativas.forEach(coop => {
        const option = document.createElement('option');
        option.value = coop.code;
        option.textContent = coop.name;
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
                <input type="text" id="nombre-${id}" required>
            </div>
            <div class="form-group">
                <label for="documento-${id}">Documento (DNI/CUIT):</label>
                <input type="text" id="documento-${id}" required>
            </div>
            <div class="form-group">
                <label for="cooperativa-${id}">Cooperativa:</label>
                <input type="text" id="cooperativa-${id}">
            </div>
            <button type="button" class="btn-remove" onclick="removeTitular('${id}')">Eliminar</button>
        </div>
    `;
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
                <input type="text" id="nombre-sup-${id}" required>
            </div>
            <div class="form-group">
                <label for="documento-sup-${id}">Documento:</label>
                <input type="text" id="documento-sup-${id}" required>
            </div>
            <div class="form-group">
                <label for="cooperativa-sup-${id}">Cooperativa:</label>
                <input type="text" id="cooperativa-sup-${id}">
            </div>
            <button type="button" class="btn-remove" onclick="removeSuplente('${id}')">Eliminar</button>
        </div>
    `;
    return card;
}

function createCartaPoderCard(id) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = id;
    card.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label for="desde-${id}">Desde Titular:</label>
                <select id="desde-${id}" required onchange="validateCartaPoder('${id}')">
                    <option value="">Seleccione un titular</option>
                </select>
            </div>
            <div class="form-group">
                <label for="hacia-${id}">Hacia Titular:</label>
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
    if (state.titulares.length >= state.maxTitulares) {
        showError('No se pueden agregar más titulares. Máximo permitido: ' + state.maxTitulares);
        return;
    }

    const id = createUniqueId();
    state.titulares.push({ id });
    const card = createTitularCard(id);
    document.getElementById('titulares-container').appendChild(card);
    updateCartaPoderSelects();
}

function removeTitular(id) {
    state.titulares = state.titulares.filter(t => t.id !== id);
    document.querySelector(`[data-id="${id}"]`).remove();
    updateCartaPoderSelects();
}

// Funciones de gestión de suplentes
function addSuplente() {
    if (state.suplentes.length >= state.maxSuplentes) {
        showError('No se pueden agregar más suplentes. Máximo permitido: ' + state.maxSuplentes);
        return;
    }

    const id = createUniqueId();
    state.suplentes.push({ id });
    const card = createSuplenteCard(id);
    document.getElementById('suplentes-container').appendChild(card);
}

function removeSuplente(id) {
    state.suplentes = state.suplentes.filter(s => s.id !== id);
    document.querySelector(`[data-id="${id}"]`).remove();
}

// Funciones de gestión de cartas poder
function addCartaPoder() {
    const id = createUniqueId();
    state.cartasPoder.push({ id });
    const card = createCartaPoderCard(id);
    document.getElementById('cartas-poder-container').appendChild(card);
    updateCartaPoderSelects();
}

function removeCartaPoder(id) {
    state.cartasPoder = state.cartasPoder.filter(cp => cp.id !== id);
    document.querySelector(`[data-id="${id}"]`).remove();
}

function updateCartaPoderSelects() {
    const titulares = Array.from(document.querySelectorAll('#titulares-container .card'))
        .map(card => ({
            id: card.dataset.id,
            nombre: card.querySelector('input[id^="nombre-"]').value
        }));

    state.cartasPoder.forEach(cp => {
        const card = document.querySelector(`[data-id="${cp.id}"]`);
        const desdeSelect = card.querySelector(`select[id^="desde-"]`);
        const haciaSelect = card.querySelector(`select[id^="hacia-"]`);
        
        const currentDesde = desdeSelect.value;
        const currentHacia = haciaSelect.value;

        desdeSelect.innerHTML = '<option value="">Seleccione un titular</option>';
        haciaSelect.innerHTML = '<option value="">Seleccione un titular</option>';

        titulares.forEach(t => {
            desdeSelect.add(new Option(t.nombre || `Titular ${t.id}`, t.id));
            haciaSelect.add(new Option(t.nombre || `Titular ${t.id}`, t.id));
        });

        desdeSelect.value = currentDesde;
        haciaSelect.value = currentHacia;
    });
}

// Funciones de validación
function validateCartaPoder(id) {
    const card = document.querySelector(`[data-id="${id}"]`);
    const desde = card.querySelector(`select[id^="desde-"]`).value;
    const hacia = card.querySelector(`select[id^="hacia-"]`).value;

    if (desde && hacia && desde === hacia) {
        showError('Un titular no puede delegarse el voto a sí mismo');
        card.querySelector(`select[id^="hacia-"]`).value = '';
        return false;
    }

    const cartasHacia = state.cartasPoder
        .filter(cp => {
            const card = document.querySelector(`[data-id="${cp.id}"]`);
            return card.querySelector(`select[id^="hacia-"]`).value === hacia;
        });

    if (cartasHacia.length > state.maxCartasPoder) {
        showError(`Un titular no puede tener más de ${state.maxCartasPoder} cartas poder`);
        card.querySelector(`select[id^="hacia-"]`).value = '';
        return false;
    }

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

    // Validar cantidad de titulares
    if (state.titulares.length === 0) {
        errors.push('Debe haber al menos un titular');
    }
    if (state.titulares.length > state.maxTitulares) {
        errors.push(`No puede haber más de ${state.maxTitulares} titulares según los votos de la cooperativa`);
    }

    // Validar cantidad de suplentes
    if (state.suplentes.length > state.maxSuplentes) {
        errors.push(`No puede haber más de ${state.maxSuplentes} suplentes`);
    }

    // Validar cartas poder
    const cartasPoderPorTitular = {};
    const titularesConVotoDelegado = new Set();

    state.cartasPoder.forEach(cp => {
        const card = document.querySelector(`[data-id="${cp.id}"]`);
        const desde = card.querySelector(`select[id^="desde-"]`).value;
        const hacia = card.querySelector(`select[id^="hacia-"]`).value;

        if (desde && hacia) {
            if (titularesConVotoDelegado.has(desde)) {
                errors.push(`El titular ${desde} ya delegó su voto`);
            }
            titularesConVotoDelegado.add(desde);

            cartasPoderPorTitular[hacia] = (cartasPoderPorTitular[hacia] || 0) + 1;
            if (cartasPoderPorTitular[hacia] > state.maxCartasPoder) {
                errors.push(`El titular ${hacia} tiene más de ${state.maxCartasPoder} cartas poder`);
            }
        }
    });

    if (errors.length > 0) {
        showErrors(errors);
        return false;
    }

    return true;
}

// Funciones de UI
function showError(message) {
    const errorModal = document.getElementById('error-modal');
    const errorList = document.getElementById('error-list');
    errorList.innerHTML = `<p class="error-message">${message}</p>`;
    errorModal.style.display = 'block';
}

function showErrors(errors) {
    const errorModal = document.getElementById('error-modal');
    const errorList = document.getElementById('error-list');
    errorList.innerHTML = errors.map(error => `<p class="error-message">${error}</p>`).join('');
    errorModal.style.display = 'block';
}

function generateResumen() {
    const resumen = {
        titulares: state.titulares.map(t => {
            const card = document.querySelector(`[data-id="${t.id}"]`);
            return {
                id: t.id,
                nombre: card.querySelector(`input[id^="nombre-"]`).value,
                documento: card.querySelector(`input[id^="documento-"]`).value,
                cooperativa: card.querySelector(`input[id^="cooperativa-"]`).value,
                votosRepresentados: []
            };
        }),
        suplentes: state.suplentes.map(s => {
            const card = document.querySelector(`[data-id="${s.id}"]`);
            return {
                id: s.id,
                nombre: card.querySelector(`input[id^="nombre-sup-"]`).value,
                documento: card.querySelector(`input[id^="documento-sup-"]`).value,
                cooperativa: card.querySelector(`input[id^="cooperativa-sup-"]`).value
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
    if (!validate()) return;

    const resumen = generateResumen();
    const resumenContainer = document.getElementById('resumen-container');
    
    let html = '<h3>Titulares y sus votos:</h3>';
    resumen.titulares.forEach(t => {
        const votosExtra = t.votosRepresentados.length;
        html += `
            <div class="card">
                <p><strong>${t.nombre}</strong> (${t.documento})</p>
                <p>Cooperativa: ${t.cooperativa || 'No especificada'}</p>
                <p>Votos totales: ${1 + votosExtra} (propio + ${votosExtra} delegados)</p>
            </div>
        `;
    });

    if (resumen.suplentes.length > 0) {
        html += '<h3>Suplentes:</h3>';
        resumen.suplentes.forEach(s => {
            html += `
                <div class="card">
                    <p><strong>${s.nombre}</strong> (${s.documento})</p>
                    <p>Cooperativa: ${s.cooperativa || 'No especificada'}</p>
                </div>
            `;
        });
    }

    resumenContainer.innerHTML = html;
}

// Manejo de cambio de cooperativa
function handleCooperativeChange() {
    const select = document.getElementById('cooperative');
    const selectedOption = select.options[select.selectedIndex];
    
    if (selectedOption && selectedOption.value) {
        const selectedCoop = {
            code: selectedOption.value,
            name: selectedOption.textContent.split(' (')[0],
            cuit: selectedOption.dataset.cuit,
            votes: parseInt(selectedOption.dataset.votes)
        };
        
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
        
        // Actualizar límites según los votos de la cooperativa
        state.maxTitulares = parseInt(selectedCoop.votes);
        state.maxSuplentes = parseInt(selectedCoop.votes);
        
        // Agregar el primer titular
        addTitular();
        
        // Actualizar textos informativos
        document.querySelector('#titulares-section h2').textContent = 
            `Titulares (1-${state.maxTitulares})`;
        document.querySelector('#suplentes-section h2').textContent = 
            `Suplentes (0-${state.maxSuplentes})`;
    } else {
        state.cooperativaSeleccionada = null;
        document.getElementById('code').value = '';
        document.getElementById('cuit').value = '';
        document.getElementById('votes').value = '';
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Cargar cooperativas
    loadCooperatives();

    // Eventos de botones principales
    document.getElementById('agregar-titular').addEventListener('click', addTitular);
    document.getElementById('agregar-suplente').addEventListener('click', addSuplente);
    document.getElementById('agregar-carta-poder').addEventListener('click', addCartaPoder);
    document.getElementById('validar').addEventListener('click', validate);
    document.getElementById('guardar').addEventListener('click', updateResumen);

    // Evento de cambio de cooperativa
    document.getElementById('cooperative').addEventListener('change', handleCooperativeChange);

    // Cerrar modal
    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('error-modal').style.display = 'none';
    });

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('error-modal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});
    
    const votesCount = parseInt(formData.get('votes'));
    
    // Recolectar datos de votantes
    for (let i = 0; i < votesCount; i++) {
        data.voters.push({
            name: formData.get(`voter_name_${i}`),
            dni: formData.get(`voter_dni_${i}`)
        });
        
        data.alternates.push({
            name: formData.get(`alternate_name_${i}`),
            dni: formData.get(`alternate_dni_${i}`)
        });
    }
    
    console.log('Datos del formulario:', data);
    // Aquí puedes agregar la lógica para enviar los datos al servidor
    alert('Formulario enviado con éxito');
}

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    const cooperatives = await loadCooperatives();
    const form = document.getElementById('registrationForm');
    const cooperativeSelect = document.getElementById('cooperative');
    
    cooperativeSelect.addEventListener('change', () => handleCooperativeChange(cooperatives));
    form.addEventListener('submit', handleSubmit);
});
