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

// ¿Está configurada la base de datos (Google Apps Script)? Ver JS/config.js
function apiActiva() {
    return typeof API_URL !== 'undefined' && !!API_URL;
}

// Envía una acción a Google Apps Script y devuelve la respuesta (JSON).
// Se usa text/plain para evitar la verificación previa (CORS) que Apps Script no admite.
async function llamarAPI(accion, datos = {}) {
    const respuesta = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(Object.assign({ accion }, datos))
    });
    if (!respuesta.ok) throw new Error('Error del servidor (' + respuesta.status + ')');
    return respuesta.json();
}

// Escapa texto para insertarlo en HTML de forma segura
function esc(valor) {
    return String(valor === undefined || valor === null ? '' : valor)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// "8:45 AM" → minutos desde la medianoche
function minutosDeHora(hora) {
    const m = String(hora).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!m) return 0;
    return (parseInt(m[1], 10) % 12 + (m[3].toUpperCase() === 'PM' ? 12 : 0)) * 60 + parseInt(m[2], 10);
}

// Enlace para agregar una cita a Google Calendar (hora de Colombia)
// cita = { fecha: '2026-12-01', hora: '6:00 PM', duracion: 60, profesional, servicios }
function enlaceGoogleCalendar(cita, detalle = '') {
    const formato = minutos => cita.fecha.replace(/-/g, '') + 'T' +
        String(Math.floor(minutos / 60)).padStart(2, '0') + String(minutos % 60).padStart(2, '0') + '00';
    const inicio = minutosDeHora(cita.hora);
    const fin = inicio + (parseInt(cita.duracion, 10) || 60);
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
        '&text=' + encodeURIComponent('Cita con ' + cita.profesional + ' - Bienestar Emocional') +
        '&dates=' + formato(inicio) + '/' + formato(fin) +
        '&ctz=America%2FBogota' +
        '&details=' + encodeURIComponent((cita.servicios || '') + (detalle ? '\n' + detalle : ''));
}

// Descarga un archivo .ics (iPhone, Android, Outlook). Colombia es UTC-5 todo el año.
function descargarICS(cita, detalle = '') {
    const [a, m, d] = cita.fecha.split('-').map(Number);
    const inicio = minutosDeHora(cita.hora);
    const utc = minutos => {
        const f = new Date(Date.UTC(a, m - 1, d, 0, minutos + 5 * 60));
        return f.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };
    const limpiar = t => String(t || '').replace(/[\\,;]/g, ' ').replace(/\n/g, '\\n');
    const ics = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Bienestar Emocional//Citas//ES', 'BEGIN:VEVENT',
        'UID:' + Date.now() + '@bienestar-emocional',
        'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''),
        'DTSTART:' + utc(inicio),
        'DTEND:' + utc(inicio + (parseInt(cita.duracion, 10) || 60)),
        'SUMMARY:' + limpiar('Cita con ' + cita.profesional + ' - Bienestar Emocional'),
        'DESCRIPTION:' + limpiar((cita.servicios || '') + (detalle ? '\n' + detalle : '')),
        'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', 'DESCRIPTION:Recordatorio de tu cita', 'END:VALARM',
        'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    enlace.download = 'cita-bienestar-emocional.ics';
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(() => URL.revokeObjectURL(enlace.href), 5000);
}

// Descarga el comprobante de reserva en PDF que genera Google Apps Script
async function descargarComprobante(id, token) {
    const r = await llamarAPI('comprobante', { id, token });
    if (!r.ok) throw new Error(r.error || 'No se pudo generar el comprobante.');
    const binario = atob(r.base64);
    const bytes = new Uint8Array(binario.length);
    for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
    enlace.download = r.nombre || 'comprobante.pdf';
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(() => URL.revokeObjectURL(enlace.href), 10000);
}

const ESTADOS_CITA = {
    pendiente: 'Pendiente de aceptación', confirmada: 'Confirmada', atendida: 'Atendida',
    cancelada: 'Cancelada', rechazada: 'Rechazada'
};

function pesosCOP(n) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(n) || 0);
}

// Texto de por qué una hora no está disponible
const MOTIVOS_HORA = { ocupada: 'ocupada', 'no alcanza': 'no alcanza', 'no disponible': 'no disponible', 'ya pasó': 'ya pasó' };

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
            checkTimeAvailability();
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
            checkTimeAvailability();
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

        const aceptaPoliticas = document.getElementById('aceptaPoliticas');
        const politicasOk = !aceptaPoliticas || aceptaPoliticas.checked;
        submitButton.disabled = !(isDateSelected && isTimeSelected && isServiceSelected && isProfessionalSelected && politicasOk);

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
                const duration = card.dataset.duration;
                return duration ? `${serviceName} (${duration} min · ${price})` : `${serviceName} (${price})`;
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
    function generateWhatsAppMessage(formData, numero = '') {
        const totalPrice = calculateTotalPrice();
        const formattedPrice = new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP'
        }).format(totalPrice);

        return encodeURIComponent(
            `🔵 *Nueva Reserva de Cita*\n\n` +
            (numero ? `🧾 *Reserva N.º:* ${numero}\n⏳ *Estado:* pendiente de aceptación\n\n` : '') +
            `👨‍⚕️ *Profesional:* ${selectedProfessional}\n` +
            `👤 *Nombre:* ${formData.name}\n` +
            `📞 *Teléfono:* ${formData.phone}\n` +
            `📧 *Email:* ${formData.email}\n` +
            `📅 *Fecha:* ${formatDate(formData.date)}\n` +
            `⏰ *Hora:* ${formData.time}\n` +
            `🏥 *Servicios Seleccionados:*\n• ${getSelectedServicesText()}\n` +
            `💰 *Precio Total:* ${formattedPrice}\n` +
            `💭 *Mensaje:* ${formData.message || 'No se incluyó mensaje adicional'}\n\n` +
            `✅ Acepto las políticas de pago y cancelación.`
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
        const telefonoProfesional = selectedProfessionalPhone;
        const urlWhatsApp = numero => `https://wa.me/${telefonoProfesional}?text=${generateWhatsAppMessage(formData, numero)}`;
        const whatsappUrl = urlWhatsApp('');

        const citaReservada = {
            fecha: formData.date,
            hora: formData.time,
            duracion: duracionTotal(),
            profesional: selectedProfessional,
            servicios: getSelectedServicesText().replace(/\n• /g, ', ')
        };

        // Mostrar confirmación (con calendario y enlace de gestión) y limpiar el formulario
        function finalizarReserva(respuesta) {
            const enlaceGestion = respuesta && respuesta.token
                ? new URL(`cita.html?id=${encodeURIComponent(respuesta.id)}&t=${encodeURIComponent(respuesta.token)}`,
                    location.protocol.startsWith('http') ? location.href : SITIO_URL).href
                : '';
            const detalle = enlaceGestion ? 'Cambiar o cancelar: ' + enlaceGestion : '';
            document.getElementById('modalResumen').textContent =
                `${formatDate(citaReservada.fecha)} a las ${citaReservada.hora} con ${citaReservada.profesional}. Recuerda llegar 15 minutos antes.`;
            document.getElementById('modalCita').hidden = false;
            document.getElementById('modalGoogle').href = enlaceGoogleCalendar(citaReservada, detalle);
            document.getElementById('modalIcs').onclick = () => descargarICS(citaReservada, detalle);
            document.getElementById('modalGestion').hidden = !enlaceGestion;
            document.getElementById('modalEnlace').href = enlaceGestion || '#';

            const conComprobante = !!(respuesta && respuesta.token);
            document.getElementById('modalTitulo').textContent = conComprobante ? '¡Solicitud de cita enviada!' : '¡Gracias por agendar tu cita!';
            document.getElementById('modalComprobante').hidden = !conComprobante;
            document.getElementById('modalPdfError').hidden = true;
            if (conComprobante) {
                document.getElementById('modalEstado').textContent =
                    `Reserva N.º ${respuesta.numero} · pendiente de aceptación. Te avisaremos por correo cuando el profesional la confirme. ` +
                    'Recuerda realizar el pago antes de 12 horas de tu cita; si no, se da por cancelada.';
                const pedirPdf = () => descargarComprobante(respuesta.id, respuesta.token).catch(() => {
                    const aviso = document.getElementById('modalPdfError');
                    aviso.textContent = 'No se pudo descargar el comprobante ahora. También te llegó por correo.';
                    aviso.hidden = false;
                });
                document.getElementById('modalPdf').onclick = pedirPdf;
                pedirPdf();
            }
            showModal();
            appointmentForm.reset();
            serviceCards.forEach(card => card.classList.remove('selected'));
            professionalCards.forEach(card => card.classList.remove('selected'));
            selectedServices.clear();
            selectedProfessional = null;
            selectedProfessionalPhone = null;
            updateSubmitButtonState();
            updateServicesSummary();
            checkTimeAvailability();
        }

        // Sin base de datos: solo WhatsApp (como antes)
        if (!apiActiva()) {
            window.open(whatsappUrl, '_blank');
            finalizarReserva();
            return;
        }

        // Con base de datos: primero se reserva la hora y luego se abre WhatsApp.
        // La ventana se abre ya, para que el navegador no la bloquee.
        const ventana = window.open('', '_blank');
        submitButton.disabled = true;
        submitButton.textContent = 'Reservando...';

        llamarAPI('crearCita', {
            fecha: formData.date,
            hora: formData.time,
            duracion: duracionTotal(),
            profesional: selectedProfessional,
            servicios: getSelectedServicesText().replace(/\n• /g, ', '),
            valor: calculateTotalPrice(),
            nombre: formData.name,
            telefono: formData.phone,
            correo: formData.email,
            mensaje: formData.message
        }).then(r => {
            if (!r.ok) {
                if (ventana) ventana.close();
                mostrarAviso(submitButton, r.error || 'No se pudo reservar la cita. Intenta de nuevo.');
                if (r.ocupado) checkTimeAvailability();
                return;
            }
            if (ventana) ventana.location.href = urlWhatsApp(r.numero);
            else window.open(urlWhatsApp(r.numero), '_blank');
            finalizarReserva(r);
        }).catch(() => {
            // Si la base de datos no responde, la cita igual se envía por WhatsApp
            if (ventana) ventana.location.href = whatsappUrl;
            else window.open(whatsappUrl, '_blank');
            finalizarReserva();
        }).finally(() => {
            submitButton.textContent = 'Reservar Cita';
            updateSubmitButtonState();
        });
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

    // Duración total de los servicios elegidos (mínimo 45 minutos)
    function duracionTotal() {
        const minutos = Array.from(serviceCards)
            .filter(card => card.classList.contains('selected'))
            .reduce((suma, card) => suma + (parseInt(card.dataset.duration, 10) || 0), 0);
        return Math.max(45, minutos);
    }

    // Consulta en la base de datos qué horas están libres para la fecha y el profesional.
    // Si la base de datos no está configurada o no responde, todas las horas quedan disponibles.
    let consultaHoras = 0;
    async function checkTimeAvailability() {
        const timeSelect = document.getElementById('time');
        Array.from(timeSelect.options).forEach(option => {
            if (option.value) {
                option.disabled = false;
                option.textContent = option.value;
            }
        });
        quitarAviso(timeSelect);

        if (!dateInput.value || !selectedProfessional || !apiActiva()) return;

        const consulta = ++consultaHoras;
        timeSelect.disabled = true;
        try {
            const r = await llamarAPI('horarios', {
                fecha: dateInput.value,
                profesional: selectedProfessional,
                duracion: duracionTotal(),
                horas: Array.from(timeSelect.options).map(o => o.value).filter(Boolean)
            });
            if (consulta !== consultaHoras || !r.ok) return;

            const opciones = Array.from(timeSelect.options).filter(o => o.value);
            if (!r.abierto) {
                opciones.forEach(o => { o.disabled = true; });
                mostrarAviso(timeSelect, r.motivo || 'No hay atención este día. Por favor elige otra fecha.');
            } else {
                r.horas.forEach(h => {
                    const opcion = opciones.find(o => o.value === h.hora);
                    if (opcion && !h.libre) {
                        opcion.disabled = true;
                        const motivo = MOTIVOS_HORA[h.motivo] || (h.habilitada ? 'ocupada' : 'no disponible');
                        opcion.textContent = `${h.hora} (${motivo})`;
                    }
                });
                if (!opciones.some(o => !o.disabled)) {
                    mostrarAviso(timeSelect, 'No quedan horas libres este día con este profesional. Prueba otra fecha.');
                }
            }
            if (timeSelect.selectedOptions[0] && timeSelect.selectedOptions[0].disabled) timeSelect.value = '';
        } catch (error) {
            console.warn('No se pudo consultar la disponibilidad:', error);
        } finally {
            if (consulta === consultaHoras) timeSelect.disabled = false;
            updateSubmitButtonState();
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

    // Mostrar indicaciones y políticas (JS/config.js)
    if (typeof POLITICAS !== 'undefined') {
        document.getElementById('listaIndicaciones').innerHTML = INDICACIONES.map(t => `<li>${esc(t)}</li>`).join('');
        document.getElementById('listaPoliticas').innerHTML = POLITICAS.map(t => `<li>${esc(t)}</li>`).join('');
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
if (pagina('prueba') && !pagina('dibujo') && !pagina('evaluacion') && !pagina('cita') && !pagina('responder')) (function () {
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


// ============================================================
// ORGANIZACIONES: planes por tamaño de empresa y cotización
// ============================================================
// Las pruebas se toman de JS/pruebas-datos.js (PRUEBAS).
if (pagina('organizaciones')) (function () {
    const DESCRIPCIONES = DESCRIPCIONES_ORG;
    const PLANES = PLANES_ORG;

    let planActual = 'pequena';

    function minutos(claves) {
        const preguntas = claves.reduce((suma, k) => suma + PRUEBAS[k].preguntas.length, 0);
        return { preguntas, minutos: Math.max(1, Math.round(preguntas * 12 / 60)) };
    }

    function tarjetaPrueba(clave) {
        const prueba = PRUEBAS[clave];
        const tarjeta = document.createElement('div');
        tarjeta.className = 'org-prueba';
        const n = prueba.preguntas.length;
        tarjeta.innerHTML = `
            <div class="org-prueba-encabezado">
                <h4></h4>
                <span class="org-tipo ${prueba.tipo}">${prueba.tipo === 'validada' ? 'Validada' : 'Orientación'}</span>
            </div>
            <p></p>
            <div class="org-prueba-pie">
                <span>${n} preguntas · ${Math.max(1, Math.round(n * 12 / 60))} min aprox.</span>
                <a href="prueba.html?p=${clave}" target="_blank" rel="noopener">Ver la prueba →</a>
            </div>`;
        tarjeta.querySelector('h4').textContent = prueba.titulo;
        tarjeta.querySelector('p').textContent = DESCRIPCIONES[clave] || '';
        return tarjeta;
    }

    function llenarLista(id, elementos) {
        const lista = document.getElementById(id);
        lista.innerHTML = '';
        elementos.forEach(texto => {
            const li = document.createElement('li');
            li.textContent = texto;
            lista.appendChild(li);
        });
    }

    function mostrarPlan(clave) {
        planActual = clave;
        const plan = PLANES[clave];

        document.querySelectorAll('.org-tamano').forEach(boton => {
            const activo = boton.dataset.plan === clave;
            boton.classList.toggle('activo', activo);
            boton.setAttribute('aria-selected', activo);
        });

        document.getElementById('planDescripcion').textContent = plan.descripcion;
        const tiempo = minutos(plan.pruebas);
        document.getElementById('planTiempo').textContent =
            `${plan.pruebas.length} pruebas · ${tiempo.preguntas} preguntas en total · cada trabajador tarda unos ${tiempo.minutos} minutos.`;

        const contenedor = document.getElementById('planPruebas');
        contenedor.innerHTML = '';
        plan.pruebas.forEach(k => contenedor.appendChild(tarjetaPrueba(k)));

        const opcionales = document.getElementById('planOpcionales');
        opcionales.innerHTML = '';
        plan.opcionales.forEach(k => opcionales.appendChild(tarjetaPrueba(k)));
        document.getElementById('planOpcionalesBloque').hidden = plan.opcionales.length === 0;

        llenarLista('planServicios', plan.servicios);
        llenarLista('planEntregables', plan.entregables);
        document.getElementById('planCotizar').textContent = `Cotizar plan ${plan.nombre}`;
    }

    // Casillas de pruebas en el formulario (todas las organizacionales y de tamizaje)
    const todasLasPruebas = [...new Set([...PLANES.grande.pruebas, ...PLANES.grande.opcionales])];
    const zonaChecks = document.getElementById('orgPruebasCheck');
    todasLasPruebas.forEach(clave => {
        const etiqueta = document.createElement('label');
        etiqueta.className = 'org-check';
        etiqueta.innerHTML = `<input type="checkbox" value="${clave}"> <span></span>`;
        etiqueta.querySelector('span').textContent = PRUEBAS[clave].titulo;
        zonaChecks.appendChild(etiqueta);
    });

    // Marcar en el formulario las pruebas del plan elegido
    function aplicarPlanAlFormulario(clave) {
        document.getElementById('orgTamano').value = clave;
        const plan = PLANES[clave];
        zonaChecks.querySelectorAll('input').forEach(c => { c.checked = plan.pruebas.includes(c.value); });
    }

    document.querySelectorAll('.org-tamano').forEach(boton => {
        boton.addEventListener('click', () => {
            mostrarPlan(boton.dataset.plan);
            aplicarPlanAlFormulario(boton.dataset.plan);
        });
    });
    document.getElementById('orgTamano').addEventListener('change', e => {
        mostrarPlan(e.target.value);
        aplicarPlanAlFormulario(e.target.value);
    });

    // Enviar la solicitud de cotización por WhatsApp
    const formulario = document.getElementById('formCotizacion');
    formulario.addEventListener('submit', e => {
        e.preventDefault();
        let primerError = null;

        formulario.querySelectorAll('[required]').forEach(campo => {
            let mensaje = '';
            if (!campo.value.trim()) mensaje = 'Este campo es obligatorio.';
            else if (campo.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(campo.value.trim())) mensaje = 'Escriba un correo válido.';
            else if (campo.type === 'number' && Number(campo.value) < 1) mensaje = 'Escriba un número mayor que 0.';
            if (mensaje) { mostrarAviso(campo, mensaje); primerError = primerError || campo; }
            else quitarAviso(campo);
        });

        const seleccionadas = [...zonaChecks.querySelectorAll('input:checked')].map(c => PRUEBAS[c.value].titulo);
        const fieldset = zonaChecks.closest('fieldset');
        if (!seleccionadas.length) { mostrarAviso(fieldset, 'Seleccione al menos una prueba.'); primerError = primerError || fieldset; }
        else quitarAviso(fieldset);

        const consentimiento = document.getElementById('orgConsentimiento');
        const etiquetaConsentimiento = consentimiento.closest('label');
        if (!consentimiento.checked) { mostrarAviso(etiquetaConsentimiento, 'Debe autorizar el tratamiento de datos.'); primerError = primerError || etiquetaConsentimiento; }
        else quitarAviso(etiquetaConsentimiento);

        if (primerError) {
            primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        const v = id => document.getElementById(id).value.trim();
        const texto =
            `*SOLICITUD DE COTIZACIÓN - ORGANIZACIONES*\n\n` +
            `*Empresa:* ${v('orgEmpresa')}\n` +
            (v('orgNit') ? `*NIT:* ${v('orgNit')}\n` : '') +
            `*Sector:* ${v('orgSector')}\n` +
            `*Ciudad:* ${v('orgCiudad')}\n` +
            `*Plan:* ${PLANES[v('orgTamano')].nombre}\n` +
            `*Trabajadores a evaluar:* ${v('orgTrabajadores')}\n` +
            `*Modalidad:* ${v('orgModalidad')}\n\n` +
            `*Contacto:* ${v('orgContacto')} (${v('orgCargo')})\n` +
            `*Teléfono:* ${v('orgTelefono')}\n` +
            `*Correo:* ${v('orgCorreo')}\n\n` +
            `*Pruebas de interés:*\n- ${seleccionadas.join('\n- ')}\n` +
            (v('orgComentarios') ? `\n*Situación a mejorar:*\n${v('orgComentarios')}` : '');

        window.open(`https://wa.me/573004804521?text=${encodeURIComponent(texto)}`, '_blank');
    });

    mostrarPlan(planActual);
    aplicarPlanAlFormulario(planActual);
})();


// ============================================================
// EVALUACIÓN ANÓNIMA PARA EMPRESAS (evaluacion.html?empresa=CODIGO)
// ============================================================
if (pagina('evaluacion')) (async function () {
    const $ = id => document.getElementById(id);
    const codigo = (new URLSearchParams(location.search).get('empresa') || '').trim().toUpperCase();
    const claveLocal = 'evaluacion_enviada_' + codigo;

    function mostrarError(mensaje) {
        $('evalTitulo').textContent = 'Evaluación no disponible';
        $('evalMensaje').textContent = mensaje;
        $('evalMensaje').hidden = false;
    }

    if (!apiActiva()) return mostrarError('La evaluación todavía no está configurada. Por favor comunícate con Bienestar Emocional.');
    if (!codigo) return mostrarError('El enlace está incompleto: falta el código de la empresa.');

    let empresa;
    try {
        const r = await llamarAPI('empresa', { codigo });
        if (!r.ok) return mostrarError(r.error);
        empresa = r.empresa;
    } catch (error) {
        return mostrarError('No se pudo conectar. Revisa tu conexión a internet e intenta de nuevo.');
    }

    const pruebas = empresa.pruebas.filter(k => PRUEBAS[k]);
    const totalPreguntas = pruebas.reduce((suma, k) => suma + PRUEBAS[k].preguntas.length, 0);
    const respuestas = {};
    pruebas.forEach(k => { respuestas[k] = []; });
    let actual = 0;

    $('evalTitulo').textContent = empresa.nombre;
    $('evalSubtitulo').textContent =
        `${pruebas.length} cuestionario${pruebas.length === 1 ? '' : 's'} · ${totalPreguntas} preguntas · unos ${Math.max(1, Math.round(totalPreguntas * 12 / 60))} minutos`;

    // Paso 1
    if (empresa.areas.length) {
        $('grupoArea').hidden = false;
        $('evalArea').innerHTML = '<option value="">Selecciona tu área</option>' +
            empresa.areas.map(a => `<option>${esc(a)}</option>`).join('');
    }
    try { $('evalYaRespondio').hidden = !localStorage.getItem(claveLocal); } catch (e) { /* sin almacenamiento */ }

    function revisarInicio() {
        $('evalComenzar').disabled = !$('evalConsentimiento').checked || (empresa.areas.length && !$('evalArea').value);
    }
    $('evalConsentimiento').addEventListener('change', revisarInicio);
    $('evalArea').addEventListener('change', revisarInicio);
    $('pasoInicio').hidden = false;

    $('evalComenzar').addEventListener('click', () => {
        $('pasoInicio').hidden = true;
        $('pasoPrueba').hidden = false;
        mostrarPrueba();
    });

    // Paso 2
    function mostrarPrueba() {
        const clave = pruebas[actual];
        const prueba = PRUEBAS[clave];
        $('evalPruebaTitulo').textContent = prueba.titulo;
        $('evalInstrucciones').textContent = prueba.instrucciones;
        $('evalSiguiente').textContent = actual === pruebas.length - 1 ? 'Enviar respuestas' : 'Siguiente cuestionario →';
        dibujarPreguntas();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function dibujarPreguntas() {
        const clave = pruebas[actual];
        const prueba = PRUEBAS[clave];
        const elegidas = respuestas[clave];
        const contenedor = $('evalPreguntas');
        contenedor.innerHTML = '';

        prueba.preguntas.forEach((pregunta, i) => {
            const bloque = document.createElement('div');
            bloque.className = 'question-item';
            const titulo = document.createElement('h3');
            titulo.textContent = `${i + 1}. ${pregunta.texto}`;
            const opcionesDiv = document.createElement('div');
            opcionesDiv.className = 'options';
            opcionesDiv.setAttribute('role', 'radiogroup');

            opcionesDePregunta(prueba, pregunta).forEach((opcion, j) => {
                const elegida = elegidas[i] === j;
                const boton = document.createElement('button');
                boton.type = 'button';
                boton.className = 'option-button' + (elegida ? ' selected' : '');
                boton.setAttribute('role', 'radio');
                boton.setAttribute('aria-checked', elegida);
                boton.innerHTML = `<div class="checkbox">${elegida ? '<div class="checkmark"></div>' : ''}</div><span class="option-text"></span>`;
                boton.querySelector('.option-text').textContent = opcion.texto;
                boton.addEventListener('click', () => {
                    elegidas[i] = j;
                    dibujarPreguntas();
                });
                opcionesDiv.appendChild(boton);
            });

            bloque.appendChild(titulo);
            bloque.appendChild(opcionesDiv);
            contenedor.appendChild(bloque);
        });
        actualizarProgreso();
    }

    function actualizarProgreso() {
        const respondidasTotal = pruebas.reduce((suma, k) => suma + respuestas[k].filter(v => v !== undefined).length, 0);
        const clave = pruebas[actual];
        const faltan = PRUEBAS[clave].preguntas.length - respuestas[clave].filter(v => v !== undefined).length;
        $('evalProgresoTexto').textContent = `Cuestionario ${actual + 1} de ${pruebas.length} · ${respondidasTotal} de ${totalPreguntas} preguntas respondidas`;
        $('evalProgreso').style.width = (respondidasTotal / totalPreguntas * 100) + '%';
        $('evalSiguiente').disabled = faltan > 0;
        $('evalFaltan').textContent = faltan > 0 ? `Faltan ${faltan} pregunta${faltan === 1 ? '' : 's'} por responder` : '';
    }

    $('evalSiguiente').addEventListener('click', async () => {
        if (actual < pruebas.length - 1) {
            actual++;
            mostrarPrueba();
            return;
        }
        await enviar();
    });

    function hayRiesgo() {
        return pruebas.some(k => {
            const alerta = PRUEBAS[k].alertaCrisis;
            const elegida = alerta ? respuestas[k][alerta.pregunta] : undefined;
            return elegida !== undefined && puntajePregunta(PRUEBAS[k], alerta.pregunta, elegida) >= alerta.desde;
        });
    }

    async function enviar() {
        const boton = $('evalSiguiente');
        boton.disabled = true;
        boton.textContent = 'Enviando...';
        quitarAviso(boton);

        const resultados = pruebas.map(k => {
            const c = calificarPrueba(PRUEBAS[k], respuestas[k]);
            return { prueba: k, puntaje: c.total, nivel: c.nivel, respuestas: respuestas[k] };
        });

        try {
            const r = await llamarAPI('enviarEvaluacion', { codigo, area: $('evalArea').value, resultados });
            if (!r.ok) throw new Error(r.error);
        } catch (error) {
            mostrarAviso(boton, (error.message && !/fetch/i.test(error.message) ? error.message : 'No se pudo enviar.') +
                ' Revisa tu conexión y vuelve a intentarlo; tus respuestas no se han perdido.');
            boton.disabled = false;
            boton.textContent = 'Reintentar envío';
            return;
        }

        try { localStorage.setItem(claveLocal, '1'); } catch (e) { /* sin almacenamiento */ }
        $('pasoPrueba').hidden = true;
        $('pasoFin').hidden = false;
        $('evalCrisis').hidden = !hayRiesgo();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    $('evalOtra').addEventListener('click', () => location.reload());
})();


// ============================================================
// PANEL DE ADMINISTRACIÓN (panel.html)
// ============================================================
if (pagina('panel')) (function () {
    const $ = id => document.getElementById(id);
    const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const NIVELES = { ok: 'Favorable', leve: 'Atención', alto: 'Riesgo' };
    let clave = '';
    try { clave = sessionStorage.getItem('panel_clave') || ''; } catch (e) { /* sin almacenamiento */ }

    // ---------- Comunicación ----------
    function estado(mensaje, tipo) {
        const el = $('panelEstado');
        el.textContent = mensaje || '';
        el.className = 'panel-estado no-imprimir' + (tipo ? ' ' + tipo : '');
    }

    async function api(accion, datos = {}) {
        estado('Cargando...');
        try {
            const r = await llamarAPI(accion, Object.assign({ clave }, datos));
            if (r.clave === false) { salir('La clave no es correcta.'); throw new Error('Clave incorrecta.'); }
            if (!r.ok) throw new Error(r.error || 'Error desconocido.');
            estado('');
            return r;
        } catch (error) {
            estado('⚠️ ' + (/fetch/i.test(error.message) ? 'No se pudo conectar con la base de datos.' : error.message), 'error');
            throw error;
        }
    }

    // ---------- Ingreso ----------
    if (!apiActiva()) $('panelSinApi').hidden = false;

    $('panelFormLogin').addEventListener('submit', async e => {
        e.preventDefault();
        if (!apiActiva()) return;
        $('panelLoginError').textContent = '';
        clave = $('panelClave').value;
        try {
            const r = await llamarAPI('login', { clave });
            if (!r.ok) throw new Error(r.error);
            try { sessionStorage.setItem('panel_clave', clave); } catch (err) { /* sin almacenamiento */ }
            entrar();
        } catch (error) {
            $('panelLoginError').textContent = /fetch/i.test(error.message) ? 'No se pudo conectar con la base de datos.' : error.message;
        }
    });

    function entrar() {
        $('panelLogin').hidden = true;
        $('panelApp').hidden = false;
        mostrarTab('empresas');
    }

    function salir(mensaje) {
        clave = '';
        try { sessionStorage.removeItem('panel_clave'); } catch (e) { /* sin almacenamiento */ }
        $('panelApp').hidden = true;
        $('panelLogin').hidden = false;
        $('panelLoginError').textContent = mensaje || '';
    }
    $('panelSalir').addEventListener('click', () => salir());

    // ---------- Pestañas ----------
    function mostrarTab(nombre) {
        document.querySelectorAll('.panel-tab-btn').forEach(b => b.classList.toggle('activo', b.dataset.tab === nombre));
        ['empresas', 'informe', 'resumen', 'citas', 'disponibilidad'].forEach(t => {
            $('tab' + t.charAt(0).toUpperCase() + t.slice(1)).hidden = t !== nombre;
        });
        if (nombre === 'empresas') cargarEmpresas();
        if (nombre === 'citas') cargarCitas();
        if (nombre === 'resumen') cargarResumen();
        if (nombre === 'disponibilidad') cargarDisponibilidad();
    }
    document.querySelectorAll('.panel-tab-btn').forEach(b => b.addEventListener('click', () => mostrarTab(b.dataset.tab)));

    // ========== EMPRESAS ==========
    const pruebasOrg = [...new Set([].concat(...Object.values(PLANES_ORG).map(p => p.pruebas.concat(p.opcionales))))];
    $('nuevaPruebas').innerHTML = pruebasOrg.map(k =>
        `<label class="panel-check"><input type="checkbox" value="${k}"> ${esc(PRUEBAS[k].titulo)}</label>`).join('');

    function marcarPlan() {
        const plan = PLANES_ORG[$('nuevaPlan').value];
        $('nuevaPruebas').querySelectorAll('input').forEach(c => { c.checked = plan.pruebas.includes(c.value); });
    }
    $('nuevaPlan').addEventListener('change', marcarPlan);
    marcarPlan();

    function enlaceEvaluacion(codigo) {
        const base = location.protocol.startsWith('http') ? location.href : (SITIO_URL || location.href);
        return new URL('evaluacion.html?empresa=' + codigo, base).href;
    }

    $('formNuevaEmpresa').addEventListener('submit', async e => {
        e.preventDefault();
        const pruebas = [...$('nuevaPruebas').querySelectorAll('input:checked')].map(c => c.value);
        if (!$('nuevaNombre').value.trim()) return mostrarAviso($('nuevaNombre'), 'Escribe el nombre de la empresa.');
        quitarAviso($('nuevaNombre'));
        if (!pruebas.length) return estado('⚠️ Elige al menos una prueba.', 'error');
        try {
            const r = await api('crearEmpresa', {
                nombre: $('nuevaNombre').value,
                plan: $('nuevaPlan').value,
                limite: $('nuevaLimite').value,
                areas: $('nuevaAreas').value.split('\n').map(a => a.trim()).filter(Boolean),
                pruebas
            });
            $('formNuevaEmpresa').reset();
            marcarPlan();
            $('cajaNueva').open = false;
            await cargarEmpresas();
            estado('✓ Evaluación creada. Código: ' + r.codigo, 'ok');
        } catch (error) { /* el mensaje ya se mostró */ }
    });

    async function cargarEmpresas() {
        let r;
        try { r = await api('listarEmpresas'); } catch (e) { return; }
        const lista = $('listaEmpresas');
        if (!r.empresas.length) {
            lista.innerHTML = '<p class="panel-vacio">Todavía no hay evaluaciones. Crea la primera con el botón de arriba.</p>';
            return;
        }
        lista.innerHTML = r.empresas.map(e => {
            const enlace = enlaceEvaluacion(e.codigo);
            const plan = PLANES_ORG[e.plan] ? PLANES_ORG[e.plan].nombre : '';
            return `
            <article class="panel-item" data-codigo="${esc(e.codigo)}">
                <div class="panel-item-info">
                    <h3>${esc(e.nombre)} <span class="panel-badge ${e.estado === 'abierta' ? 'ok' : 'gris'}">${e.estado === 'abierta' ? 'Abierta' : 'Cerrada'}</span></h3>
                    <p>${esc(plan)} · Código <strong>${esc(e.codigo)}</strong> · Creada ${esc(e.creada)}</p>
                    <p><strong>${e.participantes}</strong>${e.limite ? ' de ' + esc(e.limite) : ''} participantes · ${e.pruebas.split(',').length} pruebas</p>
                    <input class="panel-enlace" type="text" readonly value="${esc(enlace)}" aria-label="Enlace de la evaluación">
                </div>
                <div class="panel-item-acciones">
                    <button type="button" class="panel-btn panel-btn-principal" data-accion="informe">📊 Ver informe</button>
                    <button type="button" class="panel-btn" data-accion="copiar">📋 Copiar enlace</button>
                    <a class="panel-btn" target="_blank" rel="noopener"
                       href="https://wa.me/?text=${encodeURIComponent('Te invitamos a responder la evaluación anónima de bienestar laboral de ' + e.nombre + ': ' + enlace)}">📱 Enviar por WhatsApp</a>
                    <button type="button" class="panel-btn" data-accion="estado">${e.estado === 'abierta' ? '⏸️ Cerrar' : '▶️ Reabrir'}</button>
                    <button type="button" class="panel-btn panel-btn-peligro" data-accion="eliminar">🗑️ Eliminar</button>
                </div>
            </article>`;
        }).join('');

        lista.querySelectorAll('.panel-item').forEach(item => {
            const empresa = r.empresas.find(e => e.codigo === item.dataset.codigo);
            item.querySelectorAll('button[data-accion]').forEach(b => b.addEventListener('click', async () => {
                const accion = b.dataset.accion;
                if (accion === 'informe') abrirInforme(empresa.codigo);
                if (accion === 'copiar') {
                    const campo = item.querySelector('.panel-enlace');
                    try { await navigator.clipboard.writeText(campo.value); }
                    catch (e) { campo.select(); document.execCommand('copy'); }
                    estado('✓ Enlace copiado.', 'ok');
                }
                if (accion === 'estado') {
                    try {
                        await api('cambiarEstadoEmpresa', { codigo: empresa.codigo, estado: empresa.estado === 'abierta' ? 'cerrada' : 'abierta' });
                        cargarEmpresas();
                    } catch (e) { /* mensaje mostrado */ }
                }
                if (accion === 'eliminar') {
                    const respuesta = prompt(`Se borrarán la empresa "${empresa.nombre}" y TODOS sus resultados.\nEsto no se puede deshacer.\n\nEscribe ELIMINAR para confirmar:`);
                    if (respuesta !== 'ELIMINAR') return;
                    try { await api('eliminarEmpresa', { codigo: empresa.codigo }); cargarEmpresas(); estado('✓ Empresa eliminada.', 'ok'); }
                    catch (e) { /* mensaje mostrado */ }
                }
            }));
        });
    }

    // ========== INFORME ==========
    let informeActual = null;

    async function abrirInforme(codigo) {
        let r;
        try { r = await api('resultados', { codigo }); } catch (e) { return; }
        informeActual = r;
        document.querySelectorAll('.panel-tab-btn').forEach(b => b.classList.remove('activo'));
        ['Empresas', 'Resumen', 'Citas', 'Disponibilidad'].forEach(t => { $('tab' + t).hidden = true; });
        $('tabInforme').hidden = false;
        $('informe').innerHTML = construirInforme(r.empresa, r.respuestas);
        window.scrollTo({ top: 0 });
    }

    function promedio(lista) {
        return lista.length ? lista.reduce((a, b) => a + b, 0) / lista.length : 0;
    }

    function redondear(n) {
        return Math.round(n * 10) / 10;
    }

    function construirInforme(empresa, filas) {
        const participantes = new Set(filas.map(f => f.participante)).size;
        const fechas = filas.map(f => f.fecha).sort();
        const claves = empresa.pruebas.split(',').filter(k => PRUEBAS[k]);
        const hoy = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

        let html = `
            <header class="informe-encabezado">
                <p class="informe-marca">Bienestar Emocional · Informe de bienestar laboral</p>
                <h2>${esc(empresa.nombre)}</h2>
                <p>Fecha del informe: ${hoy}${fechas.length ? ` · Aplicación: ${esc(fechas[0].slice(0, 10))} a ${esc(fechas[fechas.length - 1].slice(0, 10))}` : ''}</p>
                <div class="informe-cifras">
                    <div><strong>${participantes}</strong><span>participantes</span></div>
                    <div><strong>${claves.length}</strong><span>pruebas aplicadas</span></div>
                    <div><strong>${new Set(filas.map(f => f.area)).size}</strong><span>áreas</span></div>
                </div>
            </header>`;

        if (!participantes) {
            return html + '<p class="panel-vacio">Todavía nadie ha respondido esta evaluación.</p>';
        }
        if (participantes < MINIMO_POR_AREA) {
            html += `<p class="informe-nota">⚠️ Hay menos de ${MINIMO_POR_AREA} participantes. Interprete los resultados con precaución.</p>`;
        }

        // Resumen por prueba
        const resumen = claves.map(k => {
            const prueba = PRUEBAS[k];
            const deEsta = filas.filter(f => f.prueba === k);
            const puntajes = deEsta.map(f => Number(f.puntaje));
            const media = redondear(promedio(puntajes));
            const conteo = { ok: 0, leve: 0, alto: 0 };
            deEsta.forEach(f => { if (conteo[f.nivel] !== undefined) conteo[f.nivel]++; });
            const rangoMedia = prueba.rangos.find(rg => media <= rg.hasta) || prueba.rangos[prueba.rangos.length - 1];
            return { k, prueba, deEsta, media, conteo, n: deEsta.length, rangoMedia, pctAlto: deEsta.length ? conteo.alto / deEsta.length * 100 : 0 };
        });

        // Prioridades
        const prioridades = resumen.filter(r => r.n && r.pctAlto > 0).sort((a, b) => b.pctAlto - a.pctAlto).slice(0, 3);
        html += '<section class="informe-seccion"><h3>Aspectos prioritarios</h3>';
        html += prioridades.length
            ? '<ol class="informe-prioridades">' + prioridades.map(r =>
                `<li><strong>${esc(r.prueba.titulo)}</strong>: ${Math.round(r.pctAlto)}% del personal en nivel de riesgo.</li>`).join('') + '</ol>'
            : '<p>Ninguna prueba muestra personas en nivel de riesgo. 🎉</p>';
        html += '</section>';

        // Detalle por prueba
        html += '<section class="informe-seccion"><h3>Resultados por prueba</h3>';
        resumen.forEach(r => {
            const { min, max } = rangoPuntaje(r.prueba);
            const pctMedia = max > min ? (r.media - min) / (max - min) * 100 : 0;
            const pct = n => r.n ? Math.round(n / r.n * 100) : 0;
            html += `
            <article class="informe-prueba">
                <div class="informe-prueba-encabezado">
                    <h4>${esc(r.prueba.titulo)}</h4>
                    <span class="panel-badge ${r.rangoMedia.nivel}">${esc(NIVELES[r.rangoMedia.nivel])}</span>
                </div>
                <p class="informe-media">Promedio: <strong>${r.media}${r.prueba.sufijo || ''}</strong> (escala ${min} a ${max}) · ${esc(r.rangoMedia.texto)} · ${r.n} respuestas</p>
                <div class="informe-barra-media" aria-hidden="true"><span style="width:${pctMedia}%"></span></div>
                <div class="informe-distribucion" role="img" aria-label="Favorable ${pct(r.conteo.ok)}%, atención ${pct(r.conteo.leve)}%, riesgo ${pct(r.conteo.alto)}%">
                    ${['ok', 'leve', 'alto'].map(n => r.conteo[n] ? `<span class="${n}" style="width:${pct(r.conteo[n])}%">${pct(r.conteo[n])}%</span>` : '').join('')}
                </div>
                <p class="informe-leyenda">
                    <span class="punto ok"></span> Favorable: ${r.conteo.ok}
                    <span class="punto leve"></span> Atención: ${r.conteo.leve}
                    <span class="punto alto"></span> Riesgo: ${r.conteo.alto}
                </p>
                ${tablaAreas(r)}
            </article>`;
        });
        html += '</section>';

        html += `<p class="informe-pie">Resultados anónimos y agrupados. Las áreas con menos de ${MINIMO_POR_AREA} personas no se muestran por separado para proteger la identidad de los participantes. Este informe es orientativo y no constituye un diagnóstico individual.</p>`;
        return html;
    }

    function tablaAreas(r) {
        const areas = [...new Set(r.deEsta.map(f => f.area))].sort();
        if (areas.length < 2) return '';
        const filas = areas.map(area => {
            const deArea = r.deEsta.filter(f => f.area === area);
            if (deArea.length < MINIMO_POR_AREA) {
                return `<tr><td>${esc(area)}</td><td>${deArea.length}</td><td colspan="2" class="informe-oculto">Menos de ${MINIMO_POR_AREA} personas</td></tr>`;
            }
            const media = redondear(promedio(deArea.map(f => Number(f.puntaje))));
            const alto = Math.round(deArea.filter(f => f.nivel === 'alto').length / deArea.length * 100);
            return `<tr><td>${esc(area)}</td><td>${deArea.length}</td><td>${media}${r.prueba.sufijo || ''}</td><td>${alto}%</td></tr>`;
        }).join('');
        return `<table class="informe-tabla"><thead><tr><th>Área</th><th>Personas</th><th>Promedio</th><th>En riesgo</th></tr></thead><tbody>${filas}</tbody></table>`;
    }

    $('informeVolver').addEventListener('click', () => mostrarTab('empresas'));
    $('informeImprimir').addEventListener('click', () => window.print());

    $('informeExcel').addEventListener('click', () => {
        if (!informeActual) return;
        const columnas = ['fecha', 'participante', 'area', 'prueba', 'puntaje', 'nivel'];
        const celda = v => '"' + String(v).replace(/"/g, '""') + '"';
        const lineas = [columnas.join(';')].concat(informeActual.respuestas.map(f => [
            f.fecha, f.participante, f.area, PRUEBAS[f.prueba] ? PRUEBAS[f.prueba].titulo : f.prueba,
            String(f.puntaje).replace('.', ','), NIVELES[f.nivel] || f.nivel
        ].map(celda).join(';')));
        const blob = new Blob(['﻿' + lineas.join('\r\n')], { type: 'text/csv;charset=utf-8' });
        const enlace = document.createElement('a');
        enlace.href = URL.createObjectURL(blob);
        enlace.download = `resultados_${informeActual.empresa.nombre.replace(/[^\wáéíóúñÁÉÍÓÚÑ]+/g, '_')}.csv`;
        enlace.click();
        setTimeout(() => URL.revokeObjectURL(enlace.href), 5000);
    });

    $('informeBorrar').addEventListener('click', async () => {
        if (!informeActual) return;
        const e = informeActual.empresa;
        const respuesta = prompt(`Se borrarán TODOS los resultados de "${e.nombre}". La empresa y su enlace se conservan.\n` +
            'Antes de borrar, imprime o descarga el informe.\n\nEscribe BORRAR para confirmar:');
        if (respuesta !== 'BORRAR') return;
        try {
            const r = await api('borrarResultados', { codigo: e.codigo });
            await abrirInforme(e.codigo);
            estado(`✓ Se borraron ${r.borradas} respuestas. El espacio quedó libre.`, 'ok');
        } catch (err) { /* mensaje mostrado */ }
    });

    // ========== CITAS ==========
    const opcionesProfesionales = '<option value="">Todos</option>' + PROFESIONALES.map(p => `<option>${esc(p)}</option>`).join('');
    $('citasProfesional').innerHTML = opcionesProfesionales;
    $('citasProfesional').addEventListener('change', () => pintarCitas());
    $('citasMostrar').addEventListener('change', () => pintarCitas());
    $('citasRecargar').addEventListener('click', () => cargarCitas());

    let citas = [];

    function aMinutos(hora) {
        const m = String(hora).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (!m) return 0;
        return (parseInt(m[1], 10) % 12 + (m[3].toUpperCase() === 'PM' ? 12 : 0)) * 60 + parseInt(m[2], 10);
    }

    function fechaLarga(fecha) {
        const [a, m, d] = fecha.split('-').map(Number);
        return new Date(a, m - 1, d).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }

    async function cargarCitas() {
        try { citas = (await api('listarCitas')).citas; } catch (e) { return; }
        pintarCitas();
    }

    function pintarCitas() {
        const hoy = new Date();
        const hoyTexto = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
        const profesional = $('citasProfesional').value;
        const proximas = $('citasMostrar').value === 'proximas';

        const lista = citas
            .filter(c => !profesional || c.profesional === profesional)
            .filter(c => !proximas || (c.fecha >= hoyTexto && (c.estado === 'confirmada' || c.estado === 'pendiente')))
            .sort((a, b) => proximas
                ? (a.fecha.localeCompare(b.fecha) || aMinutos(a.hora) - aMinutos(b.hora))
                : (b.fecha.localeCompare(a.fecha) || aMinutos(b.hora) - aMinutos(a.hora)));

        if (!lista.length) {
            $('listaCitas').innerHTML = `<p class="panel-vacio">No hay citas ${proximas ? 'próximas' : 'registradas'}.</p>`;
            return;
        }

        const porAceptar = citas.filter(c => c.estado === 'pendiente' && c.fecha >= hoyTexto).length;
        $('listaCitas').innerHTML = (porAceptar ? `<p class="panel-alerta">⏳ Tienes <strong>${porAceptar}</strong> cita${porAceptar > 1 ? 's' : ''} por aceptar o rechazar.</p>` : '') +
            lista.map(c => {
            const telefono = String(c.telefono).replace(/\D/g, '');
            const clase = { pendiente: 'leve', confirmada: 'ok', atendida: 'azul' }[c.estado] || 'gris';
            const activa = c.estado === 'pendiente' || c.estado === 'confirmada';
            const textoWhatsApp = c.estado === 'confirmada'
                ? `Hola ${c.nombre.split(' ')[0]}, te confirmamos tu cita N.º ${c.numero || c.id} el ${fechaLarga(c.fecha)} a las ${c.hora} con ${c.profesional}. ` +
                  (c.pago === 'pagado' ? '¡Te esperamos!' : `Recuerda realizar el pago de ${pesosCOP(c.valor)} antes de 12 horas de la cita y enviarnos el comprobante.`)
                : c.estado === 'rechazada'
                ? `Hola ${c.nombre.split(' ')[0]}, lamentamos no poder atenderte el ${fechaLarga(c.fecha)} a las ${c.hora}. ¿Te gustaría elegir otro horario?`
                : `Hola ${c.nombre.split(' ')[0]}, te escribimos de Bienestar Emocional por tu cita N.º ${c.numero || c.id}.`;
            return `
            <article class="panel-item" data-id="${esc(c.id)}">
                <div class="panel-item-info">
                    <h3>${esc(fechaLarga(c.fecha))} · ${esc(c.hora)}
                        <span class="panel-badge ${clase}">${esc(ESTADOS_CITA[c.estado] || c.estado)}</span>
                        ${activa || c.pago === 'pagado' ? `<span class="panel-badge ${c.pago === 'pagado' ? 'ok' : 'alto'}">${c.pago === 'pagado' ? '💳 Pagada' : '💳 Sin pago'}</span>` : ''}</h3>
                    <p><strong>${esc(c.nombre)}</strong> con ${esc(c.profesional)} · ${esc(c.duracion)} min${c.numero ? ' · N.º ' + esc(c.numero) : ''}</p>
                    <p>${esc(c.servicios)}${Number(c.valor) ? ' · <strong>' + pesosCOP(c.valor) + '</strong>' : ''}</p>
                    <p>📞 ${esc(c.telefono)} · ✉️ ${esc(c.correo)}</p>
                    ${c.mensaje ? `<p class="panel-mensaje">💭 ${esc(c.mensaje)}</p>` : ''}
                    ${c.nota ? `<p class="panel-mensaje">📝 ${esc(c.nota)}</p>` : ''}
                    ${Number(c.penalizacion) ? `<p><strong>Penalización:</strong> ${pesosCOP(c.penalizacion)}</p>` : ''}
                </div>
                <div class="panel-item-acciones">
                    ${c.estado === 'pendiente' ? `
                        <button type="button" class="panel-btn panel-btn-principal" data-responder="aceptar">✅ Aceptar</button>
                        <button type="button" class="panel-btn panel-btn-peligro" data-responder="rechazar">❌ Rechazar</button>` : ''}
                    ${telefono ? `<a class="panel-btn" target="_blank" rel="noopener" href="https://wa.me/${telefono}?text=${encodeURIComponent(textoWhatsApp)}">📱 WhatsApp</a>` : ''}
                    ${activa ? `<button type="button" class="panel-btn" data-pago="${c.pago === 'pagado' ? 'pendiente' : 'pagado'}">${c.pago === 'pagado' ? '↺ Quitar pago' : '💳 Marcar pagada'}</button>` : ''}
                    ${c.estado === 'confirmada' ? `
                        <button type="button" class="panel-btn" data-estado="atendida">✓ Atendida</button>
                        <button type="button" class="panel-btn panel-btn-peligro" data-estado="cancelada">✕ Cancelar</button>` : ''}
                    ${!activa ? `<button type="button" class="panel-btn" data-estado="confirmada">↺ Reactivar</button>` : ''}
                </div>
            </article>`;
        }).join('');

        const idDe = b => b.closest('.panel-item').dataset.id;
        $('listaCitas').querySelectorAll('button[data-estado]').forEach(b => b.addEventListener('click', async () => {
            if (b.dataset.estado === 'cancelada' && !confirm('¿Cancelar esta cita? La hora quedará libre para otra persona.')) return;
            try { await api('cambiarEstadoCita', { id: idDe(b), estado: b.dataset.estado }); await cargarCitas(); }
            catch (e) { /* mensaje mostrado */ }
        }));
        $('listaCitas').querySelectorAll('button[data-responder]').forEach(b => b.addEventListener('click', async () => {
            let motivo = '';
            if (b.dataset.responder === 'rechazar') {
                motivo = prompt('¿Por qué rechazas la cita? (opcional, se le enviará al paciente)');
                if (motivo === null) return;
            }
            try {
                await api('responderCitaPanel', { id: idDe(b), decision: b.dataset.responder, motivo });
                await cargarCitas();
                estado(b.dataset.responder === 'aceptar'
                    ? '✓ Cita aceptada. Se le envió un correo al paciente; también puedes avisarle por WhatsApp.'
                    : '✓ Cita rechazada. Se le envió un correo al paciente y la hora quedó libre.', 'ok');
            } catch (e) { /* mensaje mostrado */ }
        }));
        $('listaCitas').querySelectorAll('button[data-pago]').forEach(b => b.addEventListener('click', async () => {
            try {
                await api('marcarPago', { id: idDe(b), pago: b.dataset.pago });
                await cargarCitas();
                estado(b.dataset.pago === 'pagado' ? '✓ Pago registrado. Se le envió un correo al paciente.' : '✓ Pago quitado.', 'ok');
            } catch (e) { /* mensaje mostrado */ }
        }));
    }

    // ========== DISPONIBILIDAD ==========
    let disponibilidad = [];
    $('dispProfesional').innerHTML = PROFESIONALES.map(p => `<option>${esc(p)}</option>`).join('');
    $('bloqueoProfesional').innerHTML = '<option>Todos</option>' + PROFESIONALES.map(p => `<option>${esc(p)}</option>`).join('');
    $('dispProfesional').addEventListener('change', pintarHorario);

    async function cargarDisponibilidad() {
        let r;
        try { r = await api('leerDisponibilidad'); } catch (e) { return; }
        disponibilidad = r.disponibilidad;
        bloqueosActuales = r.bloqueos;
        excepciones = r.excepciones || [];
        excepcionesActivas = !!r.excepcionesActivas;
        try { citas = (await api('listarCitas')).citas; } catch (e) { /* el calendario funciona sin citas */ }
        pintarHorario();
        pintarBloqueos(r.bloqueos);
        pintarCalendario();
    }

    function pintarHorario() {
        const profesional = $('dispProfesional').value;
        const filas = disponibilidad.filter(d => d.profesional === profesional);
        const configurado = filas.length > 0;
        const horasDe = dia => {
            const fila = filas.find(f => String(f.dia) === String(dia));
            if (!configurado) return dia === 0 ? [] : HORAS_CITA;   // por defecto: lunes a sábado, todas las horas
            return fila ? fila.horas.split(',').filter(Boolean) : [];
        };
        const dias = [1, 2, 3, 4, 5, 6, 0];

        let html = '<thead><tr><th>Hora</th>' + dias.map(d =>
            `<th><button type="button" class="panel-dia" data-dia="${d}" title="Marcar o desmarcar todo el día">${DIAS[d].slice(0, 3)}</button></th>`).join('') + '</tr></thead><tbody>';
        HORAS_CITA.forEach(hora => {
            html += `<tr><th scope="row">${hora}</th>` + dias.map(d =>
                `<td><input type="checkbox" data-dia="${d}" value="${hora}" ${horasDe(d).includes(hora) ? 'checked' : ''} aria-label="${DIAS[d]} ${hora}"></td>`).join('') + '</tr>';
        });
        $('gridHorario').innerHTML = html + '</tbody>';
        $('gridHorario').querySelectorAll('.panel-dia').forEach(b => b.addEventListener('click', () => {
            const casillas = [...$('gridHorario').querySelectorAll(`input[data-dia="${b.dataset.dia}"]`)];
            const marcar = casillas.some(c => !c.checked);
            casillas.forEach(c => { c.checked = marcar; });
        }));
        if (!configurado) estado('ℹ️ Este profesional aún no tiene horario guardado: se muestra el horario por defecto (lunes a sábado).');
    }

    $('dispGuardar').addEventListener('click', async () => {
        const dias = {};
        [0, 1, 2, 3, 4, 5, 6].forEach(d => {
            dias[d] = [...$('gridHorario').querySelectorAll(`input[data-dia="${d}"]:checked`)].map(c => c.value);
        });
        try {
            await api('guardarDisponibilidad', { profesional: $('dispProfesional').value, dias });
            await cargarDisponibilidad();
            estado('✓ Horario guardado.', 'ok');
        } catch (e) { /* mensaje mostrado */ }
    });

    function pintarBloqueos(bloqueos) {
        const lista = bloqueos.slice().sort((a, b) => a.fecha.localeCompare(b.fecha));
        $('listaBloqueos').innerHTML = lista.length ? lista.map(b => `
            <div class="panel-item panel-item-compacto" data-id="${esc(b.id)}">
                <span><strong>${esc(fechaLarga(b.fecha))}</strong> · ${esc(b.profesional)}${b.motivo ? ' · ' + esc(b.motivo) : ''}</span>
                <button type="button" class="panel-btn panel-btn-peligro">Quitar</button>
            </div>`).join('') : '<p class="panel-vacio">No hay días bloqueados.</p>';
        $('listaBloqueos').querySelectorAll('button').forEach(b => b.addEventListener('click', async () => {
            try { await api('eliminarBloqueo', { id: b.closest('.panel-item').dataset.id }); cargarDisponibilidad(); }
            catch (e) { /* mensaje mostrado */ }
        }));
    }

    $('formBloqueo').addEventListener('submit', async e => {
        e.preventDefault();
        try {
            await api('agregarBloqueo', { fecha: $('bloqueoFecha').value, profesional: $('bloqueoProfesional').value, motivo: $('bloqueoMotivo').value });
            $('formBloqueo').reset();
            await cargarDisponibilidad();
            estado('✓ Día bloqueado.', 'ok');
        } catch (err) { /* mensaje mostrado */ }
    });

    // ========== RESUMEN SEMANAL ==========
    function lunesDe(fecha) {
        const d = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
        d.setDate(d.getDate() - (d.getDay() + 6) % 7);
        return d;
    }
    let resLunes = lunesDe(new Date());

    function fechaISO(d) {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    // Valor de la cita: el guardado al agendar o, en citas antiguas, el que aparece en el texto de servicios
    function valorCita(c) {
        if (Number(c.valor)) return Number(c.valor);
        return (String(c.servicios).match(/\$\s?[\d.]+/g) || [])
            .reduce((suma, t) => suma + (parseInt(t.replace(/\D/g, ''), 10) || 0), 0);
    }

    const pesos = n => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

    $('resAnterior').addEventListener('click', () => { resLunes.setDate(resLunes.getDate() - 7); pintarResumen(); });
    $('resSiguiente').addEventListener('click', () => { resLunes.setDate(resLunes.getDate() + 7); pintarResumen(); });
    $('resHoy').addEventListener('click', () => { resLunes = lunesDe(new Date()); pintarResumen(); });
    $('resRecargar').addEventListener('click', () => cargarResumen());

    async function cargarResumen() {
        try { citas = (await api('listarCitas')).citas; } catch (e) { return; }
        pintarResumen();
    }

    function pintarResumen() {
        const domingo = new Date(resLunes);
        domingo.setDate(domingo.getDate() + 6);
        const desde = fechaISO(resLunes), hasta = fechaISO(domingo);
        const opciones = { day: 'numeric', month: 'short' };
        $('resTitulo').textContent = `${resLunes.toLocaleDateString('es-CO', opciones)} – ${domingo.toLocaleDateString('es-CO', opciones)} ${domingo.getFullYear()}`;

        const semana = citas.filter(c => c.fecha >= desde && c.fecha <= hasta);
        const activas = semana.filter(c => c.estado !== 'cancelada' && c.estado !== 'rechazada');
        const atendidas = semana.filter(c => c.estado === 'atendida');
        const porAceptar = semana.filter(c => c.estado === 'pendiente');
        const pendientes = semana.filter(c => c.estado === 'confirmada');
        const canceladas = semana.filter(c => c.estado === 'cancelada' || c.estado === 'rechazada');
        const pagada = c => c.pago === 'pagado' || (!c.pago && c.estado === 'atendida');
        const suma = lista => lista.reduce((t, c) => t + valorCita(c), 0);
        const recibido = suma(semana.filter(c => pagada(c) && c.estado !== 'rechazada'));
        const porCobrar = suma(semana.filter(c => (c.estado === 'pendiente' || c.estado === 'confirmada') && !pagada(c)));
        const penalizaciones = semana.reduce((t, c) => t + (Number(c.penalizacion) || 0), 0);

        const tarjeta = (valor, texto, clase = '') => `<div class="res-tarjeta ${clase}"><strong>${valor}</strong><span>${texto}</span></div>`;
        let html = '<div class="res-tarjetas">' +
            tarjeta(activas.length, 'citas agendadas') +
            tarjeta(porAceptar.length, 'por aceptar', 'leve') +
            tarjeta(pendientes.length, 'confirmadas por atender', 'azul') +
            tarjeta(atendidas.length, 'atendidas', 'ok') +
            tarjeta(canceladas.length, 'canceladas o rechazadas', 'gris') +
            tarjeta(pesos(recibido), 'pagos recibidos', 'ok') +
            tarjeta(pesos(porCobrar), 'por cobrar', 'azul') +
            tarjeta(pesos(penalizaciones), 'penalizaciones', 'leve') +
            '</div>';

        if (!semana.length) {
            $('resumenSemana').innerHTML = html + '<p class="panel-vacio">No hay citas en esta semana.</p>';
            return;
        }

        // Por profesional
        html += '<div class="panel-caja"><h2>Por profesional</h2><table class="informe-tabla"><thead><tr>' +
            '<th>Profesional</th><th>Agendadas</th><th>Atendidas</th><th>Canceladas</th><th>Pagos recibidos</th></tr></thead><tbody>' +
            PROFESIONALES.map(p => {
                const deP = semana.filter(c => c.profesional === p);
                return `<tr><td>${esc(p)}</td><td>${deP.filter(c => c.estado !== 'cancelada' && c.estado !== 'rechazada').length}</td>` +
                    `<td>${deP.filter(c => c.estado === 'atendida').length}</td><td>${deP.filter(c => c.estado === 'cancelada' || c.estado === 'rechazada').length}</td>` +
                    `<td>${pesos(suma(deP.filter(c => pagada(c) && c.estado !== 'rechazada')))}</td></tr>`;
            }).join('') + '</tbody></table></div>';

        // Por día
        const maximo = Math.max(1, ...[0, 1, 2, 3, 4, 5, 6].map(i => {
            const d = new Date(resLunes); d.setDate(d.getDate() + i);
            return activas.filter(c => c.fecha === fechaISO(d)).length;
        }));
        html += '<div class="panel-caja"><h2>Citas por día</h2><div class="res-dias">' +
            [0, 1, 2, 3, 4, 5, 6].map(i => {
                const d = new Date(resLunes); d.setDate(d.getDate() + i);
                const n = activas.filter(c => c.fecha === fechaISO(d)).length;
                return `<div class="res-dia"><span>${DIAS[d.getDay()].slice(0, 3)} ${d.getDate()}</span>` +
                    `<div class="res-barra"><i style="width:${n / maximo * 100}%"></i></div><strong>${n}</strong></div>`;
            }).join('') + '</div></div>';

        // Servicios más pedidos
        const conteo = {};
        activas.forEach(c => String(c.servicios).split(',').forEach(t => {
            const nombre = t.replace(/\(.*?\)/g, '').trim();
            if (nombre) conteo[nombre] = (conteo[nombre] || 0) + 1;
        }));
        const servicios = Object.entries(conteo).sort((a, b) => b[1] - a[1]);
        if (servicios.length) {
            html += '<div class="panel-caja"><h2>Servicios más pedidos</h2><ol class="res-servicios">' +
                servicios.slice(0, 5).map(([n, c]) => `<li>${esc(n)} <strong>(${c})</strong></li>`).join('') + '</ol></div>';
        }

        if (pendientes.some(c => c.fecha < fechaISO(new Date()))) {
            html += '<p class="panel-alerta">Hay citas pasadas que siguen como "por atender". Márcalas como atendidas en la pestaña Citas para que el resumen sea exacto.</p>';
        }
        $('resumenSemana').innerHTML = html;
    }

    // ========== CALENDARIO: horario especial de un día ==========
    let bloqueosActuales = [];
    let excepciones = [];
    let excepcionesActivas = false;
    let calMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    let diaElegido = null;

    const JORNADAS = [
        { id: 'manana', nombre: '☀️ Mañana', desde: 0, hasta: 720 },
        { id: 'mediodia', nombre: '🌤️ Mediodía', desde: 720, hasta: 780 },
        { id: 'tarde', nombre: '🌇 Tarde', desde: 780, hasta: 1080 },
        { id: 'noche', nombre: '🌙 Noche', desde: 1080, hasta: 1440 }
    ].map(j => Object.assign(j, { horas: HORAS_CITA.filter(h => aMinutos(h) >= j.desde && aMinutos(h) < j.hasta) }))
     .filter(j => j.horas.length);

    $('calProfesional').innerHTML = PROFESIONALES.map(p => `<option>${esc(p)}</option>`).join('');
    $('calProfesional').addEventListener('change', () => { $('calEditor').hidden = true; pintarCalendario(); });
    $('calAnterior').addEventListener('click', () => { calMes.setMonth(calMes.getMonth() - 1); pintarCalendario(); });
    $('calSiguiente').addEventListener('click', () => { calMes.setMonth(calMes.getMonth() + 1); pintarCalendario(); });

    function textoFecha(d) {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    function horasSemanales(profesional, fecha) {
        const filas = disponibilidad.filter(d => d.profesional === profesional);
        const [a, m, d] = fecha.split('-').map(Number);
        const dia = new Date(a, m - 1, d).getDay();
        if (!filas.length) return dia === 0 ? [] : HORAS_CITA.slice();
        const fila = filas.find(f => String(f.dia) === String(dia));
        return fila ? fila.horas.split(',').filter(Boolean) : [];
    }

    // Cómo queda un día (mismo orden de prioridad que el servidor)
    function estadoDia(profesional, fecha) {
        const excepcion = excepciones.find(x => x.fecha === fecha && x.profesional === profesional);
        if (excepcion) {
            const horas = excepcion.horas.split(',').filter(Boolean);
            return { tipo: horas.length ? 'especial' : 'cerrado', horas, motivo: excepcion.motivo, excepcion: true };
        }
        const bloqueo = bloqueosActuales.find(b => b.fecha === fecha && (b.profesional === profesional || b.profesional === 'Todos'));
        if (bloqueo) return { tipo: 'festivo', horas: [], motivo: bloqueo.motivo || 'Bloqueado', bloqueo };
        const horas = horasSemanales(profesional, fecha);
        return { tipo: horas.length ? 'normal' : 'cerrado', horas, motivo: horas.length ? '' : 'No atiende (horario semanal)' };
    }

    function resumenJornadas(horas) {
        const nombres = JORNADAS.filter(j => j.horas.some(h => horas.includes(h))).map(j => j.nombre.split(' ')[1]);
        return nombres.length === JORNADAS.length ? 'Todo el día' : nombres.join(' · ');
    }

    function citasDelDia(profesional, fecha) {
        return citas.filter(c => c.fecha === fecha && c.profesional === profesional && (c.estado === 'confirmada' || c.estado === 'pendiente'))
            .sort((a, b) => aMinutos(a.hora) - aMinutos(b.hora));
    }

    function pintarCalendario() {
        $('calSinExcepciones').hidden = excepcionesActivas;
        const profesional = $('calProfesional').value;
        const hoy = textoFecha(new Date());
        $('calTitulo').textContent = calMes.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });

        let html = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => `<div class="cal-cabecera">${d}</div>`).join('');
        const vacios = (calMes.getDay() + 6) % 7;   // la semana empieza el lunes
        for (let i = 0; i < vacios; i++) html += '<div class="cal-vacio"></div>';

        const diasMes = new Date(calMes.getFullYear(), calMes.getMonth() + 1, 0).getDate();
        for (let d = 1; d <= diasMes; d++) {
            const fecha = textoFecha(new Date(calMes.getFullYear(), calMes.getMonth(), d));
            const e = estadoDia(profesional, fecha);
            const nCitas = citasDelDia(profesional, fecha).length;
            const etiqueta = e.tipo === 'normal' || e.tipo === 'especial' ? resumenJornadas(e.horas)
                : e.tipo === 'festivo' ? e.motivo.replace(/^Festivo:\s*/, '')
                : (e.excepcion && e.motivo ? e.motivo : 'Sin atención');
            html += `
                <button type="button" class="cal-dia ${e.tipo}${fecha < hoy ? ' pasado' : ''}${fecha === hoy ? ' hoy' : ''}${fecha === diaElegido ? ' elegido' : ''}"
                        data-fecha="${fecha}" ${fecha < hoy ? 'disabled' : ''}>
                    <span class="cal-numero">${d}</span>
                    <span class="cal-etiqueta">${esc(etiqueta)}</span>
                    ${nCitas ? `<span class="cal-citas">${nCitas} cita${nCitas > 1 ? 's' : ''}</span>` : ''}
                </button>`;
        }
        $('calGrid').innerHTML = html;
        $('calGrid').querySelectorAll('.cal-dia:not([disabled])').forEach(b =>
            b.addEventListener('click', () => abrirDia(b.dataset.fecha)));
        if (diaElegido && !$('calEditor').hidden) abrirDia(diaElegido);
    }

    function abrirDia(fecha) {
        diaElegido = fecha;
        $('calGrid').querySelectorAll('.cal-dia').forEach(b => b.classList.toggle('elegido', b.dataset.fecha === fecha));
        const profesional = $('calProfesional').value;
        const e = estadoDia(profesional, fecha);

        $('calEditor').hidden = false;
        $('calEditorTitulo').textContent = `${fechaLarga(fecha)} · ${profesional}`;
        $('calEditorEstado').textContent = {
            normal: 'Horario normal de la semana: ' + resumenJornadas(e.horas) + '.',
            especial: 'Horario especial para este día: ' + resumenJornadas(e.horas) + '.',
            cerrado: (e.excepcion ? 'Día bloqueado manualmente' : 'Sin atención') + (e.motivo ? ': ' + e.motivo : '') + '.',
            festivo: e.motivo + '. Para atender este día, marca las horas y guarda.'
        }[e.tipo];

        const deEseDia = citasDelDia(profesional, fecha);
        $('calEditorCitas').hidden = !deEseDia.length;
        $('calEditorCitas').textContent = deEseDia.length
            ? `Hay ${deEseDia.length} cita${deEseDia.length > 1 ? 's' : ''} este día: ` +
              deEseDia.map(c => `${c.hora} (${c.nombre})`).join(', ') + '. Cerrar horas no cancela estas citas.'
            : '';

        $('calHoras').innerHTML = HORAS_CITA.map(h =>
            `<label class="cal-hora"><input type="checkbox" value="${h}" ${e.horas.includes(h) ? 'checked' : ''}> ${h}</label>`).join('');
        $('calMotivo').value = e.excepcion ? (e.motivo || '') : '';
        $('calTodos').checked = false;
        $('calHoras').querySelectorAll('input').forEach(c => c.addEventListener('change', pintarJornadas));
        pintarJornadas();

        ['calGuardar', 'calBloquear', 'calNormal'].forEach(id => { $(id).disabled = !excepcionesActivas; });
        $('calNormal').hidden = !(e.excepcion || (e.bloqueo && e.bloqueo.profesional !== 'Todos'));
        $('calEditor').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Botones de jornada: muestran si la jornada está abierta y la abren o cierran completa
    function pintarJornadas() {
        const marcadas = [...$('calHoras').querySelectorAll('input:checked')].map(c => c.value);
        $('calJornadas').innerHTML = JORNADAS.map(j => {
            const abiertas = j.horas.filter(h => marcadas.includes(h)).length;
            const clase = abiertas === j.horas.length ? 'abierta' : abiertas ? 'parcial' : '';
            const texto = abiertas === j.horas.length ? 'Abierta' : abiertas ? `${abiertas} de ${j.horas.length}` : 'Cerrada';
            return `<button type="button" class="cal-jornada ${clase}" data-jornada="${j.id}">
                        <strong>${j.nombre}</strong><span>${j.horas.length > 1 ? j.horas[0] + ' – ' + j.horas[j.horas.length - 1] : j.horas[0]}</span><em>${texto}</em>
                    </button>`;
        }).join('');
        $('calJornadas').querySelectorAll('.cal-jornada').forEach(b => b.addEventListener('click', () => {
            const j = JORNADAS.find(x => x.id === b.dataset.jornada);
            const casillas = [...$('calHoras').querySelectorAll('input')].filter(c => j.horas.includes(c.value));
            const abrir = casillas.some(c => !c.checked);
            casillas.forEach(c => { c.checked = abrir; });
            pintarJornadas();
        }));
    }

    function profesionalesElegidos() {
        return $('calTodos').checked ? PROFESIONALES : [$('calProfesional').value];
    }

    async function guardarDia(horas, mensaje) {
        try {
            for (const profesional of profesionalesElegidos()) {
                await api('guardarExcepcion', { fecha: diaElegido, profesional, horas, motivo: $('calMotivo').value });
            }
            await cargarDisponibilidad();
            estado(mensaje, 'ok');
        } catch (e) { /* mensaje mostrado */ }
    }

    $('calGuardar').addEventListener('click', () => {
        const horas = [...$('calHoras').querySelectorAll('input:checked')].map(c => c.value);
        guardarDia(horas, horas.length ? '✓ Horario especial guardado para ' + fechaLarga(diaElegido) + '.' : '✓ Día bloqueado.');
    });

    $('calBloquear').addEventListener('click', () => {
        if (!confirm('¿Bloquear todo el ' + fechaLarga(diaElegido) + '? Nadie podrá agendar ese día.')) return;
        guardarDia([], '✓ Día bloqueado: ' + fechaLarga(diaElegido) + '.');
    });

    $('calNormal').addEventListener('click', async () => {
        const profesional = $('calProfesional').value;
        const e = estadoDia(profesional, diaElegido);
        try {
            for (const p of profesionalesElegidos()) {
                await api('eliminarExcepcion', { fecha: diaElegido, profesional: p });
            }
            if (!e.excepcion && e.bloqueo && e.bloqueo.profesional !== 'Todos') {
                await api('eliminarBloqueo', { id: e.bloqueo.id });
            }
            await cargarDisponibilidad();
            estado('✓ El día volvió al horario normal.', 'ok');
        } catch (err) { /* mensaje mostrado */ }
    });

    $('calCerrar').addEventListener('click', () => {
        $('calEditor').hidden = true;
        diaElegido = null;
        pintarCalendario();
    });

    // Si ya había iniciado sesión en esta pestaña, entrar directo
    if (clave && apiActiva()) entrar();
})();


// ============================================================
// MI CITA: ver, cambiar o cancelar (cita.html?id=...&t=...)
// ============================================================
if (pagina('cita') && !pagina('responder')) (async function () {
    const $ = id => document.getElementById(id);
    const parametros = new URLSearchParams(location.search);
    const id = parametros.get('id') || '';
    const token = parametros.get('t') || '';
    let cita = null;
    let penalizacionSiCancela = 0;

    function mensaje(texto, tipo) {
        $('citaMensaje').textContent = texto;
        $('citaMensaje').hidden = !texto;
        $('citaMensaje').className = 'aviso-prueba' + (tipo ? ' cita-mensaje-' + tipo : '');
    }

    function fechaLarga(fecha) {
        const [a, m, d] = fecha.split('-').map(Number);
        const texto = new Date(a, m - 1, d).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        return texto.charAt(0).toUpperCase() + texto.slice(1);
    }

    function detalleGestion() {
        return 'Cambiar o cancelar: ' + location.href;
    }

    async function cargar() {
        if (!apiActiva()) { $('citaTitulo').textContent = 'Servicio no disponible'; return mensaje('La gestión de citas todavía no está configurada.', 'error'); }
        if (!id || !token) { $('citaTitulo').textContent = 'Enlace incompleto'; return mensaje('Usa el enlace que te enviamos por correo.', 'error'); }
        let r;
        try { r = await llamarAPI('verCita', { id, token }); }
        catch (e) { $('citaTitulo').textContent = 'Sin conexión'; return mensaje('No se pudo conectar. Revisa tu internet e intenta de nuevo.', 'error'); }
        if (!r.ok) { $('citaTitulo').textContent = 'Cita no encontrada'; return mensaje(r.error, 'error'); }

        cita = r.cita;
        $('citaTitulo').textContent = 'Hola, ' + cita.nombre.split(' ')[0];
        $('citaSubtitulo').textContent = 'Estos son los datos de tu cita.';
        $('citaFecha').textContent = fechaLarga(cita.fecha);
        $('citaHora').textContent = cita.hora;
        $('citaProfesional').textContent = cita.profesional;
        $('citaServicios').textContent = cita.servicios;
        $('citaEstado').textContent = ESTADOS_CITA[cita.estado] || cita.estado;
        $('citaEstado').className = 'cita-estado ' + cita.estado;
        $('citaNumero').textContent = cita.numero || cita.id;
        $('citaTotal').textContent = Number(cita.valor) ? pesosCOP(cita.valor) : '—';
        $('citaPago').textContent = cita.pago === 'pagado' ? '✓ Pagado' : 'Pendiente';
        $('citaPago').className = cita.pago === 'pagado' ? 'cita-pagado' : 'cita-sin-pago';
        penalizacionSiCancela = r.penalizacionSiCancela || 0;

        const activa = cita.estado === 'confirmada' || cita.estado === 'pendiente';
        $('citaCalendario').hidden = !activa;
        $('citaGoogle').href = enlaceGoogleCalendar(cita, detalleGestion());
        $('citaGestion').hidden = !(activa && (r.puedeCambiar || r.puedeCancelar));
        $('citaCambiar').hidden = !r.puedeCambiar;
        $('citaNota').textContent = !activa ? 'Si quieres una nueva cita, puedes agendarla en nuestra página.'
            : r.puedeCambiar ? `Puedes cambiar o cancelar tu cita sin costo hasta ${r.horasMinimas} horas antes.`
            : `Faltan menos de ${r.horasMinimas} horas para tu cita: ya no se puede cambiar, y si cancelas se cobra una penalización del 50 %` +
              (penalizacionSiCancela ? ` (${pesosCOP(penalizacionSiCancela)})` : '') + '.';

        const info = [];
        if (cita.estado === 'pendiente') info.push('Tu reserva está pendiente: el profesional la aceptará o rechazará y te avisaremos por correo.');
        if (activa && cita.pago !== 'pagado') info.push('Recuerda realizar el pago antes de 12 horas de tu cita; si no, se da por cancelada.');
        if (cita.nota) info.push(cita.nota + '.');
        if (Number(cita.penalizacion)) info.push('Penalización por cancelación tardía: ' + pesosCOP(cita.penalizacion) + '.');
        $('citaInfo').textContent = info.join(' ');
        $('citaInfo').hidden = !info.length;
        $('citaPoliticas').innerHTML = (r.politicas || []).map(t => `<li>${esc(t)}</li>`).join('');
        $('citaDetalle').hidden = false;
        $('citaCambio').hidden = true;
    }

    $('citaIcs').addEventListener('click', () => descargarICS(cita, detalleGestion()));
    $('citaPdf').addEventListener('click', () => descargarComprobante(id, token)
        .catch(e => mensaje(/fetch/i.test(e.message) ? 'No se pudo conectar. Intenta de nuevo.' : e.message, 'error')));

    // Cancelar
    $('citaCancelar').addEventListener('click', async () => {
        const texto = penalizacionSiCancela
            ? `Faltan menos de 12 horas para tu cita. Si cancelas ahora se cobra una penalización del 50 %: ${pesosCOP(penalizacionSiCancela)}.\n\n¿Quieres cancelar de todos modos?`
            : '¿Seguro que quieres cancelar tu cita? La hora quedará libre para otra persona.';
        if (!confirm(texto)) return;
        $('citaCancelar').disabled = true;
        try {
            const r = await llamarAPI('cancelarCita', { id, token, aceptaPenalizacion: !!penalizacionSiCancela });
            if (!r.ok) throw new Error(r.error);
            await cargar();
            mensaje('✓ Tu cita fue cancelada' + (r.penalizacion ? ` con una penalización de ${pesosCOP(r.penalizacion)}` : ' sin costo') +
                '. Te enviamos un correo de confirmación.', 'ok');
        } catch (e) {
            mensaje(/fetch/i.test(e.message) ? 'No se pudo conectar. Intenta de nuevo.' : e.message, 'error');
        } finally { $('citaCancelar').disabled = false; }
    });

    // Cambiar
    const hoy = new Date();
    $('nuevaFecha').min = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

    $('citaCambiar').addEventListener('click', () => {
        $('citaDetalle').hidden = true;
        $('citaCambio').hidden = false;
        mensaje('');
    });
    $('citaVolver').addEventListener('click', () => { $('citaCambio').hidden = true; $('citaDetalle').hidden = false; });

    let consulta = 0;
    $('nuevaFecha').addEventListener('change', async () => {
        const select = $('nuevaHora');
        $('citaConfirmarCambio').disabled = true;
        quitarAviso(select);
        if (!$('nuevaFecha').value) return;
        const actual = ++consulta;
        select.disabled = true;
        select.innerHTML = '<option value="">Buscando horas libres...</option>';
        try {
            const r = await llamarAPI('horarios', {
                fecha: $('nuevaFecha').value, profesional: cita.profesional, duracion: cita.duracion,
                horas: HORAS_CITA, excluirId: id
            });
            if (actual !== consulta) return;
            if (!r.ok) throw new Error(r.error);
            if (!r.abierto) {
                select.innerHTML = '<option value="">Sin atención este día</option>';
                return mostrarAviso(select, r.motivo || 'No hay atención este día. Elige otra fecha.');
            }
            const libres = r.horas.filter(h => h.libre);
            select.innerHTML = '<option value="">Selecciona una hora</option>' + r.horas.map(h =>
                `<option value="${esc(h.hora)}" ${h.libre ? '' : 'disabled'}>${esc(h.hora)}${h.libre ? '' : ' (' + esc(MOTIVOS_HORA[h.motivo] || 'no disponible') + ')'}</option>`).join('');
            select.disabled = false;
            if (!libres.length) mostrarAviso(select, 'No quedan horas libres este día. Prueba otra fecha.');
        } catch (e) {
            select.innerHTML = '<option value="">Error al buscar horas</option>';
            mostrarAviso(select, 'No se pudieron consultar las horas. Intenta de nuevo.');
        }
    });
    $('nuevaHora').addEventListener('change', () => { $('citaConfirmarCambio').disabled = !$('nuevaHora').value; });

    $('citaConfirmarCambio').addEventListener('click', async () => {
        const boton = $('citaConfirmarCambio');
        boton.disabled = true;
        boton.textContent = 'Cambiando...';
        try {
            const r = await llamarAPI('reprogramarCita', { id, token, fecha: $('nuevaFecha').value, hora: $('nuevaHora').value });
            if (!r.ok) throw new Error(r.error);
            await cargar();
            mensaje('✓ Tu cita fue cambiada. Te enviamos un correo con los nuevos datos.', 'ok');
        } catch (e) {
            mostrarAviso($('nuevaHora'), /fetch/i.test(e.message) ? 'No se pudo conectar. Intenta de nuevo.' : e.message);
            $('nuevaFecha').dispatchEvent(new Event('change'));
        } finally {
            boton.textContent = 'Confirmar cambio';
        }
    });

    cargar();
})();


// ============================================================
// ACEPTAR O RECHAZAR UNA CITA (responder.html?id=...&k=...)
// Enlace que le llega al profesional por correo.
// ============================================================
if (pagina('responder')) (async function () {
    const $ = id => document.getElementById(id);
    const parametros = new URLSearchParams(location.search);
    const id = parametros.get('id') || '';
    const k = parametros.get('k') || '';
    let cita = null;

    function mensaje(texto, tipo) {
        $('respMensaje').textContent = texto;
        $('respMensaje').hidden = !texto;
        $('respMensaje').className = 'aviso-prueba' + (tipo ? ' cita-mensaje-' + tipo : '');
    }

    function fechaLarga(fecha) {
        const [a, m, d] = fecha.split('-').map(Number);
        const t = new Date(a, m - 1, d).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        return t.charAt(0).toUpperCase() + t.slice(1);
    }

    function pintar() {
        $('respTitulo').textContent = 'Solicitud de cita N.º ' + (cita.numero || cita.id);
        $('respPaciente').textContent = cita.nombre;
        $('respContacto').textContent = `${cita.telefono} · ${cita.correo}`;
        $('respFecha').textContent = `${fechaLarga(cita.fecha)} · ${cita.hora} (${cita.duracion} min)`;
        $('respProfesional').textContent = cita.profesional;
        $('respServicios').textContent = cita.servicios;
        $('respTotal').textContent = Number(cita.valor) ? pesosCOP(cita.valor) : '—';
        $('respMensajePaciente').textContent = cita.mensaje || '—';
        $('respEstado').textContent = ESTADOS_CITA[cita.estado] || cita.estado;
        $('respEstado').className = 'cita-estado ' + cita.estado;
        $('respAcciones').hidden = cita.estado !== 'pendiente';
        $('respDetalle').hidden = false;

        const telefono = String(cita.telefono).replace(/\D/g, '');
        const nombre = cita.nombre.split(' ')[0];
        const texto = cita.estado === 'confirmada'
            ? `Hola ${nombre}, te confirmamos tu cita N.º ${cita.numero} el ${fechaLarga(cita.fecha)} a las ${cita.hora} con ${cita.profesional}. Recuerda realizar el pago de ${pesosCOP(cita.valor)} antes de 12 horas de la cita y enviarnos el comprobante.`
            : `Hola ${nombre}, lamentamos no poder atenderte el ${fechaLarga(cita.fecha)} a las ${cita.hora}. ¿Te gustaría elegir otro horario?`;
        $('respWhatsApp').hidden = !(telefono && (cita.estado === 'confirmada' || cita.estado === 'rechazada'));
        $('respWhatsApp').href = `https://wa.me/${telefono}?text=${encodeURIComponent(texto)}`;
    }

    async function cargar() {
        if (!apiActiva()) return mensaje('La base de datos no está configurada.', 'error');
        try {
            const r = await llamarAPI('verCitaPro', { id, k });
            if (!r.ok) { $('respTitulo').textContent = 'Enlace no válido'; return mensaje(r.error, 'error'); }
            cita = r.cita;
            pintar();
        } catch (e) {
            $('respTitulo').textContent = 'Sin conexión';
            mensaje('No se pudo conectar. Intenta de nuevo.', 'error');
        }
    }

    async function responder(decision) {
        let motivo = '';
        if (decision === 'rechazar') {
            motivo = $('respMotivo').value.trim();
            if (!confirm('¿Rechazar esta cita? Se le enviará un correo al paciente y la hora quedará libre.')) return;
        }
        $('respAceptar').disabled = $('respRechazar').disabled = true;
        try {
            const r = await llamarAPI('responderCita', { id, k, decision, motivo });
            if (!r.ok) throw new Error(r.error);
            await cargar();
            mensaje(decision === 'aceptar'
                ? '✓ Cita aceptada. Le enviamos un correo al paciente. Si quieres, avísale también por WhatsApp.'
                : '✓ Cita rechazada. Le enviamos un correo al paciente y la hora quedó libre.', 'ok');
        } catch (e) {
            mensaje(/fetch/i.test(e.message) ? 'No se pudo conectar. Intenta de nuevo.' : e.message, 'error');
        } finally {
            $('respAceptar').disabled = $('respRechazar').disabled = false;
        }
    }

    $('respAceptar').addEventListener('click', () => responder('aceptar'));
    $('respRechazar').addEventListener('click', () => responder('rechazar'));
    cargar();
})();
