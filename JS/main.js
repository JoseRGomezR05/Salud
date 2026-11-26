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

    // Las pruebas de Beck pertenecen a la sección "Pruebas"
    if (paginaActual === 'beck.html' || paginaActual === 'Ansiedadbeck.html') {
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
                alert('Por favor introduce una fecha válida.');
                e.target.value = '';
                return false;
            }

            const dayOfWeek = selectedDate.getDay();

            // Si es domingo (0) no se atiende
            if (dayOfWeek === 0) {
                alert('Lo sentimos, no hay atención los domingos. Por favor seleccione otro día.');
                e.target.value = '';
                return false;
            }

            // Comparar con la fecha actual (sin tiempo)
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const todayNoTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const selectedDateNoTime = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());

            if (selectedDateNoTime < todayNoTime) {
                alert('No se pueden seleccionar fechas pasadas.');
                e.target.value = '';
                return false;
            }

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
            alert('Por favor selecciona un profesional antes de continuar.');
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
// PRUEBAS DE BECK: preguntas
// ============================================================
const preguntasDepresion = [
    {
        id: 1,
        text: "Estado de ánimo",
        options: [
            { value: 0, text: "No me siento triste" },
            { value: 1, text: "Me siento triste." },
            { value: 2, text: "Me siento triste continuamente y no puedo dejar de estarlo." },
            { value: 3, text: "Me siento tan triste o tan desgraciado que no puedo soportarlo." }
        ]
    },
    {
        id: 2,
        text: "Perspectiva del futuro",
        options: [
            { value: 0, text: "No me siento especialmente desanimado respecto al futuro." },
            { value: 1, text: "Me siento desanimado respecto al futuro." },
            { value: 2, text: "Siento que no tengo que esperar nada." },
            { value: 3, text: "Siento que el futuro es desesperanzador y las cosas no mejorarán." }
        ]
    },
    {
        id: 3,
        text: "Sentimiento de fracaso",
        options: [
            { value: 0, text: "No me siento fracasado." },
            { value: 1, text: "Creo que he fracasado más que la mayoría de las personas." },
            { value: 2, text: "Cuando miro hacia atrás, sólo veo fracaso tras fracaso." },
            { value: 3, text: "Me siento una persona totalmente fracasada." }
        ]
    },
    {
        id: 4,
        text: "Satisfacción",
        options: [
            { value: 0, text: "Las cosas me satisfacen tanto como antes." },
            { value: 1, text: "No disfruto de las cosas tanto como antes." },
            { value: 2, text: "Ya no obtengo una satisfacción auténtica de las cosas." },
            { value: 3, text: "Estoy insatisfecho o aburrido de todo." }
        ]
    },
    {
        id: 5,
        text: "Culpa",
        options: [
            { value: 0, text: "No me siento especialmente culpable." },
            { value: 1, text: "Me siento culpable en bastantes ocasiones." },
            { value: 2, text: "Me siento culpable en la mayoría de las ocasiones." },
            { value: 3, text: "Me siento culpable constantemente." }
        ]
    },
    {
        id: 6,
        text: "Castigo",
        options: [
            { value: 0, text: "No creo que esté siendo castigado." },
            { value: 1, text: "Me siento como si fuese a ser castigado." },
            { value: 2, text: "Espero ser castigado." },
            { value: 3, text: "Siento que estoy siendo castigado." }
        ]
    },
    {
        id: 7,
        text: "Decepción de sí mismo",
        options: [
            { value: 0, text: "No estoy decepcionado de mí mismo." },
            { value: 1, text: "Estoy decepcionado de mí mismo." },
            { value: 2, text: "Me da vergüenza de mí mismo." },
            { value: 3, text: "Me detesto." }
        ]
    },
    {
        id: 8,
        text: "Autocrítica",
        options: [
            { value: 0, text: "No me considero peor que cualquier otro." },
            { value: 1, text: "Me autocritico por mis debilidades o por mis errores." },
            { value: 2, text: "Continuamente me culpo por mis faltas." },
            { value: 3, text: "Me culpo por todo lo malo que sucede." }
        ]
    },
    {
        id: 9,
        text: "Pensamientos suicidas",
        options: [
            { value: 0, text: "No tengo ningún pensamiento de suicidio." },
            { value: 1, text: "A veces pienso en suicidarme, pero no lo cometería." },
            { value: 2, text: "Desearía suicidarme." },
            { value: 3, text: "Me suicidaría si tuviese la oportunidad." }
        ]
    },
    {
        id: 10,
        text: "Llanto",
        options: [
            { value: 0, text: "No lloro más de lo que solía llorar." },
            { value: 1, text: "Ahora lloro más que antes." },
            { value: 2, text: "Lloro continuamente." },
            { value: 3, text: "Antes era capaz de llorar, pero ahora no puedo, incluso aunque quiera." }
        ]
    },
    {
        id: 11,
        text: "Irritabilidad",
        options: [
            { value: 0, text: "No estoy más irritado de lo normal en mí." },
            { value: 1, text: "Me molesto o irrito más fácilmente que antes." },
            { value: 2, text: "Me siento irritado continuamente." },
            { value: 3, text: "No me irrito absolutamente nada por las cosas que antes solían irritarme." }
        ]
    },
    {
        id: 12,
        text: "Interés por los demás",
        options: [
            { value: 0, text: "No he perdido el interés por los demás." },
            { value: 1, text: "Estoy menos interesado en los demás que antes." },
            { value: 2, text: "He perdido la mayor parte de mi interés por los demás." },
            { value: 3, text: "He perdido todo el interés por los demás." }
        ]
    },
    {
        id: 13,
        text: "Toma de decisiones",
        options: [
            { value: 0, text: "Tomo decisiones más o menos como siempre he hecho." },
            { value: 1, text: "Evito tomar decisiones más que antes." },
            { value: 2, text: "Tomar decisiones me resulta mucho más difícil que antes." },
            { value: 3, text: "Ya me es imposible tomar decisiones." }
        ]
    },
    {
        id: 14,
        text: "Autoimagen",
        options: [
            { value: 0, text: "No creo tener peor aspecto que antes." },
            { value: 1, text: "Me temo que ahora parezco más viejo o poco atractivo." },
            { value: 2, text: "Creo que se han producido cambios permanentes en mi aspecto que me hacen parecer poco atractivo." },
            { value: 3, text: "Creo que tengo un aspecto horrible." }
        ]
    },
    {
        id: 15,
        text: "Capacidad de trabajo",
        options: [
            { value: 0, text: "Trabajo igual que antes." },
            { value: 1, text: "Me cuesta un esfuerzo extra comenzar a hacer algo." },
            { value: 2, text: "Tengo que obligarme mucho para hacer algo." },
            { value: 3, text: "No puedo hacer nada en absoluto." }
        ]
    },
    {
        id: 16,
        text: "Sueño",
        options: [
            { value: 0, text: "Duermo tan bien como siempre." },
            { value: 1, text: "No duermo tan bien como antes." },
            { value: 2, text: "Me despierto una o dos horas antes de lo habitual y me resulta difícil volver a dormir." },
            { value: 3, text: "Me despierto varias horas antes de lo habitual y no puedo volverme a dormir." }
        ]
    },
    {
        id: 17,
        text: "Fatiga",
        options: [
            { value: 0, text: "No me siento más cansado de lo normal." },
            { value: 1, text: "Me canso más fácilmente que antes." },
            { value: 2, text: "Me canso en cuanto hago cualquier cosa." },
            { value: 3, text: "Estoy demasiado cansado para hacer nada." }
        ]
    },
    {
        id: 18,
        text: "Apetito",
        options: [
            { value: 0, text: "Mi apetito no ha disminuido." },
            { value: 1, text: "No tengo tan buen apetito como antes." },
            { value: 2, text: "Ahora tengo mucho menos apetito." },
            { value: 3, text: "He perdido completamente el apetito." }
        ]
    },
    {
        id: 19,
        text: "Pérdida de peso",
        options: [
            { value: 0, text: "Últimamente he perdido poco peso o no he perdido nada" },
            { value: 1, text: "He perdido más de 2 kilos y medio" },
            { value: 2, text: "He perdido más de 4 kilos" },
            { value: 3, text: "He perdido más de 7 kilos" }
        ]
    },
    {
        id: 20,
        text: "Preocupación somática",
        options: [
            { value: 0, text: "No estoy preocupado por mi salud más de lo normal." },
            { value: 1, text: "Estoy preocupado por problemas físicos como dolores, molestias, malestar de estómago o estreñimiento." },
            { value: 2, text: "Estoy preocupado por mis problemas físicos y me resulta difícil pensar algo más." },
            { value: 3, text: "Estoy tan preocupado por mis problemas físicos que soy incapaz de pensar en cualquier cosa." }
        ]
    },
    {
        id: 21,
        text: "Interés sexual",
        options: [
            { value: 0, text: "No he observado ningún cambio reciente en mi interés." },
            { value: 1, text: "Estoy menos interesado por el sexo que antes." },
            { value: 2, text: "Estoy mucho menos interesado por el sexo." },
            { value: 3, text: "He perdido totalmente mi interés por el sexo." }
        ]
    }
];

const preguntasAnsiedad = [
    {
        id: 1,
        text: "Torpe o entumecido",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    },
    {
        id: 2,
        text: "Acalorad@",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    },
    {
        id: 3,
        text: "Con tembor en las piernas",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    },
    {
        id: 4,
        text: "Incapaz de relajarse",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    },
    {
        id: 5,
        text: "Con temor a que ocurra lo peor",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    },
    {
        id: 6,
        text: "Maread@, o que se le va la cabeza",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    },
    {
        id: 7,
        text: "Con latidos del corazón fuertes y acelerados",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    },
    {
        id: 8,
        text: "Inestable",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    },
    {
        id: 9,
        text: "Atemorizad@ o asustad@",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    },
    {
        id: 10,
        text: "Nervioso",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    },
    {
        id: 11,
        text: "Con sensación de bloqueo",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    },
    {
        id: 12,
        text: "Con temblores en las manos",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    },
    {
        id: 13,
        text: "Inquieto, inseguro",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    },
    {
        id: 14,
        text: "Con miedo a perder el control",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    },
    {
        id: 15,
        text: "Con sensación de ahogo",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    },
    {
        id: 16,
        text: "Con temor a morir",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    },
    {
        id: 17,
        text: "Con miedo",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    },
    {
        id: 18,
        text: "Con problemas digestivos",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    },
    {
        id: 19,
        text: "Con desvanecimientos",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    },
    {
        id: 20,
        text: "Con rubor facial",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    },
    {
        id: 21,
        text: "Con sudores, fríos o calientes",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    }
];

// ============================================================
// PRUEBAS DE BECK: funcionamiento (depresión y ansiedad)
// ============================================================
// Motor común de los inventarios de Beck (depresión y ansiedad).
// Cada página indica qué prueba es con <body data-test="depresion"> o "ansiedad".
function iniciarTestBeck(config) {
    const questions = config.preguntas;
    let responses = {};

    // Renderizar preguntas
    function renderQuestions() {
        const container = document.getElementById('questionsContainer');
        container.innerHTML = '';

        questions.forEach(question => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question-item';

            const titleH3 = document.createElement('h3');
            titleH3.textContent = `${question.id}. ${question.text}`;

            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'options';

            question.options.forEach(option => {
                const button = document.createElement('button');
                button.className = 'option-button';
                if (responses[question.id] === option.value) {
                    button.classList.add('selected');
                }

                button.innerHTML = `
                    <div class="checkbox">
                        ${responses[question.id] === option.value ? '<div class="checkmark"></div>' : ''}
                    </div>
                    <span class="option-text">${option.text}</span>
                `;

                button.addEventListener('click', () => {
                    responses[question.id] = option.value;
                    renderQuestions();
                    updateUI();
                });

                optionsDiv.appendChild(button);
            });

            questionDiv.appendChild(titleH3);
            questionDiv.appendChild(optionsDiv);
            container.appendChild(questionDiv);
        });
    }

    // Calcular puntuación total
    function calculateTotal() {
        return Object.values(responses).reduce((sum, val) => sum + (val || 0), 0);
    }

    // Actualizar UI
    function updateUI() {
        const totalAnswered = Object.keys(responses).length;
        const totalQuestions = questions.length;
        const allAnswered = totalAnswered === totalQuestions;

        // Actualizar progreso
        document.getElementById('answered').textContent = totalAnswered;
        const percentage = (totalAnswered / totalQuestions) * 100;
        document.getElementById('progressFill').style.width = percentage + '%';

        // Actualizar puntuación
        const total = calculateTotal();
        document.getElementById('totalScore').textContent = total;
        document.getElementById('interpretation').textContent = config.interpretar(total);

        // Mostrar advertencia si es necesario
        document.getElementById('warningText').style.display = total >= config.umbral ? 'block' : 'none';

        // Validar campos de información
        const nombre = document.getElementById('nombre').value.trim();
        const identificacion = document.getElementById('identificacion').value.trim();
        const sendBtn = document.getElementById('sendBtn');
        const sendMessage = document.getElementById('sendMessage');

        if (allAnswered && nombre && identificacion) {
            sendBtn.disabled = false;
            sendMessage.textContent = '✓ Listo para enviar';
            sendMessage.style.color = '#25d366';
        } else {
            sendBtn.disabled = true;
            if (!nombre || !identificacion) {
                sendMessage.textContent = 'Completa tu nombre e identificación';
            } else {
                sendMessage.textContent = 'Completa todas las preguntas';
            }
            sendMessage.style.color = '#999';
        }
    }

    // Enviar por WhatsApp
    function sendWhatsApp() {
        const nombre = document.getElementById('nombre').value.trim();
        const identificacion = document.getElementById('identificacion').value.trim();
        const total = calculateTotal();

        // Construir detalles de respuestas
        let detalles = '';
        questions.forEach(question => {
            const respuesta = responses[question.id];
            if (respuesta !== undefined) {
                detalles += `\nPregunta ${question.id}: ${respuesta} puntos`;
            }
        });

        const mensaje = encodeURIComponent(
            `*RESULTADO ${config.titulo}*\n\n` +
            `*Datos del Paciente:*\nNombre: ${nombre}\nIdentificación: ${identificacion}\n\n` +
            `*Puntuación Total: ${total}*\n\n` +
            `*Interpretación:*\n${config.interpretar(total)}${detalles}`
        );

        window.open(`https://wa.me/573004804521?text=${mensaje}`, '_blank');
    }

    ['nombre', 'identificacion'].forEach(id => {
        document.getElementById(id).addEventListener('change', updateUI);
        document.getElementById(id).addEventListener('keyup', updateUI);
    });
    document.getElementById('sendBtn').addEventListener('click', sendWhatsApp);

    renderQuestions();
}

if (pagina('beck')) {
    if (document.body.dataset.test === 'ansiedad') {
        iniciarTestBeck({
            titulo: 'INVENTARIO DE ANSIEDAD DE BECK',
            preguntas: preguntasAnsiedad,
            umbral: 22,
            interpretar(total) {
                if (total <= 21) return 'Estos altibajos son considerados normales.';
                if (total <= 35) return 'Ansiedad moderada.';
                return 'Ansiedad severa.';
            }
        });
    } else {
        iniciarTestBeck({
            titulo: 'INVENTARIO DE DEPRESIÓN DE BECK',
            preguntas: preguntasDepresion,
            umbral: 17,
            interpretar(total) {
                if (total <= 10) return 'Estos altibajos son considerados normales.';
                if (total <= 16) return 'Leve perturbación del estado de ánimo.';
                if (total <= 20) return 'Estados de depresión intermitentes.';
                if (total <= 30) return 'Depresión moderada.';
                if (total <= 40) return 'Depresión grave.';
                return 'Depresión extrema.';
            }
        });
    }
}
