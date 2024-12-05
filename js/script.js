document.addEventListener('DOMContentLoaded', () => {
    // Redirigir a la URL raíz si la URL actual es /index.html o /index
    const pathname = window.location.pathname;
    /* if (pathname.endsWith('/index.html') || pathname.endsWith('/index')) {
        window.location.replace('/VoleyballArt/');
    } 
    if (pathname.endsWith('.html')) {
        const newPathname = pathname.replace('.html', '');
        window.location.replace(newPathname);
    }  */

    const preloaderElement = document.querySelector('.preloader');
    const pageElement = document.querySelector('.page');
    const delay = 1900; // Retraso en milisegundos (1.9 segundos)
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
                                if (item.value) {
                                    element.value = item.value;
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
    function loadHTMLContent(url, element) {
        return fetch(url)
            .then(response => response.text())
            .then(data => {
                element.innerHTML += data;
            })
            .catch(error => console.error(`Error al cargar el contenido de ${url}:`, error));
    }

    // Función para cargar el archivo JSON
    function loadJSON(url) {
        return fetch(url)
            .then(response => response.json())
            .catch(error => console.error(`Error al cargar el archivo JSON: ${url}`, error));
    }

    // Función para mostrar los productos
    function displayProducts(products, limit = null) {
        const productsListElement = document.getElementById('productsId');
        let count = 0;
        for (const key in products) {
            if (products.hasOwnProperty(key)) {
                if (limit !== null && count >= limit) break; // Detener el bucle después de alcanzar el límite
                const product = products[key];
                const productHTML = `
                    <a href="${product.link[0].href}" class="card product-item border-0 mb-4">
                        <div class="card-header product-img position-relative overflow-hidden bg-transparent border p-0">
                            <img class="img-fluid w-100" src="${product.img[0].src}" alt="${product.img[0].alt}">
                        </div>
                        <div class="card-body text-center p-0 pt-4 pb-3">
                            <h6 class="text-cardShop mb-3">${product.title}</h6>
                            <div class="d-flex justify-content-center" id="priceId-${key}"></div>
                        </div>
                    </a>
                `;
                const tempDiv = document.createElement('div');
                tempDiv.className = 'col-lg-3 col-md-6 col-sm-12 pb-1';
                tempDiv.innerHTML = productHTML;
                const productElement = tempDiv.firstElementChild;
                productsListElement.appendChild(tempDiv);
                // Actualizar el precio y el precio anterior
                const priceElement = document.getElementById(`priceId-${key}`);
                if (product.previous_price) {
                    priceElement.innerHTML = `<h6 class="price">$${product.price}</h6>`;
                    priceElement.innerHTML += `<h6 class="previous-price ml-2">$${product.previous_price}</h6>`;
                } else {
                    priceElement.innerHTML = `<h6 class="price">$${product.price}</h6>`;
                }
                count++; // Incrementar el contador
            }
        }
    }

    // Función para cargar el contenido del archivo HTML
    function loadAndDisplayProducts(url, limit = null) {
        loadJSON(url).then(data => {
            const products = data.right.products.list;
            displayProducts(products, limit);
        }).catch(error => {
            console.error('Error al cargar y mostrar los productos:', error);
        });
    }

    function displayFilteredProducts(products, category, subcategory, limit, currentProductTitle) {
        const productsListElement = document.getElementById('productsIds');
        let selectedProducts = [];
        let selectedProductTitles = new Set();

        // Filtrar productos destacados de la misma subcategoría
        let filteredProducts = Object.values(products).filter(p => p.category === category && p.subcategory === subcategory && p.outstanding && p.title !== currentProductTitle);
        filteredProducts.forEach(product => {
            if (selectedProducts.length < limit && !selectedProductTitles.has(product.title)) {
                selectedProducts.push(product);
                selectedProductTitles.add(product.title);
            }
        });

        // Si no se alcanzó el límite, agregar productos de la misma subcategoría sin que sean destacados
        if (selectedProducts.length < limit) {
            filteredProducts = Object.values(products).filter(p => p.category === category && p.subcategory === subcategory && !selectedProductTitles.has(p.title) && p.title !== currentProductTitle);
            filteredProducts.forEach(product => {
                if (selectedProducts.length < limit && !selectedProductTitles.has(product.title)) {
                    selectedProducts.push(product);
                    selectedProductTitles.add(product.title);
                }
            });
        }

        // Si no se alcanzó el límite, agregar productos destacados de la misma categoría
        if (selectedProducts.length < limit) {
            filteredProducts = Object.values(products).filter(p => p.category === category && p.outstanding && !selectedProductTitles.has(p.title) && p.title !== currentProductTitle);
            filteredProducts.forEach(product => {
                if (selectedProducts.length < limit && !selectedProductTitles.has(product.title)) {
                    selectedProducts.push(product);
                    selectedProductTitles.add(product.title);
                }
            });
        }

        // Si no se alcanzó el límite, agregar productos de la misma categoría
        if (selectedProducts.length < limit) {
            filteredProducts = Object.values(products).filter(p => p.category === category && !selectedProductTitles.has(p.title) && p.title !== currentProductTitle);
            filteredProducts.forEach(product => {
                if (selectedProducts.length < limit && !selectedProductTitles.has(product.title)) {
                    selectedProducts.push(product);
                    selectedProductTitles.add(product.title);
                }
            });
        }

        // Si no se alcanzó el límite, agregar productos destacados de cualquier categoría
        if (selectedProducts.length < limit) {
            filteredProducts = Object.values(products).filter(p => p.outstanding && !selectedProductTitles.has(p.title) && p.title !== currentProductTitle);
            filteredProducts.forEach(product => {
                if (selectedProducts.length < limit && !selectedProductTitles.has(product.title)) {
                    selectedProducts.push(product);
                    selectedProductTitles.add(product.title);
                }
            });
        }

        // Si no se alcanzó el límite, agregar cualquier producto
        if (selectedProducts.length < limit) {
            filteredProducts = Object.values(products).filter(p => !selectedProductTitles.has(p.title) && p.title !== currentProductTitle);
            filteredProducts.forEach(product => {
                if (selectedProducts.length < limit && !selectedProductTitles.has(product.title)) {
                    selectedProducts.push(product);
                    selectedProductTitles.add(product.title);
                }
            });
        }

        // Mostrar los productos seleccionados
        selectedProducts.forEach(product => {
            const productHTML = `
                <div class="col-lg-3 col-md-5 col-sm-12 pb-1">
                    <a href="${product.link[0].href}" class="card product-item border-0 mb-4">
                        <div class="card-header product-img position-relative overflow-hidden bg-transparent border p-0">
                            <img class="img-fluid w-100" src="${product.img[0].src}" alt="${product.img[0].alt}">
                        </div>
                        <div class="card-body text-center p-0 pt-4 pb-3">
                            <h6 class="text-cardShop mb-3">${product.title}</h6>
                            <div class="d-flex justify-content-center" id="priceId-${product.title.replace(/\s+/g, '-')}"></div>
                        </div>
                    </a>
                </div>
            `;
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = productHTML;
            const productElement = tempDiv.firstElementChild;
            productsListElement.appendChild(productElement);

            // Actualizar el precio y el precio anterior
            const priceElement = document.getElementById(`priceId-${product.title.replace(/\s+/g, '-')}`);
            if (product.previous_price) {
                priceElement.innerHTML = `<h6 class="price">$${product.price}</h6>`;
                priceElement.innerHTML += `<h6 class="previous-price ml-2">$${product.previous_price}</h6>`;
            } else {
                priceElement.innerHTML = `<h6 class="price">$${product.price}</h6>`;
            }
        });
    }

    // Cargar y mostrar productos filtrados
    function loadAndDisplayFilteredProducts(url, category, subcategory, limit, currentProductTitle) {
        loadJSON(url).then(data => {
            const products = data.right.products.list;
            displayFilteredProducts(products, category, subcategory, limit, currentProductTitle);
        }).catch(error => {
            console.error('Error al cargar y mostrar los productos:', error);
        });
    }

    // Cargar producto de la pagina
    function loadProductDetails() {
        const searchParams = new URLSearchParams(window.location.search);
        const productTitle = searchParams.get('title');
        const productJson = 'lenguage/products/es.json'; // Ruta del archivo JSON
        const reviewJson = 'lenguage/reviews/es.json'; // Ruta del archivo JSON

        if (productTitle) {
            // Cargar los datos del producto desde el JSON
            loadJSON(productJson).then(data => {
                // Buscar el producto por el title
                const product = Object.values(data.right.products.list).find(p => p.title.replace(/[ ()]/g, '-').replace(/-+/g, '-').replace(/-$/, '') === productTitle);
                if (product) {
                    // Actualizar el contenido de la página con los datos del producto
                    document.getElementById('headId').innerHTML += `<title>${product.title} - VolleyballArt</title>`;
                    document.querySelector('[data-details="title"]').textContent = product.title;
                    document.querySelector('[data-details="img"]').src = product.img[0].src;
                    document.querySelector('[data-details="img"]').alt = product.img[0].alt;
                    if (product.previous_price) {
                        document.getElementById('priceId').innerHTML = `<h3 class="previous-price-details font-weight-semi-bold mb-4">$${product.previous_price}</h3>`;
                    }
                    document.getElementById('priceId').innerHTML += `<h3 class="font-weight-semi-bold mb-4">$${product.price}</h3>`;
                    document.querySelector('[data-details="description"]').textContent = product.description_1;
                    // Actualizar los enlaces de compartir
                    document.querySelector('[data-details="share_facebook"]').href = "https://www.facebook.com/sharer/sharer.php?u=" + window.location.href + "&description=" + product.title.replace(/ /g, '%20');
                    document.querySelector('[data-details="share_twitter"]').href = "https://twitter.com/intent/tweet?text=" + product.title.replace(/ /g, '%20') + "&url=" + window.location.href;
                    document.querySelector('[data-details="share_pinterest"]').href = "https://pinterest.com/pin/create/button/?url=" + window.location.href + "&media=" + window.location.origin + "/" + product.img[0].src + "&description=" + product.title.replace(/ /g, '%20');
                    document.querySelector('[data-details="share_whatsapp"]').href = "https://api.whatsapp.com/send?text=" + product.title.replace(/ /g, '%20') + "%20" + window.location.href;
                    // Agregar descripciones
                    const descriptionContainer = document.querySelector('[data-details="description"]');
                    descriptionContainer.innerHTML = ''; // Limpiar contenido previo
                    if (product.description_1) {
                        const p1 = document.createElement('p');
                        p1.textContent = product.description_1;
                        descriptionContainer.appendChild(p1);
                    }
                    if (product.description_2) {
                        const p2 = document.createElement('p');
                        p2.textContent = product.description_2;
                        descriptionContainer.appendChild(p2);
                    }
                    if (product.description_3) {
                        const p3 = document.createElement('p');
                        p3.textContent = product.description_3;
                        descriptionContainer.appendChild(p3);
                    }
                    // Buscar información adicional que coincida con la categoría y subcategoría del producto
                    const additionalInfo = data.right.additional_info.list;
                    let info = null;
                    if (additionalInfo[product.category] && additionalInfo[product.category][product.subcategory]) {
                        info = additionalInfo[product.category][product.subcategory];
                        console.log('Información adicional encontrada:', info);
                    }

                    // Actualizar el contenido de la página con la información adicional
                    if (info) {
                        document.querySelector('[data-details="additional_info"]').textContent = info.text;
                        const additional_info_img = document.querySelector('[data-details="additional_info_img"]');
                        if (info.img && info.img[0] && info.img[0].src) {
                            const data_info = `
                                <div class="card product-item border-0 mb-4">
                                    <div class="card-header position-relative overflow-hidden bg-transparent border p-0">
                                        <img class="img-fluid w-100" src="${info.img[0].src}" alt="${info.img[0].alt}">
                                    </div>
                                </div>
                            `;
                            const tempDiv = document.createElement('div');
                            tempDiv.className = 'col-lg-6 col-md-8 col-sm-12 pb-1';
                            tempDiv.innerHTML = data_info;
                            const productElement = tempDiv.firstElementChild;
                            additional_info_img.appendChild(tempDiv);
                        }
                    }

                    // Cargar y mostrar productos filtrados, excluyendo el producto actual
                    loadJSON(reviewJson).then(reviewsData => {
                        // Buscar reseñas que coincidan con el producto actual
                        const reviews = reviewsData.right.reviews.filter(review => review.product === product.title);
                        const numberOfReviews = reviews.length;

                        // Mostrar las reseñas
                        const reviewsContainer = document.querySelector('[data-details="reviews-product"]');
                        reviewsContainer.innerHTML = `<h4 class="mb-5 text-center">${numberOfReviews} ${reviewsData.right.general.review_product} "${product.title}"</h4>`; // Limpiar contenido previo

                        if (numberOfReviews > 0) {
                        reviews.forEach(review => {
                            const reviewHTML = `
                                <div class="media mb-4">
                                    <div class="media-body">
                                        <h6>${review.name}<small> - <i>${review.date}</i></small></h6>
                                        <div class="text-primary mb-2">
                                            ${'<i class="fas fa-star"></i>'.repeat(review.stars)}
                                            ${'<i class="far fa-star"></i>'.repeat(5 - review.stars)}
                                        </div>
                                        <p>${review.comment}</p>
                                    </div>
                                </div>
                        `;
                            reviewsContainer.innerHTML += reviewHTML;
                        });
                    } else {
                        const noReviews = reviewsData.right.general;
                        if (noReviews.null_reviews_1) {
                            reviewsContainer.innerHTML += `<p class="text-center">${noReviews.null_reviews_1}</p>`;
                        }
                        if (noReviews.null_reviews_2) {
                            reviewsContainer.innerHTML += `<p class="text-center">${noReviews.null_reviews_2}</p>`;
                        }
                    }
                    }).catch(error => {
                        console.error('Error al cargar el archivo JSON:', error);
                    });
                    loadAndDisplayFilteredProducts(productJson, product.category, product.subcategory, 4, product.title);
                } else {
                    console.error('Producto no encontrado');
                }
            }).catch(error => {
                console.error('Error al cargar el archivo JSON:', error);
            });
        }
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
    if (pathname.endsWith('/index.html') || pathname.endsWith('/')) { //pathname === "/VolleyballArt/"
        promises.push(loadHTMLContent('archivo-general/carousel-content.html', carouselElement));
        promises.push(loadHTMLContent('archivo-general/featured-content.html', featuredElement));
        promises.push(loadAndDisplayProducts('lenguage/products/es.json', 8)); // Limitar a 8 productos en index
    } else if (pathname.endsWith("/shop.html")) {
        promises.push(loadHTMLContent('archivo-general/searchSection-content.html', searchSectionElement));
        promises.push(loadHTMLContent('archivo-general/shopSidebar-content.html', shopSidebarElement));
        promises.push(loadHTMLContent('archivo-general/pageNavegation-content.html', pageNavegationElement));
        promises.push(loadAndDisplayProducts('lenguage/products/es.json')); // Cargar todos los productos en otras páginas
    } else if (pathname.endsWith("/contact.html")) {
        promises.push(loadHTMLContent('archivo-general/contact-content.html', contactElement));
    } else if (pathname.endsWith("/review.html")) {
        promises.push(loadHTMLContent('archivo-general/reviews-content.html', reviewsElement));
    } else if (pathname.endsWith("/product.html")) {
        promises.push(loadProductDetails());
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
        if (pathname.endsWith('/index.html') || pathname.endsWith('/')) { //pathname === "/VolleyballArt/"
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
        const starsContainer = document.getElementById('stars');
        const stars = starsContainer.querySelectorAll('i');
        let selectedRating = -1; // Variable para almacenar la calificación seleccionada

        stars.forEach((star, index) => {
            star.addEventListener('mouseover', () => {
                // Cambiar las clases de los elementos anteriores y el actual
                for (let i = 0; i <= index; i++) {
                    stars[i].classList.remove('far');
                    stars[i].classList.add('fas');
                }
            });

            star.addEventListener('mouseout', () => {
                // Restaurar las clases originales de todos los elementos si no están seleccionados
                stars.forEach((star, i) => {
                    if (i > selectedRating) {
                        star.classList.remove('fas');
                        star.classList.add('far');
                    }
                });
            });

            star.addEventListener('click', () => {
                // Fijar las estrellas seleccionadas
                selectedRating = index;
                stars.forEach((star, i) => {
                    if (i <= selectedRating) {
                        star.classList.remove('far');
                        star.classList.add('fas');
                    } else {
                        star.classList.remove('fas');
                        star.classList.add('far');
                    }
                });
            });
        });
    }).catch(error => {
        console.error('Error al cargar el contenido:', error);
    });

    // Obtener el title del producto de la URL
    //const productTitle = decodeURIComponent(pathname.split('/').pop().replace(/-/g, ' '));
});