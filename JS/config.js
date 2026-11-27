// ============================================================
// config.js — Configuración del sitio
// ============================================================

// URL de la aplicación web de Google Apps Script (termina en /exec).
// Mientras esté vacía, la agenda funciona como antes (todas las horas
// disponibles) y las evaluaciones de empresas no se pueden usar.
// Ver apps-script/INSTRUCCIONES.md.
const API_URL = 'https://script.google.com/macros/s/AKfycbxQw_CVKT1_ymMXNGmRE5aYD1ouEhG9d7wmjQdwunilK-CKcDGvlYmpnenHLTQzrVqE/exec';

// Dirección pública del sitio (GitHub Pages). Se usa para armar los
// enlaces de evaluación que se envían a las empresas.
const SITIO_URL = 'https://josergomezr05.github.io/Salud/';

// Horas que se ofrecen en la agenda (deben coincidir con Agendas.html)
const HORAS_CITA = [
    '8:00 AM', '8:45 AM', '9:30 AM', '10:15 AM', '11:00 AM',
    '1:00 PM', '1:45 PM', '2:30 PM', '3:15 PM', '4:00 PM', '4:45 PM', '5:30 PM'
];

// Profesionales (el nombre debe ser igual al de las tarjetas de Agendas.html)
const PROFESIONALES = [
    'José Rafael Gómez',
    'Laura Torregrosa Sanjuanelo',
    'Melissa Genis Ruiz'
];

// En los informes de empresas, un área con menos personas que este
// número no se muestra por separado, para proteger el anonimato.
const MINIMO_POR_AREA = 5;
