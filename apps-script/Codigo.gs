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
 * La clave del panel se guarda en las Propiedades del script
 * (CLAVE_ADMIN), nunca en este archivo.
 * ============================================================
 */

const ZONA = 'America/Bogota';
const MINUTOS_POR_CITA = 45;   // separación entre las horas de la agenda

const HOJAS = {
  Empresas: ['codigo', 'nombre', 'plan', 'pruebas', 'areas', 'limite', 'creada', 'estado'],
  Respuestas: ['fecha', 'empresa', 'participante', 'area', 'prueba', 'puntaje', 'nivel', 'respuestas'],
  Citas: ['id', 'creada', 'fecha', 'hora', 'duracion', 'profesional', 'servicios', 'nombre', 'telefono', 'correo', 'mensaje', 'estado'],
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
    crearCita: crearCita
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
  const duracion = Math.max(MINUTOS_POR_CITA, parseInt(d.duracion, 10) || MINUTOS_POR_CITA);
  const ocupadas = intervalosOcupados(fecha, profesional);
  const horas = (d.horas || []).map(h => {
    const inicio = aMinutos(h);
    const habilitada = configuradas === null ? true : configuradas.indexOf(h) !== -1;
    return { hora: h, libre: habilitada && !seCruza(inicio, inicio + duracion, ocupadas), habilitada: habilitada };
  });
  if (configuradas !== null && !configuradas.length) return { ok: true, abierto: false, motivo: 'No hay atención este día.' };
  return { ok: true, abierto: true, horas: horas };
}

function intervalosOcupados(fecha, profesional) {
  return leer('Citas')
    .filter(c => c.fecha === fecha && c.profesional === profesional && c.estado !== 'cancelada')
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
    if (!disponible.horas[0].libre) return { ok: false, ocupado: true, error: 'Esa hora acaba de ser reservada. Por favor elige otra.' };

    const id = Utilities.getUuid().slice(0, 8);
    agregar('Citas', [{
      id: id,
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
      estado: 'confirmada'
    }]);
    return { ok: true, id: id };
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
