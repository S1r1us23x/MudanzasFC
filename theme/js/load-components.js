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

    loadComponent('header-container', '_header.html');
    loadComponent('social-networks-container', '_socialBar.html');
    loadComponent('footer-container', '_footer.html');
});