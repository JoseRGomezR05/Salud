JavaScript

// Función para enviar correo electrónico (reemplaza con tu lógica de envío)
function sendEmail(name, phone, email, date, time, message) {
    // Reemplaza con tus credenciales de correo electrónico
    const serviceId = 'YOUR_SERVICE_ID'; 
    const templateId = 'YOUR_TEMPLATE_ID'; 
    const userId = 'YOUR_USER_ID'; 

    emailjs.init(userId);

    const templateParams = {
        to_name: name,
        from_name: 'Tu Nombre',
        to_email: email,
        phone: phone,
        date: date,
        time: time,
        message: message
    };

    emailjs.send(serviceId, templateId, templateParams)
        .then(function(response) {
            console.log('SUCCESS!', response.status, response.text);
            // Mostrar mensaje de confirmación al usuario
            showModal();
        }, function(error) {
            console.log('FAILED...', error);
            // Mostrar mensaje de error al usuario
            alert('Error al enviar el correo electrónico. Por favor, inténtalo nuevamente.');
        });
}

// Función para mostrar el modal de confirmación
function showModal() {
    const modal = document.getElementById('confirmationModal');
    modal.style.display = 'block';
}

// Función para cerrar el modal de confirmación
function closeModal() {
    const modal = document.getElementById('confirmationModal');
    modal.style.display = 'none';
}

// Obtener elementos del formulario
const appointmentForm = document.getElementById('appointmentForm');
const nameInput = document.getElementById('name');
const phoneInput = document.getElementById('phone');
const emailInput = document.getElementById('email');
const dateInput = document.getElementById('date');
const timeInput = document.getElementById('time');
const messageInput = document.getElementById('message');
const submitButton = document.getElementById('submitButton');

// Validar formulario
appointmentForm.addEventListener('input', () => {
    const isFormValid = nameInput.value && phoneInput.value && emailInput.value && dateInput.value && timeInput.value;
    submitButton.disabled = !isFormValid;
});

// Manejar envío del formulario
appointmentForm.