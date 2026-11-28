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
// Cada cita se ofrece cada 45 minutos. Qué horas atiende cada profesional
// se marca en el panel (pestaña Disponibilidad).
const HORAS_CITA = [
    '8:00 AM', '8:45 AM', '9:30 AM', '10:15 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '1:45 PM', '2:30 PM', '3:15 PM', '4:00 PM',
    '6:00 PM', '6:45 PM', '7:30 PM', '8:15 PM'
];

// Profesionales (el nombre debe ser igual al de las tarjetas de Agendas.html)
const PROFESIONALES = [
    'José Rafael Gómez',
    'Laura Torregrosa Sanjuanelo'
];

// Datos que se muestran de cada profesional (asistente y página virtual)
const PROFESIONALES_INFO = {
    'José Rafael Gómez': { titulo: 'Psicólogo clínico', especialidad: 'Terapia individual, de pareja y familiar' },
    'Laura Torregrosa Sanjuanelo': { titulo: 'Psicóloga clínica', especialidad: 'Terapia infantil y juvenil, ansiedad' }
};

// Políticas e indicaciones que el paciente acepta al reservar.
// Deben ser iguales a POLITICAS e INDICACIONES de apps-script/Codigo.gs
// (allí se usan para el comprobante en PDF y los correos).
const POLITICAS = [
    'El pago se realiza antes de la cita. Si a las 12 horas antes de la cita no se ha recibido el pago, la cita se da por cancelada.',
    'Puedes cancelar o cambiar tu cita sin costo hasta 12 horas antes.',
    'Si cancelas con menos de 12 horas de anticipación o el mismo día, se cobra una penalización del 50 % del valor de la atención.',
    'Si no asistes a la cita sin avisar, no hay devolución del pago.'
];
const INDICACIONES = [
    'Llega 15 minutos antes de la hora de tu cita.',
    'Si tu cita es virtual, te enviaremos el enlace de la videollamada por WhatsApp. Conéctate desde un lugar tranquilo y privado.',
    'Tu reserva queda pendiente hasta que el profesional la acepte. Te avisaremos por correo.',
    'Envía el comprobante de pago por WhatsApp al 300 480 4521.'
];

// En los informes de empresas, un área con menos personas que este
// número no se muestra por separado, para proteger el anonimato.
const MINIMO_POR_AREA = 5;
