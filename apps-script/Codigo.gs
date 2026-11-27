/**
 * ============================================================
 * Bienestar Emocional — Base de datos con Google Sheets
 * ============================================================
 * Este código se pega en Extensiones > Apps Script de una hoja
 * de cálculo de Google. Ver apps-script/INSTRUCCIONES.md.
 *
 * Hojas que usa (las crea la función instalar):
 *   Empresas        → empresas evaluadas y su enlace
 *   Respuestas      → resultados ANÓNIMOS de las evaluaciones
 *   Citas           → citas agendadas desde la página
 *   Disponibilidad  → días y horas de atención de cada profesional
 *   Bloqueos        → fechas sin atención (vacaciones, festivos)
 *   Excepciones     → horario especial de una fecha (por ejemplo, un
 *                     sábado en que solo se atiende en la tarde)
 *
 * Flujo de una cita: el paciente reserva → queda "pendiente" → el
 * profesional la acepta o rechaza (correo con botón o panel) → "confirmada".
 * El paciente recibe un comprobante en PDF con el total, los medios de
 * pago, las indicaciones y las políticas.
 *
 * Activadores automáticos (los crea la función instalar):
 *   enviarRecordatorios → cada día a las 7 a. m., citas de mañana
 *   revisarPagos        → cada hora, cancela las citas sin pago a tiempo
 *
 * La clave del panel se guarda en las Propiedades del script
 * (CLAVE_ADMIN), nunca en este archivo.
 * ============================================================
 */

const ZONA = 'America/Bogota';
const MINUTOS_POR_CITA = 45;   // separación entre las horas de la agenda
const SITIO_URL = 'https://josergomezr05.github.io/Salud/';
const HORAS_MINIMAS_CAMBIO = 12;   // el paciente puede cancelar o cambiar hasta 12 horas antes
const AVISAR_AL_DUENO = true;      // enviar un aviso por correo al dueño del script
const PENALIZACION_CANCELACION = 0.5;   // 50 % si cancela con menos de 12 horas
const PAGO_LIMITE_HORAS = 12;      // el pago debe estar hecho 12 horas antes de la cita
const CANCELAR_SIN_PAGO = true;    // cancelar automáticamente las citas sin pago a tiempo

// Textos del comprobante y de los correos (mantenerlos iguales a JS/config.js)
const INDICACIONES = [
  'Llega 15 minutos antes de la hora de tu cita.',
  'Si tu cita es virtual, te enviaremos el enlace de la videollamada por WhatsApp. Conéctate desde un lugar tranquilo y privado.',
  'Tu reserva queda pendiente hasta que el profesional la acepte. Te avisaremos por correo.',
  'Envía el comprobante de pago por WhatsApp al 300 480 4521.'
];
const POLITICAS = [
  'El pago se realiza antes de la cita. Si a las 12 horas antes de la cita no se ha recibido el pago, la cita se da por cancelada.',
  'Puedes cancelar o cambiar tu cita sin costo hasta 12 horas antes.',
  'Si cancelas con menos de 12 horas de anticipación o el mismo día, se cobra una penalización del 50 % del valor de la atención.',
  'Si no asistes a la cita sin avisar, no hay devolución del pago.'
];
const MEDIOS_PAGO = [
  ['Bancolombia', 'Cuenta 487-000054-76 · Llave @joseg9688'],
  ['Nequi', '300 480 4521'],
  ['Daviplata', '300 480 4521 · Llave @PLATA3004804521']
];
// Dos horas seguidas de la agenda con una separación de hasta 15 minutos
// se consideran parte de la misma jornada (ej. 11:00 → 12:00 → 1:00 PM).
const TOLERANCIA_JORNADA = 15;

const HOJAS = {
  Empresas: ['codigo', 'nombre', 'plan', 'pruebas', 'areas', 'limite', 'creada', 'estado'],
  Respuestas: ['fecha', 'empresa', 'participante', 'area', 'prueba', 'puntaje', 'nivel', 'respuestas'],
  Citas: ['id', 'creada', 'fecha', 'hora', 'duracion', 'profesional', 'servicios', 'nombre', 'telefono', 'correo', 'mensaje', 'estado',
          'valor', 'token', 'recordatorio', 'pago', 'penalizacion', 'numero', 'tokenPro', 'nota'],
  Disponibilidad: ['profesional', 'dia', 'horas'],
  Bloqueos: ['id', 'fecha', 'profesional', 'motivo'],
  // Horario especial de un día: reemplaza el horario semanal en esa fecha
  // (horas vacías = no atiende ese día)
  Excepciones: ['fecha', 'profesional', 'horas', 'motivo']
};

// ------------------------------------------------------------
// INSTALACIÓN (ejecutar una sola vez desde el editor)
// ------------------------------------------------------------
function instalar() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(HOJAS).forEach(nombre => {
    let hoja = libro.getSheetByName(nombre);
    if (!hoja) hoja = libro.insertSheet(nombre);
    const columnas = HOJAS[nombre];
    hoja.getRange(1, 1, 1, columnas.length).setValues([columnas]).setFontWeight('bold');
    hoja.setFrozenRows(1);
    // Todo como texto para que Sheets no convierta fechas, horas ni teléfonos
    hoja.getRange(1, 1, hoja.getMaxRows(), columnas.length).setNumberFormat('@');
  });
  const sobrante = libro.getSheetByName('Hoja 1') || libro.getSheetByName('Sheet1');
  if (sobrante && libro.getSheets().length > 1) libro.deleteSheet(sobrante);

  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('CLAVE_ADMIN')) {
    const clave = Utilities.getUuid().replace(/-/g, '').slice(0, 12);
    props.setProperty('CLAVE_ADMIN', clave);
    Logger.log('✅ Instalación lista. TU CLAVE DEL PANEL ES: ' + clave);
    Logger.log('Puedes cambiarla en Configuración del proyecto > Propiedades del script > CLAVE_ADMIN.');
  } else {
    Logger.log('✅ Hojas revisadas. La clave del panel ya existía y no se cambió.');
  }

  // Activador diario de recordatorios (7 a. m. hora de Colombia)
  const existe = ScriptApp.getProjectTriggers().some(t => t.getHandlerFunction() === 'enviarRecordatorios');
  if (!existe) {
    ScriptApp.newTrigger('enviarRecordatorios').timeBased().everyDays(1).atHour(7).inTimezone(ZONA).create();
    Logger.log('⏰ Recordatorios diarios activados (7 a. m.).');
  } else {
    Logger.log('⏰ Los recordatorios diarios ya estaban activados.');
  }

  // Activador cada hora: cancela las citas sin pago a tiempo
  const existePagos = ScriptApp.getProjectTriggers().some(t => t.getHandlerFunction() === 'revisarPagos');
  if (!existePagos) {
    ScriptApp.newTrigger('revisarPagos').timeBased().everyHours(1).create();
    Logger.log('💳 Revisión de pagos activada (cada hora).');
  }
  Logger.log('📧 Correos disponibles hoy: ' + MailApp.getRemainingDailyQuota());
}

// Envía un correo de prueba a tu propia cuenta (ejecútala desde el editor)
function probarCorreo() {
  const yo = Session.getEffectiveUser().getEmail();
  enviarCorreoCita({
    id: 'PRUEBA', fecha: hoyTexto(), hora: '6:00 PM', duracion: 60, profesional: 'José Rafael Gómez',
    servicios: 'Terapia Individual ($100.000)', nombre: 'Paciente de prueba', correo: yo, token: 'prueba',
    telefono: '300 000 0000', valor: 100000, numero: 'R-PRUEBA', estado: 'pendiente', pago: 'pendiente'
  }, 'solicitud');
  Logger.log('📧 Correo de prueba (con el comprobante PDF) enviado a ' + yo);
}

// ------------------------------------------------------------
// ENTRADA DE LA APLICACIÓN WEB
// ------------------------------------------------------------
function doGet() {
  return responder({ ok: true, mensaje: 'API de Bienestar Emocional funcionando.' });
}

function doPost(e) {
  let datos;
  try {
    datos = JSON.parse(e.postData.contents);
  } catch (err) {
    return responder({ ok: false, error: 'Solicitud no válida.' });
  }

  const publicas = {
    empresa: empresaPublica,
    enviarEvaluacion: enviarEvaluacion,
    horarios: horariosDisponibles,
    crearCita: crearCita,
    verCita: verCita,
    cancelarCita: cancelarCita,
    reprogramarCita: reprogramarCita,
    comprobante: comprobante,
    verCitaPro: verCitaPro,
    responderCita: responderCita
  };
  const privadas = {
    login: () => ({ ok: true }),
    listarEmpresas: listarEmpresas,
    crearEmpresa: crearEmpresa,
    cambiarEstadoEmpresa: cambiarEstadoEmpresa,
    resultados: resultadosEmpresa,
    borrarResultados: borrarResultados,
    eliminarEmpresa: eliminarEmpresa,
    listarCitas: listarCitas,
    cambiarEstadoCita: cambiarEstadoCita,
    responderCitaPanel: responderCitaPanel,
    marcarPago: marcarPago,
    leerDisponibilidad: leerDisponibilidad,
    guardarDisponibilidad: guardarDisponibilidad,
    agregarBloqueo: agregarBloqueo,
    eliminarBloqueo: eliminarBloqueo,
    guardarExcepcion: guardarExcepcion,
    eliminarExcepcion: eliminarExcepcion
  };

  try {
    if (publicas[datos.accion]) return responder(publicas[datos.accion](datos));
    if (privadas[datos.accion]) {
      if (!claveCorrecta(datos.clave)) {
        Utilities.sleep(1500);   // frena los intentos de adivinar la clave
        return responder({ ok: false, error: 'Clave incorrecta.', clave: false });
      }
      return responder(privadas[datos.accion](datos));
    }
    return responder({ ok: false, error: 'Acción desconocida.' });
  } catch (err) {
    return responder({ ok: false, error: String(err.message || err) });
  }
}

function responder(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto)).setMimeType(ContentService.MimeType.JSON);
}

function claveCorrecta(clave) {
  const real = PropertiesService.getScriptProperties().getProperty('CLAVE_ADMIN');
  return !!real && typeof clave === 'string' && clave === real;
}

// ------------------------------------------------------------
// UTILIDADES DE HOJAS
// ------------------------------------------------------------
function hoja(nombre) {
  const h = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nombre);
  if (!h) throw new Error('Falta la hoja "' + nombre + '". Ejecuta la función instalar.');
  return h;
}

// Igual que leer, pero devuelve [] si la hoja aún no existe
function leerSiExiste(nombre) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nombre) ? leer(nombre) : [];
}

function leer(nombre) {
  const valores = hoja(nombre).getDataRange().getValues();
  const columnas = valores.shift() || [];
  return valores
    .filter(fila => fila.some(v => v !== ''))
    .map(fila => {
      const obj = {};
      columnas.forEach((c, i) => { obj[c] = fila[i] === undefined ? '' : String(fila[i]); });
      return obj;
    });
}

// Reescribe la hoja completa (más rápido que borrar fila por fila)
function reescribir(nombre, filas) {
  const h = hoja(nombre);
  const columnas = HOJAS[nombre];
  const ultima = h.getLastRow();
  if (ultima > 1) h.getRange(2, 1, ultima - 1, columnas.length).clearContent();
  if (filas.length) {
    h.getRange(2, 1, filas.length, columnas.length)
      .setNumberFormat('@')
      .setValues(filas.map(f => columnas.map(c => f[c] === undefined ? '' : String(f[c]))));
  }
}

function agregar(nombre, filas) {
  if (!filas.length) return;
  const h = hoja(nombre);
  const columnas = HOJAS[nombre];
  h.getRange(h.getLastRow() + 1, 1, filas.length, columnas.length)
    .setNumberFormat('@')
    .setValues(filas.map(f => columnas.map(c => f[c] === undefined ? '' : String(f[c]))));
}

function conBloqueo(funcion) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { return funcion(); } finally { lock.releaseLock(); }
}

function ahora() {
  return Utilities.formatDate(new Date(), ZONA, 'yyyy-MM-dd HH:mm');
}

function texto(valor, maximo) {
  return String(valor === undefined || valor === null ? '' : valor).trim().slice(0, maximo || 200);
}

function codigoNuevo() {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let codigo = '';
  for (let i = 0; i < 8; i++) codigo += letras[Math.floor(Math.random() * letras.length)];
  return codigo;
}

// ------------------------------------------------------------
// EMPRESAS Y EVALUACIONES
// ------------------------------------------------------------
function buscarEmpresa(codigo) {
  return leer('Empresas').find(e => e.codigo === texto(codigo, 20).toUpperCase());
}

// Lo que ve el trabajador antes de responder (sin datos privados)
function empresaPublica(d) {
  const empresa = buscarEmpresa(d.codigo);
  if (!empresa) return { ok: false, error: 'El enlace de evaluación no es válido.' };
  if (empresa.estado !== 'abierta') return { ok: false, error: 'Esta evaluación ya está cerrada.' };
  return {
    ok: true,
    empresa: {
      nombre: empresa.nombre,
      pruebas: empresa.pruebas.split(',').filter(Boolean),
      areas: empresa.areas.split(',').map(a => a.trim()).filter(Boolean)
    }
  };
}

function enviarEvaluacion(d) {
  return conBloqueo(() => {
    const empresa = buscarEmpresa(d.codigo);
    if (!empresa || empresa.estado !== 'abierta') return { ok: false, error: 'Esta evaluación ya no está disponible.' };

    const permitidas = empresa.pruebas.split(',');
    const resultados = (d.resultados || []).filter(r => permitidas.indexOf(r.prueba) !== -1);
    if (!resultados.length) return { ok: false, error: 'No se recibieron respuestas.' };

    const filas = leer('Respuestas').filter(r => r.empresa === empresa.codigo);
    const participantes = {};
    filas.forEach(r => { participantes[r.participante] = true; });
    const limite = parseInt(empresa.limite, 10) || 0;
    if (limite && Object.keys(participantes).length >= limite) {
      return { ok: false, error: 'Ya se completó el número de participantes de esta evaluación.' };
    }

    const areas = empresa.areas.split(',').map(a => a.trim());
    const area = areas.indexOf(texto(d.area, 80)) !== -1 ? texto(d.area, 80) : 'Sin área';
    const participante = Utilities.getUuid().slice(0, 8);
    const fecha = ahora();

    agregar('Respuestas', resultados.map(r => ({
      fecha: fecha,
      empresa: empresa.codigo,
      participante: participante,
      area: area,
      prueba: texto(r.prueba, 40),
      puntaje: Number(r.puntaje) || 0,
      nivel: ['ok', 'leve', 'alto'].indexOf(r.nivel) !== -1 ? r.nivel : '',
      respuestas: JSON.stringify((r.respuestas || []).map(Number).slice(0, 60))
    })));
    return { ok: true };
  });
}

function listarEmpresas() {
  const respuestas = leer('Respuestas');
  const conteo = {};
  respuestas.forEach(r => {
    conteo[r.empresa] = conteo[r.empresa] || {};
    conteo[r.empresa][r.participante] = true;
  });
  return {
    ok: true,
    empresas: leer('Empresas').map(e => Object.assign(e, {
      participantes: Object.keys(conteo[e.codigo] || {}).length
    })).reverse()
  };
}

function crearEmpresa(d) {
  return conBloqueo(() => {
    const nombre = texto(d.nombre, 120);
    const pruebas = (d.pruebas || []).map(p => texto(p, 40)).filter(Boolean);
    if (!nombre || !pruebas.length) return { ok: false, error: 'Escribe el nombre y elige al menos una prueba.' };

    const existentes = leer('Empresas').map(e => e.codigo);
    let codigo = codigoNuevo();
    while (existentes.indexOf(codigo) !== -1) codigo = codigoNuevo();

    agregar('Empresas', [{
      codigo: codigo,
      nombre: nombre,
      plan: texto(d.plan, 20),
      pruebas: pruebas.join(','),
      areas: (d.areas || []).map(a => texto(a, 80).replace(/,/g, ' ')).filter(Boolean).join(','),
      limite: parseInt(d.limite, 10) || '',
      creada: ahora(),
      estado: 'abierta'
    }]);
    return { ok: true, codigo: codigo };
  });
}

function cambiarEstadoEmpresa(d) {
  return conBloqueo(() => {
    const empresas = leer('Empresas');
    const empresa = empresas.find(e => e.codigo === d.codigo);
    if (!empresa) return { ok: false, error: 'Empresa no encontrada.' };
    empresa.estado = d.estado === 'cerrada' ? 'cerrada' : 'abierta';
    reescribir('Empresas', empresas);
    return { ok: true };
  });
}

function resultadosEmpresa(d) {
  const empresa = buscarEmpresa(d.codigo);
  if (!empresa) return { ok: false, error: 'Empresa no encontrada.' };
  return { ok: true, empresa: empresa, respuestas: leer('Respuestas').filter(r => r.empresa === empresa.codigo) };
}

function borrarResultados(d) {
  return conBloqueo(() => {
    const todas = leer('Respuestas');
    const quedan = todas.filter(r => r.empresa !== d.codigo);
    reescribir('Respuestas', quedan);
    return { ok: true, borradas: todas.length - quedan.length };
  });
}

function eliminarEmpresa(d) {
  borrarResultados(d);
  return conBloqueo(() => {
    reescribir('Empresas', leer('Empresas').filter(e => e.codigo !== d.codigo));
    return { ok: true };
  });
}

// ------------------------------------------------------------
// AGENDA: DISPONIBILIDAD Y CITAS
// ------------------------------------------------------------
// "8:45 AM" → 525 minutos desde la medianoche
function aMinutos(hora) {
  const m = String(hora).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return -1;
  let h = parseInt(m[1], 10) % 12;
  if (m[3].toUpperCase() === 'PM') h += 12;
  return h * 60 + parseInt(m[2], 10);
}

function diaDeSemana(fecha) {
  const p = String(fecha).split('-').map(Number);
  return new Date(p[0], p[1] - 1, p[2]).getDay();
}

// Horas configuradas para un profesional en un día (null = sin configurar)
function horasDelDia(profesional, dia) {
  const fila = leer('Disponibilidad').find(r => r.profesional === profesional && String(r.dia) === String(dia));
  return fila ? fila.horas.split(',').map(h => h.trim()).filter(Boolean) : null;
}

function horariosDisponibles(d) {
  const fecha = texto(d.fecha, 10);
  const profesional = texto(d.profesional, 120);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || !profesional) return { ok: false, error: 'Faltan la fecha o el profesional.' };

  // 1) Un horario especial para ese día manda sobre todo lo demás
  const excepcion = leerSiExiste('Excepciones').find(x => x.fecha === fecha && x.profesional === profesional);
  let configuradas;
  if (excepcion) {
    configuradas = excepcion.horas.split(',').map(h => h.trim()).filter(Boolean);
    if (!configuradas.length) return { ok: true, abierto: false, motivo: excepcion.motivo || 'No hay atención este día.' };
  } else {
    // 2) Días bloqueados (festivos, vacaciones)
    const bloqueo = leer('Bloqueos').find(b => b.fecha === fecha && (b.profesional === profesional || b.profesional === 'Todos'));
    if (bloqueo) return { ok: true, abierto: false, motivo: bloqueo.motivo || 'No hay atención este día.' };
    // 3) Horario semanal
    configuradas = horasDelDia(profesional, diaDeSemana(fecha));
  }
  if (configuradas !== null && !configuradas.length) return { ok: true, abierto: false, motivo: 'No hay atención este día.' };

  const duracion = Math.max(MINUTOS_POR_CITA, parseInt(d.duracion, 10) || MINUTOS_POR_CITA);
  const ocupadas = intervalosOcupados(fecha, profesional, texto(d.excluirId, 20));
  const habilitadas = configuradas === null ? null
    : configuradas.map(aMinutos).filter(m => m >= 0).sort((a, b) => a - b);
  const esHoy = fecha === hoyTexto();
  const minutoActual = aMinutos(Utilities.formatDate(new Date(), ZONA, 'h:mm a'));

  const horas = (d.horas || []).map(h => {
    const inicio = aMinutos(h);
    const habilitada = configuradas === null ? true : configuradas.indexOf(h) !== -1;
    const alcanza = inicio + duracion <= finDeJornada(habilitadas, inicio);
    const ocupada = seCruza(inicio, inicio + duracion, ocupadas);
    const pasada = esHoy && inicio <= minutoActual;
    const motivo = !habilitada ? 'no disponible' : pasada ? 'ya pasó' : ocupada ? 'ocupada' : !alcanza ? 'no alcanza' : '';
    return { hora: h, libre: !motivo, habilitada: habilitada, motivo: motivo };
  });
  return { ok: true, abierto: true, horas: horas };
}

// Minuto en que termina la jornada continua que contiene "inicio".
// Ej.: horas 6:00, 6:45, 7:30 y 8:15 PM → la jornada termina a las 9:00 PM.
function finDeJornada(habilitadas, inicio) {
  if (habilitadas === null) return Infinity;   // sin horario configurado: no se limita
  let i = habilitadas.indexOf(inicio);
  if (i < 0) return -1;
  let fin = inicio + MINUTOS_POR_CITA;
  while (i + 1 < habilitadas.length && habilitadas[i + 1] <= fin + TOLERANCIA_JORNADA) {
    i++;
    fin = habilitadas[i] + MINUTOS_POR_CITA;
  }
  return fin;
}

function hoyTexto() {
  return Utilities.formatDate(new Date(), ZONA, 'yyyy-MM-dd');
}

function intervalosOcupados(fecha, profesional, excluirId) {
  return leer('Citas')
    .filter(c => c.fecha === fecha && c.profesional === profesional && c.estado !== 'cancelada' && c.estado !== 'rechazada' && (!excluirId || c.id !== excluirId))
    .map(c => {
      const inicio = aMinutos(c.hora);
      return [inicio, inicio + (parseInt(c.duracion, 10) || MINUTOS_POR_CITA)];
    });
}

function seCruza(inicio, fin, intervalos) {
  return intervalos.some(i => inicio < i[1] && fin > i[0]);
}

function crearCita(d) {
  return conBloqueo(() => {
    const fecha = texto(d.fecha, 10);
    const hora = texto(d.hora, 10);
    const profesional = texto(d.profesional, 120);
    const nombre = texto(d.nombre, 120);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || aMinutos(hora) < 0 || !profesional || !nombre) {
      return { ok: false, error: 'Faltan datos de la cita.' };
    }

    const disponible = horariosDisponibles({ fecha: fecha, profesional: profesional, duracion: d.duracion, horas: [hora] });
    if (!disponible.ok) return disponible;
    if (!disponible.abierto) return { ok: false, ocupado: true, error: disponible.motivo };
    if (!disponible.horas[0].libre) return { ok: false, ocupado: true, error: mensajeNoLibre(disponible.horas[0].motivo) };

    const todas = leer('Citas');
    const cita = {
      id: Utilities.getUuid().slice(0, 8),
      creada: ahora(),
      fecha: fecha,
      hora: hora,
      duracion: Math.max(MINUTOS_POR_CITA, parseInt(d.duracion, 10) || MINUTOS_POR_CITA),
      profesional: profesional,
      servicios: texto(d.servicios, 500),
      nombre: nombre,
      telefono: texto(d.telefono, 30),
      correo: texto(d.correo, 120),
      mensaje: texto(d.mensaje, 1000),
      estado: 'pendiente',
      valor: parseInt(d.valor, 10) || '',
      token: Utilities.getUuid().replace(/-/g, '').slice(0, 16),
      recordatorio: '',
      pago: 'pendiente',
      penalizacion: '',
      numero: 'R-' + ('00000' + (todas.length + 1)).slice(-5),
      tokenPro: Utilities.getUuid().replace(/-/g, '').slice(0, 20),
      nota: ''
    };
    agregar('Citas', [cita]);
    enviarCorreoCita(cita, 'solicitud');
    avisarDueno('Nueva solicitud de cita (por aceptar)', cita);
    return { ok: true, id: cita.id, token: cita.token, numero: cita.numero };
  });
}

function mensajeNoLibre(motivo) {
  if (motivo === 'no alcanza') return 'El servicio elegido no alcanza a terminar en ese horario. Por favor elige una hora más temprana.';
  if (motivo === 'ya pasó') return 'Esa hora ya pasó. Por favor elige otra.';
  if (motivo === 'no disponible') return 'Esa hora no está disponible. Por favor elige otra.';
  return 'Esa hora acaba de ser reservada. Por favor elige otra.';
}

const ACTIVAS = ['pendiente', 'confirmada'];

function pesos(n) {
  return '$' + String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// ------------------------------------------------------------
// EL PACIENTE GESTIONA SU CITA (cita.html?id=...&t=...)
// ------------------------------------------------------------
function buscarCitaConToken(d) {
  const citas = leer('Citas');
  const cita = citas.find(c => c.id === texto(d.id, 20));
  if (!cita || !cita.token || cita.token !== texto(d.token, 40)) return { citas: citas, cita: null };
  return { citas: citas, cita: cita };
}

// Fecha y hora de inicio de la cita como objeto Date (Colombia, UTC-5)
function inicioCita(cita) {
  const m = aMinutos(cita.hora);
  const hh = ('0' + Math.floor(m / 60)).slice(-2);
  const mm = ('0' + (m % 60)).slice(-2);
  return new Date(cita.fecha + 'T' + hh + ':' + mm + ':00-05:00');
}

function horasParaCita(cita) {
  return (inicioCita(cita).getTime() - Date.now()) / 3600000;
}

// Cambiar la fecha solo se permite con 12 horas o más de anticipación
function puedeCambiar(cita) {
  return ACTIVAS.indexOf(cita.estado) !== -1 && horasParaCita(cita) >= HORAS_MINIMAS_CAMBIO;
}

// Cancelar se permite hasta la hora de la cita (con penalización si faltan menos de 12 horas)
function puedeCancelar(cita) {
  return ACTIVAS.indexOf(cita.estado) !== -1 && horasParaCita(cita) > 0;
}

function penalizacionDe(cita) {
  return Math.round((Number(cita.valor) || 0) * PENALIZACION_CANCELACION);
}

function verCita(d) {
  const r = buscarCitaConToken(d);
  if (!r.cita) return { ok: false, error: 'No encontramos esta cita. Revisa el enlace.' };
  const c = r.cita;
  const conPenalizacion = puedeCancelar(c) && horasParaCita(c) < HORAS_MINIMAS_CAMBIO;
  return {
    ok: true,
    cita: {
      id: c.id, numero: c.numero, fecha: c.fecha, hora: c.hora, duracion: c.duracion, profesional: c.profesional,
      servicios: c.servicios, nombre: c.nombre, estado: c.estado, valor: c.valor, pago: c.pago,
      penalizacion: c.penalizacion, nota: c.nota
    },
    puedeCambiar: puedeCambiar(c),
    puedeCancelar: puedeCancelar(c),
    penalizacionSiCancela: conPenalizacion ? penalizacionDe(c) : 0,
    horasMinimas: HORAS_MINIMAS_CAMBIO,
    politicas: POLITICAS
  };
}

function cancelarCita(d) {
  return conBloqueo(() => {
    const r = buscarCitaConToken(d);
    if (!r.cita) return { ok: false, error: 'No encontramos esta cita. Revisa el enlace.' };
    if (!puedeCancelar(r.cita)) return { ok: false, error: 'Esta cita ya no se puede cancelar en línea. Escríbenos por WhatsApp.' };

    const tarde = horasParaCita(r.cita) < HORAS_MINIMAS_CAMBIO;
    if (tarde && penalizacionDe(r.cita) > 0 && d.aceptaPenalizacion !== true) {
      return { ok: false, requierePenalizacion: true, penalizacion: penalizacionDe(r.cita),
               error: 'Faltan menos de ' + HORAS_MINIMAS_CAMBIO + ' horas: la cancelación tiene una penalización del 50 %.' };
    }
    r.cita.estado = 'cancelada';
    r.cita.penalizacion = tarde ? penalizacionDe(r.cita) : '';
    r.cita.nota = tarde ? 'Cancelada por el paciente con menos de ' + HORAS_MINIMAS_CAMBIO + ' horas (penalización 50 %)'
                        : 'Cancelada por el paciente';
    reescribir('Citas', r.citas);
    enviarCorreoCita(r.cita, 'cancelacion');
    avisarDueno(tarde ? 'Cita cancelada con penalización' : 'Cita cancelada por el paciente', r.cita);
    return { ok: true, penalizacion: r.cita.penalizacion || 0 };
  });
}

function reprogramarCita(d) {
  return conBloqueo(() => {
    const r = buscarCitaConToken(d);
    if (!r.cita) return { ok: false, error: 'No encontramos esta cita. Revisa el enlace.' };
    if (!puedeCambiar(r.cita)) return { ok: false, error: 'Esta cita ya no se puede cambiar en línea. Escríbenos por WhatsApp.' };

    const fecha = texto(d.fecha, 10);
    const hora = texto(d.hora, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || aMinutos(hora) < 0) return { ok: false, error: 'Elige una fecha y una hora.' };

    const disponible = horariosDisponibles({
      fecha: fecha, profesional: r.cita.profesional, duracion: r.cita.duracion, horas: [hora], excluirId: r.cita.id
    });
    if (!disponible.ok) return disponible;
    if (!disponible.abierto) return { ok: false, ocupado: true, error: disponible.motivo };
    if (!disponible.horas[0].libre) return { ok: false, ocupado: true, error: mensajeNoLibre(disponible.horas[0].motivo) };

    const anterior = r.cita.fecha + ' ' + r.cita.hora;
    r.cita.fecha = fecha;
    r.cita.hora = hora;
    r.cita.recordatorio = '';
    reescribir('Citas', r.citas);
    enviarCorreoCita(r.cita, 'cambio');
    avisarDueno('Cita cambiada por el paciente (antes: ' + anterior + ')', r.cita);
    return { ok: true };
  });
}

// PDF del comprobante para descargar desde la página
function comprobante(d) {
  const r = buscarCitaConToken(d);
  if (!r.cita) return { ok: false, error: 'No encontramos esta cita.' };
  const pdf = pdfComprobante(r.cita);
  return { ok: true, nombre: pdf.getName(), base64: Utilities.base64Encode(pdf.getBytes()) };
}

// ------------------------------------------------------------
// EL PROFESIONAL ACEPTA O RECHAZA (responder.html?id=...&k=...)
// ------------------------------------------------------------
function buscarCitaPro(d) {
  const citas = leer('Citas');
  const cita = citas.find(c => c.id === texto(d.id, 20));
  if (!cita || !cita.tokenPro || cita.tokenPro !== texto(d.k, 40)) return { citas: citas, cita: null };
  return { citas: citas, cita: cita };
}

function verCitaPro(d) {
  const r = buscarCitaPro(d);
  if (!r.cita) return { ok: false, error: 'Enlace no válido.' };
  const c = r.cita;
  return { ok: true, cita: {
    id: c.id, numero: c.numero, fecha: c.fecha, hora: c.hora, duracion: c.duracion, profesional: c.profesional,
    servicios: c.servicios, nombre: c.nombre, telefono: c.telefono, correo: c.correo, mensaje: c.mensaje,
    estado: c.estado, valor: c.valor, pago: c.pago
  } };
}

function responderCita(d) {
  return conBloqueo(() => {
    const r = buscarCitaPro(d);
    if (!r.cita) return { ok: false, error: 'Enlace no válido.' };
    return aplicarRespuesta(r.citas, r.cita, d.decision, d.motivo);
  });
}

function responderCitaPanel(d) {
  return conBloqueo(() => {
    const citas = leer('Citas');
    const cita = citas.find(c => c.id === d.id);
    if (!cita) return { ok: false, error: 'Cita no encontrada.' };
    return aplicarRespuesta(citas, cita, d.decision, d.motivo);
  });
}

function aplicarRespuesta(citas, cita, decision, motivo) {
  if (cita.estado !== 'pendiente') return { ok: false, error: 'Esta cita ya fue respondida (estado: ' + cita.estado + ').' };
  if (decision === 'aceptar') {
    cita.estado = 'confirmada';
    reescribir('Citas', citas);
    enviarCorreoCita(cita, 'aceptada');
  } else if (decision === 'rechazar') {
    cita.estado = 'rechazada';
    cita.nota = texto(motivo, 300) || 'Rechazada por el profesional';
    reescribir('Citas', citas);
    enviarCorreoCita(cita, 'rechazada');
  } else {
    return { ok: false, error: 'Decisión no válida.' };
  }
  return { ok: true, estado: cita.estado, telefono: cita.telefono, nombre: cita.nombre };
}

function marcarPago(d) {
  return conBloqueo(() => {
    const citas = leer('Citas');
    const cita = citas.find(c => c.id === d.id);
    if (!cita) return { ok: false, error: 'Cita no encontrada.' };
    const antes = cita.pago;
    cita.pago = d.pago === 'pagado' ? 'pagado' : 'pendiente';
    reescribir('Citas', citas);
    if (cita.pago === 'pagado' && antes !== 'pagado') enviarCorreoCita(cita, 'pago');
    return { ok: true };
  });
}

// La ejecuta el activador cada hora: cancela las citas que no se pagaron a tiempo
function revisarPagos() {
  if (!CANCELAR_SIN_PAGO) return 0;
  return conBloqueo(() => {
    const citas = leer('Citas');
    const ahoraMs = Date.now();
    let canceladas = 0;
    citas.forEach(c => {
      if (ACTIVAS.indexOf(c.estado) === -1 || c.pago === 'pagado') return;
      const horas = horasParaCita(c);
      // Margen de 2 horas para quien reserva a última hora
      const creada = new Date(String(c.creada).replace(' ', 'T') + ':00-05:00').getTime();
      if (horas <= PAGO_LIMITE_HORAS && ahoraMs - creada >= 2 * 3600000) {
        c.estado = 'cancelada';
        c.nota = 'Cancelada automáticamente: no se recibió el pago ' + PAGO_LIMITE_HORAS + ' horas antes';
        enviarCorreoCita(c, 'sinpago');
        avisarDueno('Cita cancelada por falta de pago', c);
        canceladas++;
      }
    });
    if (canceladas) reescribir('Citas', citas);
    console.log('Citas canceladas por falta de pago: ' + canceladas);
    return canceladas;
  });
}

// ------------------------------------------------------------
// CORREOS, COMPROBANTE PDF Y RECORDATORIOS
// ------------------------------------------------------------
const DIAS_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto',
                  'septiembre', 'octubre', 'noviembre', 'diciembre'];

function fechaLarga(fecha) {
  const p = String(fecha).split('-').map(Number);
  const d = new Date(p[0], p[1] - 1, p[2]);
  return DIAS_ES[d.getDay()] + ' ' + p[2] + ' de ' + MESES_ES[p[1] - 1] + ' de ' + p[0];
}

function enlaceGoogleCalendar(cita) {
  const formato = (fecha, minutos) => fecha.replace(/-/g, '') + 'T' +
    ('0' + Math.floor(minutos / 60)).slice(-2) + ('0' + (minutos % 60)).slice(-2) + '00';
  const inicio = aMinutos(cita.hora);
  const fin = inicio + (parseInt(cita.duracion, 10) || 60);
  return 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=' + encodeURIComponent('Cita con ' + cita.profesional + ' - Bienestar Emocional') +
    '&dates=' + formato(cita.fecha, inicio) + '/' + formato(cita.fecha, fin) +
    '&ctz=' + encodeURIComponent(ZONA) +
    '&details=' + encodeURIComponent((cita.servicios || '') + '\nGestiona tu cita: ' + enlaceGestion(cita));
}

function enlaceGestion(cita) {
  return SITIO_URL + 'cita.html?id=' + encodeURIComponent(cita.id) + '&t=' + encodeURIComponent(cita.token);
}

function enlaceResponder(cita) {
  return SITIO_URL + 'responder.html?id=' + encodeURIComponent(cita.id) + '&k=' + encodeURIComponent(cita.tokenPro);
}

function escaparHtml(t) {
  return String(t || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function listaHtml(items) {
  return '<ul style="margin:6px 0 0 18px;padding:0">' + items.map(i => '<li style="margin-bottom:4px">' + escaparHtml(i) + '</li>').join('') + '</ul>';
}

function tablaPagos() {
  return '<table style="border-collapse:collapse;margin-top:6px">' + MEDIOS_PAGO.map(m =>
    '<tr><td style="padding:3px 12px 3px 0"><strong>' + escaparHtml(m[0]) + '</strong></td><td>' + escaparHtml(m[1]) + '</td></tr>').join('') +
    '</table>';
}

// Comprobante de reserva en PDF (se adjunta al correo y se puede descargar)
function pdfComprobante(cita) {
  const valor = Number(cita.valor) || 0;
  const estados = { pendiente: 'Pendiente de aceptación', confirmada: 'Confirmada', cancelada: 'Cancelada',
                    rechazada: 'Rechazada', atendida: 'Atendida' };
  const servicios = String(cita.servicios || '').split(',').map(s => s.trim()).filter(Boolean);
  const filas = servicios.map(s => {
    const precio = (s.match(/\$\s?([\d.]+)/) || [])[1];
    return '<tr><td style="padding:8px;border-bottom:1px solid #dde6ee">' + escaparHtml(s.replace(/\s*\(.*?\)\s*/g, '')) + '</td>' +
      '<td style="padding:8px;border-bottom:1px solid #dde6ee;text-align:right">' + (precio ? '$' + escaparHtml(precio) : '') + '</td></tr>';
  }).join('');

  const html =
    '<html><body style="font-family:Arial,sans-serif;color:#1e2b3a;font-size:12px;margin:30px">' +
    '<table style="width:100%;border-collapse:collapse"><tr>' +
    '<td><div style="font-size:22px;font-weight:bold;color:#1a4a6b">Bienestar Emocional</div>' +
    '<div style="color:#5a7184">Atención psicológica profesional · Colombia<br>Tel. 300 480 4521 · rafa-0512@hotmail.com</div></td>' +
    '<td style="text-align:right;vertical-align:top"><div style="font-size:16px;font-weight:bold;color:#1a4a6b">COMPROBANTE DE RESERVA</div>' +
    '<div>N.º <strong>' + escaparHtml(cita.numero || cita.id) + '</strong></div>' +
    '<div>Fecha de emisión: ' + ahora().slice(0, 10) + '</div></td></tr></table>' +
    '<hr style="border:none;border-top:3px solid #3cb6a0;margin:16px 0">' +

    '<table style="width:100%;border-collapse:collapse"><tr>' +
    '<td style="vertical-align:top;width:50%"><div style="font-weight:bold;color:#1a4a6b;margin-bottom:4px">PACIENTE</div>' +
    escaparHtml(cita.nombre) + '<br>' + escaparHtml(cita.telefono) + '<br>' + escaparHtml(cita.correo) + '</td>' +
    '<td style="vertical-align:top"><div style="font-weight:bold;color:#1a4a6b;margin-bottom:4px">CITA</div>' +
    fechaLarga(cita.fecha) + '<br>Hora: ' + escaparHtml(cita.hora) + ' (' + escaparHtml(cita.duracion) + ' min)<br>' +
    'Profesional: ' + escaparHtml(cita.profesional) + '<br>Estado: <strong>' + (estados[cita.estado] || cita.estado) + '</strong></td>' +
    '</tr></table>' +

    '<table style="width:100%;border-collapse:collapse;margin-top:18px">' +
    '<tr style="background:#1a4a6b;color:#fff"><th style="padding:8px;text-align:left">Servicio</th><th style="padding:8px;text-align:right">Valor</th></tr>' +
    filas +
    '<tr><td style="padding:10px 8px;text-align:right;font-weight:bold">TOTAL A PAGAR</td>' +
    '<td style="padding:10px 8px;text-align:right;font-size:15px;font-weight:bold;color:#1a4a6b">' + pesos(valor) + ' COP</td></tr>' +
    '<tr><td style="padding:2px 8px;text-align:right">Estado del pago</td><td style="padding:2px 8px;text-align:right">' +
    (cita.pago === 'pagado' ? 'Pagado' : 'Pendiente') + '</td></tr>' +
    '</table>' +

    '<div style="margin-top:18px;padding:12px;background:#f3f8fc;border-left:4px solid #2a6496">' +
    '<div style="font-weight:bold;color:#1a4a6b">MEDIOS DE PAGO</div>' + tablaPagos() +
    '<div style="margin-top:6px">Realiza el pago antes de ' + PAGO_LIMITE_HORAS + ' horas de tu cita y envía el comprobante por WhatsApp al 300 480 4521 indicando el N.º <span style="white-space:nowrap">' +
    escaparHtml(cita.numero || cita.id) + '</span>.</div></div>' +

    '<div style="margin-top:16px"><div style="font-weight:bold;color:#1a4a6b">INDICACIONES</div>' + listaHtml(INDICACIONES) + '</div>' +
    '<div style="margin-top:14px"><div style="font-weight:bold;color:#1a4a6b">POLÍTICAS DE PAGO Y CANCELACIÓN</div>' + listaHtml(POLITICAS) + '</div>' +

    '<div style="margin-top:22px;font-size:10px;color:#5a7184;border-top:1px solid #dde6ee;padding-top:8px">' +
    'Este documento es un comprobante de reserva y orden de pago; no reemplaza la factura electrónica. ' +
    'Gestiona tu cita en: ' + escaparHtml(enlaceGestion(cita)) + '<br>' +
    '¿Necesitas ayuda urgente? Línea 192 opción 4 · Línea 106 · Emergencias 123</div>' +
    '</body></html>';

  return Utilities.newBlob(html, 'text/html', 'comprobante.html').getAs('application/pdf')
    .setName('Comprobante-' + (cita.numero || cita.id) + '.pdf');
}

function enviarCorreoCita(cita, tipo) {
  if (!cita.correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cita.correo)) return;
  const tipos = {
    solicitud: { asunto: 'Recibimos tu solicitud de cita', titulo: 'Recibimos tu solicitud de cita',
                 texto: 'Tu reserva quedó <strong>pendiente de aceptación</strong>. Te escribiremos cuando el profesional la confirme. Adjuntamos tu comprobante con el valor a pagar.' },
    aceptada: { asunto: 'Tu cita fue confirmada', titulo: '¡Tu cita fue confirmada!',
                texto: 'El profesional aceptó tu cita. Recuerda realizar el pago antes de ' + PAGO_LIMITE_HORAS + ' horas de la cita.' },
    rechazada: { asunto: 'No fue posible confirmar tu cita', titulo: 'No fue posible confirmar tu cita',
                 texto: 'Lo sentimos, el profesional no puede atenderte en ese horario' + (cita.nota ? ' (' + escaparHtml(cita.nota) + ')' : '') + '. Puedes elegir otro horario en nuestra página.' },
    recordatorio: { asunto: 'Recordatorio: tu cita es mañana', titulo: 'Te recordamos tu cita de mañana',
                    texto: cita.pago === 'pagado' ? 'Tu pago ya fue recibido. ¡Te esperamos!'
                         : '<strong>Aún no hemos recibido tu pago.</strong> Si no se recibe ' + PAGO_LIMITE_HORAS + ' horas antes de la cita, se cancelará automáticamente.' },
    cambio: { asunto: 'Tu cita fue cambiada', titulo: 'Tu cita fue cambiada', texto: 'Estos son los nuevos datos de tu cita.' },
    cancelacion: { asunto: 'Tu cita fue cancelada', titulo: 'Tu cita fue cancelada',
                   texto: Number(cita.penalizacion) > 0
                     ? 'Como la cancelación se hizo con menos de ' + HORAS_MINIMAS_CAMBIO + ' horas de anticipación, aplica una <strong>penalización del 50 %: ' + pesos(cita.penalizacion) + '</strong>.'
                     : 'La cancelación se hizo a tiempo, sin costo.' },
    pago: { asunto: 'Recibimos tu pago', titulo: 'Recibimos tu pago', texto: 'Gracias, tu pago quedó registrado. ¡Te esperamos!' },
    sinpago: { asunto: 'Tu cita fue cancelada por falta de pago', titulo: 'Tu cita fue cancelada',
               texto: 'No recibimos el pago ' + PAGO_LIMITE_HORAS + ' horas antes de la cita, por lo que se dio por cancelada, según nuestras políticas. Si ya pagaste, escríbenos por WhatsApp.' }
  };
  const t = tipos[tipo];
  const activa = ['solicitud', 'aceptada', 'recordatorio', 'cambio', 'pago'].indexOf(tipo) !== -1;
  const boton = (url, texto, color) =>
    '<a href="' + url + '" style="display:inline-block;margin:6px 6px 0 0;padding:11px 18px;border-radius:8px;' +
    'background:' + color + ';color:#ffffff;text-decoration:none;font-weight:bold">' + texto + '</a>';

  const html =
    '<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#1e2b3a">' +
    '<div style="background:#1a4a6b;color:#fff;padding:18px 22px;border-radius:10px 10px 0 0">' +
    '<strong style="font-size:18px">Bienestar Emocional</strong></div>' +
    '<div style="border:1px solid #dde6ee;border-top:none;padding:22px;border-radius:0 0 10px 10px">' +
    '<h2 style="color:#1a4a6b;margin-top:0">' + t.titulo + '</h2>' +
    '<p>Hola ' + escaparHtml(String(cita.nombre).split(' ')[0]) + ',</p><p>' + t.texto + '</p>' +
    '<table style="border-collapse:collapse;margin:12px 0">' +
    '<tr><td style="padding:4px 12px 4px 0;color:#5a7184">N.º de reserva</td><td><strong>' + escaparHtml(cita.numero || cita.id) + '</strong></td></tr>' +
    '<tr><td style="padding:4px 12px 4px 0;color:#5a7184">📅 Fecha</td><td><strong>' + fechaLarga(cita.fecha) + '</strong></td></tr>' +
    '<tr><td style="padding:4px 12px 4px 0;color:#5a7184">⏰ Hora</td><td><strong>' + escaparHtml(cita.hora) + '</strong></td></tr>' +
    '<tr><td style="padding:4px 12px 4px 0;color:#5a7184">👤 Profesional</td><td>' + escaparHtml(cita.profesional) + '</td></tr>' +
    '<tr><td style="padding:4px 12px 4px 0;color:#5a7184">🩺 Servicio</td><td>' + escaparHtml(cita.servicios) + '</td></tr>' +
    '<tr><td style="padding:4px 12px 4px 0;color:#5a7184">💰 Total</td><td><strong>' + pesos(cita.valor) + '</strong>' +
    (cita.pago === 'pagado' ? ' (pagado)' : '') + '</td></tr>' +
    '</table>' +
    (activa && cita.pago !== 'pagado' ? '<p style="margin-bottom:2px"><strong>Medios de pago:</strong></p>' + tablaPagos() : '') +
    (activa
      ? '<div style="margin-top:12px">' +
        (tipo !== 'solicitud' ? boton(enlaceGoogleCalendar(cita), '📅 Agregar a Google Calendar', '#3cb6a0') : '') +
        boton(enlaceGestion(cita), 'Ver, cambiar o cancelar mi cita', '#2a6496') + '</div>'
      : '<p>Si quieres agendar una nueva cita, entra a <a href="' + SITIO_URL + 'Agendas.html">nuestra página</a> o escríbenos por WhatsApp.</p>') +
    '<p style="margin:18px 0 2px"><strong>Políticas:</strong></p>' + listaHtml(POLITICAS) +
    '<p style="font-size:13px;color:#5a7184">¿Necesitas ayuda urgente? Línea 192 opción 4 · Línea 106 · Emergencias 123</p>' +
    '</div></div>';

  const correo = { to: cita.correo, subject: t.asunto + ' - Bienestar Emocional', htmlBody: html, name: 'Bienestar Emocional' };
  try {
    if (tipo === 'solicitud' || tipo === 'aceptada') correo.attachments = [pdfComprobante(cita)];
  } catch (err) {
    console.log('No se pudo crear el PDF: ' + err);
  }
  try {
    MailApp.sendEmail(correo);
  } catch (err) {
    console.log('No se pudo enviar el correo: ' + err);
  }
}

function avisarDueno(asunto, cita) {
  if (!AVISAR_AL_DUENO) return;
  const pendiente = cita.estado === 'pendiente';
  const html =
    '<div style="font-family:Arial,sans-serif;max-width:560px;color:#1e2b3a">' +
    '<h2 style="color:#1a4a6b">' + escaparHtml(asunto) + '</h2>' +
    '<p><strong>' + escaparHtml(cita.nombre) + '</strong> · ' + escaparHtml(cita.telefono) + ' · ' + escaparHtml(cita.correo) + '</p>' +
    '<p>N.º ' + escaparHtml(cita.numero || cita.id) + '<br>' + fechaLarga(cita.fecha) + ' · ' + escaparHtml(cita.hora) +
    ' (' + escaparHtml(cita.duracion) + ' min)<br>' + escaparHtml(cita.profesional) + '<br>' + escaparHtml(cita.servicios) +
    '<br>Total: ' + pesos(cita.valor) + ' · Pago: ' + escaparHtml(cita.pago || 'pendiente') + '</p>' +
    (cita.mensaje ? '<p>Mensaje: ' + escaparHtml(cita.mensaje) + '</p>' : '') +
    (cita.nota ? '<p>Nota: ' + escaparHtml(cita.nota) + '</p>' : '') +
    (pendiente && cita.tokenPro
      ? '<p><a href="' + enlaceResponder(cita) + '" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#1a4a6b;color:#fff;text-decoration:none;font-weight:bold">Aceptar o rechazar esta cita</a></p>'
      : '') +
    '<p><a href="' + SITIO_URL + 'panel.html">Abrir el panel</a></p></div>';
  try {
    MailApp.sendEmail({
      to: Session.getEffectiveUser().getEmail(),
      subject: asunto + ': ' + cita.nombre + ' - ' + cita.fecha + ' ' + cita.hora,
      htmlBody: html,
      name: 'Bienestar Emocional'
    });
  } catch (err) {
    console.log('No se pudo enviar el aviso: ' + err);
  }
}

// La ejecuta el activador diario: envía el recordatorio de las citas confirmadas de mañana
function enviarRecordatorios() {
  return conBloqueo(() => {
    const manana = Utilities.formatDate(new Date(Date.now() + 24 * 3600000), ZONA, 'yyyy-MM-dd');
    const citas = leer('Citas');
    let enviados = 0;
    citas.forEach(c => {
      if (c.fecha === manana && c.estado === 'confirmada' && c.correo && !c.recordatorio) {
        enviarCorreoCita(c, 'recordatorio');
        c.recordatorio = ahora();
        enviados++;
      }
    });
    if (enviados) reescribir('Citas', citas);
    console.log('Recordatorios enviados: ' + enviados);
    return enviados;
  });
}

function listarCitas() {
  return { ok: true, citas: leer('Citas') };
}

function cambiarEstadoCita(d) {
  return conBloqueo(() => {
    const citas = leer('Citas');
    const cita = citas.find(c => c.id === d.id);
    if (!cita) return { ok: false, error: 'Cita no encontrada.' };
    cita.estado = ['pendiente', 'confirmada', 'cancelada', 'atendida', 'rechazada'].indexOf(d.estado) !== -1 ? d.estado : cita.estado;
    if (d.estado === 'cancelada' && !cita.nota) cita.nota = 'Cancelada por el profesional';
    reescribir('Citas', citas);
    return { ok: true };
  });
}

function leerDisponibilidad() {
  return {
    ok: true,
    disponibilidad: leer('Disponibilidad'),
    bloqueos: leer('Bloqueos'),
    excepciones: leerSiExiste('Excepciones'),
    excepcionesActivas: !!SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Excepciones')
  };
}

// Horario especial de un día. d.horas = [] bloquea el día completo.
function guardarExcepcion(d) {
  return conBloqueo(() => {
    hoja('Excepciones');   // avisa si falta ejecutar instalar
    const fecha = texto(d.fecha, 10);
    const profesional = texto(d.profesional, 120);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || !profesional) return { ok: false, error: 'Faltan la fecha o el profesional.' };
    const horas = (d.horas || []).filter(h => aMinutos(h) >= 0);
    const otras = leer('Excepciones').filter(x => !(x.fecha === fecha && x.profesional === profesional));
    otras.push({ fecha: fecha, profesional: profesional, horas: horas.join(','), motivo: texto(d.motivo, 200) });
    reescribir('Excepciones', otras);
    return { ok: true };
  });
}

// Quita el horario especial: el día vuelve al horario semanal
function eliminarExcepcion(d) {
  return conBloqueo(() => {
    reescribir('Excepciones', leer('Excepciones').filter(x => !(x.fecha === d.fecha && x.profesional === d.profesional)));
    return { ok: true };
  });
}

// d.profesional y d.dias = { "1": ["8:00 AM", ...], "2": [...], ... }
function guardarDisponibilidad(d) {
  return conBloqueo(() => {
    const profesional = texto(d.profesional, 120);
    if (!profesional) return { ok: false, error: 'Falta el profesional.' };
    const otras = leer('Disponibilidad').filter(r => r.profesional !== profesional);
    const nuevas = [0, 1, 2, 3, 4, 5, 6].map(dia => ({
      profesional: profesional,
      dia: dia,
      horas: ((d.dias || {})[dia] || []).filter(h => aMinutos(h) >= 0).join(',')
    }));
    reescribir('Disponibilidad', otras.concat(nuevas));
    return { ok: true };
  });
}

function agregarBloqueo(d) {
  return conBloqueo(() => {
    const fecha = texto(d.fecha, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return { ok: false, error: 'Fecha no válida.' };
    agregar('Bloqueos', [{
      id: Utilities.getUuid().slice(0, 8),
      fecha: fecha,
      profesional: texto(d.profesional, 120) || 'Todos',
      motivo: texto(d.motivo, 200)
    }]);
    return { ok: true };
  });
}

function eliminarBloqueo(d) {
  return conBloqueo(() => {
    reescribir('Bloqueos', leer('Bloqueos').filter(b => b.id !== d.id));
    return { ok: true };
  });
}
