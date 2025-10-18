const questions = [
    {
        id: 1,
        text: "Estado de ánimo",
        options: [
            { value: 0, text: "No me siento triste" },
            { value: 1, text: "Me siento triste." },
            { value: 2, text: "Me siento triste continuamente y no puedo dejar de estarlo." },
            { value: 3, text: "Me siento tan triste o tan desgraciado que no puedo soportarlo." }
        ]
    },
    {
        id: 2,
        text: "Perspectiva del futuro",
        options: [
            { value: 0, text: "No me siento especialmente desanimado respecto al futuro." },
            { value: 1, text: "Me siento desanimado respecto al futuro." },
            { value: 2, text: "Siento que no tengo que esperar nada." },
            { value: 3, text: "Siento que el futuro es desesperanzador y las cosas no mejorarán." }
        ]
    },
    {
        id: 3,
        text: "Sentimiento de fracaso",
        options: [
            { value: 0, text: "No me siento fracasado." },
            { value: 1, text: "Creo que he fracasado más que la mayoría de las personas." },
            { value: 2, text: "Cuando miro hacia atrás, sólo veo fracaso tras fracaso." },
            { value: 3, text: "Me siento una persona totalmente fracasada." }
        ]
    },
    {
        id: 4,
        text: "Satisfacción",
        options: [
            { value: 0, text: "Las cosas me satisfacen tanto como antes." },
            { value: 1, text: "No disfruto de las cosas tanto como antes." },
            { value: 2, text: "Ya no obtengo una satisfacción auténtica de las cosas." },
            { value: 3, text: "Estoy insatisfecho o aburrido de todo." }
        ]
    },
    {
        id: 5,
        text: "Culpa",
        options: [
            { value: 0, text: "No me siento especialmente culpable." },
            { value: 1, text: "Me siento culpable en bastantes ocasiones." },
            { value: 2, text: "Me siento culpable en la mayoría de las ocasiones." },
            { value: 3, text: "Me siento culpable constantemente." }
        ]
    },
    {
        id: 6,
        text: "Castigo",
        options: [
            { value: 0, text: "No creo que esté siendo castigado." },
            { value: 1, text: "Me siento como si fuese a ser castigado." },
            { value: 2, text: "Espero ser castigado." },
            { value: 3, text: "Siento que estoy siendo castigado." }
        ]
    },
    {
        id: 7,
        text: "Decepción de sí mismo",
        options: [
            { value: 0, text: "No estoy decepcionado de mí mismo." },
            { value: 1, text: "Estoy decepcionado de mí mismo." },
            { value: 2, text: "Me da vergüenza de mí mismo." },
            { value: 3, text: "Me detesto." }
        ]
    },
    {
        id: 8,
        text: "Autocrítica",
        options: [
            { value: 0, text: "No me considero peor que cualquier otro." },
            { value: 1, text: "Me autocritico por mis debilidades o por mis errores." },
            { value: 2, text: "Continuamente me culpo por mis faltas." },
            { value: 3, text: "Me culpo por todo lo malo que sucede." }
        ]
    },
    {
        id: 9,
        text: "Pensamientos suicidas",
        options: [
            { value: 0, text: "No tengo ningún pensamiento de suicidio." },
            { value: 1, text: "A veces pienso en suicidarme, pero no lo cometería." },
            { value: 2, text: "Desearía suicidarme." },
            { value: 3, text: "Me suicidaría si tuviese la oportunidad." }
        ]
    },
    {
        id: 10,
        text: "Llanto",
        options: [
            { value: 0, text: "No lloro más de lo que solía llorar." },
            { value: 1, text: "Ahora lloro más que antes." },
            { value: 2, text: "Lloro continuamente." },
            { value: 3, text: "Antes era capaz de llorar, pero ahora no puedo, incluso aunque quiera." }
        ]
    },
    {
        id: 11,
        text: "Irritabilidad",
        options: [
            { value: 0, text: "No estoy más irritado de lo normal en mí." },
            { value: 1, text: "Me molesto o irrito más fácilmente que antes." },
            { value: 2, text: "Me siento irritado continuamente." },
            { value: 3, text: "No me irrito absolutamente nada por las cosas que antes solían irritarme." }
        ]
    },
    {
        id: 12,
        text: "Interés por los demás",
        options: [
            { value: 0, text: "No he perdido el interés por los demás." },
            { value: 1, text: "Estoy menos interesado en los demás que antes." },
            { value: 2, text: "He perdido la mayor parte de mi interés por los demás." },
            { value: 3, text: "He perdido todo el interés por los demás." }
        ]
    },
    {
        id: 13,
        text: "Toma de decisiones",
        options: [
            { value: 0, text: "Tomo decisiones más o menos como siempre he hecho." },
            { value: 1, text: "Evito tomar decisiones más que antes." },
            { value: 2, text: "Tomar decisiones me resulta mucho más difícil que antes." },
            { value: 3, text: "Ya me es imposible tomar decisiones." }
        ]
    },
    {
        id: 14,
        text: "Autoimagen",
        options: [
            { value: 0, text: "No creo tener peor aspecto que antes." },
            { value: 1, text: "Me temo que ahora parezco más viejo o poco atractivo." },
            { value: 2, text: "Creo que se han producido cambios permanentes en mi aspecto que me hacen parecer poco atractivo." },
            { value: 3, text: "Creo que tengo un aspecto horrible." }
        ]
    },
    {
        id: 15,
        text: "Capacidad de trabajo",
        options: [
            { value: 0, text: "Trabajo igual que antes." },
            { value: 1, text: "Me cuesta un esfuerzo extra comenzar a hacer algo." },
            { value: 2, text: "Tengo que obligarme mucho para hacer algo." },
            { value: 3, text: "No puedo hacer nada en absoluto." }
        ]
    },
    {
        id: 16,
        text: "Sueño",
        options: [
            { value: 0, text: "Duermo tan bien como siempre." },
            { value: 1, text: "No duermo tan bien como antes." },
            { value: 2, text: "Me despierto una o dos horas antes de lo habitual y me resulta difícil volver a dormir." },
            { value: 3, text: "Me despierto varias horas antes de lo habitual y no puedo volverme a dormir." }
        ]
    },
    {
        id: 17,
        text: "Fatiga",
        options: [
            { value: 0, text: "No me siento más cansado de lo normal." },
            { value: 1, text: "Me canso más fácilmente que antes." },
            { value: 2, text: "Me canso en cuanto hago cualquier cosa." },
            { value: 3, text: "Estoy demasiado cansado para hacer nada." }
        ]
    },
    {
        id: 18,
        text: "Apetito",
        options: [
            { value: 0, text: "Mi apetito no ha disminuido." },
            { value: 1, text: "No tengo tan buen apetito como antes." },
            { value: 2, text: "Ahora tengo mucho menos apetito." },
            { value: 3, text: "He perdido completamente el apetito." }
        ]
    },
    {
        id: 19,
        text: "Pérdida de peso",
        options: [
            { value: 0, text: "Últimamente he perdido poco peso o no he perdido nada" },
            { value: 1, text: "He perdido más de 2 kilos y medio" },
            { value: 2, text: "He perdido más de 4 kilos" },
            { value: 3, text: "He perdido más de 7 kilos" }
        ]
    },
    {
        id: 20,
        text: "Preocupación somática",
        options: [
            { value: 0, text: "No estoy preocupado por mi salud más de lo normal." },
            { value: 1, text: "Estoy preocupado por problemas físicos como dolores, molestias, malestar de estómago o estreñimiento." },
            { value: 2, text: "Estoy preocupado por mis problemas físicos y me resulta difícil pensar algo más." },
            { value: 3, text: "Estoy tan preocupado por mis problemas físicos que soy incapaz de pensar en cualquier cosa." }
        ]
    },
    {
        id: 21,
        text: "Interés sexual",
        options: [
            { value: 0, text: "No he observado ningún cambio reciente en mi interés." },
            { value: 1, text: "Estoy menos interesado por el sexo que antes." },
            { value: 2, text: "Estoy mucho menos interesado por el sexo." },
            { value: 3, text: "He perdido totalmente mi interés por el sexo." }
        ]
    }
];

let responses = {};

// Inicializar la página
function init() {
    renderQuestions();
    setupEventListeners();
}

// Renderizar preguntas
function renderQuestions() {
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';

    questions.forEach(question => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-item';

        const titleH3 = document.createElement('h3');
        titleH3.textContent = `${question.id}. ${question.text}`;

        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'options';

        question.options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'option-button';
            if (responses[question.id] === option.value) {
                button.classList.add('selected');
            }

            button.innerHTML = `
                <div class="checkbox">
                    ${responses[question.id] === option.value ? '<div class="checkmark"></div>' : ''}
                </div>
                <span class="option-text">${option.text}</span>
            `;

            button.addEventListener('click', () => {
                responses[question.id] = option.value;
                renderQuestions();
                updateUI();
            });

            optionsDiv.appendChild(button);
        });

        questionDiv.appendChild(titleH3);
        questionDiv.appendChild(optionsDiv);
        container.appendChild(questionDiv);
    });
}

// Configurar event listeners
function setupEventListeners() {
    document.getElementById('sendBtn').addEventListener('click', sendWhatsApp);
}

// Calcular puntuación total
function calculateTotal() {
    return Object.values(responses).reduce((sum, val) => sum + (val || 0), 0);
}

// Obtener interpretación
function getInterpretation(total) {
    if (total <= 10) return "Estos altibajos son considerados normales.";
    if (total <= 16) return "Leve perturbación del estado de ánimo.";
    if (total <= 20) return "Estados de depresión intermitentes.";
    if (total <= 30) return "Depresión moderada.";
    if (total <= 40) return "Depresión grave.";
    return "Depresión extrema.";
}

// Actualizar UI
function updateUI() {
    const totalAnswered = Object.keys(responses).length;
    const totalQuestions = questions.length;
    const allAnswered = totalAnswered === totalQuestions;

    // Actualizar progreso
    document.getElementById('answered').textContent = totalAnswered;
    const percentage = (totalAnswered / totalQuestions) * 100;
    document.getElementById('progressFill').style.width = percentage + '%';

    // Actualizar puntuación
    const total = calculateTotal();
    document.getElementById('totalScore').textContent = total;
    document.getElementById('interpretation').textContent = getInterpretation(total);

    // Mostrar advertencia si es necesario
    const warningText = document.getElementById('warningText');
    if (total >= 17) {
        warningText.style.display = 'block';
    } else {
        warningText.style.display = 'none';
    }

    // Validar campos de información
    const nombre = document.getElementById('nombre').value.trim();
    const identificacion = document.getElementById('identificacion').value.trim();
    const sendBtn = document.getElementById('sendBtn');
    const sendMessage = document.getElementById('sendMessage');

    if (allAnswered && nombre && identificacion) {
        sendBtn.disabled = false;
        sendMessage.textContent = '✓ Listo para enviar';
        sendMessage.style.color = '#25d366';
    } else {
        sendBtn.disabled = true;
        if (!nombre || !identificacion) {
            sendMessage.textContent = 'Completa tu nombre e identificación';
        } else {
            sendMessage.textContent = 'Completa todas las preguntas';
        }
        sendMessage.style.color = '#999';
    }
}

// Enviar por WhatsApp
function sendWhatsApp() {
    const nombre = document.getElementById('nombre').value.trim();
    const identificacion = document.getElementById('identificacion').value.trim();
    const total = calculateTotal();
    const interpretation = getInterpretation(total);

    // Construir detalles de respuestas
    let detalles = '';
    questions.forEach(question => {
        const respuesta = responses[question.id];
        if (respuesta !== undefined) {
            detalles += `%0APregunta ${question.id}: ${respuesta} puntos`;
        }
    });

    // Construir mensaje
    const mensaje = `*RESULTADO INVENTARIO DE DEPRESIÓN DE BECK*%0A%0A*Datos del Paciente:*%0ANombre: ${nombre}%0AIdentificación: ${identificacion}%0A%0A*Puntuación Total: ${total}*%0A%0A*Interpretación:*%0A${interpretation}${detalles}`;

    // URL de WhatsApp
    const whatsappUrl = `https://wa.me/573004804521?text=${mensaje}`;

    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank');
}

// Event listeners para campos de información
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('nombre').addEventListener('change', updateUI);
    document.getElementById('nombre').addEventListener('keyup', updateUI);
    document.getElementById('identificacion').addEventListener('change', updateUI);
    document.getElementById('identificacion').addEventListener('keyup', updateUI);
    
    init();
});