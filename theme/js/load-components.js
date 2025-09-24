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
    loadComponent('header-container', '_header.html');
    loadComponent('social-networks-container', '_socialBar.html');
    loadComponent('footer-container', '_footer.html');
});