document.addEventListener('DOMContentLoaded', () => {
    const preloaderElement = document.querySelector('.preloader');
    const pageElement = document.querySelector('.page');
    const delay = 1900; // Retraso en milisegundos (2 segundos)
    // Ya se esta mostrando el indicador de carga

    // Función para cargar el archivo JSON y aplicar las traducciones
    function applyTranslations(data, attributes) {
        // Función para actualizar los textos de los elementos
        function updateElements(attribute) {
            const elementsNameSection = document.querySelectorAll(`[${attribute}]`);
            console.log(`Elementos encontrados con ${attribute}:`, elementsNameSection.length);

            elementsNameSection.forEach(element => {
                const keysArray = element.getAttribute(attribute).split(',');
                keysArray.forEach(keysString => {
                    const keys = keysString.split('.');
                    let nameVariable = data;
                    let position = null;

                    // Verificar si la clave está en 'left' o 'right'
                    if (keys[0] === 'left') {
                        nameVariable = data.left;
                        position = 'left';
                    } else if (keys[0] === 'right') {
                        nameVariable = data.right;
                        position = 'right';
                    }

                    // Navegar por las claves del JSON
                    keys.slice(1).forEach(key => {
                        if (nameVariable && nameVariable[key] !== undefined) {
                            nameVariable = nameVariable[key];
                        } else {
                            console.error(`Clave no encontrada: ${key}`);
                            nameVariable = null;
                        }
                    });

                    // Aplicar la traducción en la posición correcta
                    if (nameVariable) {
                        if (Array.isArray(nameVariable)) {
                            // Si es un array, recorrer los elementos y aplicar los cambios
                            nameVariable.forEach(item => {
                                if (item.href) {
                                    element.href = item.href;
                                }
                                if (item.src) {
                                    element.src = item.src;
                                }
                                if (item.alt) {
                                    element.alt = item.alt;
                                }
                                if (item.text) {
                                    if (position === 'left') {
                                        element.innerHTML = `${item.text}${element.innerHTML}`; // Añadir el texto a la izquierda del contenido existente
                                    } else if (position === 'right') {
                                        element.innerHTML += `${item.text}`; // Añadir el texto a la derecha del contenido existente
                                    }
                                }
                            });
                        } else {
                            // Si no es un array, aplicar los cambios directamente
                            if (position === 'left') {
                                element.innerHTML = `${nameVariable}${element.innerHTML}`; // Añadir el texto a la izquierda del contenido existente
                            } else if (position === 'right') {
                                element.innerHTML += `${nameVariable}`; // Añadir el texto a la derecha del contenido existente
                            }
                        }
                        console.log('Texto aplicado:', nameVariable);
                    } else {
                        console.error(`No se pudo aplicar la traducción para: ${keysString}`);
                    }
                });
            });
        }

        // Actualizar los elementos con los atributos especificados
        attributes.forEach(attribute => updateElements(attribute));

        setTimeout(() => {
            preloaderElement.classList.add('loaded');
        }, delay); // Ocultar el indicador de carga
        pageElement.classList.add('animated'); // Mostrar el contenido de la página
    }

    // Función para cargar el contenido del archivo HTML
    function loadHTMLContent(url, element, limit = null) {
        return fetch(url)
            .then(response => response.text())
            .then(data => {
                if (limit !== null) {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = data;
                    const items = tempDiv.querySelectorAll('.col-lg-3.col-md-6.col-sm-12.pb-1');
                    const fragment = document.createDocumentFragment();
                    for (let i = 0; i < (limit !== null ? limit : items.length); i++) {
                        if (items[i]) {
                            fragment.appendChild(items[i]);
                        }
                    }
                    element.appendChild(fragment);
                } else {
                    element.innerHTML += data;
                }
            })
            .catch(error => console.error(`Error al cargar el contenido de ${url}:`, error));
    }

    // Función para cargar el archivo JSON
    function loadJSON(url) {
        return fetch(url)
            .then(response => response.json())
            .catch(error => console.error(`Error al cargar el archivo JSON: ${url}`, error));
    }

    // Seleccionar los elementos que contienen el contenido de los archivos HTML
    const headElement = document.getElementById('headId');
    const headerElement = document.getElementById('headerId');
    const navSecondaryElement = document.getElementById('nav-secondaryId');
    const navPrimaryElement = document.getElementById('nav-primaryId');
    const carouselElement = document.getElementById('header-carousel');
    const featuredElement = document.getElementById('featuredId');
    const searchSectionElement = document.getElementById('searchSectionId');
    const shopSidebarElement = document.getElementById('shopSidebarId');
    const pageNavegationElement = document.getElementById('pageNavegationId');
    const productsElement = document.getElementById('productsId');
    const contactElement = document.getElementById('contactId');
    const reviewsElement = document.getElementById('reviewsId');
    const footerElement = document.getElementById('footerId');

    const promises = [
        loadHTMLContent('archivo-general/head-content.html', headElement),
        loadHTMLContent('archivo-general/header-content.html', headerElement),
        loadHTMLContent('archivo-general/navbarSecondary-content.html', navSecondaryElement),
        loadHTMLContent('archivo-general/navbarPrimary-content.html', navPrimaryElement),
        loadHTMLContent('archivo-general/footer-content.html', footerElement),
        loadJSON('lenguage/general/es.json'),
        loadJSON('lenguage/products/es.json') // Cargar el segundo archivo JSON
    ];

    // Verificar si estamos en la página de inicio
    const pathname = window.location.pathname;
    if (pathname.endsWith("/index") || pathname === "/VolleyballArt/") {
        promises.push(loadHTMLContent('archivo-general/carousel-content.html', carouselElement));
        promises.push(loadHTMLContent('archivo-general/featured-content.html', featuredElement));
        promises.push(loadHTMLContent('archivo-general/products-content.html', productsElement, 8)); // Limitar a 8 productos en index
    } else if (pathname.endsWith("/shop")) {
        promises.push(loadHTMLContent('archivo-general/searchSection-content.html', searchSectionElement));
        promises.push(loadHTMLContent('archivo-general/shopSidebar-content.html', shopSidebarElement));
        promises.push(loadHTMLContent('archivo-general/pageNavegation-content.html', pageNavegationElement));
        promises.push(loadHTMLContent('archivo-general/products-content.html', productsElement)); // Cargar todos los productos en otras páginas
    } else if (pathname.endsWith("/contact")) {
        promises.push(loadHTMLContent('archivo-general/contact-content.html', contactElement));
    } else if (pathname.endsWith("/review")) {
        promises.push(loadHTMLContent('archivo-general/review-content.html', reviewsElement));
    }

    // Cargar el contenido de los archivos HTML y los archivos JSON, luego aplicar las traducciones
    Promise.all(promises).then((results) => {
        console.log('Contenido HTML y JSON cargado completamente');
        const jsonData1 = results[5]; // El primer archivo JSON
        const jsonData2 = results[6]; // El segundo archivo JSON
        applyTranslations(jsonData1, ['data-name', 'data-name-inside']);
        applyTranslations(jsonData2, ['data-product']);
        
        // Lógica para cambiar las clases del <nav> dependiendo de la URL actual
        const navbar = document.getElementById("navbar-vertical");
        if (pathname.endsWith("/index") || pathname === "/VolleyballArt/") {
            navbar.classList.add("show");
            navbar.classList.remove("position-absolute", "bg-light");
            navbar.style.width = "";
            navbar.style.zIndex = "";
        } else {
            navbar.classList.add("position-absolute", "bg-light");
            navbar.classList.remove("show");
            navbar.style.width = "calc(100% - 30px)";
            navbar.style.zIndex = "1";
        }
        // Seleccionar elementos por clase
        const navLinks = document.querySelectorAll('.nav-link');
        const dropdownMenus = document.querySelectorAll('.dropdown-menu.bg-secondary.border-0.rounded-0.w-100.m-0');

        navLinks.forEach((navLink, index) => {
            const dropdownMenu = dropdownMenus[index];

            if (dropdownMenu) {
                dropdownMenu.addEventListener('mouseenter', () => {
                    console.log('mouseenter:', navLink);
                    navLink.classList.add('active-color');
                });

                dropdownMenu.addEventListener('mouseleave', () => {
                    console.log('mouseleave:', navLink);
                    navLink.classList.remove('active-color');
                });
            }
        });
    }).catch(error => {
        console.error('Error al cargar el contenido:', error);
    });
});