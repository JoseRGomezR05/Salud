// Función para copiar texto al portapapeles
function copiarAlPortapapeles(elementId, nombre) {
    const elemento = document.getElementById(elementId);
    const texto = elemento.textContent;
    
    // Validar que no sea un placeholder
    if (texto.startsWith('TU_')) {
        alert('⚠️ Por favor, actualiza este campo con tu información real');
        return;
    }
    
    navigator.clipboard.writeText(texto).then(() => {
        mostrarNotificacion(`✓ ${nombre} copiado correctamente`, 'success');
    }).catch(err => {
        console.error('Error al copiar:', err);
        mostrarNotificacion('Error al copiar. Intenta de nuevo.', 'error');
    });
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'info') {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion notificacion-${tipo}`;
    notificacion.innerHTML = `
        <div class="notificacion-content">
            ${mensaje}
        </div>
    `;
    
    document.body.appendChild(notificacion);
    
    // Animar entrada
    setTimeout(() => {
        notificacion.classList.add('mostrar');
    }, 10);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notificacion.classList.remove('mostrar');
        setTimeout(() => {
            notificacion.remove();
        }, 300);
    }, 3000);
}

// Efectos de carga
document.addEventListener('DOMContentLoaded', function() {
    // Animar tarjetas al cargar
    const tarjetas = document.querySelectorAll('.payment-card');
    tarjetas.forEach((tarjeta, index) => {
        tarjeta.style.opacity = '0';
        tarjeta.style.animation = `fadeIn 0.6s ease-out ${index * 0.1}s forwards`;
    });

    // Validar que los datos estén completos
    validarDatosCompletos();
});

// Función para validar si todos los datos están completos
function validarDatosCompletos() {
    const campos = document.querySelectorAll('.detail-value');
    let conPlaceholders = false;

    campos.forEach(campo => {
        if (campo.textContent.startsWith('TU_')) {
            conPlaceholders = true;
            campo.parentElement.style.opacity = '0.6';
        }
    });

    if (conPlaceholders) {
        console.warn('⚠️ Existen campos que necesitan ser actualizados con información real');
    }
}

// Scroll suave para enlaces internos
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Añadir efecto hover a las imágenes QR
const qrImages = document.querySelectorAll('.qr-image');
qrImages.forEach(img => {
    img.addEventListener('mouseover', function() {
        this.style.transform = 'scale(1.05) rotate(2deg)';
    });
    img.addEventListener('mouseout', function() {
        this.style.transform = 'scale(1) rotate(0deg)';
    });
});

// Detectar navegación activa
function marcarNavegacionActiva() {
    const paginaActual = window.location.pathname.split('/').pop();
    const links = document.querySelectorAll('.nav-links a');
    
    links.forEach(link => {
        link.parentElement.classList.remove('active');
        if (link.getAttribute('href') === paginaActual || 
            link.getAttribute('href') === 'pagos.html') {
            link.parentElement.classList.add('active');
        }
    });
}

marcarNavegacionActiva();