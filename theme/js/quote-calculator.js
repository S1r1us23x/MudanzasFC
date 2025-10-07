$(document).ready(function() {
    // Variables globales
    let cotizacionData = {};

    // Inicializar aplicación
    init();

    function init() {
        setupEventListeners();
        initSmoothScroll();
    }

    function setupEventListeners() {
        // Botón de cálculo
        $('#calcular').on('click', calcularCotizacion);
        
        // Formularios
        $('#cotizacionForm').on('submit', function(e) {
            e.preventDefault();
        });
        
        $('#contactForm').on('submit', function(e) {
            e.preventDefault();
            handleContactForm();
        });

        // Mostrar/ocultar campo de cantidad de auxiliares
        $('#checkAuxiliares').on('change', function() {
            if ($(this).is(':checked')) {
                $('#cantidadAuxiliaresContainer').show();
            } else {
                $('#cantidadAuxiliaresContainer').hide();
                $('#cantidadAuxiliares').val(1); // Reset a 1 cuando se desmarca
            }
        });

        // Mostrar/ocultar campo de cantidad de TV
        $('#checkTV').on('change', function() {
            if ($(this).is(':checked')) {
                $('#cantidadTVContainer').show();
            } else {
                $('#cantidadTVContainer').hide();
                $('#cantidadTV').val(1); // Reset a 1 cuando se desmarca
            }
        });

        // Cambios en el formulario para cálculo automático (opcional)
        $('#cotizacionForm').on('change', 'input, select', function() {
            // Puedes habilitar cálculo automático descomentando la siguiente línea
            // calcularCotizacion();
        });

        // Navegación suave
        $('.smooth-scroll, .nav-link').on('click', function(e) {
            const href = $(this).attr('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                $('html, body').animate({
                    scrollTop: $(href).offset().top - 80
                }, 800);
            }
        });
    }

    function initSmoothScroll() {
        // Navegación suave para todos los enlaces internos
        $('a[href^="#"]').on('click', function(e) {
            e.preventDefault();
            const target = $(this).attr('href');
            if ($(target).length) {
                $('html, body').animate({
                    scrollTop: $(target).offset().top - 80
                }, 800);
            }
        });
    }

    function validateForm() {
        const requiredFields = $('#cotizacionForm').find('input[required], select[required]');
        let isValid = true;
    
        requiredFields.each(function() {
            const $field = $(this);
            let isFieldValid = true;
    
            if (!$field.val() || $field.val().trim() === '') {
                isFieldValid = false;
            } else if ($field.attr('name') === 'nombre') {
                // Validación específica para el nombre
                const nameValue = $field.val();
                const nameRegex = /^[a-zA-Z\s]+$/; // Solo letras y espacios
                if (!nameRegex.test(nameValue)) {
                    isFieldValid = false;
                    $field.siblings('.invalid-feedback').text('El nombre solo puede contener letras y espacios.');
                }
            } else if ($field.attr('name') === 'telefono') {
                // Validación específica para el teléfono
                const phoneValue = $field.val().replace(/\s/g, ''); // Eliminar espacios
                const phoneRegex = /^(?:\+57)?(3\d{9})$/; // Valida 10 dígitos que empiecen por 3, con prefijo +57 opcional
                if (!phoneRegex.test(phoneValue)) {
                    isFieldValid = false;
                    $field.siblings('.invalid-feedback').text('Debe ser un número celular colombiano válido (10 dígitos).');
                }
            }
    
            if (!isFieldValid) {
                $field.addClass('is-invalid');
                isValid = false;
            } else {
                $field.removeClass('is-invalid');
            }
        });
    
        if (!isValid) {
            showNotification('Por favor, revisa los campos marcados en rojo.', 'warning');
        }
    
        return isValid;
    }

    function calcularCotizacion() {
        if (!validateForm()) return;

        // Mostrar loading
        showLoadingInResult();

        // Recopilar datos del formulario
        cotizacionData = getFormData();

        // Simular delay de cálculo para mejor UX
        setTimeout(() => {
            const resultado = calcularPrecio(cotizacionData);
            displayResultado(resultado);
            
            // Mostrar notificación de éxito
            showNotification('¡Cotización calculada exitosamente!', 'success');
        }, 1000);
    }

    function getFormData() {
        const formData = {};
        
        // Información básica
        formData.nombre = $('input[name="nombre"]').val();
        formData.telefono = $('input[name="telefono"]').val();
        formData.ciudadOrigen = $('input[name="ciudadOrigen"]').val();
        formData.ciudadDestino = $('input[name="ciudadDestino"]').val();
        formData.tipoMudanza = $('select[name="tipoMudanza"]').val();
        
        // Volumen
        formData.habitaciones = $('select[name="habitaciones"]').val();
        formData.metrosCubicos = $('select[name="metrosCubicos"]').val();
        formData.bienesEspeciales = [];
        $('input[name="bienesEspeciales"]:checked').each(function() {
            formData.bienesEspeciales.push({
                tipo: $(this).val(),
                costo: parseInt($(this).data('cost')) || 0
            });
        });
        
        // Servicios
        formData.embalaje = $('input[name="embalaje"]:checked').val();
        formData.serviciosExtra = [];
        $('input[name="serviciosExtra"]:checked').each(function() {
            const tipo = $(this).val();
            let costo = parseInt($(this).data('cost')) || 0;

            // Lógica especial para auxiliares
            if (tipo === 'auxiliares') {
                const cantidad = parseInt($('#cantidadAuxiliares').val()) || 1;
                costo *= cantidad;
            } else if (tipo === 'TV') {
                const cantidad = parseInt($('#cantidadTV').val()) || 1;
                costo *= cantidad;
            }

            formData.serviciosExtra.push({
                tipo: tipo,
                costo: costo
            });
        });
        
        // Complejidad
        formData.accesoOrigen = $('select[name="accesoOrigen"]').val();
        formData.accesoDestino = $('select[name="accesoDestino"]').val();
        formData.urgencia = $('select[name="urgencia"]').val();
        formData.seguro = $('select[name="seguro"]').val();

        return formData;
    }

    function calcularPrecio(data) {
        // Precio base según tipo de mudanza y habitaciones
        const tipoMudanzaFactor = parseFloat($(`select[name="tipoMudanza"] option[value="${data.tipoMudanza}"]`).data('factor')) || 1;
        const habitacionesData = $(`select[name="habitaciones"] option[value="${data.habitaciones}"]`);
        const precioBase = parseInt(habitacionesData.data('base')) || 200000;
        const habitacionesFactor = parseFloat(habitacionesData.data('factor')) || 1;

        let subtotal = precioBase * habitacionesFactor * tipoMudanzaFactor;

        // Factor de metros cúbicos
        const metrosCubicosFactor = parseFloat($(`select[name="metrosCubicos"] option[value="${data.metrosCubicos}"]`).data('factor')) || 1;
        subtotal *= metrosCubicosFactor;

        // Costos adicionales por bienes especiales
        let costoBienesEspeciales = 0;
        data.bienesEspeciales.forEach(bien => {
            costoBienesEspeciales += bien.costo;
        });

        // Costo de embalaje
        const costoEmbalaje = parseInt($(`input[name="embalaje"][value="${data.embalaje}"]`).data('cost')) || 0;

        // Costos de servicios extra
        let costoServiciosExtra = 0;
        data.serviciosExtra.forEach(servicio => {
            costoServiciosExtra += servicio.costo;
        });

        // Factores de complejidad
        const factorAccesoOrigen = parseFloat($(`select[name="accesoOrigen"] option[value="${data.accesoOrigen}"]`).data('factor')) || 1;
        const factorAccesoDestino = parseFloat($(`select[name="accesoDestino"] option[value="${data.accesoDestino}"]`).data('factor')) || 1;
        const factorUrgencia = parseFloat($(`select[name="urgencia"] option[value="${data.urgencia}"]`).data('factor')) || 1;

        // Aplicar factores de complejidad
        subtotal *= (factorAccesoOrigen * factorAccesoDestino * factorUrgencia);

        // Costo de seguro
        const costoSeguro = parseInt($(`select[name="seguro"] option[value="${data.seguro}"]`).data('cost')) || 0;

        // Calcular total
        const total = subtotal + costoBienesEspeciales + costoEmbalaje + costoServiciosExtra + costoSeguro;

        return {
            precioBase: precioBase,
            subtotal: Math.round(subtotal),
            costoBienesEspeciales: costoBienesEspeciales,
            costoEmbalaje: costoEmbalaje,
            costoServiciosExtra: costoServiciosExtra,
            costoSeguro: costoSeguro,
            total: Math.round(total),
            factores: {
                tipoMudanza: tipoMudanzaFactor,
                habitaciones: habitacionesFactor,
                metrosCubicos: metrosCubicosFactor,
                accesibilidad: factorAccesoOrigen * factorAccesoDestino,
                urgencia: factorUrgencia
            }
        };
    }

    function displayResultado(resultado) {
        const html = `
            <div class="cotizacion-detalle">
                <div class="text-center mb-4">
                    <i class="fas fa-check-circle fa-3x text-success mb-2"></i>
                    <h6 class="text-success">¡Cotización Lista!</h6>
                </div>
                
                <div class="cotizacion-breakdown">
                    <div class="cotizacion-item">
                        <span>Precio base:</span>
                        <span>$${formatCurrency(resultado.precioBase)}</span>
                    </div>
                    <div class="cotizacion-item">
                        <span>Subtotal con factores:</span>
                        <span>$${formatCurrency(resultado.subtotal)}</span>
                    </div>
                    ${resultado.costoBienesEspeciales > 0 ? `
                    <div class="cotizacion-item">
                        <span>Bienes especiales:</span>
                        <span>$${formatCurrency(resultado.costoBienesEspeciales)}</span>
                    </div>` : ''}
                    ${resultado.costoEmbalaje > 0 ? `
                    <div class="cotizacion-item">
                        <span>Embalaje:</span>
                        <span>$${formatCurrency(resultado.costoEmbalaje)}</span>
                    </div>` : ''}
                    ${resultado.costoServiciosExtra > 0 ? `
                    <div class="cotizacion-item">
                        <span>Servicios extra:</span>
                        <span>$${formatCurrency(resultado.costoServiciosExtra)}</span>
                    </div>` : ''}
                    ${resultado.costoSeguro > 0 ? `
                    <div class="cotizacion-item">
                        <span>Seguro:</span>
                        <span>$${formatCurrency(resultado.costoSeguro)}</span>
                    </div>` : ''}
                    <hr>
                    <div class="cotizacion-item total">
                        <span><strong>TOTAL ESTIMADO:</strong></span>
                        <span><strong>$${formatCurrency(resultado.total)}</strong></span>
                    </div>
                </div>
                
                <div class="mt-4">
                    <div class="alert alert-info">
                        <small><i class="fas fa-info-circle me-1"></i>
                        Esta es una cotización estimada. El precio final puede variar según evaluación técnica.</small>
                    </div>
                    <div class="d-grid gap-2">
                        <div class="text-center mt-4">
                            <button type="button" class="btn btn-primary" style="color: black;" id="confirmarCotizacion">
                                <i class="fas fa-whatsapp me-2"></i> Confirmar por WhatsApp
                            </button>
                        </div>
                        <div class="text-center mt-4">
                            <button type="button" class="btn btn-primary" style="color: black;" id="llamarAhora">
                                <i class="fas fa-phone me-2"></i> ¡Llamar Ahora!
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('#cotizacionResultado').html(html);

        // Event listeners para botones de acción
        $('#confirmarCotizacion').on('click', function() {
            enviarWhatsApp(resultado);
        });

        $('#llamarAhora').on('click', function() {
            window.open('tel:+573124092711', '_self');
        });
    }

    function showLoadingInResult() {
        const html = `
            <div class="text-center py-4">
                <div class="loading mb-3"></div>
                <p class="text-muted">Calculando tu cotización...</p>
            </div>
        `;
        $('#cotizacionResultado').html(html);
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('es-CO', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    function enviarWhatsApp(resultado) {
        const data = cotizacionData;

        // --- Funciones auxiliares para generar el texto ---
        const getLabel = (selector) => $(selector).length ? $(selector).text().trim() : 'No especificado';
        
        const getBienesEspeciales = () => {
            if (data.bienesEspeciales && data.bienesEspeciales.length > 0) {
                return data.bienesEspeciales.map(bien => 
                    getLabel(`input[name="bienesEspeciales"][value="${bien.tipo}"] + label`)
                ).join('\n• ');
            }
            return 'No se seleccionaron bienes especiales.';
        };

        const getServiciosExtra = () => {
            if (data.serviciosExtra && data.serviciosExtra.length > 0) {
                return data.serviciosExtra.map(servicio => {
                    let textoServicio = getLabel(`input[name="serviciosExtra"][value="${servicio.tipo}"] + label`);
                    if (servicio.tipo === 'auxiliares') {
                        const cantidad = $('#cantidadAuxiliares').val();
                        textoServicio = `Auxiliares extra (Cantidad: ${cantidad})`;
                    } else if (servicio.tipo === 'TV') {
                        const cantidad = $('#cantidadTV').val();
                        textoServicio = `Desistalar / Instalar TV (Cantidad: ${cantidad})`;
                    }
                    return textoServicio;
                }).join('\n• ');
            }
            return 'No requiere servicios extra.';
        };

        // --- Construcción del mensaje ---
        const mensaje = `¡Hola MudanzasFc! Me interesa el servicio con ustedes. Aquí está el resumen de mi cotización:

*📋 INFORMACIÓN BÁSICA*
• *Nombre:* ${data.nombre || 'No especificado'}
• *Teléfono:* ${data.telefono || 'No especificado'}
• *Desde:* ${data.ciudadOrigen || 'No especificado'}
• *Hasta:* ${data.ciudadDestino || 'No especificado'}
• *Tipo de Mudanza:* ${getLabel(`select[name="tipoMudanza"] option[value="${data.tipoMudanza}"]`)}

*🏠 DETALLES DEL VOLUMEN*
• *Habitaciones:* ${getLabel(`select[name="habitaciones"] option[value="${data.habitaciones}"]`)}
• *Metros Cúbicos (m³):* ${getLabel(`select[name="metrosCubicos"] option[value="${data.metrosCubicos}"]`)}
• *Bienes Especiales:*
        -${getBienesEspeciales()}

*🛠️ SERVICIOS ADICIONALES*
• *Embalaje:* ${getLabel(`input[name="embalaje"][value="${data.embalaje}"] + label`)}
• *Servicios Extra:*
${getServiciosExtra()}

*🚚 COMPLEJIDAD Y SEGURO*
• *Acceso en Origen:* ${getLabel(`select[name="accesoOrigen"] option[value="${data.accesoOrigen}"]`)}
• *Acceso en Destino:* ${getLabel(`select[name="accesoDestino"] option[value="${data.accesoDestino}"]`)}
• *Urgencia:* ${getLabel(`select[name="urgencia"] option[value="${data.urgencia}"]`)}
• *Seguro:* ${getLabel(`select[name="seguro"] option[value="${data.seguro}"]`)}

*💰 COTIZACIÓN ESTIMADA: $${formatCurrency(resultado.total)} COP*

¿Pueden confirmar disponibilidad y los siguientes pasos? Gracias.`;

        const whatsappUrl = `https://wa.me/+573124092711?text=${encodeURIComponent(mensaje)}`;
        window.open(whatsappUrl, '_blank');
    }

    function handleContactForm() {
        const formData = {
            nombre: $('#contactForm input[type="text"]').val(),
            email: $('#contactForm input[type="email"]').val(),
            mensaje: $('#contactForm textarea').val()
        };

        if (!formData.nombre || !formData.email) {
            showNotification('Por favor completa todos los campos requeridos', 'warning');
            return;
        }

        // Simular envío
        const btn = $('#contactForm button[type="submit"]');
        const originalText = btn.html();
        
        btn.html('<div class="loading me-2" style="display:inline-block"></div>Enviando...');
        btn.prop('disabled', true);

        setTimeout(() => {
            btn.html('<i class="fas fa-check me-2"></i>¡Enviado!');
            showNotification('¡Mensaje enviado exitosamente! Te contactaremos pronto.', 'success');
            
            setTimeout(() => {
                btn.html(originalText);
                btn.prop('disabled', false);
                $('#contactForm')[0].reset();
            }, 2000);
        }, 1500);
    }

    function showNotification(message, type = 'info') {
        const alertClass = {
            'success': 'alert-success',
            'warning': 'alert-warning',
            'error': 'alert-danger',
            'info': 'alert-info'
        };

        const icon = {
            'success': 'fa-check-circle',
            'warning': 'fa-exclamation-triangle',
            'error': 'fa-times-circle',
            'info': 'fa-info-circle'
        };

        const notification = $(`
            <div class="alert ${alertClass[type]} alert-dismissible fade show position-fixed" 
                style="top: 100px; right: 20px; z-index: 9999; min-width: 300px;">
                <i class="fas ${icon[type]} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `);

        $('body').append(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.fadeOut(() => notification.remove());
        }, 5000);
    }

    // Actualizar año en footer
    const currentYear = new Date().getFullYear();
    $('footer p').text(`© ${currentYear} MudanzasPro. Todos los derechos reservados.`);

    // Smooth reveal animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Apply animation to cards and sections
    $('.card, .feature-box').each(function() {
        this.style.opacity = '0';
        this.style.transform = 'translateY(30px)';
        this.style.transition = 'all 0.6s ease';
        observer.observe(this);
    });
});