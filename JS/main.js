// ============================================================
// main.js — Único archivo JavaScript del sitio Bienestar Emocional
//
// Cada página tiene una clase en <body> (por ejemplo
// <body class="pg pg-pagos">). Cada sección de este archivo solo se
// ejecuta en su página, comprobándolo con pagina('pagos').
// ============================================================

function pagina(nombre) {
    return document.body.classList.contains('pg-' + nombre);
}

// ============================================================
// COMÚN: menú, página activa y año (todas las páginas)
// ============================================================
// Marcar en el menú la página actual
(function () {
    const paginaActual = decodeURIComponent(location.pathname.split('/').pop()) || 'index.html';
    document.querySelectorAll('.site-nav a').forEach(enlace => {
        if (enlace.getAttribute('href') === paginaActual) {
            enlace.classList.add('active');
        }
    });

    // Cada prueba individual pertenece a la sección "Pruebas"
    if (paginaActual === 'prueba.html' || paginaActual === 'dibujo.html') {
        const pruebas = document.querySelector('.site-nav a[href="pruebas.html"]');
        if (pruebas) pruebas.classList.add('active');
    }
})();

// Botón de menú en celulares
(function () {
    const boton = document.querySelector('.site-menu-btn');
    const nav = document.querySelector('.site-nav');
    if (!boton || !nav) return;

    boton.addEventListener('click', () => {
        const abierto = nav.classList.toggle('open');
        boton.setAttribute('aria-expanded', abierto);
    });
})();

// Año actual en el pie de página
document.querySelectorAll('.site-year').forEach(el => {
    el.textContent = new Date().getFullYear();
});

// Botón flotante de WhatsApp en todas las páginas
(function () {
    if (document.querySelector('.whatsapp-float')) return;
    const enlace = document.createElement('a');
    enlace.href = 'https://wa.me/573004804521';
    enlace.className = 'whatsapp-float';
    enlace.target = '_blank';
    enlace.rel = 'noopener';
    enlace.setAttribute('aria-label', 'Contactar por WhatsApp');
    enlace.innerHTML =
        '<svg class="whatsapp-icon" viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>' +
        '<span class="whatsapp-text">Contactar por WhatsApp</span>';
    document.body.appendChild(enlace);
})();

// Muestra un mensaje de error debajo de un campo (en lugar de alert)
function mostrarAviso(campo, mensaje) {
    if (!campo) return;
    quitarAviso(campo);
    const aviso = document.createElement('span');
    aviso.className = 'aviso-campo';
    aviso.setAttribute('role', 'alert');
    aviso.textContent = mensaje;
    campo.classList.add('campo-error');
    campo.insertAdjacentElement('afterend', aviso);
    campo._aviso = aviso;
}

function quitarAviso(campo) {
    if (!campo) return;
    campo.classList.remove('campo-error');
    if (campo._aviso) {
        campo._aviso.remove();
        campo._aviso = null;
    }
}

// ============================================================
// PERFIL PROFESIONAL: tarjetas desplegables
// ============================================================
if (pagina('perfil')) (function () {
    function toggleCard(id) {
        const card = document.getElementById(id);
        const body = document.getElementById(id + '-body');
        const btn = card.querySelector('.card-trigger');
        const isOpen = card.classList.contains('open');

        // Close all
        document.querySelectorAll('.profile-card').forEach(c => {
            c.classList.remove('open');
            c.querySelector('.card-trigger').setAttribute('aria-expanded', 'false');
            const b = c.querySelector('.card-body');
            b.style.maxHeight = '0';
        });

        // Open clicked (if it wasn't already open)
        if (!isOpen) {
            card.classList.add('open');
            btn.setAttribute('aria-expanded', 'true');
            body.style.maxHeight = body.scrollHeight + 'px';
            // Smooth scroll to card
            setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
        }
    }

    window.toggleCard = toggleCard;
})();


// ============================================================
// AGENDAR CITA
// ============================================================
if (pagina('agendas')) (function () {
    // Variables globales
    const serviceCards = document.querySelectorAll('.service-card');
    const professionalCards = document.querySelectorAll('.professional-card');
    const submitButton = document.getElementById('submitButton');
    const appointmentForm = document.getElementById('appointmentForm');
    const modal = document.getElementById('confirmationModal');
    const dateInput = document.getElementById('date');
    const selectedServices = new Set();
    let selectedProfessional = null;
    let selectedProfessionalPhone = null;

    // Configurar las restricciones de fecha
    function configureDateInput() {
        // Obtener fecha actual
        const today = new Date();

        // Formatear fecha para el atributo min del input (YYYY-MM-DD)
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const minDate = `${year}-${month}-${day}`;

        // Configurar fecha mínima (no permite seleccionar días pasados)
        dateInput.setAttribute('min', minDate);

        // Agregar event listeners para compatibilidad con diferentes dispositivos
        dateInput.addEventListener('input', validateDate);
        dateInput.addEventListener('change', validateDate);
        dateInput.addEventListener('blur', validateDate);

        // Para iOS/Safari que puede tener problemas con el formato de fecha
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            dateInput.setAttribute('pattern', '\\d{4}-\\d{2}-\\d{2}');
            dateInput.setAttribute('placeholder', 'YYYY-MM-DD');
        }
    }

    // Validar la fecha seleccionada
    function validateDate(e) {
        if (!e.target.value) return false;

        try {
            const selectedDateStr = e.target.value;
            const [year, month, day] = selectedDateStr.split('-').map(num => parseInt(num, 10));

            // Crear objeto de fecha (nota: el mes en JavaScript es 0-indexado)
            const selectedDate = new Date(year, month - 1, day);

            // Verificar si la fecha es válida
            if (isNaN(selectedDate.getTime())) {
                mostrarAviso(e.target, 'Por favor introduce una fecha válida.');
                e.target.value = '';
                return false;
            }

            const dayOfWeek = selectedDate.getDay();

            // Si es domingo (0) no se atiende
            if (dayOfWeek === 0) {
                mostrarAviso(e.target, 'Lo sentimos, no hay atención los domingos. Por favor selecciona otro día.');
                e.target.value = '';
                return false;
            }

            // Comparar con la fecha actual (sin tiempo)
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const todayNoTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const selectedDateNoTime = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());

            if (selectedDateNoTime < todayNoTime) {
                mostrarAviso(e.target, 'No se pueden seleccionar fechas pasadas.');
                e.target.value = '';
                return false;
            }

            quitarAviso(e.target);
            return true;
        } catch (error) {
            console.error('Error al validar la fecha:', error);
            return false;
        }
    }

    // Selección de profesionales
    professionalCards.forEach(card => {
        card.setAttribute('tabindex', '0');

        const toggleProfessionalSelection = () => {
            professionalCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedProfessional = card.querySelector('h3').textContent;
            quitarAviso(submitButton);
            selectedProfessionalPhone = card.dataset.phone;
            updateSubmitButtonState();
            updateServicesSummary();
        };

        card.addEventListener('click', toggleProfessionalSelection);
        card.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleProfessionalSelection();
            }
        });
    });

    // Mejorar la experiencia de usuario al seleccionar servicios
    serviceCards.forEach(card => {
        // Agregar evento de teclado para accesibilidad
        card.setAttribute('tabindex', '0');

        // Manejar eventos de click y teclado
        const toggleSelection = () => {
            card.classList.toggle('selected');
            const serviceId = card.dataset.id;

            if (selectedServices.has(serviceId)) {
                selectedServices.delete(serviceId);
            } else {
                selectedServices.add(serviceId);
            }

            // Actualizar estado del botón
            updateSubmitButtonState();
            // Actualizar resumen de servicios
            updateServicesSummary();
        };

        // Añadir eventos para mouse y teclado
        card.addEventListener('click', toggleSelection);
        card.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleSelection();
            }
        });

        // Añadir tooltip para mejorar UX
        card.setAttribute('title', 'Haz clic para seleccionar este servicio');
    });

    // Actualizar estado del botón según la selección
    function updateSubmitButtonState() {
        const isDateSelected = dateInput.value !== '';
        const isTimeSelected = document.getElementById('time').value !== '';
        const isServiceSelected = selectedServices.size > 0;
        const isProfessionalSelected = selectedProfessional !== null;

        submitButton.disabled = !(isDateSelected && isTimeSelected && isServiceSelected && isProfessionalSelected);

        // Cambiar estilo visual según estado
        if (submitButton.disabled) {
            submitButton.classList.add('disabled');
        } else {
            submitButton.classList.remove('disabled');
        }
    }

    // Función para formatear fecha
    function formatDate(dateStr) {
        try {
            const [year, month, day] = dateStr.split('-');
            const date = new Date(year, month - 1, day);

            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Error formateando fecha:', error);
            return dateStr; // Devolver la fecha original en caso de error
        }
    }

    // Función para obtener servicios seleccionados con sus precios
    function getSelectedServicesText() {
        return Array.from(serviceCards)
            .filter(card => card.classList.contains('selected'))
            .map(card => {
                const serviceName = card.querySelector('h3').textContent;
                const price = card.querySelector('.price').textContent;
                return `${serviceName} (${price})`;
            })
            .join('\n• ');
    }

    // Calcular precio total
    function calculateTotalPrice() {
        return Array.from(serviceCards)
            .filter(card => card.classList.contains('selected'))
            .reduce((total, card) => {
                const price = parseInt(card.dataset.price, 10) || 0;
                return total + price;
            }, 0);
    }

    // Función para generar mensaje de WhatsApp
    function generateWhatsAppMessage(formData) {
        const totalPrice = calculateTotalPrice();
        const formattedPrice = new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP'
        }).format(totalPrice);

        return encodeURIComponent(
            `🔵 *Nueva Reserva de Cita*\n\n` +
            `👨‍⚕️ *Profesional:* ${selectedProfessional}\n` +
            `👤 *Nombre:* ${formData.name}\n` +
            `📞 *Teléfono:* ${formData.phone}\n` +
            `📧 *Email:* ${formData.email}\n` +
            `📅 *Fecha:* ${formatDate(formData.date)}\n` +
            `⏰ *Hora:* ${formData.time}\n` +
            `🏥 *Servicios Seleccionados:*\n• ${getSelectedServicesText()}\n` +
            `💰 *Precio Total:* ${formattedPrice}\n` +
            `💭 *Mensaje:* ${formData.message || 'No se incluyó mensaje adicional'}`
        );
    }

    // Función para abrir modal - CAMBIADO A FLEX
    function showModal() {
        modal.style.display = 'flex';

        // Añadir clase para animación de entrada
        setTimeout(() => {
            modal.querySelector('.modal-content').classList.add('show');
        }, 10);
    }

    // Función para cerrar modal
    function closeModal() {
        const modalContent = modal.querySelector('.modal-content');
        modalContent.classList.remove('show');

        // Esperar a que termine la animación antes de ocultar
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    // Añadir validación en tiempo real para los campos del formulario
    function setupFormValidation() {
        const formInputs = appointmentForm.querySelectorAll('input, select');

        formInputs.forEach(input => {
            input.addEventListener('input', updateSubmitButtonState);
            input.addEventListener('change', updateSubmitButtonState);
        });
    }

    // Manejador del envío del formulario
    appointmentForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Validar que se haya seleccionado un profesional
        if (!selectedProfessional || !selectedProfessionalPhone) {
            mostrarAviso(submitButton, 'Por favor selecciona un profesional antes de continuar.');
            return;
        }

        // Validar fecha antes de enviar
        if (!validateDate({ target: dateInput })) {
            return;
        }

        // Recopilar datos del formulario
        const formData = {
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            date: document.getElementById('date').value,
            time: document.getElementById('time').value,
            message: document.getElementById('message').value
        };

        // Generar mensaje y URL de WhatsApp
        const message = generateWhatsAppMessage(formData);
        const whatsappUrl = `https://wa.me/${selectedProfessionalPhone}?text=${message}`;

        // Enviar a WhatsApp
        window.open(whatsappUrl, '_blank');

        // Mostrar modal de confirmación
        showModal();

        // Limpiar formulario
        appointmentForm.reset();
        serviceCards.forEach(card => card.classList.remove('selected'));
        professionalCards.forEach(card => card.classList.remove('selected'));
        selectedServices.clear();
        selectedProfessional = null;
        selectedProfessionalPhone = null;
        updateSubmitButtonState();
        updateServicesSummary();
    });

    // Cerrar modal al hacer clic fuera
    window.onclick = function(event) {
        if (event.target === modal) {
            closeModal();
        }
    }

    // ----- FUNCIONES ADICIONALES -----

    // Función para actualizar el resumen de servicios seleccionados
    function updateServicesSummary() {
        const summaryContainer = document.getElementById('selected-services-summary');
        const selectedCards = Array.from(serviceCards).filter(card => card.classList.contains('selected'));

        if (selectedCards.length > 0 && selectedProfessional) {
            let summaryHTML = '<h3>Resumen de tu cita:</h3>';
            summaryHTML += `<p><strong>Profesional:</strong> ${selectedProfessional}</p>`;
            summaryHTML += '<h4>Servicios seleccionados:</h4><ul>';

            selectedCards.forEach(card => {
                const serviceName = card.querySelector('h3').textContent;
                const price = card.querySelector('.price').textContent;
                const duration = card.dataset.duration || 'N/A';

                summaryHTML += `<li>${serviceName} - ${price} (${duration} min)</li>`;
            });

            summaryHTML += '</ul>';
            summaryContainer.innerHTML = summaryHTML;
            summaryContainer.classList.add('active');

            // Actualizar el precio total
            updateTotalPrice();
        } else {
            summaryContainer.innerHTML = '';
            summaryContainer.classList.remove('active');

            // Resetear el precio total
            document.getElementById('total-price').textContent = 'Total: $0';
        }
    }

    // Función para actualizar el precio total
    function updateTotalPrice() {
        const totalPrice = calculateTotalPrice();
        const formattedPrice = new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(totalPrice);

        document.getElementById('total-price').textContent = `Total: ${formattedPrice}`;
    }

    // Función para comprobar disponibilidad de horarios
    function checkTimeAvailability() {
        const dateInput = document.getElementById('date');
        const timeSelect = document.getElementById('time');

        if (!dateInput.value) return;

        // Aquí podrías hacer una petición al servidor para verificar horarios disponibles
        // Por ahora, simulamos que algunos horarios no están disponibles

        // Ejemplo: los lunes no hay citas disponibles por la mañana
        const [year, month, day] = dateInput.value.split('-').map(Number);
        const dayOfWeek = new Date(year, month - 1, day).getDay();

        // Resetear todas las opciones
        Array.from(timeSelect.options).forEach(option => {
            option.disabled = false;
        });

        // Ejemplo: Si es lunes (1), deshabilitamos los horarios de la mañana
        if (dayOfWeek === 1) {
            Array.from(timeSelect.options).forEach(option => {
                if (option.value && option.value.includes('AM')) {
                    option.disabled = true;
                }
            });

            // Si ya había seleccionado un horario de mañana, lo reseteamos
            if (timeSelect.value && timeSelect.value.includes('AM')) {
                timeSelect.value = '';
            }
        }
    }

    // Función para validar número telefónico
    function validatePhoneNumber() {
        const phoneInput = document.getElementById('phone');
        const phoneNumber = phoneInput.value.trim();

        // Patrón básico para número colombiano (ajustar según necesidades)
        const phonePattern = /^(\+57|57)?[3][0-9]{9}$/;

        if (phoneNumber && !phonePattern.test(phoneNumber)) {
            phoneInput.setCustomValidity('Ingresa un número de teléfono móvil colombiano válido');
        } else {
            phoneInput.setCustomValidity('');
        }
    }

    // Función para formatear el número telefónico mientras se escribe
    function formatPhoneNumber() {
        const phoneInput = document.getElementById('phone');
        let phoneNumber = phoneInput.value.replace(/\D/g, ''); // Eliminar no-dígitos

        // Si el número no empieza con el código de Colombia y tiene suficientes dígitos
        if (!phoneNumber.startsWith('57') && phoneNumber.length >= 10) {
            // Asumimos que es un número móvil colombiano
            phoneNumber = '57' + phoneNumber.slice(-10);
        }

        // Formatear para mejor legibilidad
        if (phoneNumber.length > 2) {
            const formattedNumber = `+${phoneNumber.slice(0, 2)} ${phoneNumber.slice(2)}`;
            phoneInput.value = formattedNumber;
        }
    }

    // Función para mejorar la selección en dispositivos táctiles
    function enhanceTouchExperience() {
        // Detectar si es un dispositivo táctil
        const isTouchDevice = ('ontouchstart' in window) ||
                              (navigator.maxTouchPoints > 0) ||
                              (navigator.msMaxTouchPoints > 0);

        if (isTouchDevice) {
            document.body.classList.add('touch-device');

            // Para dispositivos iOS específicamente
            if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                document.body.classList.add('ios-device');

                // Corregir problemas específicos de iOS con los inputs de fecha
                const dateInputs = document.querySelectorAll('input[type="date"]');
                dateInputs.forEach(input => {
                    input.addEventListener('touchstart', function(e) {
                        this.focus();
                    });
                });
            }
        }
    }

    // Función para guardar datos del formulario en localStorage
    function saveFormData() {
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');

        // Guardar solo si hay valor
        if (nameInput.value) localStorage.setItem('appointment_name', nameInput.value);
        if (emailInput.value) localStorage.setItem('appointment_email', emailInput.value);
        if (phoneInput.value) localStorage.setItem('appointment_phone', phoneInput.value);
    }

    // Función para cargar datos guardados
    function loadSavedFormData() {
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');

        // Cargar datos si existen
        if (localStorage.getItem('appointment_name')) {
            nameInput.value = localStorage.getItem('appointment_name');
        }

        if (localStorage.getItem('appointment_email')) {
            emailInput.value = localStorage.getItem('appointment_email');
        }

        if (localStorage.getItem('appointment_phone')) {
            phoneInput.value = localStorage.getItem('appointment_phone');
        }
    }

    // Inicializar todas las funcionalidades al cargar la página
    document.addEventListener('DOMContentLoaded', () => {
        configureDateInput();
        setupFormValidation();
        updateSubmitButtonState();
        enhanceTouchExperience();
        loadSavedFormData();

        // Comprobar si es un dispositivo móvil para ajustar la UX
        if (/Mobi|Android/i.test(navigator.userAgent)) {
            document.body.classList.add('mobile-device');
        }

        // Añadir nuevos event listeners
        dateInput.addEventListener('change', checkTimeAvailability);

        const phoneInput = document.getElementById('phone');
        phoneInput.addEventListener('input', validatePhoneNumber);
        phoneInput.addEventListener('blur', formatPhoneNumber);

        // Guardar datos cuando se completan
        const formInputs = appointmentForm.querySelectorAll('input');
        formInputs.forEach(input => {
            input.addEventListener('blur', saveFormData);
        });

        // Botón para cerrar modal
        const closeButton = document.querySelector('.close-button');
        if (closeButton) {
            closeButton.addEventListener('click', closeModal);
        }

        // Añadir control de calendario personalizado para iOS si es necesario
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            const datePickerFallback = document.createElement('div');
            datePickerFallback.className = 'date-picker-helper';
            datePickerFallback.innerHTML = 'Toca aquí para seleccionar fecha';
            datePickerFallback.addEventListener('click', function() {
                dateInput.click();
                dateInput.focus();
            });

            // Insertar después del input date
            dateInput.parentNode.insertBefore(datePickerFallback, dateInput.nextSibling);
        }
    });

    window.closeModal = closeModal;
})();


// ============================================================
// ATENCIÓN VIRTUAL: videollamada y chats
// ============================================================
if (pagina('virtual')) (function () {
    // Variables para el manejo de la videollamada
    let localStream;
    let remoteStream;
    let isCallActive = false;
    let isMuted = false;
    let isVideoOff = false;
    let isScreenSharing = false;

    // Iniciar la aplicación cuando el DOM esté cargado
    document.addEventListener('DOMContentLoaded', function() {
        // Inicializar la videollamada
        initVideoCall();

        // Configurar ambos chats
        setupChat('.chat-input input', '.chat-messages', '.chat-input .send-btn', false);
        setupChat('.ai-input input', '.ai-messages', '.ai-input .send-btn', true);

        // Simulación de carga de documentos
        const uploadBtn = document.querySelector('.upload-btn');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', function() {
                openFileSelector();
            });
        }
    });

    // Función para inicializar la videollamada
    async function initVideoCall() {
        // Elementos DOM para la videollamada
        const localVideo = document.getElementById('localVideo');
        const remoteVideo = document.getElementById('remoteVideo');
        const muteBtn = document.getElementById('muteBtn');
        const videoBtn = document.getElementById('videoBtn');
        const endCallBtn = document.getElementById('endCallBtn');
        const screenShareBtn = document.getElementById('screenShareBtn');
        const statusIndicator = document.querySelector('.status-indicator');

        // Verificar si los elementos existen
        if (!localVideo || !remoteVideo) {
            console.error('Elementos de video no encontrados');
            return;
        }

        try {
            // Obtener acceso a la cámara y micrófono del usuario
            localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            // Mostrar el video local
            localVideo.srcObject = localStream;

            // Configurar una conexión "simulada" para demostración
            setupDemoConnection(statusIndicator);

            // Agregar event listeners para los botones de control
            if (muteBtn) muteBtn.addEventListener('click', toggleMute);
            if (videoBtn) videoBtn.addEventListener('click', toggleVideo);
            if (endCallBtn) endCallBtn.addEventListener('click', endCall);
            if (screenShareBtn) screenShareBtn.addEventListener('click', toggleScreenShare);

            console.log('Inicialización de videollamada completada');
            if (statusIndicator) statusIndicator.textContent = 'Listo para llamar';

        } catch (error) {
            console.error('Error al inicializar videollamada:', error);
            if (statusIndicator) {
                statusIndicator.textContent = 'Error: No se pudo acceder a la cámara/micrófono';
            }

            // Mostrar mensaje de error al usuario
            showNotification('No se pudo acceder a la cámara o micrófono. Por favor, verifica los permisos del navegador.', 'error');
        }
    }

    // Configurar una "llamada" de demostración
    function setupDemoConnection(statusIndicator) {
        // Simular una llamada entrante después de unos segundos
        setTimeout(() => {
            if (statusIndicator) statusIndicator.textContent = 'Llamada entrante...';

            // Mostrar notificación de llamada entrante
            showCallNotification('Dr. Jose Gomez', function(accepted) {
                if (accepted) {
                    startCall();
                } else {
                    if (statusIndicator) statusIndicator.textContent = 'Llamada rechazada';
                    setTimeout(() => {
                        if (statusIndicator) statusIndicator.textContent = 'Listo para llamar';
                    }, 3000);
                }
            });
        }, 5000);
    }

    // Iniciar una llamada
    function startCall() {
        const remoteVideo = document.getElementById('remoteVideo');
        const statusIndicator = document.querySelector('.status-indicator');

        // En una implementación real, aquí se configuraría WebRTC
        isCallActive = true;

        if (statusIndicator) statusIndicator.textContent = 'En llamada';
        showNotification('Llamada conectada', 'success');

        // Simular video remoto (en una implementación real sería el flujo del otro participante)
        // Para esta demo, simplemente clonamos nuestro propio stream
        if (localStream && remoteVideo) {
            remoteStream = localStream.clone();
            remoteVideo.srcObject = remoteStream;
        }

        // Iniciar temporizador de llamada
        startCallTimer();

        console.log('Llamada iniciada');
    }

    // Finalizar la llamada
    function endCall() {
        const remoteVideo = document.getElementById('remoteVideo');
        const statusIndicator = document.querySelector('.status-indicator');

        if (!isCallActive) return;

        isCallActive = false;

        if (statusIndicator) statusIndicator.textContent = 'Llamada finalizada';
        showNotification('Llamada finalizada', 'info');

        // Detener temporizador de llamada
        stopCallTimer();

        // Detener video remoto
        if (remoteVideo && remoteVideo.srcObject) {
            const tracks = remoteVideo.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            remoteVideo.srcObject = null;
        }

        console.log('Llamada finalizada');

        // Restaurar estado después de unos segundos
        setTimeout(() => {
            if (statusIndicator) statusIndicator.textContent = 'Listo para llamar';
            setupDemoConnection(statusIndicator);
        }, 5000);
    }

    // Activar/desactivar micrófono
    function toggleMute() {
        const muteBtn = document.getElementById('muteBtn');

        if (!localStream) return;

        isMuted = !isMuted;
        localStream.getAudioTracks().forEach(track => {
            track.enabled = !isMuted;
        });

        if (muteBtn) {
            muteBtn.title = isMuted ? 'Activar micrófono' : 'Silenciar';
            muteBtn.innerHTML = isMuted 
                ? '<svg class="icon" viewBox="0 0 24 24"><path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"></path></svg>' 
                : '<svg class="icon" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"></path><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"></path></svg>';
        }

        showNotification('Micrófono ' + (isMuted ? 'silenciado' : 'activado'), 'info');
        console.log('Micrófono ' + (isMuted ? 'silenciado' : 'activado'));
    }

    // Activar/desactivar video
    function toggleVideo() {
        const videoBtn = document.getElementById('videoBtn');

        if (!localStream) return;

        isVideoOff = !isVideoOff;
        localStream.getVideoTracks().forEach(track => {
            track.enabled = !isVideoOff;
        });

        if (videoBtn) {
            videoBtn.title = isVideoOff ? 'Activar video' : 'Desactivar video';
            videoBtn.innerHTML = isVideoOff 
                ? '<svg class="icon" viewBox="0 0 24 24"><path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z"></path></svg>' 
                : '<svg class="icon" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"></path></svg>';
        }

        showNotification('Cámara ' + (isVideoOff ? 'desactivada' : 'activada'), 'info');
        console.log('Video ' + (isVideoOff ? 'desactivado' : 'activado'));
    }

    // Compartir pantalla
    async function toggleScreenShare() {
        const screenShareBtn = document.getElementById('screenShareBtn');
        const localVideo = document.getElementById('localVideo');

        if (!localVideo) return;

        if (isScreenSharing) {
            // Restaurar cámara
            try {
                localStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
                localVideo.srcObject = localStream;
                isScreenSharing = false;

                if (screenShareBtn) screenShareBtn.title = 'Compartir pantalla';
                showNotification('Compartición de pantalla finalizada', 'info');
                console.log('Pantalla compartida detenida');
            } catch (error) {
                console.error('Error al restaurar cámara:', error);
                showNotification('Error al restaurar cámara', 'error');
            }
        } else {
            // Compartir pantalla
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true
                });

                // Guardar la pista de audio original
                const audioTrack = localStream.getAudioTracks()[0];

                // Detener las pistas de video actuales
                localStream.getVideoTracks().forEach(track => track.stop());

                // Crear un nuevo stream con la pantalla y el audio original
                const newStream = new MediaStream();
                screenStream.getVideoTracks().forEach(track => {
                    newStream.addTrack(track);
                    // Evento para detectar cuando se detiene la compartición de pantalla
                    track.addEventListener('ended', async () => {
                        try {
                            localStream = await navigator.mediaDevices.getUserMedia({
                                video: true,
                                audio: true
                            });
                            localVideo.srcObject = localStream;
                            isScreenSharing = false;

                            if (screenShareBtn) screenShareBtn.title = 'Compartir pantalla';
                            showNotification('Compartición de pantalla finalizada', 'info');
                            console.log('Pantalla compartida detenida');
                        } catch (error) {
                            console.error('Error al restaurar cámara:', error);
                            showNotification('Error al restaurar cámara', 'error');
                        }
                    });
                });

                // Agregar pista de audio si existe
                if (audioTrack) {
                    newStream.addTrack(audioTrack);
                }

                // Asignar el nuevo stream
                localStream = newStream;
                localVideo.srcObject = localStream;

                isScreenSharing = true;
                if (screenShareBtn) screenShareBtn.title = 'Detener compartición';
                showNotification('Compartiendo pantalla', 'success');
                console.log('Compartiendo pantalla');
            } catch (error) {
                console.error('Error al compartir pantalla:', error);
                showNotification('Error al compartir pantalla', 'error');
            }
        }
    }

    // Función para los chats (tanto normal como IA)
    function setupChat(inputSelector, messagesSelector, btnSelector, isAI) {
        const input = document.querySelector(inputSelector);
        const messages = document.querySelector(messagesSelector);
        const sendBtn = document.querySelector(btnSelector);

        if (!input || !messages || !sendBtn) {
            console.error('Elementos de chat no encontrados:', { inputSelector, messagesSelector, btnSelector });
            return;
        }

        sendBtn.addEventListener('click', function() {
            sendChatMessage(input, messages, isAI);
        });

        // Permitir envío con Enter
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatMessage(input, messages, isAI);
            }
        });
    }

    // Función para enviar mensaje de chat
    function sendChatMessage(input, messages, isAI) {
        if (input.value.trim() === '') return;

        // Añadir mensaje del usuario
        const userMsg = document.createElement('div');
        userMsg.className = 'message user';
        userMsg.textContent = input.value;
        messages.appendChild(userMsg);

        // Guardar el mensaje para procesarlo
        const userMessage = input.value.trim();

        // Limpiar input
        input.value = '';

        // Simular respuesta (en un caso real, aquí conectarías con backend/API)
        setTimeout(function() {
            const aiMsg = document.createElement('div');
            aiMsg.className = 'message assistant';

            if (isAI) {
                // Procesamiento inteligente de mensajes para el asistente virtual
                aiMsg.textContent = getAIResponse(userMessage);
            } else {
                aiMsg.textContent = "Tu mensaje ha sido recibido. Un profesional te responderá pronto.";
            }

            messages.appendChild(aiMsg);
            messages.scrollTop = messages.scrollHeight;
        }, 1000);

        messages.scrollTop = messages.scrollHeight;
    }

    // Generar respuestas para el asistente virtual
    function getAIResponse(message) {
        // Convertir el mensaje a minúsculas para facilitar las comparaciones
        const lowerMessage = message.toLowerCase();

        // Palabras clave y sus respuestas
        const keywords = {
            'hola': '¡Hola! ¿En qué puedo ayudarte hoy con tu consulta de bienestar emocional?',
            'saludos': '¡Saludos! Soy tu asistente virtual de Bienestar Emocional. ¿En qué puedo ayudarte?',
            'ayuda': 'Puedo ayudarte con información sobre nuestros servicios, agendar citas o conectarte con un profesional. ¿Qué necesitas?',
            'cita': 'Para agendar una cita, puedes indicarme tu disponibilidad y preferencia de profesional. También puedes usar nuestra sección "Agendar Cita" en el menú principal.',
            'precio': 'Nuestras consultas tienen diferentes precios según el tipo de servicio y profesional. La consulta inicial tiene un costo aproximado de $50-80. ¿Te gustaría más información sobre algún servicio específico?',
            'servicio': 'Ofrecemos servicios de terapia individual, terapia de pareja, terapia familiar, coaching de vida y apoyo en situaciones de crisis. ¿Sobre cuál te gustaría más información?',
            'ansiedad': 'La ansiedad es una respuesta natural del cuerpo ante situaciones de estrés. Nuestros profesionales están capacitados para ayudarte con técnicas de manejo de ansiedad. ¿Te gustaría agendar una consulta?',
            'depresión': 'Entendemos que la depresión puede ser difícil de manejar. Nuestros terapeutas especializados pueden ayudarte con un enfoque personalizado. ¿Necesitas hablar con alguien urgentemente?',
            'estrés': 'El estrés crónico puede afectar tu bienestar físico y mental. Ofrecemos técnicas de manejo del estrés y mindfulness. ¿Te gustaría conocer algunas técnicas básicas?',
            'llamada': 'Puedes iniciar una videollamada con un profesional usando los controles en la sección de videollamada. También ofrecemos consultas telefónicas si prefieres.',
            'gracias': 'Ha sido un placer ayudarte. Estamos aquí para apoyar tu bienestar emocional. ¿Hay algo más en lo que pueda asistirte?',
            'profesionales': 'Contamos con psicólogos, psiquiatras y coaches certificados con amplia experiencia en diferentes áreas. ¿Buscas ayuda en algún tema específico?'
        };

        // Revisar si el mensaje contiene alguna palabra clave
        for (const [key, response] of Object.entries(keywords)) {
            if (lowerMessage.includes(key)) {
                return response;
            }
        }

        // Respuesta por defecto si no se encuentra ninguna palabra clave
        return "Gracias por tu mensaje. Estoy aquí para ayudarte con cualquier consulta sobre bienestar emocional. ¿Podrías darme más detalles sobre lo que necesitas?";
    }

    // Mostrar notificaciones
    function showNotification(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        // Añadir al DOM
        document.body.appendChild(notification);

        // Mostrar con animación
        setTimeout(() => {
            notification.style.right = '20px';
        }, 100);

        // Eliminar después de 3 segundos
        setTimeout(() => {
            notification.style.right = '-300px';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    }

    // Mostrar notificación de llamada entrante
    function showCallNotification(caller, callback) {
        // Crear el modal de notificación
        const modal = document.createElement('div');
        modal.className = 'call-notification';
        modal.innerHTML = `
            <div class="call-notification-content">
                <div class="caller-avatar">
                    <img src="/api/placeholder/80/80" alt="Avatar">
                </div>
                <h3>Llamada entrante</h3>
                <p>${caller}</p>
                <div class="call-actions">
                    <button class="reject-call">Rechazar</button>
                    <button class="accept-call">Aceptar</button>
                </div>
            </div>
        `;

        // Añadir al DOM
        document.body.appendChild(modal);

        // Reproducir sonido de llamada
        const ringtone = new Audio();
        ringtone.src = 'https://cdnjs.cloudflare.com/ajax/libs/sound-effects/1.0.0/ring.mp3';
        ringtone.loop = true;
        ringtone.play().catch(err => console.log('Audio playback prevented: ', err));

        // Manejar clicks en los botones
        modal.querySelector('.accept-call').addEventListener('click', () => {
            ringtone.pause();
            document.body.removeChild(modal);
            callback(true);
        });

        modal.querySelector('.reject-call').addEventListener('click', () => {
            ringtone.pause();
            document.body.removeChild(modal);
            callback(false);
        });
    }

    // Iniciar temporizador de llamada
    let callTimer;
    let callDuration = 0;

    function startCallTimer() {
        const statusIndicator = document.querySelector('.status-indicator');
        if (!statusIndicator) return;

        callDuration = 0;
        callTimer = setInterval(() => {
            callDuration++;
            const minutes = Math.floor(callDuration / 60);
            const seconds = callDuration % 60;
            statusIndicator.textContent = `En llamada: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }, 1000);
    }

    // Detener temporizador de llamada
    function stopCallTimer() {
        clearInterval(callTimer);
    }

    // Simulación de selector de archivos
    function openFileSelector() {
        // Crear un input de tipo file invisible
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.jpg, .jpeg, .png, .pdf, .doc, .docx';
        fileInput.style.display = 'none';

        // Añadir al DOM
        document.body.appendChild(fileInput);

        // Simular click
        fileInput.click();

        // Manejar selección de archivo
        fileInput.addEventListener('change', function() {
            if (fileInput.files.length > 0) {
                const fileName = fileInput.files[0].name;
                showNotification(`Archivo seleccionado: ${fileName}`, 'success');

                // Simular carga del archivo
                setTimeout(() => {
                    // Añadir mensaje al chat
                    const chatMessages = document.querySelector('.chat-messages');
                    if (chatMessages) {
                        const fileMsg = document.createElement('div');
                        fileMsg.className = 'message user';
                        fileMsg.innerHTML = `<div class="file-attachment">📎 ${fileName}</div>`;
                        chatMessages.appendChild(fileMsg);
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    }
                }, 500);
            }

            // Eliminar el input
            document.body.removeChild(fileInput);
        });
    }

    // Agregar estilos CSS necesarios para las nuevas funcionalidades
    const styleElement = document.createElement('style');
    styleElement.textContent = `
    `;

    document.head.appendChild(styleElement);
})();


// ============================================================
// PRUEBAS: lista desplegable
// ============================================================
if (pagina('pruebas')) (function () {
    // Función para desplegar/contraer pruebas
    function togglePruebas(header) {
        const icon = header.querySelector('.toggle-icon');
        const lista = header.nextElementSibling;

        icon.classList.toggle('rotado');
        lista.classList.toggle('abierta');
    }

    window.togglePruebas = togglePruebas;
})();


// ============================================================
// PAGOS: copiar datos de pago
// ============================================================
if (pagina('pagos')) (function () {
    // Copiar al portapapeles el texto de un elemento
    function copiarAlPortapapeles(elementId, descripcion) {
        const texto = document.getElementById(elementId).textContent.trim();

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(texto)
                .then(() => mostrarNotificacion(`${descripcion} copiado: ${texto}`, 'success'))
                .catch(() => copiarConRespaldo(texto, descripcion));
        } else {
            copiarConRespaldo(texto, descripcion);
        }
    }

    // Método alternativo para navegadores antiguos o páginas sin HTTPS
    function copiarConRespaldo(texto, descripcion) {
        const area = document.createElement('textarea');
        area.value = texto;
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();

        try {
            document.execCommand('copy');
            mostrarNotificacion(`${descripcion} copiado: ${texto}`, 'success');
        } catch (error) {
            mostrarNotificacion('No se pudo copiar. Cópialo manualmente.', 'error');
        }

        document.body.removeChild(area);
    }

    // Mostrar notificación temporal
    function mostrarNotificacion(mensaje, tipo = 'info') {
        const anterior = document.querySelector('.notificacion');
        if (anterior) anterior.remove();

        const icono = tipo === 'success' ? 'fa-check-circle' : tipo === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
        const notificacion = document.createElement('div');
        notificacion.className = `notificacion notificacion-${tipo}`;
        notificacion.innerHTML = `<div class="notificacion-content"><i class="fas ${icono}"></i><span></span></div>`;
        notificacion.querySelector('span').textContent = mensaje;
        document.body.appendChild(notificacion);

        setTimeout(() => notificacion.classList.add('mostrar'), 10);
        setTimeout(() => {
            notificacion.classList.remove('mostrar');
            setTimeout(() => notificacion.remove(), 300);
        }, 2500);
    }

    window.copiarAlPortapapeles = copiarAlPortapapeles;
})();


// ============================================================
// PRUEBA PSICOLÓGICA (prueba.html?p=<clave>)
// ============================================================
// Las preguntas de cada prueba están en JS/pruebas-datos.js.
if (pagina('prueba') && !pagina('dibujo')) (function () {
    const clave = new URLSearchParams(location.search).get('p');
    const prueba = (typeof PRUEBAS !== 'undefined' && Object.prototype.hasOwnProperty.call(PRUEBAS, clave))
        ? PRUEBAS[clave] : null;

    if (!prueba) {
        document.getElementById('pruebaTitulo').textContent = 'Prueba no encontrada';
        document.getElementById('pruebaInstrucciones').innerHTML =
            'La prueba que buscas no existe. <a href="pruebas.html">Ver todas las pruebas</a>.';
        document.querySelectorAll('.aviso-prueba, .patient-info-section, .progress-section, .result-section')
            .forEach(el => el.hidden = true);
        return;
    }

    const preguntas = prueba.preguntas;
    const respuestas = {};   // índice de pregunta → índice de opción elegida
    const sufijo = prueba.sufijo || '';

    // Encabezado de la página
    document.title = `${prueba.titulo} | Bienestar Emocional`;
    document.getElementById('pruebaCategoria').textContent =
        prueba.categoria + (prueba.tipo === 'validada' ? ' · Prueba validada' : ' · Cuestionario de orientación');
    document.getElementById('pruebaTitulo').textContent = prueba.titulo;
    document.getElementById('pruebaInstrucciones').textContent = prueba.instrucciones;
    document.getElementById('totalPreguntas').textContent = preguntas.length;
    document.getElementById('avisoPropia').hidden = prueba.tipo !== 'propia';
    document.getElementById('pruebaFuente').textContent = prueba.tipo === 'validada'
        ? 'Fuente: ' + prueba.fuente
        : 'Cuestionario de orientación elaborado por Bienestar Emocional. No es un instrumento validado científicamente.';

    function opcionesDe(pregunta) {
        return pregunta.opciones || prueba.opciones;
    }

    // Puntaje de una respuesta (las preguntas invertidas se puntúan al revés)
    function puntajeDe(i) {
        const opciones = opcionesDe(preguntas[i]);
        const valor = opciones[respuestas[i]].valor;
        if (!preguntas[i].invertida) return valor;
        const valores = opciones.map(o => o.valor);
        return Math.max(...valores) + Math.min(...valores) - valor;
    }

    function calcularTotal() {
        let total = 0;
        Object.keys(respuestas).forEach(i => { total += puntajeDe(Number(i)); });
        return prueba.puntuar ? prueba.puntuar(total) : total;
    }

    function interpretar(total) {
        const rango = prueba.rangos.find(r => total <= r.hasta) || prueba.rangos[prueba.rangos.length - 1];
        return rango.texto;
    }

    function necesitaAyuda(total) {
        return prueba.umbralMenor ? total <= prueba.umbral : total >= prueba.umbral;
    }

    function hayRiesgo() {
        const alerta = prueba.alertaCrisis;
        if (!alerta || respuestas[alerta.pregunta] === undefined) return false;
        return puntajeDe(alerta.pregunta) >= alerta.desde;
    }

    // Dibujar las preguntas
    function dibujarPreguntas() {
        const contenedor = document.getElementById('questionsContainer');
        contenedor.innerHTML = '';

        preguntas.forEach((pregunta, i) => {
            const bloque = document.createElement('div');
            bloque.className = 'question-item';

            const titulo = document.createElement('h3');
            titulo.textContent = `${i + 1}. ${pregunta.texto}`;

            const opcionesDiv = document.createElement('div');
            opcionesDiv.className = 'options';
            opcionesDiv.setAttribute('role', 'radiogroup');

            opcionesDe(pregunta).forEach((opcion, j) => {
                const elegida = respuestas[i] === j;
                const boton = document.createElement('button');
                boton.type = 'button';
                boton.className = 'option-button' + (elegida ? ' selected' : '');
                boton.setAttribute('role', 'radio');
                boton.setAttribute('aria-checked', elegida);
                boton.innerHTML = `
                    <div class="checkbox">${elegida ? '<div class="checkmark"></div>' : ''}</div>
                    <span class="option-text"></span>`;
                boton.querySelector('.option-text').textContent = opcion.texto;

                boton.addEventListener('click', () => {
                    respuestas[i] = j;
                    dibujarPreguntas();
                    actualizar();
                });
                opcionesDiv.appendChild(boton);
            });

            bloque.appendChild(titulo);
            bloque.appendChild(opcionesDiv);
            contenedor.appendChild(bloque);
        });
    }

    // Actualizar progreso, resultado y botón de envío
    function actualizar() {
        const respondidas = Object.keys(respuestas).length;
        const completa = respondidas === preguntas.length;

        document.getElementById('answered').textContent = respondidas;
        document.getElementById('progressFill').style.width = (respondidas / preguntas.length * 100) + '%';

        const total = calcularTotal();
        document.getElementById('totalScore').textContent = completa ? total + sufijo : '–';
        document.getElementById('interpretation').textContent =
            completa ? interpretar(total) : 'Completa todas las preguntas para ver tu resultado';
        document.getElementById('warningText').hidden = !(completa && necesitaAyuda(total));
        document.getElementById('alertaCrisis').hidden = !hayRiesgo();

        const nombre = document.getElementById('nombre').value.trim();
        const identificacion = document.getElementById('identificacion').value.trim();
        const acepta = document.getElementById('consentimiento').checked;
        const boton = document.getElementById('sendBtn');
        const mensaje = document.getElementById('sendMessage');

        if (completa && nombre && identificacion && acepta) {
            boton.disabled = false;
            mensaje.textContent = '✓ Listo para enviar';
            mensaje.style.color = '#25d366';
        } else {
            boton.disabled = true;
            mensaje.style.color = '#999';
            if (!completa) mensaje.textContent = 'Completa todas las preguntas';
            else if (!nombre || !identificacion) mensaje.textContent = 'Completa tu nombre e identificación';
            else mensaje.textContent = 'Marca la autorización de tratamiento de datos';
        }
    }

    // Enviar resultado por WhatsApp
    function enviarWhatsApp() {
        const nombre = document.getElementById('nombre').value.trim();
        const identificacion = document.getElementById('identificacion').value.trim();
        const total = calcularTotal();

        let detalle = '';
        preguntas.forEach((pregunta, i) => {
            detalle += `\n${i + 1}. ${opcionesDe(pregunta)[respuestas[i]].texto} (${puntajeDe(i)})`;
        });

        const texto =
            `*RESULTADO: ${prueba.titulo.toUpperCase()}*\n\n` +
            `*Datos del paciente:*\nNombre: ${nombre}\nIdentificación: ${identificacion}\n\n` +
            `*Puntuación total: ${total}${sufijo}*\n` +
            `*Interpretación:* ${interpretar(total)}\n` +
            (hayRiesgo() ? '\n⚠️ *ATENCIÓN: el paciente marcó pensamientos de hacerse daño.*\n' : '') +
            `\n*Respuestas:*${detalle}`;

        window.open(`https://wa.me/573004804521?text=${encodeURIComponent(texto)}`, '_blank');
    }

    ['nombre', 'identificacion'].forEach(id => {
        document.getElementById(id).addEventListener('input', actualizar);
    });
    document.getElementById('consentimiento').addEventListener('change', actualizar);
    document.getElementById('sendBtn').addEventListener('click', enviarWhatsApp);

    dibujarPreguntas();
    actualizar();
})();


// ============================================================
// PRUEBAS PROYECTIVAS DE DIBUJO (dibujo.html?p=<clave>)
// ============================================================
// Cada dibujo se puede hacer en papel (subiendo una foto) o en la
// pantalla. No hay calificación automática: se envía al profesional.
if (pagina('dibujo')) (function () {
    const clave = new URLSearchParams(location.search).get('p');
    const prueba = (typeof DIBUJOS !== 'undefined' && Object.prototype.hasOwnProperty.call(DIBUJOS, clave))
        ? DIBUJOS[clave] : null;

    if (!prueba) {
        document.getElementById('dibujoTitulo').textContent = 'Prueba no encontrada';
        document.getElementById('dibujoIntro').innerHTML =
            'La prueba que buscas no existe. <a href="pruebas.html">Ver todas las pruebas</a>.';
        document.querySelectorAll('.aviso-prueba, .patient-info-section, .materiales, .preguntas-dibujo, .result-section')
            .forEach(el => el.hidden = true);
        return;
    }

    document.title = `${prueba.titulo} | Bienestar Emocional`;
    document.getElementById('dibujoCategoria').textContent = prueba.categoria;
    document.getElementById('dibujoTitulo').textContent = prueba.titulo;
    document.getElementById('dibujoIntro').textContent = prueba.introduccion;
    document.getElementById('dibujoReferencia').textContent = prueba.referencia;

    const listaMateriales = document.getElementById('listaMateriales');
    prueba.materiales.forEach(texto => {
        const li = document.createElement('li');
        li.textContent = texto;
        listaMateriales.appendChild(li);
    });

    // ---------- Un bloque por cada dibujo ----------
    const bloques = prueba.dibujos.map((dibujo, n) => crearBloqueDibujo(dibujo, n));

    function crearBloqueDibujo(dibujo, n) {
        const estado = {
            modo: 'foto',          // 'foto' o 'pantalla'
            foto: null,            // archivo subido
            trazos: [],            // dibujo en pantalla: lista de trazos
            borrados: 0,
            inicio: null,
            fin: null
        };

        const bloque = document.createElement('div');
        bloque.className = 'bloque-dibujo';
        bloque.innerHTML = `
            <h3></h3>
            <p class="consigna"></p>
            <div class="modo-dibujo" role="tablist">
                <button type="button" class="modo-btn activo" data-modo="foto">📷 Subir foto del dibujo</button>
                <button type="button" class="modo-btn" data-modo="pantalla">✏️ Dibujar en pantalla</button>
            </div>
            <div class="panel-foto">
                <label class="subir-foto">
                    <input type="file" accept="image/*">
                    <span>Toca aquí para tomar o elegir la foto de tu dibujo</span>
                </label>
                <img class="vista-previa" alt="" hidden>
            </div>
            <div class="panel-pantalla" hidden>
                <div class="herramientas">
                    <button type="button" class="herr activo" data-herr="lapiz">✏️ Lápiz</button>
                    <button type="button" class="herr" data-herr="borrador">🧽 Borrador</button>
                    <button type="button" class="herr" data-accion="deshacer">↩️ Deshacer</button>
                    <button type="button" class="herr" data-accion="limpiar">🗑️ Empezar de nuevo</button>
                </div>
                <canvas class="lienzo"></canvas>
            </div>`;
        bloque.querySelector('h3').textContent = dibujo.titulo;
        bloque.querySelector('.consigna').textContent = dibujo.consigna;
        document.getElementById('contenedorDibujos').appendChild(bloque);

        // Cambiar entre foto y pantalla
        bloque.querySelectorAll('.modo-btn').forEach(boton => {
            boton.addEventListener('click', () => {
                estado.modo = boton.dataset.modo;
                bloque.querySelectorAll('.modo-btn').forEach(b => b.classList.toggle('activo', b === boton));
                bloque.querySelector('.panel-foto').hidden = estado.modo !== 'foto';
                bloque.querySelector('.panel-pantalla').hidden = estado.modo !== 'pantalla';
                if (estado.modo === 'pantalla') ajustarLienzo();
                actualizar();
            });
        });

        // Subir foto
        const entrada = bloque.querySelector('input[type="file"]');
        const vista = bloque.querySelector('.vista-previa');
        entrada.addEventListener('change', () => {
            const archivo = entrada.files[0];
            if (!archivo || !archivo.type.startsWith('image/')) return;
            estado.foto = archivo;
            if (vista.src) URL.revokeObjectURL(vista.src);
            vista.src = URL.createObjectURL(archivo);
            vista.alt = 'Vista previa de ' + dibujo.titulo;
            vista.hidden = false;
            actualizar();
        });

        // Dibujar en pantalla (proporción de hoja carta vertical)
        const lienzo = bloque.querySelector('.lienzo');
        const ctx = lienzo.getContext('2d');
        let herramienta = 'lapiz';
        let trazoActual = null;

        function ajustarLienzo() {
            const ancho = lienzo.clientWidth;
            if (!ancho) return;
            const escala = window.devicePixelRatio || 1;
            lienzo.width = ancho * escala;
            lienzo.height = ancho * 1.294 * escala;
            lienzo.style.height = (ancho * 1.294) + 'px';
            redibujar();
        }

        // Los puntos se guardan en proporción (0 a 1) para que el dibujo
        // no se deforme si cambia el tamaño de la pantalla.
        function redibujar(destino = ctx, ancho = lienzo.width, alto = lienzo.height) {
            destino.fillStyle = '#ffffff';
            destino.fillRect(0, 0, ancho, alto);
            destino.lineCap = 'round';
            destino.lineJoin = 'round';
            estado.trazos.forEach(trazo => {
                destino.strokeStyle = trazo.borrador ? '#ffffff' : '#222222';
                destino.lineWidth = (trazo.borrador ? 0.03 : 0.004) * ancho;
                destino.beginPath();
                trazo.puntos.forEach(([x, y], i) => {
                    if (i === 0) destino.moveTo(x * ancho, y * alto);
                    else destino.lineTo(x * ancho, y * alto);
                });
                if (trazo.puntos.length === 1) {
                    const [x, y] = trazo.puntos[0];
                    destino.lineTo(x * ancho + 0.1, y * alto + 0.1);
                }
                destino.stroke();
            });
        }

        function punto(e) {
            const r = lienzo.getBoundingClientRect();
            return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
        }

        lienzo.addEventListener('pointerdown', e => {
            e.preventDefault();
            lienzo.setPointerCapture(e.pointerId);
            trazoActual = { borrador: herramienta === 'borrador', puntos: [punto(e)] };
            estado.trazos.push(trazoActual);
            if (trazoActual.borrador) estado.borrados++;
            if (!estado.inicio) estado.inicio = Date.now();
            redibujar();
        });
        lienzo.addEventListener('pointermove', e => {
            if (!trazoActual) return;
            trazoActual.puntos.push(punto(e));
            redibujar();
        });
        ['pointerup', 'pointercancel'].forEach(evento => lienzo.addEventListener(evento, () => {
            if (!trazoActual) return;
            trazoActual = null;
            estado.fin = Date.now();
            actualizar();
        }));

        bloque.querySelectorAll('.herr').forEach(boton => {
            boton.addEventListener('click', () => {
                if (boton.dataset.herr) {
                    herramienta = boton.dataset.herr;
                    bloque.querySelectorAll('[data-herr]').forEach(b => b.classList.toggle('activo', b === boton));
                } else if (boton.dataset.accion === 'deshacer') {
                    if (estado.trazos.pop()) estado.borrados++;
                    redibujar();
                    actualizar();
                } else if (boton.dataset.accion === 'limpiar') {
                    if (estado.trazos.length && !confirm('¿Borrar todo el dibujo y empezar de nuevo?')) return;
                    estado.trazos = [];
                    estado.inicio = estado.fin = null;
                    estado.borrados = 0;
                    redibujar();
                    actualizar();
                }
            });
        });

        window.addEventListener('resize', () => {
            if (estado.modo === 'pantalla') ajustarLienzo();
        });

        return {
            dibujo,
            estado,
            listo() {
                return estado.modo === 'foto' ? !!estado.foto : estado.trazos.some(t => !t.borrador);
            },
            // Devuelve el dibujo como archivo de imagen
            archivo(nombreBase) {
                if (estado.modo === 'foto') return Promise.resolve(estado.foto);
                const salida = document.createElement('canvas');
                salida.width = 1275;   // hoja carta a 150 ppp
                salida.height = 1650;
                redibujar(salida.getContext('2d'), salida.width, salida.height);
                return new Promise(resolver => salida.toBlob(blob =>
                    resolver(new File([blob], nombreBase + '.png', { type: 'image/png' })), 'image/png'));
            },
            resumen() {
                if (estado.modo === 'foto') return 'Dibujado en papel (foto adjunta)';
                const minutos = estado.inicio && estado.fin ? Math.max(1, Math.round((estado.fin - estado.inicio) / 60000)) : '?';
                return `Dibujado en pantalla · Tiempo aprox.: ${minutos} min · Borrados/correcciones: ${estado.borrados}`;
            }
        };
    }

    // ---------- Preguntas después del dibujo ----------
    const contenedorPreguntas = document.getElementById('contenedorPreguntas');
    const campos = prueba.preguntas.map((texto, i) => {
        const grupo = document.createElement('div');
        grupo.className = 'form-group';
        const etiqueta = document.createElement('label');
        etiqueta.htmlFor = 'pregunta' + i;
        etiqueta.textContent = `${i + 1}. ${texto}`;
        const area = document.createElement('textarea');
        area.id = 'pregunta' + i;
        area.rows = 2;
        grupo.appendChild(etiqueta);
        grupo.appendChild(area);
        contenedorPreguntas.appendChild(grupo);
        return area;
    });

    // ---------- Validación y envío ----------
    const edad = document.getElementById('edad');
    const grupoAcudiente = document.getElementById('grupoAcudiente');

    function esMenor() {
        const valor = parseInt(edad.value, 10);
        return !isNaN(valor) && valor < 18;
    }

    function actualizar() {
        grupoAcudiente.hidden = !esMenor();

        const nombre = document.getElementById('nombre').value.trim();
        const identificacion = document.getElementById('identificacion').value.trim();
        const acudiente = document.getElementById('acudiente').value.trim();
        const acepta = document.getElementById('consentimiento').checked;
        const dibujosListos = bloques.every(b => b.listo());
        const boton = document.getElementById('sendBtn');
        const mensaje = document.getElementById('sendMessage');

        let falta = '';
        if (!nombre || !identificacion || !edad.value) falta = 'Completa tu nombre, identificación y edad';
        else if (esMenor() && !acudiente) falta = 'Escribe el nombre del padre, madre o acudiente';
        else if (!dibujosListos) falta = bloques.length > 1 ? 'Sube o haz todos los dibujos' : 'Sube o haz el dibujo';
        else if (!acepta) falta = 'Marca la autorización de tratamiento de datos';

        boton.disabled = !!falta;
        mensaje.textContent = falta || '✓ Listo para enviar';
        mensaje.style.color = falta ? '#999' : '#25d366';
    }

    function textoResultado() {
        let texto =
            `*${prueba.titulo.toUpperCase()}*\n\n` +
            `*Datos del paciente:*\n` +
            `Nombre: ${document.getElementById('nombre').value.trim()}\n` +
            `Identificación: ${document.getElementById('identificacion').value.trim()}\n` +
            `Edad: ${edad.value}\n`;
        if (esMenor()) texto += `Acudiente: ${document.getElementById('acudiente').value.trim()}\n`;

        texto += '\n*Dibujos:*';
        bloques.forEach(b => { texto += `\n${b.dibujo.titulo}: ${b.resumen()}`; });

        texto += '\n\n*Respuestas:*';
        prueba.preguntas.forEach((pregunta, i) => {
            texto += `\n${i + 1}. ${pregunta}\n→ ${campos[i].value.trim() || '(sin respuesta)'}`;
        });
        return texto;
    }

    async function enviar() {
        const boton = document.getElementById('sendBtn');
        const nota = document.getElementById('notaEnvio');
        boton.disabled = true;

        const base = document.getElementById('nombre').value.trim().replace(/[^\wáéíóúñÁÉÍÓÚÑ]+/g, '_') || 'paciente';
        const archivos = await Promise.all(bloques.map((b, i) => b.archivo(`${base}_${clave}_${i + 1}`)));
        const texto = textoResultado();

        // En celulares: compartir directamente dibujos y texto (se elige WhatsApp)
        if (navigator.canShare && navigator.canShare({ files: archivos })) {
            try {
                await navigator.share({ title: prueba.titulo, text: texto, files: archivos });
                nota.hidden = false;
                nota.textContent = '✓ Enviado. Si WhatsApp no incluyó el texto, pulsa de nuevo el botón para enviarlo.';
                actualizar();
                return;
            } catch (error) {
                if (error.name === 'AbortError') { actualizar(); return; }
                // Si falla, se usa el método alternativo
            }
        }

        // En computador: descargar los dibujos y abrir WhatsApp con el texto
        archivos.forEach(archivo => {
            const enlace = document.createElement('a');
            enlace.href = URL.createObjectURL(archivo);
            enlace.download = archivo.name.includes('.') ? archivo.name : archivo.name + '.png';
            document.body.appendChild(enlace);
            enlace.click();
            enlace.remove();
            setTimeout(() => URL.revokeObjectURL(enlace.href), 10000);
        });
        nota.hidden = false;
        nota.textContent = `Se descargaron tus dibujos (${archivos.length}). En la conversación de WhatsApp que se abrió, ` +
            'adjunta las imágenes descargadas con el clip 📎 antes o después de enviar el mensaje.';
        window.open(`https://wa.me/573004804521?text=${encodeURIComponent(texto)}`, '_blank');
        actualizar();
    }

    ['nombre', 'identificacion', 'edad', 'acudiente'].forEach(id =>
        document.getElementById(id).addEventListener('input', actualizar));
    document.getElementById('consentimiento').addEventListener('change', actualizar);
    document.getElementById('sendBtn').addEventListener('click', enviar);

    actualizar();
})();
