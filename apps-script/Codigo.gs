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
 * Correos: al agendar, cambiar o cancelar una cita se envía un correo
 * al paciente y un aviso a la cuenta dueña del script. Cada día a las
 * 7 a. m. se envían los recordatorios de las citas del día siguiente
 * (la función instalar crea ese activador automático).
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
// Dos horas seguidas de la agenda con una separación de hasta 15 minutos
// se consideran parte de la misma jornada (ej. 11:00 → 12:00 → 1:00 PM).
const TOLERANCIA_JORNADA = 15;

const HOJAS = {
  Empresas: ['codigo', 'nombre', 'plan', 'pruebas', 'areas', 'limite', 'creada', 'estado'],
  Respuestas: ['fecha', 'empresa', 'participante', 'area', 'prueba', 'puntaje', 'nivel', 'respuestas'],
  Citas: ['id', 'creada', 'fecha', 'hora', 'duracion', 'profesional', 'servicios', 'nombre', 'telefono', 'correo', 'mensaje', 'estado',
          'valor', 'token', 'recordatorio'],
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
  Logger.log('📧 Correos disponibles hoy: ' + MailApp.getRemainingDailyQuota());
}

// Envía un correo de prueba a tu propia cuenta (ejecútala desde el editor)
function probarCorreo() {
  const yo = Session.getEffectiveUser().getEmail();
  enviarCorreoCita({
    id: 'PRUEBA', fecha: hoyTexto(), hora: '6:00 PM', duracion: 60, profesional: 'José Rafael Gómez',
    servicios: 'Terapia Individual', nombre: 'Paciente de prueba', correo: yo, token: 'prueba'
  }, 'confirmacion');
  Logger.log('📧 Correo de prueba enviado a ' + yo);
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
    reprogramarCita: reprogramarCita
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
    .filter(c => c.fecha === fecha && c.profesional === profesional && c.estado !== 'cancelada' && (!excluirId || c.id !== excluirId))
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
      estado: 'confirmada',
      valor: parseInt(d.valor, 10) || '',
      token: Utilities.getUuid().replace(/-/g, '').slice(0, 16),
      recordatorio: ''
    };
    agregar('Citas', [cita]);
    enviarCorreoCita(cita, 'confirmacion');
    avisarDueno('Nueva cita', cita);
    return { ok: true, id: cita.id, token: cita.token };
  });
}

function mensajeNoLibre(motivo) {
  if (motivo === 'no alcanza') return 'El servicio elegido no alcanza a terminar en ese horario. Por favor elige una hora más temprana.';
  if (motivo === 'ya pasó') return 'Esa hora ya pasó. Por favor elige otra.';
  if (motivo === 'no disponible') return 'Esa hora no está disponible. Por favor elige otra.';
  return 'Esa hora acaba de ser reservada. Por favor elige otra.';
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

function puedeCambiar(cita) {
  return cita.estado === 'confirmada' &&
    inicioCita(cita).getTime() - Date.now() >= HORAS_MINIMAS_CAMBIO * 3600000;
}

function verCita(d) {
  const r = buscarCitaConToken(d);
  if (!r.cita) return { ok: false, error: 'No encontramos esta cita. Revisa el enlace.' };
  const c = r.cita;
  return {
    ok: true,
    cita: { id: c.id, fecha: c.fecha, hora: c.hora, duracion: c.duracion, profesional: c.profesional,
            servicios: c.servicios, nombre: c.nombre, estado: c.estado },
    puedeCambiar: puedeCambiar(c),
    horasMinimas: HORAS_MINIMAS_CAMBIO
  };
}

function cancelarCita(d) {
  return conBloqueo(() => {
    const r = buscarCitaConToken(d);
    if (!r.cita) return { ok: false, error: 'No encontramos esta cita. Revisa el enlace.' };
    if (!puedeCambiar(r.cita)) return { ok: false, error: 'Esta cita ya no se puede cancelar en línea. Escríbenos por WhatsApp.' };
    r.cita.estado = 'cancelada';
    reescribir('Citas', r.citas);
    enviarCorreoCita(r.cita, 'cancelacion');
    avisarDueno('Cita cancelada por el paciente', r.cita);
    return { ok: true };
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

// ------------------------------------------------------------
// CORREOS Y RECORDATORIOS
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

function escaparHtml(t) {
  return String(t || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function enviarCorreoCita(cita, tipo) {
  if (!cita.correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cita.correo)) return;
  const titulos = {
    confirmacion: { asunto: 'Tu cita está agendada', titulo: '¡Tu cita está agendada!' },
    recordatorio: { asunto: 'Recordatorio: tu cita es mañana', titulo: 'Te recordamos tu cita de mañana' },
    cambio: { asunto: 'Tu cita fue cambiada', titulo: 'Tu cita fue cambiada' },
    cancelacion: { asunto: 'Tu cita fue cancelada', titulo: 'Tu cita fue cancelada' }
  };
  const t = titulos[tipo];
  const activa = tipo !== 'cancelacion';
  const boton = (url, texto, color) =>
    '<a href="' + url + '" style="display:inline-block;margin:6px 6px 0 0;padding:11px 18px;border-radius:8px;' +
    'background:' + color + ';color:#ffffff;text-decoration:none;font-weight:bold">' + texto + '</a>';

  const html =
    '<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#1e2b3a">' +
    '<div style="background:#1a4a6b;color:#fff;padding:18px 22px;border-radius:10px 10px 0 0">' +
    '<strong style="font-size:18px">Bienestar Emocional</strong></div>' +
    '<div style="border:1px solid #dde6ee;border-top:none;padding:22px;border-radius:0 0 10px 10px">' +
    '<h2 style="color:#1a4a6b;margin-top:0">' + t.titulo + '</h2>' +
    '<p>Hola ' + escaparHtml(cita.nombre.split(' ')[0]) + ',</p>' +
    '<table style="border-collapse:collapse;margin:12px 0">' +
    '<tr><td style="padding:4px 12px 4px 0;color:#5a7184">📅 Fecha</td><td><strong>' + fechaLarga(cita.fecha) + '</strong></td></tr>' +
    '<tr><td style="padding:4px 12px 4px 0;color:#5a7184">⏰ Hora</td><td><strong>' + escaparHtml(cita.hora) + '</strong></td></tr>' +
    '<tr><td style="padding:4px 12px 4px 0;color:#5a7184">👤 Profesional</td><td>' + escaparHtml(cita.profesional) + '</td></tr>' +
    '<tr><td style="padding:4px 12px 4px 0;color:#5a7184">🩺 Servicio</td><td>' + escaparHtml(cita.servicios) + '</td></tr>' +
    '</table>' +
    (activa
      ? '<p>Por favor llega 15 minutos antes. Si es una cita virtual, te enviaremos el enlace por WhatsApp.</p>' +
        boton(enlaceGoogleCalendar(cita), '📅 Agregar a Google Calendar', '#3cb6a0') +
        boton(enlaceGestion(cita), 'Cambiar o cancelar mi cita', '#2a6496') +
        '<p style="font-size:13px;color:#5a7184;margin-top:16px">Puedes cambiar o cancelar en línea hasta ' +
        HORAS_MINIMAS_CAMBIO + ' horas antes de la cita.</p>'
      : '<p>Si quieres agendar una nueva cita, entra a ' +
        '<a href="' + SITIO_URL + 'Agendas.html">nuestra página</a> o escríbenos por WhatsApp.</p>') +
    '<p style="font-size:13px;color:#5a7184">¿Necesitas ayuda urgente? Línea 192 opción 4 · Línea 106 · Emergencias 123</p>' +
    '</div></div>';

  try {
    MailApp.sendEmail({ to: cita.correo, subject: t.asunto + ' - Bienestar Emocional', htmlBody: html, name: 'Bienestar Emocional' });
  } catch (err) {
    console.log('No se pudo enviar el correo: ' + err);
  }
}

function avisarDueno(asunto, cita) {
  if (!AVISAR_AL_DUENO) return;
  try {
    MailApp.sendEmail({
      to: Session.getEffectiveUser().getEmail(),
      subject: asunto + ': ' + cita.nombre + ' - ' + cita.fecha + ' ' + cita.hora,
      body: asunto + '\n\n' +
        'Paciente: ' + cita.nombre + '\nTeléfono: ' + cita.telefono + '\nCorreo: ' + cita.correo + '\n' +
        'Fecha: ' + fechaLarga(cita.fecha) + '\nHora: ' + cita.hora + '\nProfesional: ' + cita.profesional + '\n' +
        'Servicios: ' + cita.servicios + '\n\nPanel: ' + SITIO_URL + 'panel.html',
      name: 'Bienestar Emocional'
    });
  } catch (err) {
    console.log('No se pudo enviar el aviso: ' + err);
  }
}

// La ejecuta el activador diario: envía el recordatorio de las citas de mañana
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
    cita.estado = ['confirmada', 'cancelada', 'atendida'].indexOf(d.estado) !== -1 ? d.estado : cita.estado;
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
