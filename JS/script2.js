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
    const selectedDate = new Date(dateInput.value);
    const dayOfWeek = selectedDate.getDay();
    
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