const questions = [
    {
        id: 1,
        text: "Torpe o entumecido",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    },
    {
        id: 2,
        text: "Acalorad@",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    },
    {
        id: 3,
        text: "Con tembor en las piernas",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    },
    {
        id: 4,
        text: "Incapaz de relajarse",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    },
    {
        id: 5,
        text: "Con temor a que ocurra lo peor",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    },
    {
        id: 6,
        text: "Maread@, o que se le va la cabeza",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    },
    {
        id: 7,
        text: "Con latidos del corazón fuertes y acelerados",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    },
    {
        id: 8,
        text: "Inestable",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    },
    {
        id: 9,
        text: "Atemorizad@ o asustad@",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    },
    {
        id: 10,
        text: "Nervioso",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    },
    {
        id: 11,
        text: "Con sensación de bloqueo",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    },
    {
        id: 12,
        text: "Con temblores en las manos",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    },
    {
        id: 13,
        text: "Inquieto, inseguro",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    },
    {
        id: 14,
        text: "Con miedo a perder el control",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    },
    {
        id: 15,
        text: "Con sensación de ahogo",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    },
    {
        id: 16,
        text: "Con temor a morir",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    },
    {
        id: 17,
        text: "Con miedo",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    },
    {
        id: 18,
        text: "Con problemas digestivos",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    },
    {
        id: 19,
        text: "Con desvanecimientos",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    },
    {
        id: 20,
        text: "Con rubor facial",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
        ]
    },
    {
        id: 21,
        text: "Con sudores, fríos o calientes",
        options: [
            { value: 0, text: "No, en absoluto" },
            { value: 1, text: "Levemente" },
            { value: 2, text: "Moderadamente" },
            { value: 3, text: "Bastante" }
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
    if (total <= 21) return "Estos altibajos son considerados normales.";
    if (total <= 35) return "Moderada.";
    if (total >= 36) return "Ansiedad Severa.";
    return "Ansiedad extrema.";
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
    const mensaje = `*RESULTADO INVENTARIO DE ANSIEDAD DE BECK*%0A%0A*Datos del Paciente:*%0ANombre: ${nombre}%0AIdentificación: ${identificacion}%0A%0A*Puntuación Total: ${total}*%0A%0A*Interpretación:*%0A${interpretation}${detalles}`;

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