// Variables globales
const serviceCards = document.querySelectorAll('.service-card');
const submitButton = document.getElementById('submitButton');
const appointmentForm = document.getElementById('appointmentForm');
const modal = document.getElementById('confirmationModal');
const dateInput = document.getElementById('date');
const selectedServices = new Set();

// Número de WhatsApp del psicólogo
const WHATSAPP_NUMBER = '+573004804521';

// Configurar las restricciones de fecha
function configureDateInput() {
    // Obtener fecha actual
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Formatear fecha actual para el atributo min del input
    const minDate = today.toISOString().split('T')[0];
    
    // Configurar fecha mínima (no permite seleccionar días pasados)
    dateInput.min = minDate;
    
    // Agregar event listener para validar días de la semana
    dateInput.addEventListener('input', validateDate);
}

// Validar la fecha seleccionada
function validateDate(e) {
    const selectedDate = new Date(e.target.value);
    const dayOfWeek = selectedDate.getDay();
    
    // Si es domingo (0) o la fecha es anterior a hoy
    if (dayOfWeek === 6) {
        alert('Lo sentimos, no hay atención los domingos. Por favor seleccione otro día.');
        e.target.value = ''; // Limpiar la selección
        return false;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        alert('No se pueden seleccionar fechas pasadas.');
        e.target.value = ''; // Limpiar la selección
        return false;
    }
    
    return true;
}

// Manejador de selección de servicios
serviceCards.forEach(card => {
    card.addEventListener('click', () => {
        card.classList.toggle('selected');
        const serviceId = card.dataset.id;
        
        if (selectedServices.has(serviceId)) {
            selectedServices.delete(serviceId);
        } else {
            selectedServices.add(serviceId);
        }
        
        // Habilitar/deshabilitar botón según selección
        submitButton.disabled = selectedServices.size === 0;
    });
});

// Función para formatear fecha
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Función para obtener servicios seleccionados
function getSelectedServicesText() {
    return Array.from(serviceCards)
        .filter(card => card.classList.contains('selected'))
        .map(card => card.querySelector('h3').textContent)
        .join(', ');
}

// Función para generar mensaje de WhatsApp
function generateWhatsAppMessage(formData) {
    return encodeURIComponent(
        `🔵 *Nueva Reserva de Cita*\n\n` +
        `👤 *Nombre:* ${formData.name}\n` +
        `📞 *Teléfono:* ${formData.phone}\n` +
        `📧 *Email:* ${formData.email}\n` +
        `📅 *Fecha:* ${formatDate(formData.date)}\n` +
        `⏰ *Hora:* ${formData.time}\n` +
        `🔍 *Servicios:* ${getSelectedServicesText()}\n` +
        `💭 *Mensaje:* ${formData.message || 'No se incluyó mensaje adicional'}`
    );
}

// Función para abrir modal
function showModal() {
    modal.style.display = 'block';
}

// Función para cerrar modal
function closeModal() {
    modal.style.display = 'none';
}

// Manejador del envío del formulario
appointmentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Validar fecha antes de enviar
    const dateInput = document.getElementById('date');
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
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

    // Enviar a WhatsApp
    window.open(whatsappUrl, '_blank');

    // Mostrar modal de confirmación
    showModal();

    // Limpiar formulario
    appointmentForm.reset();
    serviceCards.forEach(card => card.classList.remove('selected'));
    selectedServices.clear();
    submitButton.disabled = true;
});

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    if (event.target === modal) {
        closeModal();
    }
}

// Inicializar las restricciones de fecha al cargar la página
document.addEventListener('DOMContentLoaded', configureDateInput);