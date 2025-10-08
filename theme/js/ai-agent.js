$(document).ready(function() {
    const chatWindow = $('#chat-window');
    const chatForm = $('#ai-chat-form');
    const chatInput = $('#chat-input');
    const chatContainer = $('#floating-chat-container');
    const toggleButton = $('#chat-toggle-button');
    const closeButton = $('#chat-close-button');

    // Guardar el mensaje inicial para poder restaurarlo
    const initialMessageHtml = chatWindow.html();

    // Mostrar el chat automáticamente después de unos segundos
    setTimeout(() => {
        if (sessionStorage.getItem('chatOpened') !== 'true') {
            chatContainer.fadeIn();
        }
    }, 3000);

    // Abrir/cerrar chat con el botón flotante
    toggleButton.on('click', function() {
        const isVisible = chatContainer.is(':visible');
        chatContainer.fadeToggle();
        sessionStorage.setItem('chatOpened', 'true'); // Marcar que el usuario ya interactuó

        // Si la ventana estaba visible, ahora se está cerrando, así que la reiniciamos.
        if (isVisible) {
            setTimeout(resetChat, 500); // Esperar a que termine la animación de fadeOut
        }
    });

    // Cerrar chat con el botón 'X' en la cabecera
    closeButton.on('click', function() {
        chatContainer.fadeOut();
        sessionStorage.setItem('chatOpened', 'true'); // Marcar que el usuario ya interactuó
        setTimeout(resetChat, 500); // Esperar a que termine la animación de fadeOut
    });

    // Evento para enviar el mensaje
    chatForm.on('submit', function(e) {
        e.preventDefault();
        const userMessage = chatInput.val().trim();

        if (userMessage) {
            displayMessage(userMessage, 'user');
            chatInput.val('');
            getAIResponse(userMessage);
        }
    });

    /**
     * Reinicia el chat a su estado inicial.
     */
    function resetChat() {
        chatWindow.html(initialMessageHtml);
    }

    /**
     * Muestra un mensaje en la ventana del chat.
     * @param {string} message - El texto del mensaje.
     * @param {string} sender - 'user' o 'ai'.
     */
    function displayMessage(message, sender) {
        const messageClass = sender === 'user' ? 'user-message' : 'ai-message';
        const messageHtml = `<div class="${messageClass}"><p>${message}</p></div>`;
        chatWindow.append(messageHtml);
        chatWindow.scrollTop(chatWindow.prop("scrollHeight"));
    }

    /**
     * Obtiene una respuesta del agente de IA.
     * @param {string} userMessage - El mensaje del usuario.
     */
    function getAIResponse(userMessage) {
        // Muestra un indicador de que el AI está "escribiendo"
        displayMessage('...', 'ai');

        // ADVERTENCIA: La clave de API no debe estar aquí en un sitio en producción.
        // Cualquiera puede robarla. Esto es solo para fines de demostración.
        const apiKey = 'AIzaSyDHqyOgknJMK4gZK9_i1wqXwVPTDkSRexs';
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

        const systemInstructions = `
            Eres un asistente virtual para "Mudanzas FC", una empresa de mudanzas en Colombia.
            Tu nombre es FC-Bot. Eres amable, profesional y muy eficiente.
            Tu objetivo es ayudar a los usuarios a resolver sus dudas y a cotizar su mudanza.

            Información de la empresa:
            - Nombre: Mudanzas FC
            - Experiencia: 15 años.
            - Servicios principales: Mudanzas residenciales, corporativas y servicios integrales (embalaje, empaque, logística especializada, instalación de TV/Audio, armado y desarmado de mueble, tranporte de materiales quimicos).
            - Cobertura: Bogotá y a nivel nacional con servicios express y compartidos.
            - Valores: Puntualidad, Seguridad, Equipo Profesional, Servicio Integral, Precios Transparentes.
            - Contacto: WhatsApp (+57) 312-409-2711, via email operaciones@mudanzas.com, direccion "Calle 129 N°91b-33, Bogotá".

            Funcionalidades:
            1.  Si el usuario quiere cotizar, guíalo para que use el cotizador online en la página "https://mudanzasfc.com/quote.html". Explícale que allí puede ingresar los detalles de su mudanza para obtener un precio estimado aproximado segun sus necesidades.
            2.  Si el usuario pregunta por servicios, descríbelos basándote en la información proporcionada. y que puede consultar en "https://mudanzasfc.com/services.html"
            3.  Si el usuario tiene preguntas frecuentes (ej: "¿empacan mis cosas?", "¿son puntuales?", "¿qué métodos de pago aceptan?"), responde usando la información de la empresa y sus valores. y redirigelo a "https://mudanzasfc.com/faq.html"
            4.  Para cualquier otra pregunta, responde de la manera más útil posible con el contexto que tienes. Si no sabes la respuesta, sugiere amablemente que contacten a un asesor humano por WhatsApp o correo.
            5.  Usa el modelo 'gemini-2.5-flash-lite' para respuestas rápidas.
        `;

        const requestData = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{ "text": systemInstructions + "\n\nUsuario: " + userMessage }]
                }
            ]
        };

        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        })
        .then(response => response.json())
        .then(data => {
            // Verifica si la respuesta es válida y tiene candidatos
            if (data && data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
                const aiResponse = data.candidates[0].content.parts[0].text;
                // Actualiza el mensaje '...' con la respuesta real
                chatWindow.find('.ai-message:last p').html(aiResponse);
            } else {
                // Maneja respuestas de error de la API que no fueron capturadas por .catch
                console.error('Respuesta inválida de la API de Gemini:', data);
                const errorMessage = "Lo siento, no pude procesar esa respuesta. Por favor, intenta con otra pregunta.";
                chatWindow.find('.ai-message:last p').html(errorMessage);
            }
            chatWindow.scrollTop(chatWindow.prop("scrollHeight"));
        })
        .catch(error => {
            console.error('Error al contactar la API de Gemini:', error);
            const errorMessage = "Lo siento, estoy teniendo problemas para conectarme en este momento. Por favor, intenta de nuevo más tarde.";
            chatWindow.find('.ai-message:last p').html(errorMessage);
            chatWindow.scrollTop(chatWindow.prop("scrollHeight"));
        });
    }
});