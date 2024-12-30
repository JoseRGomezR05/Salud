// Actualización del código JavaScript para el manejo del formulario
document.getElementById('booking-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Recoger los servicios seleccionados
    const selectedServices = Array.from(document.querySelectorAll('.service-checkbox'))
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.parentElement.querySelector('h3').textContent);

    // Si no hay servicios seleccionados, mostrar mensaje
    if (selectedServices.length === 0) {
        alert('Por favor selecciona al menos un servicio');
        return;
    }

    // Recoger los datos del formulario
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const message = document.getElementById('message').value;

    // Calcular el precio total
    const totalPrice = Array.from(document.querySelectorAll('.service-checkbox'))
        .filter(checkbox => checkbox.checked)
        .reduce((total, checkbox) => total + parseInt(checkbox.dataset.price), 0);

    // Formatear el mensaje para WhatsApp
    const whatsappMessage = `¡Hola! Quisiera agendar una cita:
    
*Datos del paciente:*
📋 Nombre: ${name}
📧 Email: ${email}
📱 Teléfono: ${phone}
📅 Fecha: ${date}
⏰ Hora: ${time}

*Servicios seleccionados:*
${selectedServices.map(service => `✓ ${service}`).join('\n')}

💰 Precio Total: $${totalPrice}

${message ? `*Mensaje adicional:*\n${message}` : ''}`;

    // Codificar el mensaje para URL
    const encodedMessage = encodeURIComponent(whatsappMessage);

    // Abrir WhatsApp con el mensaje
    window.open(`https://wa.me/TUNUMERODEWHATSAPP?text=${encodedMessage}`);

    // Limpiar el formulario
    this.reset();
    // Limpiar selección de servicios
    document.querySelectorAll('.service-card').forEach(card => {
        card.classList.remove('selected-service');
    });
    document.querySelectorAll('.service-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    updateServicesSummary();
});

// Función mejorada para actualizar el resumen de servicios
function updateServicesSummary() {
    const checkboxes = document.querySelectorAll('.service-checkbox');
    const summaryDiv = document.getElementById('selected-services-summary');
    const summaryList = document.getElementById('selected-services-list');
    const totalPriceSpan = document.getElementById('total-price');
    
    let totalPrice = 0;
    let selectedServices = [];

    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            const card = checkbox.parentElement;
            const serviceName = card.querySelector('h3').textContent;
            const price = parseInt(checkbox.dataset.price);
            const duration = checkbox.dataset.duration;
            
            selectedServices.push({
                name: serviceName,
                price: price,
                duration: duration
            });
            
            totalPrice += price;
        }
    });

    if (selectedServices.length > 0) {
        summaryDiv.style.display = 'block';
        summaryList.innerHTML = selectedServices.map(service => 
            `<p>${service.name} - $${service.price} (${service.duration} min)</p>`
        ).join('');
        totalPriceSpan.textContent = totalPrice;
    } else {
        summaryDiv.style.display = 'block'; // Cambio aquí para siempre mostrar el resumen
        summaryList.innerHTML = '<p>Ningún servicio seleccionado</p>';
        totalPriceSpan.textContent = '0';
    }
}

// Actualización del HTML para el formulario