# Base de datos con Google Sheets (Apps Script)

Esta guía conecta la página con una hoja de cálculo de Google que guarda:

- **Evaluaciones de empresas**: respuestas anónimas de los trabajadores.
- **Citas**: cada cita que se agenda desde la página.
- **Disponibilidad**: los días y horas en que atiende cada profesional, y los días sin atención.

Es gratis con una cuenta de Gmail. Toma unos 10 minutos y solo se hace una vez.

---

## Paso 1. Crear la hoja de cálculo

1. Entra a <https://sheets.google.com> con tu cuenta de Gmail.
2. Crea una hoja **en blanco**.
3. Ponle un nombre, por ejemplo: `Bienestar Emocional - Base de datos`.

## Paso 2. Pegar el código

1. En la hoja, abre el menú **Extensiones → Apps Script**. Se abre una pestaña nueva con un editor.
2. Borra todo lo que aparece en el archivo `Código.gs`.
3. Abre el archivo [`Codigo.gs`](Codigo.gs) de esta carpeta, **copia todo** y pégalo en el editor.
4. Presiona **Guardar** (el ícono del disquete o `Ctrl + S`).

## Paso 3. Instalar y obtener tu clave

1. Arriba del editor, en la lista de funciones, elige **`instalar`**.
2. Presiona **▶ Ejecutar**.
3. Google pedirá permisos:
   - Presiona **Revisar permisos** y elige tu cuenta.
   - Aparecerá *"Google no verificó esta app"*. Es normal porque la app es tuya: presiona
     **Configuración avanzada → Ir a (nombre del proyecto) (no seguro)**.
   - Presiona **Permitir**.
4. Abajo, en el **Registro de ejecución**, aparecerá:

   ```
   ✅ Instalación lista. TU CLAVE DEL PANEL ES: xxxxxxxxxxxx
   ```

   **Copia esa clave y guárdala.** Es la que usarás para entrar al panel.

Si vuelves a la hoja de cálculo verás 5 pestañas nuevas: Empresas, Respuestas, Citas,
Disponibilidad y Bloqueos.

> Para cambiar la clave: en Apps Script ve a **⚙️ Configuración del proyecto → Propiedades del
> script**, edita `CLAVE_ADMIN` y guarda.

## Paso 4. Publicar como aplicación web

1. Arriba a la derecha presiona **Implementar → Nueva implementación**.
2. En el engranaje ⚙️ junto a "Seleccionar tipo", elige **Aplicación web**.
3. Configura:
   - **Descripción**: `Bienestar Emocional`
   - **Ejecutar como**: **Yo** (tu correo)
   - **Quién tiene acceso**: **Cualquier usuario**
4. Presiona **Implementar** y copia la **URL de la aplicación web**. Termina en `/exec`, así:

   ```
   https://script.google.com/macros/s/AKfycb..../exec
   ```

"Cualquier usuario" es necesario para que los pacientes y trabajadores puedan enviar datos sin
iniciar sesión. Las acciones privadas (ver resultados, ver citas, borrar) exigen tu clave.

## Paso 5. Conectar la página

Abre [`JS/config.js`](../JS/config.js) y pega la URL entre las comillas:

```js
const API_URL = 'https://script.google.com/macros/s/AKfycb..../exec';
```

Guarda, haz commit y sube a GitHub. (O pásale la URL a Claude y lo hace por ti.)

## Paso 6. Activar GitHub Pages

Los enlaces de evaluación que se envían a las empresas apuntan a
`https://josergomezr05.github.io/Salud/`. Para que funcionen:

1. En GitHub, entra al repositorio **Salud → Settings → Pages**.
2. En **Branch** elige `main` y la carpeta `/ (root)` y presiona **Save**.
3. En 1 o 2 minutos el sitio queda en línea.

---

## Cómo se usa

### Panel
Entra a `https://josergomezr05.github.io/Salud/panel.html` con tu clave. El panel no aparece en el menú
de la página, así que guarda el enlace.

### Evaluar una empresa (el ciclo completo)
1. **Panel → Empresas → Nueva evaluación**: nombre, plan, áreas y número máximo de participantes.
2. Copia el **enlace** o envíalo por WhatsApp a la persona de Talento Humano.
3. Los trabajadores responden **de forma anónima** desde el celular o el computador.
4. **Ver informe**: resultados por prueba, aspectos prioritarios y comparación por áreas.
5. **Imprimir / Guardar PDF** para entregarlo, o **Descargar Excel** para tus archivos.
6. **Borrar resultados**: libera el espacio. La empresa y su enlace se conservan por si quieres
   volver a medir (por ejemplo, a los 6 meses). **Eliminar** borra la empresa y todo lo suyo.
7. Repite con la siguiente empresa.

Mientras recibes respuestas puedes **Cerrar** la evaluación para que nadie más responda.

### Flujo de una cita
1. El paciente reserva y **acepta las políticas**. La cita queda **pendiente de aceptación** y la hora se aparta.
2. Descarga su **comprobante en PDF** (total, medios de pago, indicaciones y políticas); también le llega por correo.
3. A ti te llega el WhatsApp y un **correo con el botón "Aceptar o rechazar esta cita"**. También puedes
   hacerlo en Panel → Citas.
4. Al aceptar, el paciente recibe un correo de confirmación; al rechazar, la hora queda libre.
5. Cuando el paciente pague, márcala como **💳 Pagada** en el panel (el paciente recibe un correo).
6. Si 12 horas antes de la cita no está pagada, **se cancela automáticamente** (revisión cada hora;
   se desactiva con `CANCELAR_SIN_PAGO = false`). Hay 2 horas de margen para quien reserva a última hora.
7. Si el paciente cancela con menos de 12 horas, se registra la **penalización del 50 %**.

Las políticas e indicaciones están en `POLITICAS` e `INDICACIONES` de `Codigo.gs` (PDF y correos) y de
`JS/config.js` (página de citas). Si las cambias, cámbialas en los dos lugares.

### Correos automáticos
- **Al agendar**: el paciente recibe un correo con los datos de la cita, un botón para agregarla a
  Google Calendar y un enlace para **cambiarla o cancelarla** (hasta 12 horas antes; se cambia en
  `HORAS_MINIMAS_CAMBIO` de `Codigo.gs`).
- **Un día antes**: todos los días a las 7 a. m. se envía un recordatorio a quienes tienen cita al día siguiente.
- **Si el paciente cambia o cancela**: recibe un correo, y tú recibes un aviso en tu Gmail
  (se desactiva poniendo `AVISAR_AL_DUENO = false`).
- Los correos salen desde tu Gmail. El plan gratis permite **100 correos al día**.
- Para probar: en Apps Script elige la función **`probarCorreo`** → **▶ Ejecutar**. Te llega un correo de ejemplo.

### Resumen semanal
Panel → **📊 Resumen**: citas agendadas, atendidas, por atender y canceladas; ingresos de las citas
atendidas y por confirmar; detalle por profesional, por día y los servicios más pedidos. Marca las citas
como **Atendida** en la pestaña Citas para que los ingresos sean exactos.

### Horario y citas
- **Calendario de atención** (pestaña Disponibilidad): toca un día del mes para cambiar **solo ese día**:
  abrir o cerrar ☀️ mañana, 🌤️ mediodía, 🌇 tarde o 🌙 noche, elegir horas sueltas, **bloquear el día
  completo** o **volver al horario normal**. Sirve también para atender un festivo. Puedes aplicarlo a
  todos los profesionales a la vez.
- **Horario semanal**: elige un profesional y marca las horas en que atiende cada día. Toca el
  nombre de un día para marcarlo o desmarcarlo completo. Agrega los **días sin atención** (festivos,
  vacaciones) para uno o para todos los profesionales.
- **Citas**: ves las próximas citas, las marcas como atendidas o las cancelas (la hora queda libre).
- En la página **Agendar Cita**, los pacientes solo ven las horas libres. Una cita ocupa las horas
  que dure el servicio: una terapia de 90 minutos a las 8:00 bloquea también las 8:45.

---

## Capacidad (plan gratis de Google)

| Límite | Valor aproximado | ¿Qué significa? |
|---|---|---|
| Celdas por hoja de cálculo | 10 millones | Unas 1.000.000 de filas de respuestas |
| Una respuesta de un trabajador a una prueba | 1 fila (8 celdas) | Un trabajador con 5 pruebas = 5 filas |
| Tiempo de ejecución por día | 90 minutos | Miles de envíos al día |
| Usuarios al mismo tiempo | unas 30 solicitudes simultáneas | Suficiente para empresas grandes si no responden todos en el mismo segundo |

Los límites diarios se reinician solos cada 24 horas. Borrar los resultados de una empresa libera
sus celdas. Aun así, se recomienda borrar los datos cuando ya no se necesiten: es una buena práctica
de protección de datos (Ley 1581 de 2012).

## Privacidad

- Las evaluaciones **no guardan nombre, cédula ni correo**: solo el área, la fecha, el puntaje y las
  opciones elegidas, con un código aleatorio por participante.
- En los informes, las áreas con menos de 5 personas no se muestran por separado
  (se cambia en `MINIMO_POR_AREA` de `JS/config.js`).
- Las citas sí guardan nombre, teléfono y correo del paciente: solo tú las ves con tu clave.
- La hoja de cálculo está en tu Google Drive. **No la compartas** con nadie.

## Si cambias el código más adelante

Cuando se actualice `Codigo.gs`:

1. Borra todo el código del editor, pega el nuevo y **guarda**.
2. Elige la función **`instalar`** y presiona **▶ Ejecutar**. Crea las hojas y columnas nuevas que
   falten y el activador de recordatorios; **no borra datos ni cambia tu clave**. Si Google vuelve a
   pedir permisos (por ejemplo para enviar correos), acéptalos igual que la primera vez.
3. **Implementar → Gestionar implementaciones → ✏️ Editar → Versión: Nueva versión → Implementar**.

Así la URL sigue siendo la misma y no hay que cambiar `config.js`.
