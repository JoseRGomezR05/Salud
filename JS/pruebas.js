// Mostrar fecha actual
var f = new Date();
document.getElementById('fecha').textContent = f.getDate() + "/" + (f.getMonth() + 1) + "/" + f.getFullYear();

// Función para desplegar/contraer pruebas
function togglePruebas(header) {
    const icon = header.querySelector('.toggle-icon');
    const lista = header.nextElementSibling;
    
    icon.classList.toggle('rotado');
    lista.classList.toggle('abierta');
}