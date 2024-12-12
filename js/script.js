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
    const generalJson = 'lenguage/general/es.json'; // Ruta del archivo JSON
    const productJson = 'lenguage/products/es.json'; // Ruta del archivo JSON
    const reviewJson = 'lenguage/reviews/es.json'; // Ruta del archivo JSON
    let currentSortCriteria = null;
    let isAscending = true;
    let many_variables = {
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        numbers: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
        prices: {
            range_1: { min: 0, max: 50000 },
            range_2: { min: 50000, max: 100000 },
            range_3: { min: 100000, max: 150000 },
            range_4: { min: 150000, max: 200000 },
            range_5: { min: 200000, max: 250000 },
            range_6: { min: 250000, max: 300000 }
        }
        /* Color no se pudo cargar desde el JSON despues tratar de buscarle la vuelta */
    };
    
    const sizesCategory = {
        shoes: {
            men: getArrayElements(many_variables.numbers, [36, 37]),
            women: getArrayElements(many_variables.numbers, [44, 45]),
        },
        clothing: {
            jackets_and_hoodies: many_variables.sizes,
            game_shirts: many_variables.sizes,
            t_shirts_and_tank_tops: many_variables.sizes,
            leggings_and_shorts: getArrayElements(many_variables.sizes, ['XS', 'XXL']),
        },
        accessories: {
            sleeves: getArrayElements(many_variables.sizes, ['XS', 'XXL']),
            socks_and_calf_sleeves: getArrayElements(many_variables.sizes, ['XS', 'XXL']),
            knee_pads: getArrayElements(many_variables.sizes, ['XS', 'XXL'])
        }
    };

    const preloaderElement = document.querySelector('.preloader');
    const pageElement = document.querySelector('.page');
    const delay = 1900; // Retraso en milisegundos (1.9 segundos)
    // Ya se esta mostrando el indicador de carga

    const productsCart = JSON.parse(localStorage.getItem('productsCart')) || []; // Cargar datos desde localStorage o inicializar como array vacío

    function displayFilteredProducts(products, category, subcategory, limit, productId) {
        const productsListElement = document.getElementById('productsIds');
        let selectedProducts = [];
        let selectedProductId = new Set();

        // Filtrar productos destacados de la misma subcategoría
        let filteredProducts = Object.values(products).filter(p => p.category === category && p.subcategory === subcategory && p.outstanding && p.id !== productId);
        filteredProducts.forEach(product => {
            if (selectedProducts.length < limit && !selectedProductId.has(product.id)) {
                selectedProducts.push(product);
                selectedProductId.add(product.id);
            }
        });

        // Si no se alcanzó el límite, agregar productos de la misma subcategoría sin que sean destacados
        if (selectedProducts.length < limit) {
            filteredProducts = Object.values(products).filter(p => p.category === category && p.subcategory === subcategory && !selectedProductId.has(p.id) && p.id !== productId);
            filteredProducts.forEach(product => {
                if (selectedProducts.length < limit && !selectedProductId.has(product.id)) {
                    selectedProducts.push(product);
                    selectedProductId.add(product.id);
                }
            });
        }

        // Si no se alcanzó el límite, agregar productos destacados de la misma categoría
        if (selectedProducts.length < limit) {
            filteredProducts = Object.values(products).filter(p => p.category === category && p.outstanding && !selectedProductId.has(p.id) && p.id !== productId);
            filteredProducts.forEach(product => {
                if (selectedProducts.length < limit && !selectedProductId.has(product.id)) {
                    selectedProducts.push(product);
                    selectedProductId.add(product.id);
                }
            });
        }

        // Si no se alcanzó el límite, agregar productos de la misma categoría
        if (selectedProducts.length < limit) {
            filteredProducts = Object.values(products).filter(p => p.category === category && !selectedProductId.has(p.id) && p.id !== productId);
            filteredProducts.forEach(product => {
                if (selectedProducts.length < limit && !selectedProductId.has(product.id)) {
                    selectedProducts.push(product);
                    selectedProductId.add(product.id);
                }
            });
        }

        // Si no se alcanzó el límite, agregar productos destacados de cualquier categoría
        if (selectedProducts.length < limit) {
            filteredProducts = Object.values(products).filter(p => p.outstanding && !selectedProductId.has(p.id) && p.id !== productId);
            filteredProducts.forEach(product => {
                if (selectedProducts.length < limit && !selectedProductId.has(product.id)) {
                    selectedProducts.push(product);
                    selectedProductId.add(product.id);
                }
            });
        }

        // Si no se alcanzó el límite, agregar cualquier producto
        if (selectedProducts.length < limit) {
            filteredProducts = Object.values(products).filter(p => !selectedProductId.has(p.id) && p.id !== productId);
            filteredProducts.forEach(product => {
                if (selectedProducts.length < limit && !selectedProductId.has(product.id)) {
                    selectedProducts.push(product);
                    selectedProductId.add(product.id);
                }
            });
        }

        products.sort((a, b) => a.price - b.price).sort((a, b) => a.outstanding - b.outstanding).sort((a, b) => a.subcategory - b.subcategory).sort((a, b) => a.category - b.category);
        
        // Mostrar los productos seleccionados
        selectedProducts.forEach(product => {
            const productHTML = `
                <div class="col-lg-3 col-md-5 col-sm-12 pb-1">
                    <a href="${product.href}" class="card product-item border-0 mb-4">
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

    function addCart(e) {
        const quantityInput = document.querySelector('.quantity-input');
        const amount = parseInt(quantityInput.value);

        // Obtener el tamaño seleccionado, si existe
        const sizeInput = document.querySelector('input[name="size"]:checked');
        const size = sizeInput ? sizeInput.value : null;

        // Crear una copia del objeto `e`
        const productCopy = { ...e, amount, size };

        // Verificar si el producto ya existe en el carrito
        const existingProductIndex = productsCart.findIndex(product => product.title === e.title && product.size === size);
        if (existingProductIndex !== -1) {
            productsCart[existingProductIndex].amount += amount;
        } else {
            productsCart.push(productCopy);
        }

        updateCart();
        console.log(productsCart);
        localStorage.setItem('productsCart', JSON.stringify(productsCart));
    }

    function updateCart() {
        let newNumber = Object.values(productsCart).flat().reduce((acc, product) => acc + product.amount, 0);
        const cartNumberElement = document.querySelector('.cart-number');
        if (cartNumberElement) {
            cartNumberElement.textContent = newNumber;
        }
    }

    // Cargar producto de la pagina
    function loadProductDetails(limitInterest = null) {
        const searchParams = new URLSearchParams(window.location.search);
        const productTitle = searchParams.get('title');

        if (productTitle) {
            // Cargar los JSONs
            Promise.all([loadJSON(productJson), loadJSON(reviewJson), loadJSON(generalJson)])
            .then(([productData, reviewsData, generalData]) => {
                const product = Object.values(productData.products).find(p => p.title.replace(/[ ()]/g, '-').replace(/-+/g, '-').replace(/-$/, '') === productTitle);
                if (product) {
                    // Actualizar el contenido de la página con los datos del producto
                    document.getElementById('headId').innerHTML += `<title>${product.title} - VolleyballArt</title>`;
                    document.querySelector('[data-details="title"]').textContent = product.title;
                    
                    // Filtrar los elementos del array `product.img` que no tienen `carousel` en `true`
                    const filteredImages = product.img.filter(image => !image.carousel);

                    // Verificar si el array `filteredImages` tiene más de 0 elementos
                    if (filteredImages.length > 1) {
                        const carouselContainer = document.querySelector('[data-details="img-carousel"]');
                        let carouselHTML = `
                                <div class="carousel-inner border">
                        `;

                        filteredImages.forEach((image, index) => {
                            carouselHTML += `
                                <div class="carousel-item ${index === 0 ? 'active' : ''}">
                                    <img class="w-100 h-100" src="${image.src}" alt="${image.alt}">
                                </div>
                            `;
                        });

                        carouselHTML += `
                            </div>
                            <a class="carousel-control-prev" href="#product-carousel" data-slide="prev">
                                <i class="fa fa-2x fa-angle-left text-dark"></i>
                            </a>
                            <a class="carousel-control-next" href="#product-carousel" data-slide="next">
                                <i class="fa fa-2x fa-angle-right text-dark"></i>
                            </a>
                        `;
                        carouselContainer.innerHTML = carouselHTML;
                    } else {
                        const carouselContainer = document.querySelector('[data-details="img"]');
                        let carouselHTML = `
                            <div class="carousel-item active">
                                <img class="w-100 h-100" src="${product.img[0].src}" alt="${product.img[0].alt}">
                            </div>
                        `;
                        carouselContainer.innerHTML = carouselHTML;
                    }

                    // Actualizar el contenido de la página con los datos del producto
                    if (product.previous_price) {
                        document.getElementById('priceId').innerHTML = `<h3 class="previous-price-details font-weight-semi-bold mb-4">$${product.previous_price}</h3>`;
                    }
                    document.getElementById('priceId').innerHTML += `<h3 class="font-weight-semi-bold mb-4">$${product.price}</h3>`;

                    // Actualizar los enlaces de compartir
                    document.querySelector('[data-details="share_facebook"]').href = "https://www.facebook.com/sharer/sharer.php?u=" + window.location.href + "&description=" + product.title.replace(/ /g, '%20');
                    document.querySelector('[data-details="share_twitter"]').href = "https://twitter.com/intent/tweet?text=" + product.title.replace(/ /g, '%20') + "&url=" + window.location.href;
                    document.querySelector('[data-details="share_pinterest"]').href = "https://pinterest.com/pin/create/button/?url=" + window.location.href + "&media=" + window.location.origin + "/" + product.img[0].src + "&description=" + product.title.replace(/ /g, '%20');
                    document.querySelector('[data-details="share_whatsapp"]').href = "https://api.whatsapp.com/send?text=" + product.title.replace(/ /g, '%20') + "%20" + window.location.href;

                    // Agregar descripciones
                    const descriptionContainer = document.querySelector('[data-details="description"]');
                    if (product.description) {
                        descriptionContainer.innerHTML = product.description;
                    }

                    // Buscar información adicional que coincida con la categoría y subcategoría del producto
                    const additionalInfo = productData.category; // Suponiendo que ahora es un array
                    let info = null;
                    
                    if (additionalInfo && Array.isArray(additionalInfo)) {
                        const categoryInfo = additionalInfo.find(info => info.id === product.category);
                        if (categoryInfo && categoryInfo.subcategory && Array.isArray(categoryInfo.subcategory)) {
                            const subcategoryInfo = categoryInfo.subcategory.find(sub => sub.id === product.subcategory);
                            if (subcategoryInfo) {
                                info = subcategoryInfo;
                            }
                        }
                    }

                    // Actualizar el contenido de la página con la información adicional
                    if (info) {
                        document.querySelector('[data-details="additional_info_title"]').textContent = generalData.tab_pane.information.subtitle;
                        const additionalInfoContainer = document.querySelector('[data-details="additional_info"]');
                        if (info.text) {
                            additionalInfoContainer.innerHTML = info.text;
                        }
                        const additional_info_img = document.querySelector('[data-details="additional_info_img"]');
                        if (info.img && info.img.length > 0) {
                            let data_info = '';
                            info.img.forEach((image) => {
                                data_info += `
                                    <div class="card product-item border-0 mb-4">
                                        <div class="card-header position-relative overflow-hidden bg-transparent border p-0">
                                            <img class="img-fluid w-100" src="${image.src}" alt="${image.alt}">
                                        </div>
                                    </div>
                                `;
                            });
                            const tempDiv = document.createElement('div');
                            tempDiv.className = 'col-lg-6 col-md-8 col-sm-12 pb-1';
                            tempDiv.innerHTML = data_info;
                            const productElement = tempDiv.firstElementChild;
                            additional_info_img.appendChild(tempDiv);
                        }
                    }

                    // Actualizar los tamaños según la categoría y subcategoría
                    const sizeContainer = document.querySelector('.size-container');
                    sizeContainer.innerHTML = ''; // Limpiar contenido previo

                    const category = product.category;
                    const subcategory = product.subcategory;
                    const availableSizes = (sizesCategory[category] && sizesCategory[category][subcategory]) ? sizesCategory[category][subcategory] : [];

                    // Actualizar el texto de size-name según la categoría
                    const sizeNameElement = document.querySelector('[data-details="size-name"]');
                    if (category === 'shoes') {
                        sizeNameElement.textContent = 'Numero de calzado:';
                    } else {
                        sizeNameElement.textContent = 'Talle:';
                    }

                    availableSizes.forEach((size, index) => {
                        const sizeHTML = `
                            <div class="custom-control custom-radio custom-control-inline">
                                <input type="radio" class="custom-control-input" id="size-${index}" name="size" value="${size}">
                                <label class="custom-control-label" for="size-${index}">${size}</label>
                            </div>
                        `;
                        sizeContainer.innerHTML += sizeHTML;
                    });

                    document.querySelector('[data-details="btn_cart_product"]').textContent = generalData.page_product.btn.text;
                    document.querySelector('[data-details="share"]').textContent = generalData.page_product.share;

                    // Buscar reseñas que coincidan con el producto actual
                    const reviews = reviewsData.reviews.filter(review => review.id_product === product.id);
                    const numberOfReviews = reviews.length;
                    // Insertar el contenido HTML de los tabs
                    const tabPaneContainer = document.querySelector('[data-details="tab_pane"]');
                    tabPaneContainer.innerHTML = `
                        <a class="nav-item nav-link active" data-toggle="tab" href="#tab-pane-1">${generalData.tab_pane.description.title}</a>
                        <a class="nav-item nav-link" data-toggle="tab" href="#tab-pane-2">${generalData.tab_pane.information.title}</a>
                        <a class="nav-item nav-link" data-toggle="tab" href="#tab-pane-3">${generalData.tab_pane.review.title} (${numberOfReviews})</a>
                    `;

                    const containerFormReview = document.querySelector('[data-details="form_review"]');
                    containerFormReview.innerHTML = `
                        <div class="row">
                                    <div class="col-md-6" data-details="reviews-product"></div>
                                    <div class="col-md-6">
                                        <h4 class="mb-4">${generalData.review_product.title}</h4>
                                        <small>${generalData.review_product.text}</small>
                                        <div class="d-flex my-3">
                                            <p class="mb-0 mr-2">${generalData.review_product.rating}</p>
                                            <div class="text-primary" id="stars">
                                                <i class="fa-regular fa-star"></i>
                                                <i class="fa-regular fa-star"></i>
                                                <i class="fa-regular fa-star"></i>
                                                <i class="fa-regular fa-star"></i>
                                                <i class="fa-regular fa-star"></i>
                                            </div>
                                        </div>
                                        <form>
                                            <div class="form-group">
                                                <label for="message">${generalData.review_product.form.review}</label>
                                                <textarea id="message" cols="30" rows="5"
                                                    class="form-control"></textarea>
                                            </div>
                                            <div class="form-group">
                                                <label for="name">${generalData.review_product.form.name}</label>
                                                <input type="text" class="form-control" id="name">
                                            </div>
                                            <div class="form-group">
                                                <label for="email">${generalData.review_product.form.email}</label>
                                                <input type="email" class="form-control" id="email">
                                            </div>
                                            <div class="form-group mb-0">
                                                <input type="submit" value="${generalData.review_product.form.submit}"
                                                    class="btn btn-primary px-3">
                                            </div>
                                        </form>
                                    </div>
                                </div>
                    `;

                    document.querySelector('[data-details="related"]').innerHTML = `<span class="px-2" data-product="general.related">${generalData.page_product.related}</span>`;

                    if (numberOfReviews > 0) {
                        const totalStars = reviews.reduce((sum, review) => sum + review.stars, 0);
                        const averageStars = numberOfReviews > 0 ? (totalStars / numberOfReviews).toFixed(1) : 0;
                        const starsProductHTML = `
                            ${'<i class="fa-solid fa-star"></i>\n'.repeat(Math.ceil(averageStars))}
                            ${'<i class="fa-regular fa-star"></i>\n'.repeat(5 - Math.ceil(averageStars))}
                        `;
                        document.querySelector('[data-details="stars_product"]').style.display = '';
                        document.querySelector('[data-details="stars_product"]').innerHTML = starsProductHTML;
                    }
                    const countsReviewsProductHTML = document.querySelector('[data-details="count_reviews"]');
                    countsReviewsProductHTML.textContent = "(" + numberOfReviews + " " + generalData.tab_pane.review.title + ")";

                    // Mostrar las reseñas
                    const reviewsContainer = document.querySelector('[data-details="reviews-product"]');
                    reviewsContainer.innerHTML = `<h4 class="mb-5 text-center">${numberOfReviews} ${generalData.page_product.review_product} "${product.title}"</h4>`; // Limpiar contenido previo

                    if (numberOfReviews > 0) {
                        reviews.forEach(review => {
                            const reviewHTML = `
                                <div class="media mb-4">
                                    <div class="media-body">
                                        <h6>${review.name}<small> - <i>${review.date}</i></small></h6>
                                        <div class="text-primary mb-2">
                                            ${'<i class="fa-solid fa-star"></i>\n'.repeat(review.stars)}
                                            ${'<i class="fa-regular fa-star"></i>\n'.repeat(5 - review.stars)}
                                        </div>
                                        <p>${review.comment}</p>
                                    </div>
                                </div>
                            `;
                            reviewsContainer.innerHTML += reviewHTML;
                        });
                    } else {
                        const noReviews = generalData.page_product.null_reviews;
                        if (noReviews) {
                            reviewsContainer.innerHTML += noReviews;
                        }
                    }

                    // Desactivar el botón inicialmente
                    const btnCartFunction = document.querySelector('.btn_cart_function');
                    btnCartFunction.disabled = availableSizes.length > 0;

                    // Habilitar el botón cuando se seleccione un tamaño
                    const sizeInputs = document.querySelectorAll('input[name="size"]');
                    sizeInputs.forEach(input => {
                        input.addEventListener('change', () => {
                            btnCartFunction.disabled = false;
                        });
                    });
                    // Agregar el producto al carrito al hacer clic en el botón
                    btnCartFunction.addEventListener('click', () => {
                        addCart(product);
                    });

                    displayFilteredProducts(Object.values(productData.products), product.category, product.subcategory, limitInterest, product.id);

                    // Actualizar el contador al iniciar
                    updateCart();

                    const starsContainer = document.getElementById('stars');
                    const stars = starsContainer.querySelectorAll('i');
                    let selectedRating = -1; // Variable para almacenar la calificación seleccionada
                    
                    stars.forEach((star, index) => {
                        star.addEventListener('mouseover', () => {
                            // Cambiar las clases de los elementos anteriores y el actual
                            for (let i = 0; i <= index; i++) {
                                stars[i].classList.remove('fa-regular');
                                stars[i].classList.add('fa-solid');
                            }
                        });
                    
                        star.addEventListener('mouseout', () => {
                            // Restaurar las clases originales de todos los elementos si no están seleccionados
                            stars.forEach((star, i) => {
                                if (i > selectedRating) {
                                    star.classList.remove('fa-solid');
                                    star.classList.add('fa-regular');
                                }
                            });
                        });
                    
                        star.addEventListener('click', () => {
                            // Fijar las estrellas seleccionadas
                            selectedRating = index;
                            stars.forEach((star, i) => {
                                if (i <= selectedRating) {
                                    star.classList.remove('fa-regular');
                                    star.classList.add('fa-solid');
                                } else {
                                    star.classList.remove('fa-solid');
                                    star.classList.add('fa-regular');
                                }
                            });
                        });
                    });
                } else {
                    console.error('Producto no encontrado');
                }
            })
            .catch(error => {
                console.error('Error al cargar los archivos JSON:', error);
            });
        }
    }


    //Cosas a modificar


    // Función para mostrar los productos
    function displayProducts(products, sortCriteria = null, limit = null, reviews = null) {
        Promise.all([loadJSON(productJson)])
        .then(([productData]) => {
            if(products === null) {
                products = Object.values(productData.products);
            }
            if (!Array.isArray(products)) {
                products = Object.values(productData);
            }
            if (sortCriteria) {
                if (currentSortCriteria === sortCriteria) {
                    isAscending = !isAscending; // Alternar el orden
                } else {
                    isAscending = true; // Restablecer a ascendente si se cambia el criterio
                }
                currentSortCriteria = sortCriteria;
                products = sortProducts(products, sortCriteria, reviews);
            } else {
                products.sort((a, b) => a.outstanding - b.outstanding).sort((a, b) => a.price - b.price);
            }
            if(pathname.endsWith('/index.html')) {
                products.sort((a, b) => a.price - b.price);
                sortCriteria = 'featured';
                products = sortProducts(products, sortCriteria, reviews);
            }
    
            const productsListElement = document.getElementById('productsId');
            productsListElement.innerHTML = ''; // Limpiar contenido previo
            let count = 0;
            for (const key in products) {
                if (products.hasOwnProperty(key)) {
                    if (limit !== null && count >= limit) break; // Detener el bucle después de alcanzar el límite
                    const product = products[key];
                    const productHTML = `
                        <a href="${product.href}" class="card product-item border-0 mb-4">
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
        })
        .catch(error => {
            console.error('Error al cargar los archivos JSON:', error);
        });
    }
    
    function loadFilters(limit = null) {
        Promise.all([loadJSON(productJson), loadJSON(generalJson)])
        .then(([productData, generalData]) => {
            const priceFilters = [
                { text: generalData.filter.price.form.range_all.text, checked: true, min: 0, max: Number.MAX_SAFE_INTEGER},
                many_variables.prices.range_1,
                many_variables.prices.range_2,
                many_variables.prices.range_3,
                many_variables.prices.range_4,
                many_variables.prices.range_5,
                many_variables.prices.range_6
            ];

            const sidebar = document.getElementById('shopSidebarId');
            sidebar.innerHTML = `
                <div class="border-bottom mb-4 pb-4">
                    <h5 class="font-weight-semi-bold mb-4">${generalData.filter.price.title}</h5>
                    <form id="price-form"></form>
                </div>
            `;
            let products = Object.values(productData.products);
            products.sort((a, b) => a.price - b.price);
    
            createFilterForm(priceFilters, 'price-form', 'price', limit);

            // Aplicar la lógica de filtrado inicial
            filterProductsByPrice(null, products, limit);
        })
        .catch(error => {
            console.error('Error al cargar los archivos JSON:', error);
        });
    }

    function createFilterForm(filterData, formId, type, limit = null) {
        const form = document.getElementById(formId);
        form.innerHTML = ''; // Limpiar contenido previo
    
        filterData.forEach((filter, index) => {
            let filterHTML = '';
            if (type === 'price') {
                const priceRange = filter.min !== undefined && filter.max !== undefined
                    ? (filter.max === Number.MAX_SAFE_INTEGER ? 'Todos los Precios' : `$${filter.min} - $${filter.max}`)
                    : filter.text;
                filterHTML = `
                    <div class="custom-control custom-checkbox d-flex align-items-center justify-content-between mb-3">
                        <input type="checkbox" class="custom-control-input" id="${formId}-${index}" ${filter.checked ? 'checked' : ''} data-min="${filter.min}" data-max="${filter.max}">
                        <label class="custom-control-label" for="${formId}-${index}">${priceRange}</label>
                    </div>
                `;
            } else {
                const text = typeof filter === 'string' ? filter : filter.text;
                filterHTML = `
                    <div class="custom-control custom-checkbox d-flex align-items-center justify-content-between mb-3">
                        <input type="checkbox" class="custom-control-input" id="${formId}-${index}" ${filter.checked ? 'checked' : ''}>
                        <label class="custom-control-label" for="${formId}-${index}">${text}</label>
                    </div>
                `;
            }
            form.innerHTML += filterHTML;
        });
    
        // Agregar evento de cambio a los checkboxes de precios
        if (type === 'price') {
            const checkboxes = form.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    filterProductsByPrice(null, null, limit);
                });
            });
        }
    }

    function filterProductsByPrice(sortCriteria = null, products = null, limit = null) {
        const checkboxes = document.querySelectorAll('#price-form input[type="checkbox"]:checked');
        const selectedRanges = Array.from(checkboxes).map(checkbox => ({
            min: parseInt(checkbox.getAttribute('data-min')),
            max: parseInt(checkbox.getAttribute('data-max'))
        }));
    
        // Si no hay checkboxes seleccionados, no mostrar ningún producto
        updateProducts(selectedRanges, sortCriteria, products, limit);
    }

    function updateProducts(selectedRanges = [], sortCriteria = null, products = null, limit = null) {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        const subcategory = urlParams.get('subcategory');
    
        Promise.all([loadJSON(productJson), loadJSON(reviewJson)]).then(([productData, reviewData]) => {
            let allProducts = products || Object.values(productData.products);
            const reviews = reviewData.reviews;
    
            allProducts = filterProductsByCategory(allProducts, category, subcategory);
    
            let filteredProducts;
            if (selectedRanges.length === 0) {
                /* Si no hay checkboxes seleccionados, mostrar todos los productos
                filteredProducts = allProducts; */

                // Si no hay checkboxes seleccionados, no mostrar ningún producto
                filteredProducts = [];
                console.log('No hay rangos seleccionados');
            } else {
                filteredProducts = allProducts.filter(product => {
                    return selectedRanges.some(range => product.price >= range.min && product.price <= range.max);
                });
                console.log('Rangos seleccionados:', filteredProducts);
            }
    
            displayProducts(filteredProducts, sortCriteria, limit, reviews);
            searchSection(limit, filteredProducts);
        }).catch(error => {
            console.error('Error al cargar y filtrar los productos:', error);
        });
    }

    function searchSection(limit = null, filteredProducts = null) {
        const searchSectionElement = document.getElementById('searchSectionId');
        loadJSON(generalJson).then(data => {
            const searchSectionHTML = `
                <!-- searchSection-content -->
                <div class="d-flex align-items-center justify-content-between mb-4">
                    <!-- Product Search - Start -->
                    <form id="search-form">
                        <div class="input-group">
                            <input type="text" class="form-control" id="search-input" placeholder="Search by Name">
                            <div class="input-group-append">
                                <span class="input-group-text bg-transparent text-primary">
                                    <i class="fa-solid fa-magnifying-glass"></i>
                                </span>
                            </div>
                        </div>
                    </form>
                    <!-- Product Search - End -->
                    <!-- Sort By - Start -->
                    <div class="dropdown ml-4">
                        <button class="btn border dropdown-toggle" type="button" id="triggerId"
                            data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">${data.searchSection.btn.text}</button>
                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="triggerId">
                            <a class="dropdown-item" id="sort-reverse">${data.searchSection.menu.reverse.text}</a>
                            <a class="dropdown-item" id="sort-featured">${data.searchSection.menu.featured.text}</a>
                            <a class="dropdown-item" id="sort-best-rating">${data.searchSection.menu.best_rating.text}</a>
                        </div>
                    </div>
                    <!-- Sort By - End -->
                </div>
            `;
            searchSectionElement.innerHTML = searchSectionHTML;
            
            // Agregar los event listeners después de cargar el contenido HTML
            const sortReverseElement = document.getElementById('sort-reverse');
            const sortBestRatingElement = document.getElementById('sort-best-rating');
            const sortFeaturedElement = document.getElementById('sort-featured');
            
            if (sortReverseElement) {
                sortReverseElement.addEventListener('click', () => {
                    filterProductsByPrice('reverse', filteredProducts, limit);
                });
            }
        
            if (sortBestRatingElement) {
                sortBestRatingElement.addEventListener('click', () => {
                    filterProductsByPrice('best_rating', filteredProducts, limit);
                });
            }
        
            if (sortFeaturedElement) {
                sortFeaturedElement.addEventListener('click', () => {
                    filterProductsByPrice('featured', filteredProducts, limit);
                });
            }
        });
    }

    function sortProducts(products, criteria, reviews) {
        switch (criteria) {
            case 'reverse':
                return products.reverse();
            case 'best_rating':
                return products.sort((a, b) => {
                    const ratingA = getAverageRating(a, reviews);
                    const ratingB = getAverageRating(b, reviews);
                    return isAscending ? ratingB - ratingA : ratingA - ratingB;
                });
            case 'featured':
                return  products.sort((a, b) => isAscending ? b.outstanding - a.outstanding : a.outstanding - b.outstanding);
            default:
                return products;
        }
    }
    
    function getAverageRating(product, reviews) {
        const productReviews = reviews.filter(review => review.product === product.title);
        if (productReviews.length === 0) return 0;
        const totalStars = productReviews.reduce((sum, review) => sum + review.stars, 0);
        return totalStars / productReviews.length;
    }


    function filterProductsByCategory(products, category, subcategory) {
        return products.filter(product => {
            if (category && subcategory) {
                return product.category === category && product.subcategory === subcategory;
            } else if (category) {
                return product.category === category;
            }
            return true;
        });
    }


    // Funciones generales

    // Función para obtener los elementos de un array que no están en otro array
    function getArrayElements(array, elementsToRemove) {
        return array.filter(item => !elementsToRemove.includes(item));
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


    //Generar el contenido de la página

    function head() {
        const headContainer = document.getElementById('headId');
        loadJSON(generalJson).then(data => {
            const metaTags = [
                { charset: "UTF-8" },
                { name: "viewport", content: data.head.viewport },
                { name: "description", content: data.head.description },
                { name: "keywords", content: data.head.keywords },
                { "http-equiv": "Content-Security-Policy", content: "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com https://ka-f.fontawesome.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://code.jquery.com https://cdn.jsdelivr.net https://kit.fontawesome.com; img-src 'self' data:; connect-src 'self'" }
            ];

            const linkTags = [
                { rel: "Icon", href: data.store_info.icon.href },
                { rel: "preconnect", href: "https://fonts.gstatic.com" },
                { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap" },
                { rel: "stylesheet", href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.0/css/all.min.css" },
                { rel: "stylesheet", href: "css/styleGeneral.css" },
                { rel: "stylesheet", href: "css/style.css" }
            ];

            let headHTML = metaTags.map(tag => {
                const attributes = Object.entries(tag).map(([key, value]) => `${key}="${value}"`).join(' ');
                return `<meta ${attributes}>`;
            }).join('\n');

            headHTML += linkTags.map(tag => {
                const attributes = Object.entries(tag).map(([key, value]) => `${key}="${value}"`).join(' ');
                return `<link ${attributes}>`;
            }).join('\n');

            headContainer.innerHTML += headHTML;

            // Establecer el título de la página
            let title = '';
            if (pathname.endsWith('/index.html') || pathname.endsWith('/')) {
                title = `${data.store_info.title_brand} - ${data.head.title_data}`;
            } else if (pathname.endsWith('/shop.html')) {
                title = `${data.store_info.shop.text} - ${data.store_info.title_brand}`;
            } else if (pathname.endsWith('/contact.html')) {
                title = `${data.store_info.contact.text} - ${data.store_info.title_brand}`;
            } else if (pathname.endsWith('/review.html')) {
                title = `${data.store_info.review.text} - ${data.store_info.title_brand}`;
            }
            if (title)
                document.title = title;
        }).catch(error => {
            console.error('Error al cargar el archivo JSON:', error);
        });
    }

    function header() {
        const headerContainer = document.getElementById('headerId');
        loadJSON(generalJson).then(data => {
            const headerElements = [
                {
                    type: 'link',
                    href: data.store_info.home.href,
                    content: `<img src="${data.store_info.logo.src}" alt="${data.store_info.logo.alt}" class="logo">`,
                    class: 'text-decoration-none'
                },
                {
                    type: 'form',
                    content: `
                        <div class="input-group">
                            <input type="text" class="form-control" placeholder="Search Products">
                            <div class="input-group-append">
                                <span class="input-group-text bg-transparent text-secondary">
                                    <i class="fa-solid fa-magnifying-glass"></i>
                                </span>
                            </div>
                        </div>
                    `,
                    class: 'col-lg-6 col-6 text-right'
                },
                {
                    type: 'cart',
                    content: `
                        <div class="elementor-widget-container">
                            <div class="raven-shopping-cart-wrap">
                                <a class="raven-shopping-cart btn">
                                    <span class="raven-shopping-cart-icon fa-solid fa-cart-shopping"></span>
                                    <span class="raven-shopping-cart-count cart-number">0</span>
                                </a>
                            </div>
                        </div>
                    `,
                    class: 'col-lg-3 col-6 text-right elementor-element elementor-element-2 raven-shopping-cart-skin-dark elementor-widget__width-auto raven-shopping-cart-remove-thumbnail-yes raven-shopping-cart-remove-view-cart-yes raven-shopping-quick-view-align-right elementor-widget elementor-widget-raven-shopping-cart'
                }
            ];
    
            const headerHTML = headerElements.map(element => {
                if (element.type === 'link') {
                    return `
                        <div class="col-lg-3 d-none d-lg-block">
                            <a class="${element.class}" href="${element.href}">
                                ${element.content}
                            </a>
                        </div>
                    `;
                } else if (element.type === 'form') {
                    return `
                        <div class="${element.class}">
                            <form action="">
                                ${element.content}
                            </form>
                        </div>
                    `;
                } else if (element.type === 'cart') {
                    return `
                        <div class="${element.class}">
                            ${element.content}
                        </div>
                    `;
                }
            }).join('');
    
            headerContainer.innerHTML += `
                <!-- header-content.html -->
                <section class="row align-items-center py-3 px-xl-5">
                    ${headerHTML}
                </section>
            `;
        }).catch(error => {
            console.error('Error al cargar el archivo JSON:', error);
        });
    }

    function navbarPrimary() {
        const navPrimaryContainer = document.getElementById('nav-primaryId');
        loadJSON(generalJson).then(data => {
            const navItems = [
                { href: data.store_info.home.href, text: data.store_info.home.text },
                { href: data.store_info.shop.href, text: data.store_info.shop.text },
                { href: data.store_info.review.href, text: data.store_info.review.text },
                { href: data.store_info.contact.href, text: data.store_info.contact.text }
            ];
    
            const navLinksHTML = navItems.map(item => `
                <a class="nav-item nav-link" href="${item.href}">${item.text}</a>
            `).join('');
    
            const navPrimaryHTML = `
                <!-- navbarPrimary-content.html -->
                <a class="text-decoration-none d-block d-lg-none" href="${data.store_info.home.href}">
                    <img src="${data.store_info.logo.src}" alt="${data.store_info.logo.alt}" class="logo">
                </a>
                <button type="button" class="navbar-toggler" data-toggle="collapse" data-target="#navbarCollapse">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse nav-underline justify-content-between" id="navbarCollapse">
                    <div class="navbar-nav mr-auto py-0">
                        ${navLinksHTML}
                    </div>
                </div>
            `;
            navPrimaryContainer.innerHTML += navPrimaryHTML;
        }).catch(error => {
            console.error('Error al cargar el archivo JSON:', error);
        });
    }

    function createNavItem(item) {
        const subItems = item.subcategory
            .filter(subItem => subItem.title) // Filtrar subItems sin title
            .map(subItem => `
                <li><a ${subItem.href ? `href="${subItem.href}"` : ''} class="dropdown-item">${subItem.title}</a></li>
            `).join('');
    
        if (!item.title) return ''; // Verificar si el item principal tiene title
    
        return `
            <li class="nav-item dropdown">
                <a ${item.href ? `href="${item.href}"` : ''} class="nav-link">
                    ${item.title}<i class="fa-solid fa-angle-down float-right mt-1"></i>
                </a>
                <ul class="dropdown-menu bg-secondary border-0 rounded-0 w-100 m-0">
                    ${subItems}
                </ul>
            </li>
        `;
    }
    
    function createNavSecondaryHTML(productData, generalData) {
        const categories = productData.category;
        const navItems = categories.map(category => {
            const subItems = category.subcategory.map(subCategory => {
                return {
                    href: subCategory.href || null,
                    title: subCategory.title
                };
            });
    
            return createNavItem({
                href: category.href || null,
                title: category.title,
                subcategory: subItems
            });
        }).join('');
    
        let className = null;
        let style = null;
        if (pathname.endsWith('/index.html') || pathname.endsWith('/')) {
            className = "show";
        } else {
            className = "position-absolute bg-light";
            style = 'style="width: calc(100% - 30px); z-index: 1;"';
        }
    
        return `
            <!-- navbarSecondary-content -->
            <a class="btn shadow-none d-flex align-items-center justify-content-between bg-tertiary w-100" data-toggle="collapse"
                href="#navbar-vertical" style="height: 65px; margin-top: -1px; padding: 0 30px;">
                <h6 class="m-0">${generalData.store_info.shop.category}</h6>
                <i class="fa-solid fa-angle-down"></i>
            </a>
            <nav class="collapse navbar navbar-vertical navbar-primary align-items-start p-0 border border-top-0 border-bottom-0 ${className}"
                id="navbar-vertical" ${style ? `${style}` : ''}>
                <ul class="navbar-nav w-100">
                    ${navItems}
                </ul>
            </nav>
        `;
    }
    
    function navbarSecondary() {
        const navSecondaryContainer = document.getElementById('nav-secondaryId');
        Promise.all([loadJSON(productJson), loadJSON(generalJson)])
            .then(([productData, generalData]) => {
                const navSecondaryHTML = createNavSecondaryHTML(productData, generalData);
                navSecondaryContainer.innerHTML = navSecondaryHTML;
            })
            .catch(error => {
                console.error('Error al cargar los archivos JSON:', error);
            });
    }

    function footer() {
        const footerContainer = document.getElementById('footerId');
        loadJSON(generalJson).then(generalData => {
            const footerSections = [
                {
                    class: 'col-lg-4 col-md-12 mb-5 pr-3 pr-xl-5',
                    content: `
                        <a class="text-decoration-none" href="${generalData.store_info.home.href}">
                            <img src="${generalData.store_info.logo.src}" alt="${generalData.store_info.logo.alt}" class="mb-4 display-5 font-weight-semi-bold-2">
                        </a>
                        ${generateContactInfo(generalData.data)}
                    `
                },
                {
                    class: 'col-md-4 mb-5',
                    title: generalData.store_info.title,
                    links: [
                        { href: generalData.store_info.home.href, text: generalData.store_info.home.about_us },
                        { href: generalData.store_info.shop.href, text: generalData.store_info.shop.our_products },
                        { href: generalData.store_info.review.href, text: generalData.store_info.review.your_reviews },
                        { href: generalData.store_info.contact.href, text: generalData.store_info.contact.contact_us }
                    ]
                },
                {
                    class: 'col-md-4 mb-5',
                    title: generalData.resources.title,
                    links: [
                        { href: generalData.resources.privacy_policy.href, text: generalData.resources.privacy_policy.text },
                        { href: generalData.resources.terms_conditions.href, text: generalData.resources.terms_conditions.text },
                        { href: generalData.resources.tracking.href, text: generalData.resources.tracking.text },
                        { href: generalData.resources.consumer_defense.href, text: generalData.resources.consumer_defense.text },
                        { href: generalData.resources.faq.href, text: generalData.resources.faq.text }
                    ]
                },
                {
                    class: 'col-md-4 mb-5',
                    title: generalData.social_media.title,
                    socialLinks: [
                        { href: generalData.social_media.instagram.href, icon: 'fa-brands fa-instagram' },
                        { href: generalData.social_media.facebook.href, icon: 'fa-brands fa-facebook' },
                        { href: generalData.social_media.whatsapp.href, icon: 'fa-brands fa-whatsapp' },
                        { href: generalData.social_media.x.href, icon: 'fa-brands fa-square-x-twitter' }
                    ]
                }
            ];
    
            const footerHTML = `
                <section class="row px-xl-5 pt-3">
                    ${generateFooterSection(footerSections[0])}
                    <div class="col-lg-8 col-md-12">
                        <div class="row">
                            ${footerSections.slice(1).map(generateFooterSection).join('')}
                        </div>
                    </div>
                </section>
                <section class="row border-top border-light mx-xl-5 py-4">
                    <div class="col-md-6 px-xl-0" style="font-size: 0.75rem;">
                        <p class="mb-md-0 text-center text-md-left text-dark">${generalData.copyright.title}
                            &copy;<a class="text-dark font-weight-semi-bold" href="${generalData.store_info.home.href}">${generalData.store_info.title_brand}</a>${generalData.copyright.text}
                        </p>
                    </div>
                    <div class="col-md-6 px-xl-0 text-center text-md-right">
                        <img class="img-fluid" src="${generalData.payment_methods.src}" alt="${generalData.payment_methods.alt}">
                    </div>
                </section>
            `;
    
            footerContainer.innerHTML += footerHTML;
        }).catch(error => {
            console.error('Error al cargar el archivo JSON:', error);
        });
    }
    
    function generateContactInfo(data) {
        return `
            <a class="text-dark" ${data.address.href ? `href="${data.address.href}"` : ''}>
                <p class="mb-2">
                    <i class="fa-solid fa-map text-secondary mr-3"></i>${data.address.text}
                </p>
            </a>
            <a class="text-dark" ${data.email.href ? `href="${data.email.href}"` : ''}>
                <p class="mb-2">
                    <i class="fa-solid fa-envelope text-secondary mr-3"></i> ${data.email.text}
                </p>
            </a>
            <a class="text-dark" ${data.phone.href ? `href="${data.phone.href}"` : ''}>
                <p class="mb-0">
                    <i class="fa-solid fa-phone text-secondary mr-3"></i>${data.phone.text}
                </p>
            </a>
        `;
    }
    
    function generateFooterSection(section) {
        if (section.links) {
            const linksHTML = section.links.map(link => `
                <a class="text-dark mb-2" ${link.href ? `href="${link.href}"` : ''}>
                    <i class="fa-solid fa-angle-right mr-2"></i>${link.text}
                </a>
            `).join('');
            return `
                <div class="${section.class}">
                    <h5 class="font-weight-bold text-dark mb-4">${section.title}</h5>
                    <div class="d-flex flex-column justify-content-start">
                        ${linksHTML}
                    </div>
                </div>
            `;
        } else if (section.socialLinks) {
            const socialLinksHTML = section.socialLinks.map(link => `
                <a class="mb-2" ${link.href ? `href="${link.href}"` : ''}>
                    <i class="${link.icon} mr-2"></i>
                </a>
            `).join('');
            return `
                <div class="${section.class}">
                    <h5 class="font-weight-bold text-dark mb-4">${section.title}</h5>
                    <div class="social-icons">
                        ${socialLinksHTML}
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="${section.class}">
                    ${section.content}
                </div>
            `;
        }
    }

    //Funciones particulares

    function featured() {
        const featuredContainer = document.getElementById('featuredId');
        loadJSON(generalJson).then(generalData => {
            const featuredItems = [
                {
                    href: generalData.featured.quality_product.href,
                    icon: 'fa-solid fa-check',
                    class: null,
                    title: generalData.featured.quality_product.title
                },
                {
                    href: generalData.resources.tracking.href,
                    icon: 'fa-solid fa-truck-fast',
                    class: ' icon-after',
                    title: generalData.resources.tracking.text_offer
                },
                {
                    href: generalData.featured.days_return.href,
                    icon: 'fa-solid fa-right-left',
                    class: null,
                    title: generalData.featured.days_return.title
                },
                {
                    href: generalData.data.phone.href,
                    icon: 'fa-solid fa-phone-volume',
                    class: ' icon-after',
                    title: generalData.data.phone.medium
                }
            ];
    
            const featuredHTML = featuredItems.map(item => `
                <div class="col-lg-3 col-md-6 col-sm-12 pb-1">
                    <a ${item.href ? `href="${item.href}"` : ''} class="d-flex align-items-center border mb-4" style="padding: 30px">
                        <h1 class="${item.icon} text-secondary m-0 mr-3${item.class ? item.class : ''}"></h1>
                        <h5 class="font-weight-semi-bold m-0">${item.title}</h5>
                    </a>
                </div>
            `).join('');
    
            featuredContainer.innerHTML += `
                <!-- featured-content.html -->
                <div class="row px-xl-5 pb-3">
                    ${featuredHTML}
                </div>
            `;
        }).catch(error => {
            console.error('Error al cargar el archivo JSON:', error);
        });
    }

    function loadCarouselContent() {
        Promise.all([loadJSON(productJson), loadJSON(generalJson)])
        .then(([productData, generalData]) => {
            const products = Object.values(productData.products);
            const onSaleProducts = products.filter(product => product.previous_price !== null);
    
            const carouselContainer = document.getElementById('header-carousel');
            if (carouselContainer) {
                let carouselHTML = '<div class="carousel-inner">';

                // Cargar la lista de archivos disponibles
                onSaleProducts.forEach((product, index) => {
                    const filteredImages = product.img.filter(image => image.carousel === true);

                    if (filteredImages) {
                        carouselHTML += `
                            <div class="carousel-item ${index === 0 ? 'active' : ''}" style="height: 410px;">
                                <img class="img-fluid" src="${filteredImages[0].src}" alt="${product.img[0].alt}">
                                <div class="carousel-caption d-flex flex-column align-items-center justify-content-center">
                                    <div class="p-3" style="max-width: 700px;">
                                        <h4 class="text-light text-uppercase font-weight-medium mb-3">${generalData.carousel.title}</h4>
                                        <h3 class="display-4 text-white font-weight-semi-bold mb-4">${product.title}</h3>
                                        <a class="btn btn-light py-2 px-3" href="product.html?title=${product.title.replace(/[ ()]/g, '-').replace(/-+/g, '-').replace(/-$/, '')}">${generalData.carousel.btn}</a>
                                    </div>
                                </div>
                            </div>
                        `;
                    }
                });
                carouselHTML += '</div>';

                carouselHTML += `
                    <a class="carousel-control-prev" href="#header-carousel" data-slide="prev">
                        <div class="btn btn-dark" style="width: 45px; height: 45px;">
                            <span class="carousel-control-prev-icon mb-n2"></span>
                        </div>
                    </a>
                    <a class="carousel-control-next" href="#header-carousel" data-slide="next">
                        <div class="btn btn-dark" style="width: 45px; height: 45px;">
                            <span class="carousel-control-next-icon mb-n2"></span>
                        </div>
                    </a>
                `;
                carouselContainer.innerHTML = carouselHTML;
            }
        })
        .catch(error => {
            console.error('Error al cargar los archivos JSON:', error);
        });
    }

    function pageHeader(page, title, className) {
        const pageHeaderContainer = document.getElementById('pageHeaderId');
        pageHeaderContainer.classList.add(className);
        loadJSON(generalJson).then(dataGeneral => {
            const pageHeaderHTML = `
                <div class="d-flex flex-column align-items-center justify-content-center" style="min-height: 300px">
                    <h1 class="font-weight-semi-bold text-light mb-3">${dataGeneral.store_info[page][title]}</h1>
                    <div class="d-inline-flex">
                        <p class="m-0"><a href="${dataGeneral.store_info.home.href}">${dataGeneral.store_info.home.text}</a></p>
                        <p class="m-0 px-2">-</p>
                        <p class="m-0">${dataGeneral.store_info[page].text}</p>
                    </div>
                </div>
            `;
            pageHeaderContainer.innerHTML = pageHeaderHTML;
        }).catch(error => {
            console.error('Error al cargar el archivo JSON:', error);
        });
    }

    function productTitle() {
        const productTitleContainer = document.getElementById('productTitleId');
        loadJSON(generalJson).then(dataGeneral => {
            const productTitleHTML = `
                <span class="px-2">${dataGeneral.store_info.shop.text}</span>
            `;
            productTitleContainer.innerHTML = productTitleHTML;
        }).catch(error => {
            console.error('Error al cargar el archivo JSON de productos:', error);
        });
    }

    // Funciones de Paginas especificas

    function index() {
        loadCarouselContent();
        productTitle();
        featured();
    }

    /* function pageNavegation() {
        const pageNavegationContainer = document.getElementById('pageNavegationId');
        loadJSON(generalJson).then(data => {
            const pageNavegationHTML = `
                <!-- pageNavegation-content.html -->
                <nav aria-label="Page navigation">
                    <ul class="pagination justify-content-center mb-3">
                        <li class="page-item disabled">
                            <a class="page-link" aria-label="Previous" data-product="pageNavegation.previous.link">
                                <span aria-hidden="true">&laquo;</span>
                                <span class="sr-only" data-product="pageNavegation.previous.text"></span>
                            </a>
                        </li>
                        <li class="page-item active"><a class="page-link" data-product="pageNavegation.pages.page_1"></a></li>
                        <li class="page-item"><a class="page-link" data-product="pageNavegation.pages.page_2"></a></li>
                        <li class="page-item"><a class="page-link" data-product="pageNavegation.pages.page_3"></a></li>
                        <li class="page-item">
                            <a class="page-link" aria-label="Next" data-product="pageNavegation.next.link">
                                <span aria-hidden="true">&raquo;</span>
                                <span class="sr-only" data-product="pageNavegation.next.text"></span>
                            </a>
                        </li>
                    </ul>
                </nav>
            `;
            pageNavegationContainer.innerHTML += pageNavegationHTML;
        });
    } */

    // Seleccionar los elementos que contienen el contenido de los archivos HTML
    const contactElement = document.getElementById('contactId');
    const reviewsElement = document.getElementById('reviewsId');
    

    const promises = [
        head(),
        header(),
        navbarSecondary(),
        navbarPrimary(),
        footer(),
        loadJSON(generalJson)
    ];

    // Verificar si estamos en la página de inicio
    if (pathname.endsWith('/index.html') || pathname.endsWith('/')) { //pathname === "/VolleyballArt/"
        promises.push(index());
        promises.push(displayProducts(null, null, 8, null)); // Limitar a 8 productos en index
    } else if (pathname.endsWith("/shop.html")) {
        promises.push(pageHeader('shop', 'our_products', 'background-image-shop'));
        promises.push(loadFilters(null)); // Página 1, 10 elementos por página
    } else if (pathname.endsWith("/contact.html")) {
        promises.push(pageHeader('contact', 'contact_us', 'background-image-contact'));
        promises.push(loadHTMLContent('general-file/contact-content.html', contactElement));
    } else if (pathname.endsWith("/review.html")) {
        promises.push(pageHeader('review', 'your_reviews', 'background-image-review'));
        promises.push(loadHTMLContent('general-file/reviews-content.html', reviewsElement));
    } else if (pathname.endsWith("/product.html")) {
        promises.push(loadProductDetails(4)); // Limitar a 4 productos relacionados

        const quantityInput = document.querySelector('.quantity-input');
        const btnMinus = document.querySelector('.btn-minus');
        const btnPlus = document.querySelector('.btn-plus');

        btnMinus.addEventListener('click', () => {
            let currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        });

        btnPlus.addEventListener('click', () => {
            let currentValue = parseInt(quantityInput.value);
            quantityInput.value = currentValue + 1;
        });
    }

    // Cargar el contenido de los archivos HTML y los archivos JSON, luego aplicar las traducciones
    Promise.all(promises).then((results) => {
        console.log('Contenido HTML y JSON cargado completamente');

        setTimeout(() => {
            preloaderElement.classList.add('loaded');
        }, delay); // Ocultar el indicador de carga
        pageElement.classList.add('animated'); // Mostrar el contenido de la página

        // Seleccionar elementos por clase
        const navLinks = document.querySelectorAll('.nav-link');
        const dropdownMenus = document.querySelectorAll('.dropdown-menu.bg-secondary.border-0.rounded-0.w-100.m-0');

        navLinks.forEach((navLink, index) => {
            const dropdownMenu = dropdownMenus[index];

            if (dropdownMenu) {
                dropdownMenu.addEventListener('mouseenter', () => {
                    navLink.classList.add('active-color');
                });

                dropdownMenu.addEventListener('mouseleave', () => {
                    navLink.classList.remove('active-color');
                });
            }
        });
    }).catch(error => {
        console.error('Error al cargar el contenido:', error);
    });

    // Obtener el title del producto de la URL
    //const productTitle = decodeURIComponent(pathname.split('/').pop().replace(/-/g, ' '));
});