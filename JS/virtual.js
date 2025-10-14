
// Variables para el manejo de la videollamada
let localStream;
let remoteStream;
let peerConnection;
let isCallActive = false;
let isMuted = false;
let isVideoOff = false;
let isScreenSharing = false;

// Elementos DOM
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const muteBtn = document.getElementById('muteBtn');
const videoBtn = document.getElementById('videoBtn');
const endCallBtn = document.getElementById('endCallBtn');
const screenShareBtn = document.getElementById('screenShareBtn');
const statusIndicator = document.querySelector('.status-indicator');
const aiMessages = document.getElementById('aiMessages');
const aiInputField = document.getElementById('aiInputField');
const sendBtn = document.getElementById('sendBtn');

// Iniciar la aplicación
document.addEventListener('DOMContentLoaded', init);

// Función de inicialización
async function init() {
    try {
        // Obtener acceso a la cámara y micrófono del usuario
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        
        // Mostrar el video local
        localVideo.srcObject = localStream;
        
        // Configurar una conexión "simulada" para demostración
        setupDemoConnection();
        
        // Agregar event listeners
        muteBtn.addEventListener('click', toggleMute);
        videoBtn.addEventListener('click', toggleVideo);
        endCallBtn.addEventListener('click', endCall);
        screenShareBtn.addEventListener('click', toggleScreenShare);
        sendBtn.addEventListener('click', sendMessage);
        aiInputField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        console.log('Inicialización completada');
        statusIndicator.textContent = 'Listo para llamar';
        
    } catch (error) {
        console.error('Error al inicializar:', error);
        statusIndicator.textContent = 'Error: No se pudo acceder a la cámara/micrófono';
    }
}

// Configurar una "llamada" de demostración
function setupDemoConnection() {
    // Simular una llamada entrante después de unos segundos
    setTimeout(() => {
        statusIndicator.textContent = 'Llamada entrante...';
        
        // Mostrar confirmación
        if (confirm('Llamada entrante. ¿Deseas contestar?')) {
            startCall();
        }
    }, 3000);
}

// Iniciar una llamada
function startCall() {
    // En una implementación real, aquí se configuraría WebRTC
    isCallActive = true;
    statusIndicator.textContent = 'En llamada';
    
    // Simular video remoto (en una implementación real sería el flujo del otro participante)
    // Para esta demo, simplemente clonamos nuestro propio stream
    remoteStream = localStream.clone();
    remoteVideo.srcObject = remoteStream;
    
    console.log('Llamada iniciada');
}

// Finalizar la llamada
function endCall() {
    if (!isCallActive) return;
    
    isCallActive = false;
    statusIndicator.textContent = 'Llamada finalizada';
    
    // Detener video remoto
    if (remoteVideo.srcObject) {
        const tracks = remoteVideo.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        remoteVideo.srcObject = null;
    }
    
    console.log('Llamada finalizada');
    
    // Restaurar estado después de unos segundos
    setTimeout(() => {
        statusIndicator.textContent = 'Listo para llamar';
        setupDemoConnection();
    }, 5000);
}

// Activar/desactivar micrófono
function toggleMute() {
    isMuted = !isMuted;
    localStream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
    });
    
    muteBtn.title = isMuted ? 'Activar micrófono' : 'Silenciar';
    muteBtn.innerHTML = isMuted 
        ? '<svg class="icon" viewBox="0 0 24 24"><path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"></path></svg>' 
        : '<svg class="icon" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"></path><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"></path></svg>';
    
    console.log('Micrófono ' + (isMuted ? 'silenciado' : 'activado'));
}

// Activar/desactivar video
function toggleVideo() {
    isVideoOff = !isVideoOff;
    localStream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoOff;
    });
    
    videoBtn.title = isVideoOff ? 'Activar video' : 'Desactivar video';
    videoBtn.innerHTML = isVideoOff 
        ? '<svg class="icon" viewBox="0 0 24 24"><path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z"></path></svg>' 
        : '<svg class="icon" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"></path></svg>';
    
    console.log('Video ' + (isVideoOff ? 'desactivado' : 'activado'));
}

// Compartir pantalla
async function toggleScreenShare() {
    if (isScreenSharing) {
        // Restaurar cámara
        try {
            localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            localVideo.srcObject = localStream;
            isScreenSharing = false;
            screenShareBtn.title = 'Compartir pantalla';
            console.log('Pantalla compartida detenida');
        } catch (error) {
            console.error('Error al restaurar cámara:', error);
        }
    } else {
        // Compartir pantalla
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true
            });
            
            // Guardar la pista de audio original
            const audioTrack = localStream.getAudioTracks()[0];
            
            // Detener las pistas de video actuales
            localStream.getVideoTracks().forEach(track => track.stop());
            
            // Crear un nuevo stream con la pantalla y el audio original
            const newStream = new MediaStream();
            screenStream.getVideoTracks().forEach(track => {
                newStream.addTrack(track);
                // Evento para detectar cuando se detiene la compartición de pantalla
                track.addEventListener('ended', async () => {
                    try {
                        localStream = await navigator.mediaDevices.getUserMedia({
                            video: true,
                            audio: true
                        });
                        localVideo.srcObject = localStream;
                        isScreenSharing = false;
                        screenShareBtn.title = 'Compartir pantalla';
                        console.log('Pantalla compartida detenida');
                    } catch (error) {
                        console.error('Error al restaurar cámara:', error);
                    }
                });
            });
            
            // Agregar pista de audio si existe
            if (audioTrack) {
                newStream.addTrack(audioTrack);
            }
            
            // Asignar el nuevo stream
            localStream = newStream;
            localVideo.srcObject = localStream;
            
            isScreenSharing = true;
            screenShareBtn.title = 'Detener compartición';
            console.log('Compartiendo pantalla');
        } catch (error) {
            console.error('Error al compartir pantalla:', error);
        }
    }
}

// Enviar mensaje al asistente IA
function sendMessage() {
    const message = aiInputField.value.trim();
    if (!message) return;
    
    // Agregar mensaje del usuario
    addMessage(message, 'user');
    aiInputField.value = '';
    
    // Simular respuesta de la IA después de un breve retraso
    setTimeout(() => {
        // Respuestas predefinidas básicas
        let response;
        
        if (message.toLowerCase().includes('hola') || message.toLowerCase().includes('saludos')) {
            response = '¡Hola! ¿En qué puedo ayudarte hoy?';
        } else if (message.toLowerCase().includes('ayuda') || message.toLowerCase().includes('ayudar')) {
            response = 'Puedo ayudarte con información, sugerencias o resolver dudas durante tu videollamada.';
        } else if (message.toLowerCase().includes('llamada') || message.toLowerCase().includes('videollamada')) {
            response = 'Esta plataforma te permite realizar videollamadas mientras interactúas conmigo. Puedes activar/desactivar tu cámara y micrófono con los botones de abajo.';
        } else if (message.toLowerCase().includes('gracias') || message.toLowerCase().includes('agradec')) {
            response = '¡No hay de qué! Estoy aquí para ayudarte.';
        } else if (message.toLowerCase().includes('compartir') || message.toLowerCase().includes('pantalla')) {
            response = 'Puedes compartir tu pantalla haciendo clic en el botón de compartir pantalla en los controles de la videollamada.';
        } else {
            response = 'Entiendo tu mensaje. ¿Hay algo específico en lo que pueda ayudarte con la videollamada o alguna otra consulta?';
        }if (isAI) {
            aiMsg.textContent = "Gracias por tu pregunta. Estoy procesando tu consulta y te responderé en breve.";
        } else {
            aiMsg.textContent = "Tu mensaje ha sido recibido. Un profesional te responderá pronto.";
        }
        
        addMessage(response, 'ai');
    }, 1000);
}

// Agregar mensaje al chat
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = text;
    
    aiMessages.appendChild(messageDiv);
    aiMessages.scrollTop = aiMessages.scrollHeight;
}
// Configurar ambos chats
setupChat('.chat-input input', '.chat-messages', '.chat-input .send-btn', false);
setupChat('.ai-input input', '.ai-messages', '.ai-input .send-btn', true);

// Simulación básica de botones de videollamada
document.querySelectorAll('.control-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        alert('Esta función sería implementada con una API de videollamadas como Twilio, Zoom o WebRTC.');
    });
});

// Simulación de carga de documentos
document.querySelector('.upload-btn').addEventListener('click', function() {
    alert('Aquí se abriría un selector de archivos para cargar documentos.');
});

