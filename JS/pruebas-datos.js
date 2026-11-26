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
        categoria: 'Estrés',
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
        categoria: 'Estrés',
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
        maximoMostrado: 100,
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
    }
};
