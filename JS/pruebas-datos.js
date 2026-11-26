// ============================================================
// pruebas-datos.js — Preguntas de todas las pruebas del sitio
//
// Cada prueba se abre con prueba.html?p=<clave>, por ejemplo
// prueba.html?p=phq9. Para agregar una prueba nueva basta con
// añadir un objeto a PRUEBAS y un enlace en pruebas.html.
//
// Tipos de prueba:
//   tipo: 'validada'  → instrumento científico de uso libre.
//   tipo: 'propia'    → cuestionario de orientación creado por
//                       Bienestar Emocional (no validado).
//
// Campos:
//   titulo, categoria, tipo, fuente, instrucciones
//   opciones      → respuestas comunes a todas las preguntas
//                   [{ texto, valor }]
//   preguntas     → [{ texto, invertida?, opciones? }]
//                   invertida: el puntaje se calcula al revés.
//                   opciones: respuestas propias de esa pregunta.
//   rangos        → [{ hasta, texto, nivel }] nivel: ok | leve | alto
//   umbral        → puntaje desde el cual se recomienda consultar.
//   umbralMenor   → true si un puntaje BAJO es el preocupante.
//   alertaCrisis  → { pregunta (índice desde 0), desde (valor) }
//   puntuar(total)→ opcional, transforma el puntaje mostrado.
//   sufijo        → opcional, texto después del puntaje (por ejemplo '%').
//
// Las pruebas proyectivas de dibujo están en DIBUJOS (al final)
// y se abren con dibujo.html?p=<clave>.
// ============================================================

const FRECUENCIA_2_SEMANAS = [
    { texto: 'Ningún día', valor: 0 },
    { texto: 'Varios días', valor: 1 },
    { texto: 'Más de la mitad de los días', valor: 2 },
    { texto: 'Casi todos los días', valor: 3 }
];

const FRECUENCIA_PROPIA = [
    { texto: 'Nunca', valor: 0 },
    { texto: 'A veces', valor: 1 },
    { texto: 'Con frecuencia', valor: 2 },
    { texto: 'Casi siempre', valor: 3 }
];

const SI_NO = [
    { texto: 'Sí', valor: 1 },
    { texto: 'No', valor: 0 }
];

// Rangos genéricos para los cuestionarios propios (por porcentaje del máximo)
function rangosPorcentaje(maximo, textos) {
    return [
        { hasta: Math.floor(maximo * 0.33), texto: textos[0], nivel: 'ok' },
        { hasta: Math.floor(maximo * 0.66), texto: textos[1], nivel: 'leve' },
        { hasta: maximo, texto: textos[2], nivel: 'alto' }
    ];
}

const PRUEBAS = {

    // ---------------------------------------------------------- DEPRESIÓN
    phq9: {
        titulo: 'Cuestionario de Salud del Paciente (PHQ-9)',
        categoria: 'Depresión',
        tipo: 'validada',
        fuente: 'PHQ-9 · Kroenke, Spitzer y Williams. Desarrollado con una beca educativa de Pfizer Inc. Uso libre, no requiere permiso.',
        instrucciones: 'Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado los siguientes problemas?',
        opciones: FRECUENCIA_2_SEMANAS,
        preguntas: [
            { texto: 'Poco interés o placer en hacer cosas.' },
            { texto: 'Se ha sentido decaído(a), deprimido(a) o sin esperanzas.' },
            { texto: 'Ha tenido dificultad para quedarse o permanecer dormido(a), o ha dormido demasiado.' },
            { texto: 'Se ha sentido cansado(a) o con poca energía.' },
            { texto: 'Sin apetito o ha comido en exceso.' },
            { texto: 'Se ha sentido mal con usted mismo(a), o que es un fracaso, o que ha quedado mal con usted mismo(a) o con su familia.' },
            { texto: 'Ha tenido dificultad para concentrarse en ciertas actividades, tales como leer o ver la televisión.' },
            { texto: '¿Se ha movido o hablado tan lento que otras personas podrían haberlo notado? O lo contrario: muy inquieto(a) o agitado(a), moviéndose mucho más de lo normal.' },
            { texto: 'Pensamientos de que estaría mejor muerto(a) o de lastimarse de alguna manera.' }
        ],
        rangos: [
            { hasta: 4, texto: 'Síntomas depresivos mínimos.', nivel: 'ok' },
            { hasta: 9, texto: 'Síntomas depresivos leves.', nivel: 'leve' },
            { hasta: 14, texto: 'Síntomas depresivos moderados.', nivel: 'alto' },
            { hasta: 19, texto: 'Síntomas depresivos moderadamente severos.', nivel: 'alto' },
            { hasta: 27, texto: 'Síntomas depresivos severos.', nivel: 'alto' }
        ],
        umbral: 10,
        alertaCrisis: { pregunta: 8, desde: 1 }
    },

    gds15: {
        titulo: 'Escala de Depresión Geriátrica (GDS-15)',
        categoria: 'Depresión',
        tipo: 'validada',
        fuente: 'GDS-15 · Yesavage y Sheikh (1986). Dominio público.',
        instrucciones: 'Pensada para personas de 60 años o más. Responda pensando en cómo se ha sentido durante la última semana.',
        opciones: SI_NO,
        preguntas: [
            { texto: '¿Está básicamente satisfecho(a) con su vida?', invertida: true },
            { texto: '¿Ha renunciado a muchas de sus actividades e intereses?' },
            { texto: '¿Siente que su vida está vacía?' },
            { texto: '¿Se encuentra a menudo aburrido(a)?' },
            { texto: '¿Está de buen ánimo la mayor parte del tiempo?', invertida: true },
            { texto: '¿Teme que algo malo le vaya a pasar?' },
            { texto: '¿Se siente feliz la mayor parte del tiempo?', invertida: true },
            { texto: '¿Se siente a menudo desamparado(a)?' },
            { texto: '¿Prefiere quedarse en casa en lugar de salir y hacer cosas nuevas?' },
            { texto: '¿Siente que tiene más problemas de memoria que la mayoría de la gente?' },
            { texto: '¿Piensa que es maravilloso estar vivo(a)?', invertida: true },
            { texto: '¿Se siente bastante inútil tal como está ahora?' },
            { texto: '¿Se siente lleno(a) de energía?', invertida: true },
            { texto: '¿Siente que su situación no tiene esperanza?' },
            { texto: '¿Cree que la mayoría de las personas están mejor que usted?' }
        ],
        rangos: [
            { hasta: 4, texto: 'Sin indicios de depresión.', nivel: 'ok' },
            { hasta: 8, texto: 'Indicios de depresión leve.', nivel: 'leve' },
            { hasta: 11, texto: 'Indicios de depresión moderada.', nivel: 'alto' },
            { hasta: 15, texto: 'Indicios de depresión severa.', nivel: 'alto' }
        ],
        umbral: 5
    },

    // ---------------------------------------------------------- ANSIEDAD
    gad7: {
        titulo: 'Escala de Ansiedad Generalizada (GAD-7)',
        categoria: 'Ansiedad',
        tipo: 'validada',
        fuente: 'GAD-7 · Spitzer, Kroenke, Williams y Löwe. Desarrollado con una beca educativa de Pfizer Inc. Uso libre, no requiere permiso.',
        instrucciones: 'Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado los siguientes problemas?',
        opciones: FRECUENCIA_2_SEMANAS,
        preguntas: [
            { texto: 'Se ha sentido nervioso(a), ansioso(a) o con los nervios de punta.' },
            { texto: 'No ha sido capaz de parar o controlar su preocupación.' },
            { texto: 'Se ha preocupado demasiado por diferentes cosas.' },
            { texto: 'Ha tenido dificultad para relajarse.' },
            { texto: 'Se ha sentido tan inquieto(a) que no ha podido quedarse quieto(a).' },
            { texto: 'Se ha molestado o irritado fácilmente.' },
            { texto: 'Ha tenido miedo de que algo terrible fuera a pasar.' }
        ],
        rangos: [
            { hasta: 4, texto: 'Ansiedad mínima.', nivel: 'ok' },
            { hasta: 9, texto: 'Ansiedad leve.', nivel: 'leve' },
            { hasta: 14, texto: 'Ansiedad moderada.', nivel: 'alto' },
            { hasta: 21, texto: 'Ansiedad severa.', nivel: 'alto' }
        ],
        umbral: 10
    },

    ansiedadCotidiana: {
        titulo: 'Cuestionario de Ansiedad en la Vida Diaria',
        categoria: 'Ansiedad',
        tipo: 'propia',
        instrucciones: 'Durante el último mes, ¿con qué frecuencia le ha pasado lo siguiente?',
        opciones: FRECUENCIA_PROPIA,
        preguntas: [
            { texto: 'He sentido el corazón acelerado, falta de aire o presión en el pecho sin hacer esfuerzo físico.' },
            { texto: 'He tenido tensión en el cuello, los hombros o la mandíbula.' },
            { texto: 'He evitado lugares, personas o situaciones por miedo a sentirme mal.' },
            { texto: 'Me ha costado dejar de pensar en lo que podría salir mal.' },
            { texto: 'He sentido malestar en el estómago (náuseas, nudo, diarrea) por nervios.' },
            { texto: 'He necesitado revisar o confirmar varias veces las cosas para quedarme tranquilo(a).' },
            { texto: 'Me he sentido en peligro o en alerta aunque no hubiera una razón clara.' },
            { texto: 'La preocupación me ha impedido concentrarme en el trabajo, el estudio o la casa.' }
        ],
        get rangos() {
            return rangosPorcentaje(24, [
                'Nivel bajo de ansiedad en la vida diaria.',
                'Nivel moderado: la ansiedad está afectando algunas áreas de su vida.',
                'Nivel alto: la ansiedad está interfiriendo de forma importante en su día a día.'
            ]);
        },
        umbral: 9
    },

    // ---------------------------------------------------------- ESTRÉS
    estresPercibido: {
        titulo: 'Cuestionario de Estrés Percibido',
        categoria: 'Estrés',
        tipo: 'propia',
        instrucciones: 'Durante el último mes, ¿con qué frecuencia se ha sentido o ha pensado de esta manera?',
        opciones: FRECUENCIA_PROPIA,
        preguntas: [
            { texto: 'He sentido que tengo más responsabilidades de las que puedo manejar.' },
            { texto: 'Me he sentido irritable o con poca paciencia.' },
            { texto: 'He sentido que las cosas no salen como espero, por mucho que me esfuerce.' },
            { texto: 'Me ha costado desconectarme de los problemas al final del día.' },
            { texto: 'He tenido dolores de cabeza, cansancio o malestar físico sin causa médica clara.' },
            { texto: 'He sentido que no tengo tiempo para mí.' },
            { texto: 'Me he sentido capaz de resolver mis problemas personales.', invertida: true },
            { texto: 'He sentido que tengo el control de las cosas importantes de mi vida.', invertida: true },
            { texto: 'He comido, fumado o bebido más de lo usual para calmarme.' },
            { texto: 'He sentido que los problemas se acumulan y no puedo con ellos.' }
        ],
        get rangos() {
            return rangosPorcentaje(30, [
                'Nivel bajo de estrés.',
                'Nivel moderado de estrés: conviene revisar sus fuentes de tensión.',
                'Nivel alto de estrés: está afectando su bienestar.'
            ]);
        },
        umbral: 11
    },

    estresLaboral: {
        titulo: 'Cuestionario de Estrés Laboral',
        categoria: 'Psicología Organizacional',
        tipo: 'propia',
        instrucciones: 'Pensando en su trabajo o estudio durante el último mes, ¿con qué frecuencia le pasa lo siguiente?',
        opciones: FRECUENCIA_PROPIA,
        preguntas: [
            { texto: 'La cantidad de trabajo es mayor de la que puedo hacer en mi horario.' },
            { texto: 'Recibo instrucciones poco claras o contradictorias.' },
            { texto: 'Siento que tengo poco control sobre cómo organizo mis tareas.' },
            { texto: 'Me llevo trabajo o preocupaciones laborales a la casa.' },
            { texto: 'Tengo conflictos o tensiones con compañeros o jefes.' },
            { texto: 'Siento que mi esfuerzo no es reconocido.' },
            { texto: 'Me preocupa perder mi trabajo o mis ingresos.' },
            { texto: 'Siento presión constante por cumplir plazos.' },
            { texto: 'Cuento con apoyo de mis compañeros o jefes cuando lo necesito.', invertida: true },
            { texto: 'Pienso en el trabajo con angustia el domingo o antes de empezar la semana.' }
        ],
        get rangos() {
            return rangosPorcentaje(30, [
                'Nivel bajo de estrés laboral.',
                'Nivel moderado de estrés laboral.',
                'Nivel alto de estrés laboral: su entorno de trabajo está afectando su salud.'
            ]);
        },
        umbral: 11
    },

    desgasteLaboral: {
        titulo: 'Cuestionario de Desgaste Laboral (Burnout)',
        categoria: 'Psicología Organizacional',
        tipo: 'propia',
        instrucciones: 'Durante los últimos 3 meses, ¿con qué frecuencia se ha sentido así con respecto a su trabajo?',
        opciones: FRECUENCIA_PROPIA,
        preguntas: [
            { texto: 'Termino la jornada emocionalmente agotado(a).' },
            { texto: 'Me levanto cansado(a) solo de pensar en otro día de trabajo.' },
            { texto: 'Siento que trabajar con personas me desgasta.' },
            { texto: 'Me he vuelto más frío(a) o indiferente con las personas con las que trabajo.' },
            { texto: 'Siento que mi trabajo ha perdido sentido.' },
            { texto: 'Me cuesta sentir satisfacción por lo que logro.' },
            { texto: 'Siento que ya no rindo como antes.' },
            { texto: 'He pensado en renunciar porque no aguanto más.' },
            { texto: 'Me siento con energía para afrontar mis tareas.', invertida: true }
        ],
        get rangos() {
            return rangosPorcentaje(27, [
                'Sin señales importantes de desgaste laboral.',
                'Señales moderadas de desgaste: es un buen momento para tomar medidas.',
                'Señales altas de desgaste laboral (burnout).'
            ]);
        },
        umbral: 10
    },

    // ---------------------------------------------------------- AUTOESTIMA
    rosenberg: {
        titulo: 'Escala de Autoestima de Rosenberg',
        categoria: 'Autoestima',
        tipo: 'validada',
        fuente: 'Rosenberg Self-Esteem Scale · Morris Rosenberg (1965). Uso libre para fines educativos y profesionales.',
        instrucciones: 'Indique qué tan de acuerdo está con cada una de las siguientes frases.',
        opciones: [
            { texto: 'Muy de acuerdo', valor: 4 },
            { texto: 'De acuerdo', valor: 3 },
            { texto: 'En desacuerdo', valor: 2 },
            { texto: 'Muy en desacuerdo', valor: 1 }
        ],
        preguntas: [
            { texto: 'Siento que soy una persona digna de aprecio, al menos en igual medida que los demás.' },
            { texto: 'Estoy convencido(a) de que tengo cualidades buenas.' },
            { texto: 'Soy capaz de hacer las cosas tan bien como la mayoría de la gente.' },
            { texto: 'Tengo una actitud positiva hacia mí mismo(a).' },
            { texto: 'En general, estoy satisfecho(a) conmigo mismo(a).' },
            { texto: 'Siento que no tengo mucho de lo que estar orgulloso(a).', invertida: true },
            { texto: 'En general, me inclino a pensar que soy un fracaso.', invertida: true },
            { texto: 'Me gustaría poder sentir más respeto por mí mismo(a).', invertida: true },
            { texto: 'Hay veces que realmente pienso que soy un(a) inútil.', invertida: true },
            { texto: 'A veces creo que no soy buena persona.', invertida: true }
        ],
        rangos: [
            { hasta: 25, texto: 'Autoestima baja.', nivel: 'alto' },
            { hasta: 29, texto: 'Autoestima media.', nivel: 'leve' },
            { hasta: 40, texto: 'Autoestima elevada.', nivel: 'ok' }
        ],
        umbral: 25,
        umbralMenor: true
    },

    // ---------------------------------------------------------- SUEÑO
    calidadSueno: {
        titulo: 'Cuestionario de Calidad del Sueño',
        categoria: 'Calidad del Sueño',
        tipo: 'propia',
        instrucciones: 'Durante el último mes, ¿con qué frecuencia le ha pasado lo siguiente?',
        opciones: FRECUENCIA_PROPIA,
        preguntas: [
            { texto: 'Me despierto sintiéndome descansado(a).', invertida: true },
            { texto: 'Duermo menos de 6 horas por noche.' },
            { texto: 'Me despierto durante la noche y me cuesta volver a dormir.' },
            { texto: 'Me acuesto y me levanto a horas muy distintas cada día.' },
            { texto: 'Uso el celular, la televisión o el computador en la cama antes de dormir.' },
            { texto: 'Tomo café, bebidas energéticas o alcohol en la tarde o la noche.' },
            { texto: 'Tengo sueño o me quedo dormido(a) durante el día sin querer.' },
            { texto: 'Ronco fuerte o me han dicho que dejo de respirar mientras duermo.' }
        ],
        get rangos() {
            return rangosPorcentaje(24, [
                'Buena calidad del sueño.',
                'Calidad del sueño regular: algunos hábitos pueden estar afectando su descanso.',
                'Mala calidad del sueño: su descanso está afectado de forma importante.'
            ]);
        },
        umbral: 9
    },

    insomnio: {
        titulo: 'Cuestionario de Síntomas de Insomnio',
        categoria: 'Calidad del Sueño',
        tipo: 'propia',
        instrucciones: 'Durante las últimas 2 semanas, ¿con qué frecuencia le ha pasado lo siguiente?',
        opciones: FRECUENCIA_PROPIA,
        preguntas: [
            { texto: 'Tardo más de 30 minutos en quedarme dormido(a).' },
            { texto: 'Me despierto varias veces durante la noche.' },
            { texto: 'Me despierto mucho antes de la hora que quería y ya no me duermo.' },
            { texto: 'Me preocupa no poder dormir.' },
            { texto: 'La falta de sueño afecta mi ánimo, concentración o memoria durante el día.' },
            { texto: 'Otras personas han notado que estoy cansado(a) o irritable por dormir mal.' },
            { texto: 'Tomo medicamentos o remedios para poder dormir.' }
        ],
        get rangos() {
            return rangosPorcentaje(21, [
                'Sin síntomas importantes de insomnio.',
                'Síntomas moderados de insomnio.',
                'Síntomas altos de insomnio.'
            ]);
        },
        umbral: 8
    },

    // ---------------------------------------------------------- BIENESTAR
    who5: {
        titulo: 'Índice de Bienestar de la OMS (WHO-5)',
        categoria: 'Bienestar General',
        tipo: 'validada',
        fuente: 'WHO-5 · Psychiatric Research Unit, Mental Health Centre North Zealand (Dinamarca). Uso libre, no requiere permiso.',
        instrucciones: 'Durante las últimas 2 semanas...',
        opciones: [
            { texto: 'Todo el tiempo', valor: 5 },
            { texto: 'La mayor parte del tiempo', valor: 4 },
            { texto: 'Más de la mitad del tiempo', valor: 3 },
            { texto: 'Menos de la mitad del tiempo', valor: 2 },
            { texto: 'De vez en cuando', valor: 1 },
            { texto: 'Nunca', valor: 0 }
        ],
        preguntas: [
            { texto: 'Me he sentido alegre y de buen ánimo.' },
            { texto: 'Me he sentido tranquilo(a) y relajado(a).' },
            { texto: 'Me he sentido activo(a) y con energía.' },
            { texto: 'Me he despertado fresco(a) y descansado(a).' },
            { texto: 'Mi vida diaria ha estado llena de cosas que me interesan.' }
        ],
        // El puntaje se multiplica por 4 para obtener un porcentaje (0 a 100)
        puntuar: total => total * 4,
        sufijo: '%',
        rangos: [
            { hasta: 28, texto: 'Bienestar muy bajo. Se recomienda una valoración profesional.', nivel: 'alto' },
            { hasta: 50, texto: 'Bienestar bajo.', nivel: 'leve' },
            { hasta: 100, texto: 'Buen nivel de bienestar.', nivel: 'ok' }
        ],
        umbral: 50,
        umbralMenor: true
    },

    satisfaccionVida: {
        titulo: 'Escala de Satisfacción con la Vida (SWLS)',
        categoria: 'Bienestar General',
        tipo: 'validada',
        fuente: 'Satisfaction With Life Scale · Diener, Emmons, Larsen y Griffin (1985). Uso libre, no requiere permiso.',
        instrucciones: 'Indique qué tan de acuerdo está con cada frase.',
        opciones: [
            { texto: 'Totalmente de acuerdo', valor: 7 },
            { texto: 'De acuerdo', valor: 6 },
            { texto: 'Ligeramente de acuerdo', valor: 5 },
            { texto: 'Ni de acuerdo ni en desacuerdo', valor: 4 },
            { texto: 'Ligeramente en desacuerdo', valor: 3 },
            { texto: 'En desacuerdo', valor: 2 },
            { texto: 'Totalmente en desacuerdo', valor: 1 }
        ],
        preguntas: [
            { texto: 'En la mayoría de los aspectos, mi vida se acerca a mi ideal.' },
            { texto: 'Las condiciones de mi vida son excelentes.' },
            { texto: 'Estoy satisfecho(a) con mi vida.' },
            { texto: 'Hasta ahora he conseguido las cosas importantes que quiero en la vida.' },
            { texto: 'Si pudiera vivir mi vida de nuevo, no cambiaría casi nada.' }
        ],
        rangos: [
            { hasta: 9, texto: 'Muy insatisfecho(a) con la vida.', nivel: 'alto' },
            { hasta: 14, texto: 'Insatisfecho(a) con la vida.', nivel: 'alto' },
            { hasta: 19, texto: 'Ligeramente insatisfecho(a).', nivel: 'leve' },
            { hasta: 20, texto: 'Punto neutral.', nivel: 'leve' },
            { hasta: 25, texto: 'Ligeramente satisfecho(a).', nivel: 'ok' },
            { hasta: 30, texto: 'Satisfecho(a) con la vida.', nivel: 'ok' },
            { hasta: 35, texto: 'Muy satisfecho(a) con la vida.', nivel: 'ok' }
        ],
        umbral: 14,
        umbralMenor: true
    },

    equilibrioVida: {
        titulo: 'Cuestionario de Equilibrio Personal',
        categoria: 'Bienestar General',
        tipo: 'propia',
        instrucciones: 'Durante el último mes, ¿con qué frecuencia ha sentido lo siguiente?',
        opciones: [
            { texto: 'Casi siempre', valor: 3 },
            { texto: 'Con frecuencia', valor: 2 },
            { texto: 'A veces', valor: 1 },
            { texto: 'Nunca', valor: 0 }
        ],
        preguntas: [
            { texto: 'Tengo personas de confianza con las que puedo hablar de lo que siento.' },
            { texto: 'Siento que mi vida tiene un propósito o una dirección.' },
            { texto: 'Dedico tiempo a actividades que disfruto.' },
            { texto: 'Me acepto a mí mismo(a), con mis virtudes y defectos.' },
            { texto: 'Puedo tomar mis propias decisiones sin depender de la aprobación de otros.' },
            { texto: 'Siento que estoy aprendiendo y creciendo como persona.' },
            { texto: 'Cuido mi cuerpo: como, me muevo y descanso de forma adecuada.' },
            { texto: 'Logro equilibrar el trabajo o estudio con mi vida personal.' }
        ],
        get rangos() {
            return [
                { hasta: 8, texto: 'Equilibrio personal bajo: varias áreas de su vida necesitan atención.', nivel: 'alto' },
                { hasta: 16, texto: 'Equilibrio personal medio.', nivel: 'leve' },
                { hasta: 24, texto: 'Buen equilibrio personal.', nivel: 'ok' }
            ];
        },
        umbral: 8,
        umbralMenor: true
    },

    // ---------------------------------------------------------- ORGANIZACIONAL
    cbi: {
        titulo: 'Inventario de Burnout de Copenhague (CBI) - Trabajo',
        categoria: 'Psicología Organizacional',
        tipo: 'validada',
        fuente: 'Copenhagen Burnout Inventory, escala de burnout relacionado con el trabajo · Kristensen y cols. (2005), Centro Nacional de Investigación del Entorno Laboral de Dinamarca. Uso libre.',
        instrucciones: 'Responda pensando en su trabajo actual. El resultado va de 0 a 100.',
        preguntas: [
            { texto: '¿Se siente agotado(a) al final de la jornada de trabajo?', opciones: 'frecuencia' },
            { texto: '¿Se siente agotado(a) por las mañanas solo de pensar en otro día de trabajo?', opciones: 'frecuencia' },
            { texto: '¿Siente que cada hora de trabajo es agotadora para usted?', opciones: 'frecuencia' },
            { texto: '¿Tiene suficiente energía para su familia y amigos en su tiempo libre?', opciones: 'frecuencia', invertida: true },
            { texto: '¿Su trabajo es emocionalmente agotador?', opciones: 'grado' },
            { texto: '¿Su trabajo le frustra?', opciones: 'grado' },
            { texto: '¿Se siente quemado(a) por su trabajo?', opciones: 'grado' }
        ],
        // El puntaje es el promedio de las 7 respuestas (0 a 100)
        puntuar: total => Math.round(total / 7),
        rangos: [
            { hasta: 49, texto: 'Burnout bajo.', nivel: 'ok' },
            { hasta: 74, texto: 'Burnout moderado.', nivel: 'leve' },
            { hasta: 99, texto: 'Burnout alto.', nivel: 'alto' },
            { hasta: 100, texto: 'Burnout severo.', nivel: 'alto' }
        ],
        umbral: 50
    },

    satisfaccionLaboral: {
        titulo: 'Escala de Satisfacción Laboral (Warr, Cook y Wall)',
        categoria: 'Psicología Organizacional',
        tipo: 'validada',
        fuente: 'Overall Job Satisfaction Scale · Warr, Cook y Wall (1979). Versión en español publicada por el INSST (NTP 394). Uso libre.',
        instrucciones: '¿Qué tan satisfecho(a) se siente con cada uno de estos aspectos de su trabajo?',
        opciones: [
            { texto: 'Muy insatisfecho(a)', valor: 1 },
            { texto: 'Insatisfecho(a)', valor: 2 },
            { texto: 'Moderadamente insatisfecho(a)', valor: 3 },
            { texto: 'Ni satisfecho(a) ni insatisfecho(a)', valor: 4 },
            { texto: 'Moderadamente satisfecho(a)', valor: 5 },
            { texto: 'Satisfecho(a)', valor: 6 },
            { texto: 'Muy satisfecho(a)', valor: 7 }
        ],
        preguntas: [
            { texto: 'Las condiciones físicas del trabajo.' },
            { texto: 'La libertad para elegir su propio método de trabajo.' },
            { texto: 'Sus compañeros de trabajo.' },
            { texto: 'El reconocimiento que obtiene por el trabajo bien hecho.' },
            { texto: 'Su superior inmediato.' },
            { texto: 'La responsabilidad que se le ha asignado.' },
            { texto: 'Su salario.' },
            { texto: 'La posibilidad de utilizar sus capacidades.' },
            { texto: 'Las relaciones entre la dirección y los trabajadores de su empresa.' },
            { texto: 'Sus posibilidades de ascender.' },
            { texto: 'El modo en que su empresa está gestionada.' },
            { texto: 'La atención que se presta a las sugerencias que usted hace.' },
            { texto: 'Su horario de trabajo.' },
            { texto: 'La variedad de tareas que realiza en su trabajo.' },
            { texto: 'Su estabilidad en el empleo.' }
        ],
        rangos: [
            { hasta: 52, texto: 'Insatisfacción laboral general.', nivel: 'alto' },
            { hasta: 67, texto: 'Satisfacción laboral intermedia.', nivel: 'leve' },
            { hasta: 105, texto: 'Satisfacción laboral general.', nivel: 'ok' }
        ],
        umbral: 52,
        umbralMenor: true
    },

    climaLaboral: {
        titulo: 'Cuestionario de Clima Laboral',
        categoria: 'Psicología Organizacional',
        tipo: 'propia',
        instrucciones: 'Pensando en su lugar de trabajo actual, ¿con qué frecuencia ocurre lo siguiente?',
        opciones: [
            { texto: 'Casi siempre', valor: 3 },
            { texto: 'Con frecuencia', valor: 2 },
            { texto: 'A veces', valor: 1 },
            { texto: 'Nunca', valor: 0 }
        ],
        preguntas: [
            { texto: 'En mi trabajo hay un ambiente de respeto entre las personas.' },
            { texto: 'La comunicación entre las áreas es clara y oportuna.' },
            { texto: 'Me siento libre de expresar mis opiniones sin miedo a represalias.' },
            { texto: 'Las normas y decisiones se aplican de forma justa para todos.' },
            { texto: 'Tengo los recursos y herramientas necesarios para hacer mi trabajo.' },
            { texto: 'Siento que la empresa se preocupa por el bienestar de sus empleados.' },
            { texto: 'Los conflictos se resuelven de manera adecuada.' },
            { texto: 'Me siento orgulloso(a) de trabajar en esta organización.' },
            { texto: 'Existen oportunidades de capacitación y crecimiento.' },
            { texto: 'Recomendaría esta empresa como un buen lugar para trabajar.' }
        ],
        get rangos() {
            return [
                { hasta: 10, texto: 'Clima laboral desfavorable.', nivel: 'alto' },
                { hasta: 20, texto: 'Clima laboral intermedio: hay aspectos por mejorar.', nivel: 'leve' },
                { hasta: 30, texto: 'Clima laboral favorable.', nivel: 'ok' }
            ];
        },
        umbral: 10,
        umbralMenor: true
    },

    trabajoEquipo: {
        titulo: 'Cuestionario de Trabajo en Equipo',
        categoria: 'Psicología Organizacional',
        tipo: 'propia',
        instrucciones: 'Pensando en su equipo de trabajo, ¿con qué frecuencia ocurre lo siguiente?',
        opciones: [
            { texto: 'Casi siempre', valor: 3 },
            { texto: 'Con frecuencia', valor: 2 },
            { texto: 'A veces', valor: 1 },
            { texto: 'Nunca', valor: 0 }
        ],
        preguntas: [
            { texto: 'Los objetivos del equipo están claros para todos.' },
            { texto: 'Cada persona sabe cuáles son sus funciones y responsabilidades.' },
            { texto: 'Nos ayudamos cuando alguien tiene mucha carga de trabajo.' },
            { texto: 'Confío en que mis compañeros cumplirán con su parte.' },
            { texto: 'Las reuniones del equipo son útiles y productivas.' },
            { texto: 'Las diferencias de opinión se discuten con respeto.' },
            { texto: 'Celebramos juntos los logros del equipo.' },
            { texto: 'Me siento parte importante del equipo.' }
        ],
        get rangos() {
            return [
                { hasta: 8, texto: 'Trabajo en equipo débil.', nivel: 'alto' },
                { hasta: 16, texto: 'Trabajo en equipo intermedio.', nivel: 'leve' },
                { hasta: 24, texto: 'Buen trabajo en equipo.', nivel: 'ok' }
            ];
        },
        umbral: 8,
        umbralMenor: true
    },

    liderazgo: {
        titulo: 'Cuestionario de Liderazgo Percibido',
        categoria: 'Psicología Organizacional',
        tipo: 'propia',
        instrucciones: 'Pensando en su jefe o líder directo, ¿con qué frecuencia ocurre lo siguiente?',
        opciones: [
            { texto: 'Casi siempre', valor: 3 },
            { texto: 'Con frecuencia', valor: 2 },
            { texto: 'A veces', valor: 1 },
            { texto: 'Nunca', valor: 0 }
        ],
        preguntas: [
            { texto: 'Explica con claridad lo que espera de mí.' },
            { texto: 'Me da retroalimentación útil sobre mi trabajo.' },
            { texto: 'Reconoce cuando hago bien las cosas.' },
            { texto: 'Me trata con respeto, incluso cuando hay problemas.' },
            { texto: 'Escucha mis ideas y sugerencias.' },
            { texto: 'Cumple lo que promete.' },
            { texto: 'Apoya mi desarrollo profesional.' },
            { texto: 'Da ejemplo con su comportamiento.' }
        ],
        get rangos() {
            return [
                { hasta: 8, texto: 'Percepción de liderazgo desfavorable.', nivel: 'alto' },
                { hasta: 16, texto: 'Percepción de liderazgo intermedia.', nivel: 'leve' },
                { hasta: 24, texto: 'Percepción de liderazgo favorable.', nivel: 'ok' }
            ];
        },
        umbral: 8,
        umbralMenor: true
    },

    balanceVidaTrabajo: {
        titulo: 'Cuestionario de Equilibrio Vida-Trabajo',
        categoria: 'Psicología Organizacional',
        tipo: 'propia',
        instrucciones: 'Durante el último mes, ¿con qué frecuencia le ha pasado lo siguiente?',
        opciones: FRECUENCIA_PROPIA,
        preguntas: [
            { texto: 'Trabajo más horas de las que me corresponden.' },
            { texto: 'Respondo mensajes o correos del trabajo en mi tiempo libre.' },
            { texto: 'El trabajo me impide compartir tiempo con mi familia o amigos.' },
            { texto: 'He dejado de hacer actividades que disfruto por falta de tiempo.' },
            { texto: 'Mis problemas personales afectan mi rendimiento en el trabajo.' },
            { texto: 'Llego a casa sin energía para nada más.' },
            { texto: 'Puedo tomar mis vacaciones y descansos sin problema.', invertida: true },
            { texto: 'Siento culpa cuando descanso o no estoy trabajando.' }
        ],
        get rangos() {
            return rangosPorcentaje(24, [
                'Buen equilibrio entre la vida personal y el trabajo.',
                'Equilibrio vida-trabajo afectado de forma moderada.',
                'Desequilibrio importante entre la vida personal y el trabajo.'
            ]);
        },
        umbral: 9
    },

    // ---------------------------------------------------------- CLÍNICA
    k10: {
        titulo: 'Escala de Malestar Psicológico de Kessler (K-10)',
        categoria: 'Psicología Clínica',
        tipo: 'validada',
        fuente: 'Kessler Psychological Distress Scale (K-10) · Kessler y cols. (2002). Uso libre.',
        instrucciones: 'Durante los últimos 30 días, ¿con qué frecuencia...',
        opciones: [
            { texto: 'Nunca', valor: 1 },
            { texto: 'Pocas veces', valor: 2 },
            { texto: 'A veces', valor: 3 },
            { texto: 'Muchas veces', valor: 4 },
            { texto: 'Siempre', valor: 5 }
        ],
        preguntas: [
            { texto: '...se ha sentido cansado(a) sin una buena razón?' },
            { texto: '...se ha sentido nervioso(a)?' },
            { texto: '...se ha sentido tan nervioso(a) que nada lo(a) podía calmar?' },
            { texto: '...se ha sentido sin esperanza?' },
            { texto: '...se ha sentido inquieto(a) o intranquilo(a)?' },
            { texto: '...se ha sentido tan inquieto(a) que no podía quedarse quieto(a)?' },
            { texto: '...se ha sentido deprimido(a)?' },
            { texto: '...ha sentido que todo lo que hacía le costaba un gran esfuerzo?' },
            { texto: '...se ha sentido tan triste que nada lo(a) podía animar?' },
            { texto: '...se ha sentido inútil o sin valor?' }
        ],
        rangos: [
            { hasta: 15, texto: 'Malestar psicológico bajo.', nivel: 'ok' },
            { hasta: 21, texto: 'Malestar psicológico moderado.', nivel: 'leve' },
            { hasta: 29, texto: 'Malestar psicológico alto.', nivel: 'alto' },
            { hasta: 50, texto: 'Malestar psicológico muy alto.', nivel: 'alto' }
        ],
        umbral: 22
    },

    audit: {
        titulo: 'Test de Identificación de Trastornos por Consumo de Alcohol (AUDIT)',
        categoria: 'Psicología Clínica',
        tipo: 'validada',
        fuente: 'AUDIT · Organización Mundial de la Salud (Babor y cols., 2001). Uso libre.',
        instrucciones: 'Las preguntas se refieren a su consumo de bebidas alcohólicas (cerveza, vino, aguardiente, ron, etc.) durante el último año.',
        preguntas: [
            { texto: '¿Con qué frecuencia consume alguna bebida alcohólica?', opciones: [
                { texto: 'Nunca', valor: 0 }, { texto: 'Una vez al mes o menos', valor: 1 },
                { texto: 'De 2 a 4 veces al mes', valor: 2 }, { texto: 'De 2 a 3 veces a la semana', valor: 3 },
                { texto: '4 o más veces a la semana', valor: 4 }] },
            { texto: '¿Cuántas bebidas alcohólicas suele tomar en un día de consumo normal?', opciones: [
                { texto: '1 o 2', valor: 0 }, { texto: '3 o 4', valor: 1 }, { texto: '5 o 6', valor: 2 },
                { texto: '7 a 9', valor: 3 }, { texto: '10 o más', valor: 4 }] },
            { texto: '¿Con qué frecuencia toma 6 o más bebidas alcohólicas en una sola ocasión?', opciones: 'frecuenciaAudit' },
            { texto: '¿Con qué frecuencia, en el último año, no ha podido parar de beber una vez que había empezado?', opciones: 'frecuenciaAudit' },
            { texto: '¿Con qué frecuencia, en el último año, no pudo hacer lo que se esperaba de usted porque había bebido?', opciones: 'frecuenciaAudit' },
            { texto: '¿Con qué frecuencia, en el último año, ha necesitado beber en ayunas para recuperarse después de haber bebido mucho el día anterior?', opciones: 'frecuenciaAudit' },
            { texto: '¿Con qué frecuencia, en el último año, ha tenido remordimientos o sentimientos de culpa después de haber bebido?', opciones: 'frecuenciaAudit' },
            { texto: '¿Con qué frecuencia, en el último año, no ha podido recordar lo que sucedió la noche anterior porque había estado bebiendo?', opciones: 'frecuenciaAudit' },
            { texto: '¿Usted o alguna otra persona ha resultado herido(a) porque usted había bebido?', opciones: 'siNoAudit' },
            { texto: '¿Algún familiar, amigo, médico u otro profesional de la salud se ha preocupado por su consumo de alcohol o le ha sugerido que deje de beber?', opciones: 'siNoAudit' }
        ],
        rangos: [
            { hasta: 7, texto: 'Consumo de bajo riesgo.', nivel: 'ok' },
            { hasta: 15, texto: 'Consumo de riesgo.', nivel: 'leve' },
            { hasta: 19, texto: 'Consumo perjudicial.', nivel: 'alto' },
            { hasta: 40, texto: 'Posible dependencia del alcohol.', nivel: 'alto' }
        ],
        umbral: 8
    },

    pcptsd5: {
        titulo: 'Tamizaje de Estrés Postraumático (PC-PTSD-5)',
        categoria: 'Psicología Clínica',
        tipo: 'validada',
        fuente: 'Primary Care PTSD Screen for DSM-5 · Prins y cols. (2016), Centro Nacional de TEPT de EE. UU. Dominio público.',
        instrucciones: 'Responda solo si alguna vez ha vivido un evento muy aterrador, horrible o traumático (por ejemplo: un accidente grave, una agresión física o sexual, un desastre natural, violencia armada o la muerte repentina de un ser querido). En el último mes, usted...',
        opciones: SI_NO,
        preguntas: [
            { texto: '¿Ha tenido pesadillas sobre el evento o ha pensado en él cuando no quería?' },
            { texto: '¿Se ha esforzado mucho por no pensar en el evento o ha evitado situaciones que se lo recuerden?' },
            { texto: '¿Ha estado constantemente en guardia, alerta o se asusta con facilidad?' },
            { texto: '¿Se ha sentido adormecido(a) o desconectado(a) de las personas, las actividades o lo que le rodea?' },
            { texto: '¿Se ha sentido culpable o no ha podido dejar de culparse a sí mismo(a) o a otros por el evento o por los problemas que causó?' }
        ],
        rangos: [
            { hasta: 2, texto: 'Pocas señales de estrés postraumático.', nivel: 'ok' },
            { hasta: 5, texto: 'Posibles señales de estrés postraumático.', nivel: 'alto' }
        ],
        umbral: 3
    },

    asrs: {
        titulo: 'Tamizaje de TDAH en Adultos (ASRS v1.1)',
        categoria: 'Psicología Clínica',
        tipo: 'validada',
        fuente: 'Adult ADHD Self-Report Scale v1.1, parte A · Organización Mundial de la Salud y Kessler y cols. (2005). Uso libre para tamizaje.',
        instrucciones: 'Para personas de 18 años o más. Durante los últimos 6 meses, ¿con qué frecuencia...',
        preguntas: [
            { texto: '...tiene dificultad para terminar los detalles finales de un proyecto, una vez que ya hizo las partes difíciles?', opciones: 'asrsA' },
            { texto: '...tiene dificultad para poner las cosas en orden cuando hace una tarea que requiere organización?', opciones: 'asrsA' },
            { texto: '...tiene problemas para recordar citas u obligaciones?', opciones: 'asrsA' },
            { texto: '...evita o retrasa empezar una tarea que requiere pensar mucho?', opciones: 'asrsB' },
            { texto: '...mueve o retuerce las manos o los pies cuando tiene que estar sentado(a) mucho tiempo?', opciones: 'asrsB' },
            { texto: '...se siente demasiado activo(a) o con la necesidad de hacer cosas, como si tuviera un motor por dentro?', opciones: 'asrsB' }
        ],
        rangos: [
            { hasta: 3, texto: 'El tamizaje no sugiere síntomas de TDAH.', nivel: 'ok' },
            { hasta: 6, texto: 'El tamizaje sugiere síntomas compatibles con TDAH en adultos.', nivel: 'alto' }
        ],
        umbral: 4
    },

    scoff: {
        titulo: 'Cuestionario SCOFF (Conducta Alimentaria)',
        categoria: 'Psicología Clínica',
        tipo: 'validada',
        fuente: 'SCOFF · Morgan, Reid y Lacey (1999). Versión en español de García-Campayo y cols. (2005). Uso libre.',
        instrucciones: 'Responda pensando en su relación con la comida y su cuerpo.',
        opciones: SI_NO,
        preguntas: [
            { texto: '¿Se provoca el vómito porque se siente incómodamente lleno(a)?' },
            { texto: '¿Le preocupa haber perdido el control sobre la cantidad que come?' },
            { texto: '¿Ha perdido recientemente más de 6 kilos en un período de 3 meses?' },
            { texto: '¿Cree que está gordo(a) aunque los demás le digan que está demasiado delgado(a)?' },
            { texto: '¿Diría que la comida domina su vida?' }
        ],
        rangos: [
            { hasta: 1, texto: 'Sin señales de riesgo en la conducta alimentaria.', nivel: 'ok' },
            { hasta: 5, texto: 'Posible riesgo de un trastorno de la conducta alimentaria.', nivel: 'alto' }
        ],
        umbral: 2
    }
};

// Respuestas con nombre, usadas con opciones: 'nombre' en una pregunta
const OPCIONES_NOMBRADAS = {
    // CBI
    frecuencia: [
        { texto: 'Siempre', valor: 100 },
        { texto: 'A menudo', valor: 75 },
        { texto: 'A veces', valor: 50 },
        { texto: 'Rara vez', valor: 25 },
        { texto: 'Nunca o casi nunca', valor: 0 }
    ],
    grado: [
        { texto: 'En un grado muy alto', valor: 100 },
        { texto: 'En un grado alto', valor: 75 },
        { texto: 'Algo', valor: 50 },
        { texto: 'Poco', valor: 25 },
        { texto: 'Muy poco', valor: 0 }
    ],
    // AUDIT
    frecuenciaAudit: [
        { texto: 'Nunca', valor: 0 },
        { texto: 'Menos de una vez al mes', valor: 1 },
        { texto: 'Mensualmente', valor: 2 },
        { texto: 'Semanalmente', valor: 3 },
        { texto: 'A diario o casi a diario', valor: 4 }
    ],
    siNoAudit: [
        { texto: 'No', valor: 0 },
        { texto: 'Sí, pero no en el último año', valor: 2 },
        { texto: 'Sí, en el último año', valor: 4 }
    ],
    // ASRS: las preguntas 1 a 3 cuentan desde "Algunas veces"; las 4 a 6 desde "Con frecuencia"
    asrsA: [
        { texto: 'Nunca', valor: 0 },
        { texto: 'Rara vez', valor: 0 },
        { texto: 'Algunas veces', valor: 1 },
        { texto: 'Con frecuencia', valor: 1 },
        { texto: 'Muy frecuentemente', valor: 1 }
    ],
    asrsB: [
        { texto: 'Nunca', valor: 0 },
        { texto: 'Rara vez', valor: 0 },
        { texto: 'Algunas veces', valor: 0 },
        { texto: 'Con frecuencia', valor: 1 },
        { texto: 'Muy frecuentemente', valor: 1 }
    ]
};

// Convertir los nombres de opciones en la lista de respuestas real
Object.values(PRUEBAS).forEach(prueba => {
    prueba.preguntas.forEach(pregunta => {
        if (typeof pregunta.opciones === 'string') {
            pregunta.opciones = OPCIONES_NOMBRADAS[pregunta.opciones];
        }
    });
});

// ============================================================
// PRUEBAS PROYECTIVAS DE DIBUJO (dibujo.html?p=<clave>)
// No tienen calificación automática: el dibujo y las respuestas
// se envían al profesional, que es quien los interpreta.
// ============================================================
const MATERIALES_DIBUJO = [
    'Una hoja blanca tamaño carta, en posición vertical (una hoja por dibujo).',
    'Un lápiz de grafito (HB o número 2) y un borrador.',
    'No uses regla, colores, plantillas ni imágenes de referencia.',
    'Un lugar tranquilo, sin ayuda ni sugerencias de otras personas.'
];

const DIBUJOS = {
    figuraHumana: {
        titulo: 'Test del Dibujo de la Figura Humana',
        categoria: 'Prueba proyectiva',
        referencia: 'Basado en la técnica del dibujo de la figura humana (K. Machover, 1949; E. Koppitz, 1968). La interpretación la realiza únicamente el profesional.',
        introduccion: 'No hay dibujos buenos ni malos, y no se evalúa si sabes dibujar. Dibuja con calma y tómate el tiempo que necesites.',
        materiales: MATERIALES_DIBUJO,
        dibujos: [
            { titulo: 'Dibujo 1', consigna: 'Dibuja una persona completa, de la cabeza a los pies. Puede ser como tú quieras.' },
            { titulo: 'Dibujo 2', consigna: 'En otra hoja, dibuja ahora una persona completa del sexo contrario al de la persona que dibujaste primero.' }
        ],
        preguntas: [
            'Sobre la persona del primer dibujo: ¿quién es y qué edad tiene?',
            '¿Qué está haciendo?',
            '¿Cómo se siente? ¿Por qué?',
            '¿Qué es lo que más le gusta y lo que menos le gusta de sí misma?',
            '¿Cuál es su mayor deseo?',
            '¿Qué es lo que más le preocupa o le da miedo?',
            '¿Se parece a ti en algo? ¿En qué?',
            'Sobre la persona del segundo dibujo: ¿quién es, qué edad tiene y qué está haciendo?'
        ]
    },

    familia: {
        titulo: 'Test del Dibujo de la Familia',
        categoria: 'Prueba proyectiva',
        referencia: 'Basado en la técnica del dibujo de la familia (L. Corman, 1961). La interpretación la realiza únicamente el profesional.',
        introduccion: 'No hay dibujos buenos ni malos, y no se evalúa si sabes dibujar. Dibuja con calma y tómate el tiempo que necesites.',
        materiales: MATERIALES_DIBUJO,
        dibujos: [
            { titulo: 'Dibujo', consigna: 'Dibuja una familia: una familia que tú imagines.' }
        ],
        preguntas: [
            '¿Quiénes son las personas de tu dibujo? Escribe el nombre, la edad y qué son entre ellos (papá, hija, abuelo...).',
            '¿En qué orden las dibujaste? (primero a..., luego a...)',
            '¿Dónde están y qué están haciendo?',
            '¿Quién es el más bueno de esta familia? ¿Por qué?',
            '¿Quién es el menos bueno? ¿Por qué?',
            '¿Quién es el más feliz? ¿Y el menos feliz? ¿Por qué?',
            '¿A quién prefieres en esta familia? ¿Por qué?',
            'Si tú fueras parte de esta familia, ¿quién serías? ¿Por qué?',
            '¿Falta alguien en el dibujo? ¿Quién?'
        ]
    }
};

// ============================================================
// CALIFICACIÓN (usada por la evaluación de empresas y el panel)
// ============================================================
function opcionesDePregunta(prueba, pregunta) {
    return pregunta.opciones || prueba.opciones;
}

// Puntaje de una pregunta según el índice de la opción elegida
function puntajePregunta(prueba, indicePregunta, indiceOpcion) {
    const pregunta = prueba.preguntas[indicePregunta];
    const opciones = opcionesDePregunta(prueba, pregunta);
    const valor = opciones[indiceOpcion].valor;
    if (!pregunta.invertida) return valor;
    const valores = opciones.map(o => o.valor);
    return Math.max(...valores) + Math.min(...valores) - valor;
}

// elegidas: lista con el índice de la opción elegida en cada pregunta
function calificarPrueba(prueba, elegidas) {
    let total = 0;
    elegidas.forEach((opcion, i) => { total += puntajePregunta(prueba, i, opcion); });
    if (prueba.puntuar) total = prueba.puntuar(total);
    const rango = prueba.rangos.find(r => total <= r.hasta) || prueba.rangos[prueba.rangos.length - 1];
    return { total, nivel: rango.nivel, texto: rango.texto };
}

// Puntaje mínimo y máximo posibles de una prueba
function rangoPuntaje(prueba) {
    let min = 0, max = 0;
    prueba.preguntas.forEach(p => {
        const valores = opcionesDePregunta(prueba, p).map(o => o.valor);
        min += Math.min(...valores);
        max += Math.max(...valores);
    });
    if (prueba.puntuar) { min = prueba.puntuar(min); max = prueba.puntuar(max); }
    return { min, max };
}

// ============================================================
// PLANES PARA ORGANIZACIONES (organizaciones.html y panel.html)
// ============================================================
// Qué mide cada prueba (texto para las empresas)
const DESCRIPCIONES_ORG = {
    cbi: 'Agotamiento físico y emocional relacionado con el trabajo.',
    satisfaccionLaboral: 'Satisfacción con 15 aspectos del trabajo: salario, jefe, compañeros, horario, estabilidad y más.',
    climaLaboral: 'Respeto, comunicación, justicia, recursos y sentido de pertenencia.',
    estresLaboral: 'Carga de trabajo, claridad de funciones, control, reconocimiento y presión por plazos.',
    desgasteLaboral: 'Señales de burnout: agotamiento, distanciamiento y pérdida de sentido del trabajo.',
    trabajoEquipo: 'Objetivos, roles, confianza, cooperación y manejo de diferencias en el equipo.',
    liderazgo: 'Cómo perciben los trabajadores a sus jefes directos.',
    balanceVidaTrabajo: 'Conflicto entre las exigencias del trabajo y la vida personal y familiar.',
    k10: 'Nivel general de malestar psicológico (nerviosismo, tristeza, desesperanza).',
    gad7: 'Síntomas de ansiedad en las últimas 2 semanas.',
    phq9: 'Síntomas depresivos en las últimas 2 semanas.'
};

const PLANES_ORG = {
    pequena: {
        nombre: 'Pequeña empresa',
        descripcion: 'Una evaluación corta y económica para empresas de 1 a 50 trabajadores. ' +
            'Mide lo esencial (agotamiento, clima y estrés) y entrega recomendaciones fáciles de aplicar. ' +
            'En equipos de menos de 10 personas los resultados se presentan solo de forma general, para proteger el anonimato.',
        pruebas: ['cbi', 'climaLaboral', 'estresLaboral'],
        opcionales: [],
        servicios: [
            'Reunión inicial virtual con el dueño o gerente.',
            'Aplicación anónima en línea o en papel.',
            'Análisis de resultados del equipo.',
            'Una charla de 1 hora sobre manejo del estrés.'
        ],
        entregables: [
            'Informe resumido de bienestar laboral.',
            'De 3 a 5 recomendaciones prácticas y de bajo costo.'
        ]
    },
    mediana: {
        nombre: 'Mediana empresa',
        descripcion: 'Un diagnóstico completo y ágil del bienestar laboral, pensado para empresas de 51 a 200 trabajadores. ' +
            'Identifica los principales factores de riesgo y entrega recomendaciones prácticas para la dirección.',
        pruebas: ['cbi', 'satisfaccionLaboral', 'climaLaboral', 'estresLaboral', 'trabajoEquipo'],
        opcionales: [],
        servicios: [
            'Reunión inicial con la gerencia o Talento Humano.',
            'Aplicación anónima en línea o en papel.',
            'Análisis de resultados de toda la empresa.',
            'Un taller grupal (manejo del estrés o comunicación asertiva).',
            'Socialización de resultados con la dirección.'
        ],
        entregables: [
            'Informe general de bienestar laboral.',
            'Mapa de los principales factores de riesgo y fortalezas.',
            'Recomendaciones priorizadas de intervención.'
        ]
    },
    grande: {
        nombre: 'Gran empresa',
        descripcion: 'Un programa integral para organizaciones de más de 200 trabajadores, con resultados por área o sede, ' +
            'plan de intervención y medición de seguimiento para ver el impacto de las acciones.',
        pruebas: ['cbi', 'satisfaccionLaboral', 'climaLaboral', 'estresLaboral', 'desgasteLaboral',
            'trabajoEquipo', 'liderazgo', 'balanceVidaTrabajo'],
        opcionales: ['k10', 'gad7', 'phq9'],
        servicios: [
            'Reuniones de planeación con gerencia, Talento Humano y SST.',
            'Aplicación anónima en línea o en papel, por áreas o sedes.',
            'Análisis comparativo entre áreas, sedes y cargos.',
            'Ciclo de 3 talleres (estrés, liderazgo y trabajo en equipo).',
            'Espacios de escucha y orientación para trabajadores que lo soliciten.',
            'Nueva medición a los 6 meses para comparar resultados.'
        ],
        entregables: [
            'Informe general y un informe por cada área o sede.',
            'Tablero de indicadores de bienestar laboral.',
            'Plan de intervención con responsables y fechas.',
            'Informe de seguimiento con la comparación antes y después.'
        ]
    }
};
