// Variables globales
const serviceCards = document.querySelectorAll('.service-card');
const submitButton = document.getElementById('submitButton');
const appointmentForm = document.getElementById('appointmentForm');
const modal = document.getElementById('confirmationModal');
const dateInput = document.getElementById('date');
const selectedServices = new Set();
const WHATSAPP_NUMBER = '+573004804521';

// Configurar las restricciones de fecha
function configureDateInput() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const minDate = today.toISOString().split('T')[0];
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    
    dateInput.min = minDate;
    dateInput.max = maxDate.toISOString().split('T')[0];
    
    dateInput.addEventListener('touchend', (e) => {
        e.preventDefault();
        dateInput.click();
    });
    
    dateInput.addEventListener('input', validateDate);
}

// Validar la fecha seleccionada
function validateDate(e) {
    const selectedDate = new Date(e.target.value);
    const dayOfWeek = selectedDate.getDay();
    
    if (dayOfWeek === 6 || dayOfWeek === 0) {
        alert('Lo sentimos, solo atendemos de lunes a viernes. Por favor seleccione otro día.');
        e.target.value = '';
        return false;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        alert('No se pueden seleccionar fechas pasadas.');
        e.target.value = '';
        return false;
    }
    
    return true;
}

// Función para formatear fecha
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
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
        
        updateServicesSummary();
        submitButton.disabled = selectedServices.size === 0;
    });
});

// Función para actualizar el resumen de servicios
function updateServicesSummary() {
    const summaryDiv = document.getElementById('selected-services-summary');
    const summaryList = document.getElementById('selected-services-list');
    const totalPriceSpan = document.getElementById('total-price');
    
    let totalPrice = 0;
    let selectedServicesList = [];

    serviceCards.forEach(card => {
        if (card.classList.contains('selected')) {
            const serviceName = card.querySelector('h3').textContent;
            const price = parseInt(card.dataset.price);
            const duration = card.dataset.duration || '60';
            
            selectedServicesList.push({
                name: serviceName,
                price: price,
                duration: duration
            });
            
            totalPrice += price;
        }
    });

    if (selectedServicesList.length > 0) {
        summaryDiv.style.display = 'block';
        summaryList.innerHTML = selectedServicesList.map(service => 
            `<p>${service.name} - $${service.price.toLocaleString()} (${service.duration} min)</p>`
        ).join('');
        totalPriceSpan.textContent = totalPrice.toLocaleString();
    } else {
        summaryDiv.style.display = 'block';
        summaryList.innerHTML = '<p>Ningún servicio seleccionado</p>';
        totalPriceSpan.textContent = '0';
    }
}

// Función para generar mensaje de WhatsApp
function generateWhatsAppMessage(formData, selectedServicesList, totalPrice) {
    return encodeURIComponent(
        `¡Hola! Quisiera agendar una cita:

*Datos del paciente:*
📋 Nombre: ${formData.name}
📧 Email: ${formData.email}
📱 Teléfono: ${formData.phone}
📅 Fecha: ${formatDate(formData.date)}
⏰ Hora: ${formData.time}

*Servicios seleccionados:*
${selectedServicesList.map(service => `✓ ${service.name} - $${service.price.toLocaleString()}`).join('\n')}

💰 Precio Total: $${totalPrice.toLocaleString()}

${formData.message ? `*Mensaje adicional:*\n${formData.message}` : ''}`
    );
}

// Manejador del envío del formulario
appointmentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (!validateDate({ target: dateInput })) {
        return;
    }
    
    // Recopilar servicios seleccionados y precio total
    let selectedServicesList = [];
    let totalPrice = 0;
    
    serviceCards.forEach(card => {
        if (card.classList.contains('selected')) {
            selectedServicesList.push({
                name: card.querySelector('h3').textContent,
                price: parseInt(card.dataset.price)
            });
            totalPrice += parseInt(card.dataset.price);
        }
    });

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
    const message = generateWhatsAppMessage(formData, selectedServicesList, totalPrice);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank');

    // Mostrar modal de confirmación
    showModal();

    // Limpiar formulario y selecciones
    appointmentForm.reset();
    serviceCards.forEach(card => card.classList.remove('selected'));
    selectedServices.clear();
    submitButton.disabled = true;
    updateServicesSummary();
});

// Funciones para el modal
function showModal() {
    modal.style.display = 'block';
}

function closeModal() {
    modal.style.display = 'none';
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    if (event.target === modal) {
        closeModal();
    }
}

// Inicializar las configuraciones al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    configureDateInput();
    updateServicesSummary();
});