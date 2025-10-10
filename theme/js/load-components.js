async function loadComponent(elementId, url) {
    const element = document.getElementById(elementId);
    if (!element) {
        return;
    }
    
    try {
        url = 'layouts/' + url;
        const response = await fetch(url);
        if (response.ok) {
        const content = await response.text();
        element.innerHTML = content;
        } else {
        console.error('Error al cargar el componente:', response.statusText);
        }
    } catch (error) {
        console.error('Error en la solicitud fetch:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {

    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "tfznf8li8f");

    // Observador para detectar cuando el menú está cargado y luego resaltar el enlace activo
    const headerContainer = document.getElementById('header-container');
    const observer = new MutationObserver(function(mutations, obs) {
        const navLinks = document.querySelectorAll('#navbar-collapse .nav-link');
        if (navLinks.length > 0) {
        const currentPage = window.location.pathname.split("/").pop();
        
        navLinks.forEach(link => {
            // Elimina la clase 'active' de cualquier elemento que la tenga
            if (link.parentElement.classList.contains('active')) {
                link.parentElement.classList.remove('active');
            }
            // Añade la clase 'active' al enlace de la página actual
            if (link.getAttribute('href') === currentPage) {
                link.parentElement.classList.add('active');
            }
        });
        obs.disconnect(); // Detiene la observación una vez que el menú está listo
        }
    });
    
    observer.observe(headerContainer, {
        childList: true,
        subtree: true
    });

    $('select[name="tipoMudanza"]').on('change', function() {
        const tipoSeleccionado = $(this).val();
        const avisoDistancia = $('#aviso-distancia');

        if (tipoSeleccionado === 'nacionalExpress' || tipoSeleccionado === 'nacionalCompartido') {
            avisoDistancia.slideDown();
        } else {
            avisoDistancia.slideUp();
        }
    });

    loadComponent('header-container', '_header.html');
    loadComponent('social-networks-container', '_socialBar.html');
    loadComponent('footer-container', '_footer.html');
    loadComponent('meta-container', '_meta.html');
});