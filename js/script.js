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
    };
    
    const sizesCategory = {
        1: {
            1: getArrayElements(many_variables.numbers, [36, 37]),
            2: getArrayElements(many_variables.numbers, [44, 45]),
        },
        2: {
            3: many_variables.sizes,
            4: many_variables.sizes,
            5: many_variables.sizes,
            6: getArrayElements(many_variables.sizes, ['XS', 'XXL']),
            7: getArrayElements(many_variables.sizes, ['XS', 'XXL']),
        },
        3: {
            9: getArrayElements(many_variables.sizes, ['XS', 'XXL']),
            10: getArrayElements(many_variables.sizes, ['XS', 'XXL']),
            11: getArrayElements(many_variables.sizes, ['XS', 'XXL'])
        }
    };

    const preloaderElement = document.querySelector('.preloader');
    const pageElement = document.querySelector('.page');
    const delay = 100; // Retraso en milisegundos (0.1 segundos - excepto que tarde más, la página, en cargar)
    // Ya se esta mostrando el indicador de carga

    const productsCart = JSON.parse(localStorage.getItem('productsCart')) || []; // Cargar datos desde localStorage o inicializar como array vacío

    // Inicializar el objeto selectedShippingMethod si no existe
    initializeSelectedShippingMethod();

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
                priceElement.innerHTML = `<h6 class="price">$&nbsp;${product.price}</h6>`;
                priceElement.innerHTML += `<h6 class="previous-price ml-2">$&nbsp;${product.previous_price}</h6>`;
            } else {
                priceElement.innerHTML = `<h6 class="price">$&nbsp;${product.price}</h6>`;
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
        const productsCart = JSON.parse(localStorage.getItem('productsCart')) || [];
        let newNumber = productsCart.reduce((acc, product) => acc + product.amount, 0);
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
                    document.getElementById('headId').innerHTML += `<title>${product.title} - ${generalData.store_info.title_brand}</title>`;
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
                        document.getElementById('priceId').innerHTML = `<h3 class="previous-price-details font-weight-semi-bold mb-4">$&nbsp;${product.previous_price}</h3>`;
                    }
                    document.getElementById('priceId').innerHTML += `<h3 class="font-weight-semi-bold mb-4">$&nbsp;${product.price}</h3>`;

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
                    // Insertar el contenido HTML de los tabs
                    const tabPaneContainer = document.querySelector('[data-details="tab_pane"]');
                    tabPaneContainer.innerHTML = `
                        <a class="nav-item nav-link active" data-toggle="tab" href="#tab-pane-1">${generalData.tab_pane.description.title}</a>
                        <a class="nav-item nav-link" data-toggle="tab" href="#tab-pane-2">${generalData.tab_pane.information.title}</a>
                        <a class="nav-item nav-link" data-toggle="tab" href="#tab-pane-3">${generalData.tab_pane.review.title} (${reviews.length})</a>
                    `;

                    const containerFormReview = document.querySelector('[data-details="form_review"]');
                    containerFormReview.innerHTML = `
                        <div class="row">
                        <div class="col-md-6" data-details="reviews-product"></div>
                            <div class="col-md-6">
                                <h4 class="mb-4">${generalData.review_product.title}</h4>
                                <small>${generalData.review_product.text}</small>
                                <div class="d-flex my-3">
                                    <p class="mb-0 mr-2">${generalData.review_product.rating}<text class="text-red"> *</text> </p>
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
                                        <label for="message">${generalData.review_product.form.review}<text class="text-red"> *</text></label>
                                        <textarea id="message" cols="30" rows="5"
                                            class="form-control"></textarea>
                                    </div>
                                    <div class="form-group">
                                        <label for="name">${generalData.review_product.form.name}<text class="text-red"> *</text></label>
                                        <input type="text" class="form-control" id="name">
                                    </div>
                                    <div class="form-group">
                                        <label for="email">${generalData.review_product.form.email}<text class="text-red"> *</text></label>
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

                    document.querySelector('[data-details="related"]').innerHTML = `<span class="px-2">${generalData.page_product.related}</span>`;

                    if (reviews.length > 0) {
                        const totalStars = reviews.reduce((sum, review) => sum + review.stars, 0);
                        const averageStars = reviews.length > 0 ? (totalStars / reviews.length).toFixed(1) : 0;
                        const starsProductHTML = `
                            ${'<i class="fa-solid fa-star"></i>\n'.repeat(Math.ceil(averageStars))}
                            ${'<i class="fa-regular fa-star"></i>\n'.repeat(5 - Math.ceil(averageStars))}
                        `;
                        document.querySelector('[data-details="stars_product"]').style.display = '';
                        document.querySelector('[data-details="stars_product"]').innerHTML = starsProductHTML;
                    }
                    const countsReviewsProductHTML = document.querySelector('[data-details="count_reviews"]');
                    countsReviewsProductHTML.textContent = "(" + reviews.length + " " + generalData.tab_pane.review.title + ")";

                    // Mostrar las reseñas
                    const reviewsContainer = document.querySelector('[data-details="reviews-product"]');
                    reviewsContainer.innerHTML = `
                        <h4 class="mb-5 text-center">${reviews.length} ${generalData.page_product.review_product} "${product.title}"</h4>
                        <div class="container-review">
                            ${generateReviewsHTML(reviews, generalData)}
                        </div>
                    `; // Limpiar contenido previo

                    // Desactivar el botón inicialmente
                    const btnCartFunction = document.querySelector('[data-details="btn_cart_product"]');
                    const sizeInputs = document.querySelectorAll('input[name="size"]');

                    // Verificar si hay un tamaño seleccionado al cargar la página
                    const isSizeSelected = Array.from(sizeInputs).some(input => input.checked);
                    btnCartFunction.disabled = !isSizeSelected;

                    // Habilitar el botón cuando se seleccione un tamaño
                    sizeInputs.forEach(input => {
                        input.addEventListener('change', () => {
                            btnCartFunction.disabled = false;
                        });
                    });

                    // Agregar el producto al carrito al hacer clic en el botón
                    btnCartFunction.addEventListener('click', () => {
                        addCart(product);
                        updateCart();
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

    function generateReviewsHTML(reviews, generalData) {
        let reviewsHTML = '';
    
        if (reviews.length > 0) {
            reviews.forEach(review => {
                reviewsHTML += `
                    <div class="mb-4">
                        <h6>${review.name}<small> - <i>${review.date}</i></small></h6>
                        <div class="text-primary mb-2">
                            ${'<i class="fa-solid fa-star"></i>\n'.repeat(review.stars)}
                            ${'<i class="fa-regular fa-star"></i>\n'.repeat(5 - review.stars)}
                        </div>
                        <p>${review.comment}</p>
                    </div>
                `;
            });
        } else {
            const noReviews = generalData.page_product.null_reviews;
            if (noReviews) {
                reviewsHTML += noReviews;
            }
        }
    
        return reviewsHTML;
    }

    // Función para mostrar los productos
    function displayProducts(products, sortCriteria = null, limit = null, reviews = null, page = null, sortedProducts = null) {
        Promise.all([loadJSON(productJson)])
        .then(([productData]) => {
            if (products === null) {
                products = Object.values(productData.products);
            }
            if (!Array.isArray(products)) {
                products = Object.values(productData.products);
            }
            if (sortCriteria && !sortedProducts) {
                products = sortProducts(products, sortCriteria, reviews);
            } else if (!sortedProducts) {
                products.sort((a, b) => a.outstanding - b.outstanding).sort((a, b) => a.price - b.price);
            } else {
                products = sortedProducts;
            }
            if (pathname.endsWith('/index.html')) {
                products.sort((a, b) => a.price - b.price);
                sortCriteria = 'featured';
                products = sortProducts(products, sortCriteria, reviews);
            }
    
            const productsListElement = document.getElementById('productsId');
            productsListElement.innerHTML = ''; // Limpiar contenido previo
    
            // Paginación
            const itemsPerPage = limit || 10;
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedProducts = products.slice(startIndex, endIndex);
    
            let count = 0;
            for (const key in paginatedProducts) {
                if (paginatedProducts.hasOwnProperty(key)) {
                    const product = paginatedProducts[key];
                    const productHTML = `
                        <div class="col-lg-3 col-md-6 col-sm-12 pb-1">
                            <a href="${product.href}" class="card product-item border-0 mb-4">
                                <div class="card-header product-img position-relative overflow-hidden bg-transparent border p-0">
                                    <img class="img-fluid w-100" src="${product.img[0].src}" alt="${product.img[0].alt}">
                                </div>
                                <div class="card-body text-center p-0 pt-4 pb-3">
                                    <h6 class="text-cardShop mb-3">${product.title}</h6>
                                    <div class="d-flex justify-content-center" id="priceId-${key}"></div>
                                </div>
                            </a>
                        </div>
                    `;
                    productsListElement.innerHTML += productHTML;
    
                    // Actualizar el precio y el precio anterior
                    const priceElement = document.getElementById(`priceId-${key}`);
                    if (product.previous_price) {
                        priceElement.innerHTML = `<h6 class="price">$&nbsp;${product.price}</h6>`;
                        priceElement.innerHTML += `<h6 class="previous-price ml-2">$&nbsp;${product.previous_price}</h6>`;
                    } else {
                        priceElement.innerHTML = `<h6 class="price">$&nbsp;${product.price}</h6>`;
                    }
                    count++; // Incrementar el contador
                }
            }
    
            // Crear botones de paginación
            if (pathname.endsWith('/shop.html')) {
                const paginationElement = document.getElementById('paginationId');
                paginationElement.innerHTML = ''; // Limpiar contenido previo
                            
                const totalPages = Math.ceil(products.length / itemsPerPage);
                let paginationHTML = `
                    <nav aria-label="Page navigation">
                        <ul class="pagination justify-content-center mb-3">
                            <li class="page-item ${page === 1 ? 'disabled' : ''}">
                                <button class="page-link pagination" aria-label="Previous" ${page === 1 ? 'disabled' : ''}>
                                    <span aria-hidden="true">&laquo;</span>
                                    <span class="sr-only">Previous</span>
                                </button>
                            </li>
                `;
                            
                if (totalPages <= 4) {
                    // Mostrar todas las páginas si son 4 o menos
                    for (let i = 1; i <= totalPages; i++) {
                        paginationHTML += `
                            <li class="page-item ${page === i ? 'active' : ''}">
                                <button class="page-link pagination">${i}</button>
                            </li>
                        `;
                    }
                } else {
                    // Mostrar la primera página
                    paginationHTML += `
                        <li class="page-item ${page === 1 ? 'active' : ''}">
                            <button class="page-link pagination">1</button>
                        </li>
                    `;
                
                    if (page > 4) {
                        // Mostrar puntos suspensivos si la página actual es mayor que 3
                        paginationHTML += `
                            <li class="page-item disabled">
                                <span class="page-link">...</span>
                            </li>
                        `;
                    }
                
                    // Mostrar las páginas alrededor de la página actual
                    let startPage = Math.max(2, page - 2);
                    let endPage = Math.min(totalPages - 2, page + 2);
                
                    if (page === 1) {
                        endPage = 3;
                    } else if (page === totalPages) {
                        startPage = totalPages - 2;
                    }
                
                    for (let i = startPage; i <= endPage; i++) {
                        paginationHTML += `
                            <li class="page-item ${page === i ? 'active' : ''}">
                                <button class="page-link pagination">${i}</button>
                            </li>
                        `;
                    }
                
                    if (page < totalPages - 4) {
                        // Mostrar puntos suspensivos si la página actual es menor que totalPages - 2
                        paginationHTML += `
                            <li class="page-item disabled">
                                <span class="page-link">...</span>
                            </li>
                        `;
                    }
                
                    // Mostrar la última página
                    paginationHTML += `
                        <li class="page-item ${page === totalPages ? 'active' : ''}">
                            <button class="page-link pagination">${totalPages}</button>
                        </li>
                    `;
                }
                
                paginationHTML += `
                            <li class="page-item ${page === totalPages ? 'disabled' : ''}">
                                <button class="page-link pagination" aria-label="Next" ${page === totalPages ? 'disabled' : ''}>
                                    <span aria-hidden="true">&raquo;</span>
                                    <span class="sr-only">Next</span>
                                </button>
                            </li>
                        </ul>
                    </nav>
                `;
                
                paginationElement.innerHTML = paginationHTML;
                
                // Agregar event listeners a los botones de paginación
                const pageButtons = paginationElement.querySelectorAll('.page-link.pagination');
                pageButtons.forEach((button, index) => {
                    button.addEventListener('click', () => {
                        if (button.getAttribute('aria-label') === 'Previous') {
                            displayProducts(products, sortCriteria, limit, reviews, page - 1, products);
                        } else if (button.getAttribute('aria-label') === 'Next') {
                            displayProducts(products, sortCriteria, limit, reviews, page + 1, products);
                        } else {
                            displayProducts(products, sortCriteria, limit, reviews, parseInt(button.textContent), products);
                        }
                    });
                });
            }
        })
        .catch(error => {
            console.error('Error al cargar los archivos JSON:', error);
        });
    }
    
    function loadFilters(limit = null, page = null) {
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
    
            createFilterForm(priceFilters, 'price-form', 'price', limit, page);
    
            // Aplicar la lógica de filtrado inicial
            filterProductsByPrice(null, products, limit, page);
        })
        .catch(error => {
            console.error('Error al cargar los archivos JSON:', error);
        });
    }
    
    function createFilterForm(filterData, formId, type, limit = null, page = null) {
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
                    filterProductsByPrice(null, null, limit, page);
                });
            });
        }
    }
    
    function filterProductsByPrice(sortCriteria = null, products = null, limit = null, page = null) {
        const checkboxes = document.querySelectorAll('#price-form input[type="checkbox"]:checked');
        const selectedRanges = Array.from(checkboxes).map(checkbox => ({
            min: parseInt(checkbox.getAttribute('data-min')),
            max: parseInt(checkbox.getAttribute('data-max'))
        }));
    
        // Si no hay checkboxes seleccionados, no mostrar ningún producto
        updateProducts(selectedRanges, sortCriteria, products, limit, page);
    }
    
    function updateProducts(selectedRanges = [], sortCriteria = null, products = null, limit = null, page = null) {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        const subcategory = urlParams.get('subcategory');
    
        Promise.all([loadJSON(productJson), loadJSON(reviewJson)]).then(([productData, reviewData]) => {
            let allProducts = products || Object.values(productData.products);
            const reviews = reviewData.reviews;
    
            allProducts = filterProductsByCategory(allProducts, category, subcategory, productData);
    
            let filteredProducts;
            if (selectedRanges.length === 0) {
                // Si no hay checkboxes seleccionados, no mostrar ningún producto
                filteredProducts = [];
            } else {
                filteredProducts = allProducts.filter(product => {
                    return selectedRanges.some(range => product.price >= range.min && product.price <= range.max);
                });
            }
            
            displayProducts(filteredProducts, sortCriteria, limit, reviews, page);
            orderSection(filteredProducts, limit, reviews, page); // Llamar a orderSection con los productos filtrados
        }).catch(error => {
            console.error('Error al cargar y filtrar los productos:', error);
        });
    }
    
    function orderSection(filteredProducts, limit, reviews, page = null) {
        const orderSectionElement = document.getElementById('orderSectionId');
        
        Promise.all([loadJSON(generalJson)])
        .then(([generalData]) => {
            const orderSectionHTML = `
                <div class="d-flex align-items-center justify-content-between mb-4">
                    <div></div>
                    <!-- Sort By - Start -->
                    <div class="dropdown ml-4">
                        <button class="btn border dropdown-toggle order" type="button" id="triggerId" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">${generalData.orderSection.btn.text}</button>
                        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="triggerId">
                            <button class="dropdown-item" id="sort-reverse">${generalData.orderSection.menu.reverse.text}</button>
                            <button class="dropdown-item" id="sort-featured">${generalData.orderSection.menu.featured.text}</button>
                            <button class="dropdown-item" id="sort-best-rating">${generalData.orderSection.menu.best_rating.text}</button>
                        </div>
                    </div>
                    <!-- Sort By - End -->
                </div>
            `;
            orderSectionElement.innerHTML = orderSectionHTML;

            const sortReverseElement = document.getElementById('sort-reverse');
            const sortBestRatingElement = document.getElementById('sort-best-rating');
            const sortFeaturedElement = document.getElementById('sort-featured');
            
            if (sortReverseElement) {
                sortReverseElement.addEventListener('click', () => {
                    displayProducts(filteredProducts, 'reverse', limit, reviews, page);
                });
            }
        
            if (sortBestRatingElement) {
                sortBestRatingElement.addEventListener('click', () => {
                    displayProducts(filteredProducts, 'best_rating', limit, reviews, page);
                });
            }
        
            if (sortFeaturedElement) {
                sortFeaturedElement.addEventListener('click', () => {
                    displayProducts(filteredProducts, 'featured', limit, reviews, page);
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

    function filterProductsByCategory(products, categoryName, subcategoryName, dataProducts) {
        let categoryId = null;
        let subcategoryId = null;
    
        if (categoryName) {
            const category = dataProducts.category.find(cat => cat.title === categoryName);
            if (category) {
                categoryId = category.id;
            }
        }
    
        if (subcategoryName && categoryId) {
            const category = dataProducts.category.find(cat => cat.title === categoryName);
            if (category) {
                const subcategory = category.subcategory.find(subcat => subcat.title === subcategoryName);
                if (subcategory) {
                    subcategoryId = subcategory.id;
                }
            }
        }
    
        return products.filter(product => {
            if (categoryId && subcategoryId) {
                return product.category === categoryId && product.subcategory === subcategoryId;
            } else if (categoryId) {
                return product.category === categoryId;
            }
            return true;
        });
    }

    // Funciones generales

    // Función para obtener los elementos de un array que no están en otro array
    function getArrayElements(array, elementsToRemove) {
        return array.filter(item => !elementsToRemove.includes(item));
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
        Promise.all([loadJSON(generalJson)])
        .then(([generalData]) => {
            const metaTags = [
                { charset: "UTF-8" },
                { name: "viewport", content: generalData.head.viewport },
                { name: "description", content: generalData.head.description },
                { name: "keywords", content: generalData.head.keywords },
                { "http-equiv": "Content-Security-Policy", content: "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com https://ka-f.fontawesome.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://code.jquery.com https://cdn.jsdelivr.net https://kit.fontawesome.com; img-src 'self' data:; connect-src 'self' https://formspree.io;" }
            ];

            const linkTags = [
                { rel: "Icon", href: generalData.store_info.icon.href },
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
                title = `${generalData.store_info.title_brand} - ${generalData.head.title_data}`;
            } else if (pathname.endsWith('/shop.html')) {
                title = `${generalData.store_info.shop.text} - ${generalData.store_info.title_brand}`;
            } else if (pathname.endsWith('/contact.html')) {
                title = `${generalData.store_info.contact.text} - ${generalData.store_info.title_brand}`;
            } else if (pathname.endsWith('/cart.html')) {
                title = `${generalData.store_info.cart.text} - ${generalData.store_info.title_brand}`;
            } else if (pathname.endsWith('/checkout.html')) {
                title = `${generalData.store_info.checkout.text} - ${generalData.store_info.title_brand}`;
            }

            if (title)
                document.title = title;
        }).catch(error => {
            console.error('Error al cargar el archivo JSON:', error);
        });
    }

    function header() {
        const headerContainer = document.getElementById('headerId');
        Promise.all([loadJSON(generalJson)])
        .then(([generalData]) => {
            const headerElements = [
                {
                    type: 'link',
                    href: generalData.store_info.home.href,
                    content: `<img src="${generalData.store_info.logo.src}" alt="${generalData.store_info.logo.alt}" class="logo">`,
                    class: 'text-decoration-none'
                },
                {
                    type: 'form',
                    content: `
                        <div class="input-group">
                            <input type="text" class="form-control search" placeholder="Buscar Productos">
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
                                <a href="${generalData.store_info.cart.href}" class="raven-shopping-cart btn">
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
                <section class="row align-items-center py-3 px-xl-5">
                    ${headerHTML}
                </section>
            `;
            // Llamar a updateCart después de que el encabezado se haya renderizado
            updateCart();
        }).catch(error => {
            console.error('Error al cargar el archivo JSON:', error);
        });
    }

    function navbarPrimary() {
        const navPrimaryContainer = document.getElementById('nav-primaryId');
        Promise.all([loadJSON(generalJson)])
        .then(([generalData]) => {
            const navItems = [
                { href: generalData.store_info.home.href, text: generalData.store_info.home.text },
                { href: generalData.store_info.shop.href, text: generalData.store_info.shop.text },
                { href: generalData.store_info.contact.href, text: generalData.store_info.contact.text }
            ];
    
            const navLinksHTML = navItems.map(item => `
                <a class="nav-item nav-link" href="${item.href}">${item.text}</a>
            `).join('');
    
            const navPrimaryHTML = `
                <!-- navbarPrimary-content.html -->
                <a class="text-decoration-none d-block d-lg-none" href="${generalData.store_info.home.href}">
                    <img src="${generalData.store_info.logo.src}" alt="${generalData.store_info.logo.alt}" class="logo">
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
            <nav class="collapse navbar navbar-vertical navbar-primary align-items-start p-0 border border-top-0 border-bottom-0 transition ${className}"
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
        Promise.all([loadJSON(generalJson)])
        .then(([generalData]) => {
            const footerSections = [
                {
                    class: 'col-lg-4 col-md-12 mb-5 pr-3 pr-xl-5',
                    content: `
                        <a class="text-decoration-none" href="${generalData.store_info.home.href}">
                            <img src="${generalData.store_info.logo.src}" alt="${generalData.store_info.logo.alt}" class="mb-4 display-5 font-weight-semi-bold-2">
                        </a>
                        ${generateContactInfo(generalData.data, 'text-dark')}
                    `
                },
                {
                    class: 'col-md-4 mb-5',
                    title: generalData.store_info.title,
                    links: [
                        { href: generalData.store_info.home.href, text: generalData.store_info.home.about_us },
                        { href: generalData.store_info.shop.href, text: generalData.store_info.shop.our_products },
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
    
    function generateContactInfo(generalData, text) {
        return `
            <a class="${text}" ${generalData.address.href ? `href="${generalData.address.href}"` : ''}>
                <p class="mb-2">
                    <i class="fa-solid fa-map text-secondary mr-3"></i>${generalData.address.text}
                </p>
            </a>
            <a class="${text}" ${generalData.email.href ? `href="${generalData.email.href}"` : ''}>
                <p class="mb-2">
                    <i class="fa-solid fa-envelope text-secondary mr-3"></i> ${generalData.email.text}
                </p>
            </a>
            <a class="${text}" ${generalData.phone.href ? `href="${generalData.phone.href}"` : ''}>
                <p class="mb-0">
                    <i class="fa-solid fa-phone text-secondary mr-3"></i>${generalData.phone.text}
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
        Promise.all([loadJSON(generalJson)])
        .then(([generalData]) => {
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
        Promise.all([loadJSON(generalJson)])
        .then(([generalData]) => {
            const pageHeaderHTML = `
                <div class="d-flex flex-column align-items-center justify-content-center" style="min-height: 300px">
                    <h1 class="font-weight-semi-bold text-light mb-3">${generalData.store_info[page][title]}</h1>
                    <div class="d-inline-flex">
                        <p class="m-0"><a href="${generalData.store_info.home.href}">${generalData.store_info.home.text}</a></p>
                        <p class="m-0 px-2 p-white">-</p>
                        <p class="m-0 p-white">${generalData.store_info[page].text}</p>
                    </div>
                </div>
            `;
            pageHeaderContainer.innerHTML = pageHeaderHTML;
        }).catch(error => {
            console.error('Error al cargar el archivo JSON:', error);
        });
    }

    function titleDynamic(page = null) {
        const titleElement = document.getElementById('titleId');
        Promise.all([loadJSON(generalJson)])
        .then(([generalData]) => {
            const titleHTML = `
                <span class="px-2">${generalData.store_info[page].text}</span>
            `;
            titleElement.innerHTML = titleHTML;
        }).catch(error => {
            console.error('Error al cargar el archivo JSON de productos:', error);
        });
    }

    function formContact() {
        const formContainer = document.getElementById('contact_formId');
        Promise.all([loadJSON(generalJson)])
        .then(([generalData]) => {
            const formFields = generalData.page_contact.form.fields;
            let formContactHTML = `
                <div class="contact-form">
                    <div id="success"></div>
                    <form action="https://formspree.io/f/xldeygjz" method="POST" id="contactForm">
            `;
    
            formFields.forEach(field => {
                if (field.type === 'textarea') {
                    formContactHTML += `
                        <div class="control-group">
                            <textarea class="form-control" rows="6" id="${field.id}" name="${field.name}" placeholder="${field.placeholder}"
                                required data-validation-required-message="${field.required_msj}"></textarea>
                            <small class="help-block text-danger" id="${field.id}-error"></small>
                            <p></p>
                        </div>
                    `;
                } else {
                    formContactHTML += `
                        <div class="control-group">
                            <input type="${field.type}" class="form-control" id="${field.id}" name="${field.name}" placeholder="${field.placeholder}"
                                required data-validation-required-message="${field.required_msj}"/>
                            <small class="help-block text-danger" id="${field.id}-error"></small>
                            <p></p>
                        </div>
                    `;
                }
            });
    
            formContactHTML += `
                        <div>
                            <button class="btn btn-primary py-2 px-4" type="submit" id="sendMessageButton">${generalData.page_contact.form.btn}</button>
                        </div>
                    </form>
                </div>
            `;
    
            formContainer.innerHTML = formContactHTML;
    
            // Añadir validación personalizada
            const contactForm = document.getElementById('contactForm');
            const inputs = contactForm.querySelectorAll('input, textarea');
    
            inputs.forEach(input => {
                input.addEventListener('invalid', function(event) {
                    event.preventDefault(); // Prevenir el mensaje de validación predeterminado
                    const errorElement = document.getElementById(`${input.id}-error`);
                    errorElement.textContent = input.getAttribute('data-validation-required-message');
                });
    
                input.addEventListener('input', function() {
                    const errorElement = document.getElementById(`${input.id}-error`);
                    errorElement.textContent = '';
                });
            });
    
            contactForm.addEventListener('submit', function(event) {
                let formIsValid = true;
                inputs.forEach(input => {
                    const errorElement = document.getElementById(`${input.id}-error`);
                    if (!input.checkValidity()) {
                        input.setCustomValidity(input.getAttribute('data-validation-required-message'));
                        errorElement.textContent = input.getAttribute('data-validation-required-message');
                        formIsValid = false;
                    } else {
                        input.setCustomValidity('');
                        errorElement.textContent = '';
                    }
                });
                if (!formIsValid) {
                    event.preventDefault(); // Prevenir el envío del formulario si no es válido
                }
            });
            contactForm.addEventListener('submit', handleSubmit);

            async function handleSubmit(event) {
                event.preventDefault();
                const formData = new FormData(this);
                const response = await fetch(this.action, {
                    method: this.method,
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                })
                if (response.ok) {
                    Swal.fire({
                        title: generalData.page_contact.form.title,
                        text: generalData.page_contact.form.text,
                        icon: generalData.page_contact.form.icon,
                        confirmButtonText: generalData.page_contact.form.confirmButtonText,
                    }).then(() => {
                        this.reset();
                    });
                }
            }
        })
        .catch(error => {
            console.error('Error al cargar los archivos JSON:', error);
        });
    }

    function contactInfo() {
        const contactInfoContainer = document.getElementById('contact_infoId');
        Promise.all([loadJSON(generalJson)])
        .then(([generalData]) => {
            const contactInfoHTML = `
                <h5 class="font-weight-semi-bold mb-3">${generalData.page_contact.subtitle_1}</h5>
                <p>${generalData.page_contact.subtext_1}</p>
                <div class="d-flex flex-column mb-3">
                    <h5 class="font-weight-semi-bold mb-3">${generalData.page_contact.subtitle_2}</h5>
                    <div class="d-flex flex-column mb-3">
                        ${generateContactInfo(generalData.data, 'text-body')}
                    </div>
                </div>
            `;
            contactInfoContainer.innerHTML = contactInfoHTML;
        })
        .catch(error => {
            console.error('Error al cargar los archivos JSON:', error);
        });
    }

    function cartTable() {
        const cartContainer = document.getElementById('cart_container');
        const cartTableContainer = document.getElementById('cart_tableId');
        const cartFormContainer = document.getElementById('cartFormId');
        const cart_empty = document.getElementById('cart_empty');
        const cartItems = JSON.parse(localStorage.getItem('productsCart')) || []; // Obtener los datos del carrito del localStorage
    
        Promise.all([loadJSON(generalJson)])
        .then(([generalData]) => {
            if (cartItems.length > 0) {
                cartContainer.style.justifyContent = '';
                cart_empty.style.display = 'none';
                cartTableContainer.style.display = 'block';
                cartFormContainer.style.display = 'block';
                let cartTableHTML = `
                    <form id="cartForm">
                        <table class="table table-bordered text-center mb-0">
                            <thead class="bg-secondary text-dark">
                                <tr>
                                    <th>${generalData.page_cart.table.product}</th>
                                    <th>${generalData.page_cart.table.price}</th>
                                    <th>${generalData.page_cart.table.quantity}</th>
                                    <th>${generalData.page_cart.table.total}</th>
                                    <th>${generalData.page_cart.table.remove}</th>
                                </tr>
                            </thead>
                            <tbody class="align-middle">
                `;
                
                let subtotal = 0;
                
                cartItems.forEach(item => {
                    let sizeInfo = '';
                    if (item.size) {
                        if (!isNaN(item.size)) {
                            sizeInfo = `Numero: ${item.size}`;
                        } else {
                            sizeInfo = `Talle: ${item.size}`;
                        }
                    }
                
                    const itemTotal = item.price * item.amount;
                    subtotal += itemTotal;
                
                    cartTableHTML += `
                        <tr>
                            <td class="align-middle"><a class="text-body" href=${item.href}><img src="${item.img[0].src}" alt="${item.img[0].alt}" style="width: 50px;">${item.title}${sizeInfo ? ` - ${sizeInfo}` : ''}</a></td>
                            <td class="align-middle">$${item.price}</td>
                            <td class="align-middle">
                                <div class="input-group quantity mx-auto" style="width: 100px;">
                                    <div class="input-group-btn">
                                        <button class="btn btn-sm btn-primary btn-minus" data-id="${item.id}" ${item.size ? `data-size="${item.size}"` : ''}>
                                            <i class="fa fa-minus"></i>
                                        </button>
                                    </div>
                                    <input type="text" class="form-control form-control-sm bg-secondary text-center cart-quantity-input" value="${item.amount}" data-id="${item.id}" ${item.size ? `data-size="${item.size}"` : ''}>
                                    <div class="input-group-btn">
                                        <button class="btn btn-sm btn-primary btn-plus" data-id="${item.id}" ${item.size ? `data-size="${item.size}"` : ''}>
                                            <i class="fa fa-plus"></i>
                                        </button>
                                    </div>
                                </div>
                            </td>
                            <td class="align-middle">$${itemTotal}</td>
                            <td class="align-middle">
                                <button class="btn btn-sm btn-primary btn-remove" data-id="${item.id}" ${item.size ? `data-size="${item.size}"` : ''}>
                                    <i class="fa fa-times"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                });
            
                cartTableHTML += `
                            </tbody>
                        </table>
                        <div class="d-flex justify-content-end">
                            <button id="updateCartButton" class="btn btn-block btn-primary my-2 py-2">Actualizar Carrito</button>
                            <button id="clearCartButton" class="btn btn-block btn-primary my-2 py-2">Borrar Todo</button>
                        </div>
                    </form>
                `;
            
                cartTableContainer.innerHTML = cartTableHTML;
            
                // Añadir event listeners para los botones de incrementar, decrementar y eliminar
                const btnMinus = document.querySelectorAll('.btn-minus');
                const btnPlus = document.querySelectorAll('.btn-plus');
                const btnRemove = document.querySelectorAll('.btn-remove');
                document.getElementById('updateCartButton').addEventListener('click', updateCartInput);
                document.getElementById('clearCartButton').addEventListener('click', clearCart);
            
                btnMinus.forEach(button => {
                    button.addEventListener('click', (event) => {
                        event.preventDefault(); // Prevenir el comportamiento predeterminado del formulario
                        updateQuantity(button.dataset.id, button.dataset.size, -1);
                    });
                });
            
                btnPlus.forEach(button => {
                    button.addEventListener('click', (event) => {
                        event.preventDefault(); // Prevenir el comportamiento predeterminado del formulario
                        updateQuantity(button.dataset.id, button.dataset.size, 1);
                    });
                });
            
                btnRemove.forEach(button => {
                    button.addEventListener('click', (event) => {
                        event.preventDefault(); // Prevenir el comportamiento predeterminado del formulario
                        removeItem(button.dataset.id, button.dataset.size);
                    });
                });
            
                // Interceptar el evento submit del formulario
                document.getElementById('cartForm').addEventListener('submit', (event) => {
                    event.preventDefault(); // Prevenir el comportamiento predeterminado de recargar la página
                    updateCartInput(); // Actualizar el carrito manualmente
                });
            
                // Interceptar el evento keydown en los inputs de cantidad
                const quantityInputs = document.querySelectorAll('.cart-quantity-input');
                quantityInputs.forEach(input => {
                    input.addEventListener('keydown', (event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault(); // Prevenir el comportamiento predeterminado de recargar la página
                            updateCartInput(); // Actualizar el carrito manualmente
                        }
                    });
                });
            
                // Calcular el total
                let total = subtotal;
            
                // Generar el HTML del formulario de pago y el resumen del carrito
                let shipping_free = 100000;

                const shippingOptions = [
                    {
                        id: 'featured_shipping_1',
                        label: generalData.page_cart.shipping.js_shipping_calculator_response.shipping_motorcycle,
                        description: generalData.page_cart.shipping.js_shipping_calculator_response.arrives_between,
                        price: 5900
                    },
                    {
                        id: 'featured_shipping_2',
                        label: generalData.page_cart.shipping.js_shipping_calculator_response.shipping_company_clasic,
                        description: generalData.page_cart.shipping.js_shipping_calculator_response.arrives_between,
                        price: 7199
                    },
                    {
                        id: 'featured_shipping_3',
                        label: generalData.page_cart.shipping.js_shipping_calculator_response.shipping_company_express,
                        description: generalData.page_cart.shipping.js_shipping_calculator_response.arrives_between,
                        price: 7899
                    },
                    {
                        id: 'featured_shipping_4',
                        label: generalData.page_cart.shipping.js_shipping_calculator_response.pickup_point_slow,
                        description: generalData.page_cart.shipping.js_shipping_calculator_response.pickup_point_option_slow,
                        price: 4500
                    },
                    {
                        id: 'featured_shipping_5',
                        label: generalData.page_cart.shipping.js_shipping_calculator_response.pickup_point_fast,
                        description: generalData.page_cart.shipping.js_shipping_calculator_response.pickup_point_option_fast,
                        price: 4999
                    }
                ];

                let cartFormHTML = `
                    <div class="js-fulfillment-info js-allows-non-shippable">
                        <div class="js-ship-free-rest mt-2 mb-3">
                            <div class="js-bar-progress bar-progress">
                                <div id="js_bar_progress_active" class="bar-progress-active transition-soft" style="width: 0%;"></div>
                                <div id="js_bar_progress_check" class="bar-progress-check transition-soft">
                                    <svg class="icon-inline icon-2x" viewBox="0 0 512 512"><path d="M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 48c110.532 0 200 89.451 200 200 0 110.532-89.451 200-200 200-110.532 0-200-89.451-200-200 0-110.532 89.451-200 200-200m140.204 130.267l-22.536-22.718c-4.667-4.705-12.265-4.736-16.97-.068L215.346 303.697l-59.792-60.277c-4.667-4.705-12.265-4.736-16.97-.069l-22.719 22.536c-4.705 4.667-4.736 12.265-.068 16.971l90.781 91.516c4.667 4.705 12.265 4.736 16.97.068l172.589-171.204c4.704-4.668 4.734-12.266.067-16.971z"></path></svg>
                                </div>
                            </div>
                            <div id="js_ship_free_rest_message" class="ship-free-rest-message condition">
                                <div class="ship-free-rest-text bar-progress-success h4 text-accent transition-soft">${generalData.page_cart.shipping.shipping_free}</div>
                                <div class="ship-free-rest-text bar-progress-amount h6 transition-soft">${generalData.page_cart.shipping.js_ship_free_dif}</div>
                                <div class="ship-free-rest-text bar-progress-condition transition-soft">
                                    <strong class="text-accent">${generalData.page_cart.shipping.overcoming_the}</strong> <span>$${shipping_free}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="js-fulfillment-info js-allows-non-shippable">
                        <div class="js-visible-on-cart-filled js-has-new-shipping js-shipping-calculator-container">
                            <div id="cart_shipping_container" class="row">
                                <div class="mb-2 col-12">
                                    <div id="js_shipping_calculator_head" class="shipping-calculator-head position-relative transition-soft with-zip">
                                        ${createZipcodeSection(generalData)}
                                        ${createShippingCalculatorForm(generalData)}
                                    </div>
                                    <div id="js_shipping_calculator_response" class="mb-3 float-left w-100 transition-soft radio-buttons-group">
                                        <div class="form-label my-3 float-left">
                                            <svg class="icon-inline icon-lg svg-icon-text mr-2 align-bottom" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M632 384h-24V275.9c0-16.8-6.8-33.3-18.8-45.2l-83.9-83.9c-11.8-12-28.3-18.8-45.2-18.8H416V78.6c0-25.7-22.2-46.6-49.4-46.6H49.4C22.2 32 0 52.9 0 78.6v290.8C0 395.1 22.2 416 49.4 416h16.2c-1.1 5.2-1.6 10.5-1.6 16 0 44.2 35.8 80 80 80s80-35.8 80-80c0-5.5-.6-10.8-1.6-16h195.2c-1.1 5.2-1.6 10.5-1.6 16 0 44.2 35.8 80 80 80s80-35.8 80-80c0-5.5-.6-10.8-1.6-16H632c4.4 0 8-3.6 8-8v-16c0-4.4-3.6-8-8-8zM460.1 160c8.4 0 16.7 3.4 22.6 9.4l83.9 83.9c.8.8 1.1 1.9 1.8 2.8H416v-96h44.1zM144 480c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48zm63.6-96C193 364.7 170 352 144 352s-49 12.7-63.6 32h-31c-9.6 0-17.4-6.5-17.4-14.6V78.6C32 70.5 39.8 64 49.4 64h317.2c9.6 0 17.4 6.5 17.4 14.6V384H207.6zM496 480c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48zm0-128c-26.1 0-49 12.7-63.6 32H416v-96h160v96h-16.4c-14.6-19.3-37.5-32-63.6-32z"></path></svg>
                                            ${generalData.page_cart.shipping.js_shipping_calculator_response.home_delivery}
                                        </div>
                                        <ul id="shipping_options" class="list-unstyled box p-0">
                                            ${shippingOptions.map(option => createShippingOption(option.id, option.label, option.description, option.price, subtotal, shipping_free, generalData)).join('')}
                                        </ul>
                                        <div class="font-small float-left w-100 mb-3">${generalData.page_cart.shipping.notCosiderHolidays}</div>
                                        <input type="hidden" name="after_calculation">
                                        <input type="hidden" name="zipcode">
                                    </div>
                                </div>
                                <div class="w-100 container-fluid">
                                    <span class="form-row align-items-end">
                                        <div class="col-1 col-md-auto form-label">
                                            <svg class="icon-inline icon-lg svg-icon-text align-text-bottom" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M635.7 176.1l-91.4-160C538.6 6.2 528 0 516.5 0h-393C112 0 101.4 6.2 95.7 16.1l-91.4 160C-7.9 197.5 7.4 224 32 224h32v254.5C64 497 78.3 512 96 512h256c17.7 0 32-15 32-33.5V224h160v280c0 4.4 3.6 8 8 8h16c4.4 0 8-3.6 8-8V224h32c24.6 0 39.9-26.5 27.7-47.9zM352 478.5c0 .9-.3 1.4-.2 1.5l-255.2.2s-.6-.5-.6-1.7V352h256v126.5zm0-158.5H96v-96h256v96zM32.1 192l91.4-160h393L608 192H32.1z"></path></svg>
                                        </div>
                                        <div class="col-11 form-label">
                                            <div>${generalData.page_cart.shipping.our_local}</div>
                                        </div>
                                    </span>
                                </div>
                                <div id="js_store_branches_container" class="container-fluid">
                                    <div class="box mt-3 p-0">
                                        <div class="radio-buttons-group">
                                            <ul class="list-unstyled radio-button-container">
                                                ${createBranchOptions(generalData)}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                cartFormHTML += `
                    <div class="card border-secondary mb-5">
                        <div class="card-header bg-secondary border-0">
                            <h4 class="font-weight-semi-bold m-0">${generalData.page_cart.cart.title}</h4>
                        </div>
                        <div class="card-body">
                            <div class="d-flex justify-content-between mb-3 pt-1">
                                <h6 class="font-weight-medium">${generalData.page_cart.cart.table.subtotal}</h6>
                                <h6 class="font-weight-medium" id="subtotal">$&nbsp;${subtotal}</h6>
                            </div>
                            <div id="shippingCostSection" class="d-flex justify-content-between">
                            </div>
                        </div>
                        <div class="card-footer border-secondary bg-transparent">
                            <div id="totalSection" class="d-flex justify-content-between mt-2">
                                <h5 class="font-weight-bold">${generalData.page_cart.cart.table.total}</h5>
                                <h5 class="font-weight-bold" id="total">$&nbsp;${total}</h5>
                            </div>
                            <a class="text-white" href="${generalData.store_info.checkout.href}"><button id="checkoutButton" class="btn btn-block btn-primary my-3 py-3">${generalData.page_cart.cart.btn}</button></a>
                        </div>
                    </div>
                `;

                cartFormContainer.innerHTML = cartFormHTML;

                // Actualizar el método de envío dinámicamente
                let selectedShippingMethod = localStorage.getItem('selectedShippingMethod');
                if (selectedShippingMethod) {
                    selectedShippingMethod = JSON.parse(selectedShippingMethod);
                    updateShippingMethod(selectedShippingMethod, subtotal, shipping_free, shippingOptions[0], generalData);
                }

                const js_shipping_calculator_form = document.getElementById('js_shipping_calculator_form');
                const js_shipping_calculator_head = document.getElementById('js_shipping_calculator_head');
                js_shipping_calculator_head.style.height = '100px'; // Añadir la clase de posicionamiento

                const js_cart_saved_zipcode = document.getElementById('js_cart_saved_zipcode');
                js_cart_saved_zipcode.style.display = 'none'; // Remover la clase de posicionamiento

                const js_shipping_calculator_response = document.getElementById('js_shipping_calculator_response');
                js_shipping_calculator_response.style.display = 'none';

                const js_calculate_shipping_wording = document.getElementById('js_calculate_shipping_wording');
                const js_calculating_shipping_wording = document.getElementById('js_calculating_shipping_wording');
                const js_calculating_shipping_wording_logo = document.getElementById('js_calculating_shipping_wording_logo');
                const js_danger_postal = document.getElementById('js_danger_postal');
                const js_danger_zipcode = document.getElementById('js_danger_zipcode');
                const js_danger_external = document.getElementById('js_danger_external');

                let savedShippingMethod = localStorage.getItem('selectedShippingMethod');
                if (savedShippingMethod) {
                    savedShippingMethod = JSON.parse(savedShippingMethod);
                    if (savedShippingMethod.zipCode !== null) {
                        handleCalculateShipping();
                        handleShippingMethodSelection(null, subtotal, generalData);
                    } else {
                        handleChangeZipcode();
                        handleShippingMethodSelection(null, subtotal, generalData);
                    }
                } else {
                    initializeSelectedShippingMethod();
                    savedShippingMethod = JSON.parse(localStorage.getItem('selectedShippingMethod'));
                    handleChangeZipcode();
                    handleShippingMethodSelection(null, subtotal, generalData);
                }

                updateBarProgress(subtotal, shipping_free, generalData, true);

                document.addEventListener('click', (event) => {
                    if (event.target && (event.target.id === 'js_calculate_shipping' || event.target.id === 'js_calculate_shipping_wording')) {
                        js_danger_external.style.display = 'none';
                        js_danger_postal.style.display = 'none';
                        js_danger_zipcode.style.display = 'none';
                        js_calculate_shipping_wording.style.display = 'none';
                        js_calculating_shipping_wording.style.display = 'inline';
                        js_calculating_shipping_wording_logo.style.display = 'inline';
                        handleShippingMethodSelection(null, subtotal, generalData);
                        setTimeout(handleCalculateShipping, 100); // Agregar un retraso de 100ms antes de ejecutar handleCalculateShipping
                    } else if (event.target && event.target.id === 'js_shipping_calculator_change_zipcode') {
                        handleChangeZipcode();
                    } else if (event.target && event.target.classList.contains('js-shipping-method')) {
                        handleShippingMethodSelection(event.target, subtotal, generalData);
                    }
                    checkShippingMethodSelection();
                });

                function handleCalculateShipping() {
                    let js_shipping_input = document.getElementById('js_shipping_input').value.trim();
                
                    if (js_shipping_input.length === 4 || (localStorage.getItem('selectedShippingMethod') && savedShippingMethod.zipCode !== null)) {
                        if (localStorage.getItem('selectedShippingMethod') && savedShippingMethod.zipCode !== null) {
                            js_shipping_input = savedShippingMethod.zipCode;
                        }
                    
                        const js_shipping_input_values = document.querySelectorAll('.js_shipping_calculator_current_zip_value');
                        js_shipping_input_values.forEach(element => {
                            element.textContent = js_shipping_input;
                        });
                    
                        js_shipping_calculator_head.style.height = '25px'; // Añadir la clase de posicionamiento
                        js_shipping_calculator_form.style.display = 'none';
                        js_cart_saved_zipcode.style.display = 'block'; // Añadir la clase de posicionamiento
                        js_shipping_calculator_response.style.display = 'block';
                        js_calculating_shipping_wording_logo.style.display = 'none';
                        js_calculating_shipping_wording.style.display = 'none';
                        js_calculate_shipping_wording.style.display = 'inline';
                    } else if (js_shipping_input === "404") {
                        // Ocurrió un error al calcular el envío. Por favor intentá de nuevo en unos segundos.
                        js_calculating_shipping_wording_logo.style.display = 'none';
                        js_calculating_shipping_wording.style.display = 'none';
                        js_calculate_shipping_wording.style.display = 'inline';
                        js_danger_zipcode.style.display = 'inline';
                    } else if (js_shipping_input === "44") {
                        // El calculo falló por un problema con el medio de envío. Por favor intentá de nuevo en unos segundos.
                        js_calculating_shipping_wording_logo.style.display = 'none';
                        js_calculating_shipping_wording.style.display = 'none';
                        js_calculate_shipping_wording.style.display = 'inline';
                        js_danger_external.style.display = 'inline';
                    } else if (js_shipping_input.length !== 4 && js_shipping_input !== "") {
                        // No encontramos este código postal. ¿Está bien escrito?
                        js_calculating_shipping_wording_logo.style.display = 'none';
                        js_calculating_shipping_wording.style.display = 'none';
                        js_calculate_shipping_wording.style.display = 'inline';
                        js_danger_postal.style.display = 'inline';
                    }
                }

                function handleChangeZipcode() {
                    js_shipping_calculator_head.style.height = '100px'; // Añadir la clase de posicionamiento
                    js_cart_saved_zipcode.style.display = 'none'; // Remover la clase de posicionamiento
                    js_shipping_calculator_response.style.display = 'none';
                    js_shipping_calculator_form.style.display = 'block'; // Añadir la clase de posicionamiento
                    if (isFeaturedShippingMethod()) {
                        updateSelectedShippingMethod('zipCode', null);
                    } else {
                        if(localStorage.getItem('selectedShippingMethod')) {
                            updateSelectedShippingMethod('zipCode', null);
                            updateSelectedShippingMethod('shippingMethod', null);
                            updateSelectedShippingMethod('amount', null);
                            updateSelectedShippingMethod('label', null);
                            updateSelectedShippingMethod('description', null);
                        }
                    }
                }

                // Cargar el método de envío guardado al cargar la página
                rechargeShippingMethod(savedShippingMethod);

                // Verificar el estado inicial de los métodos de envío
                checkShippingMethodSelection();

                // Verificar periódicamente si el objeto selectedShippingMethod existe en localStorage
                setInterval(() => {
                    if (!localStorage.getItem('selectedShippingMethod')) {
                        initializeSelectedShippingMethod();
                        
                        
                    }
rechargeShippingMethod();
checkShippingMethodSelection();
                }, 1); // Verificar cada segundo
            } else {
                cartContainer.style.justifyContent = 'center';
                cart_empty.style.display = 'block';
                cart_empty.style.marginInline = '20px';
                cartTableContainer.style.display = 'none';
                cartFormContainer.style.display = 'none';
                updateSelectedShippingMethod('amount', null);
                updateSelectedShippingMethod('shippingMethod', null);
                updateSelectedShippingMethod('label', null);
                updateSelectedShippingMethod('description', null);
                let cart_emptyHTML = `
                    <div class="alert alert-info"><i class="fa-solid fa-circle-info"></i> ${generalData.page_cart.shipping.alert_cart} </div>
                `;
                cart_empty.innerHTML = cart_emptyHTML;
            }
        })
        .catch(error => {
            console.error('Error al cargar los archivos JSON:', error);
        });
    }

    function initializeSelectedShippingMethod() {
        if (!localStorage.getItem('selectedShippingMethod')) {
            const defaultShippingMethod = {
                shippingMethod: null,
                zipCode: null,
                amount: 0,
                label: null,
                description: null
            };
            localStorage.setItem('selectedShippingMethod', JSON.stringify(defaultShippingMethod));
        }
    }

    function rechargeShippingMethod(savedShippingMethod = null) {
        if(!savedShippingMethod) {
               savedShippingMethod = localStorage.getItem('selectedShippingMethod');
                if (savedShippingMethod) {
                    savedShippingMethod = JSON.parse(savedShippingMethod);
}
}
            if (savedShippingMethod.shippingMethod) {
                const { shippingMethod, zipCode } = savedShippingMethod;
                const shippingInput = document.getElementById('js_shipping_input');
                const shippingMethodInput = document.getElementById(shippingMethod);
                shippingMethodInput.checked = false;
            
                if (shippingInput) {
                    if (zipCode) {
                        shippingInput.value = zipCode;
                    }
                }
                if(shippingMethod) {
                    if(shippingMethodInput) {
                        shippingMethodInput.checked = true;
                    }
                }
            }
    }

    function updateShippingMethod(selectedShippingMethod, subtotal, shipping_free, shippingOptions, generalData) {
        if (selectedShippingMethod.shippingMethod === shippingOptions.id) {
            let price = shippingOptions.price;
            selectedShippingMethod.amount = price;
            if (subtotal >= shipping_free) {
                price = 0;
                selectedShippingMethod.amount = price;
            }
            selectedShippingMethod.id = shippingOptions.id;
            handleShippingMethodSelection(null, subtotal, generalData, selectedShippingMethod);
        }
    }

    function checkShippingMethodSelection() {
        const checkoutButton = document.getElementById('checkoutButton');
        
        let isAnyChecked = false;
        
        let selectedShippingMethod = localStorage.getItem('selectedShippingMethod');
        if (selectedShippingMethod) {
            selectedShippingMethod = JSON.parse(selectedShippingMethod);
            if(selectedShippingMethod.shippingMethod) {
                isAnyChecked = true;
            }
        }
        checkoutButton.disabled = !isAnyChecked;
    }

    function handleShippingMethodSelection(target, subtotal, generalData, selectedShippingMethodFeatured = null) {
        let js_shipping_input = null;
        const shippingCostSection = document.getElementById('shippingCostSection');
        const totalSection = document.getElementById('totalSection');
        
        let selectedShippingMethod = null;
        let price = null;
        let label = null;
        let description = null;

        if(selectedShippingMethodFeatured) {
            selectedShippingMethod = selectedShippingMethodFeatured.id;
            price = selectedShippingMethodFeatured.amount;
        } else {
            js_shipping_input = document.getElementById('js_shipping_input').value.trim();
            if(js_shipping_input == "") {
                let selectedShippingMethodZipCode = localStorage.getItem('selectedShippingMethod');
                
                if(selectedShippingMethodZipCode) {
                    selectedShippingMethodZipCode = JSON.parse(selectedShippingMethodZipCode);
                    if(selectedShippingMethodZipCode.zipCode) {
                        js_shipping_input = selectedShippingMethodZipCode.zipCode;
                    }
                }
            }
        }

        if (target) {
            selectedShippingMethod = target.id;
            price = target.dataset.price;
            label = target.dataset.label;
            description = target.dataset.description;
        }

        price = Number(price);
    
        if (selectedShippingMethod === 'featured_shipping_6' && selectedShippingMethod != null) {
            localStorage.setItem('selectedShippingMethod', JSON.stringify({
                shippingMethod: selectedShippingMethod,
                zipCode: null,
                amount: price,
                label: label,
                description: description
            }));
        } else if (js_shipping_input && js_shipping_input.length === 4 && selectedShippingMethod != null) {
            localStorage.setItem('selectedShippingMethod', JSON.stringify({
                shippingMethod: selectedShippingMethod,
                zipCode: js_shipping_input,
                amount: price,
                label: label,
                description: description
            }));
        } else if (js_shipping_input && js_shipping_input.length === 4 && selectedShippingMethod == null) {
            updateSelectedShippingMethod('zipCode', js_shipping_input);
        } else if (selectedShippingMethod === 'featured_shipping_1' && selectedShippingMethodFeatured != null) {
            updateSelectedShippingMethod('amount', price);
        }

        const selectedShippingMethodVerific = localStorage.getItem('selectedShippingMethod');
        if (selectedShippingMethodVerific) {
            const parsedShippingMethod = JSON.parse(selectedShippingMethodVerific);
            if (parsedShippingMethod.shippingMethod) {
                price = Number(parsedShippingMethod.amount);
                const total = subtotal + price;

                if(price === 0) {
                    price = generalData.page_cart.shipping.free;
                }
                shippingCostSection.innerHTML = `
                    <h6 class="font-weight-medium">${generalData.page_cart.cart.table.shipping_cost}</h6>
                    <h6 class="font-weight-medium" id="shippingCost">${!isNaN(price) ? `$&nbsp;${price}` : price}</h6>
                `;
                
                totalSection.innerHTML = `
                    <h5 class="font-weight-bold">${generalData.page_cart.cart.table.total}</h5>
                    <h5 class="font-weight-bold" id="total">$&nbsp;${total}</h5>
                `;
            }
        }
    }

    function isFeaturedShippingMethod() {
        // Obtener el objeto actual de localStorage
        let selectedShippingMethod = localStorage.getItem('selectedShippingMethod');
        
        if (selectedShippingMethod) {
            // Parsear el objeto JSON
            selectedShippingMethod = JSON.parse(selectedShippingMethod);
            
            // Verificar si el shippingMethod es 'featured_shipping_6'
            if (selectedShippingMethod.shippingMethod === 'featured_shipping_6') {
                return true;
            }
        }
        return false;
    }

    function updateSelectedShippingMethod(key, value) {
        // Inicializar el objeto si no existe
        initializeSelectedShippingMethod();

        // Obtener el objeto actual de localStorage
        let selectedShippingMethod = localStorage.getItem('selectedShippingMethod');
        
        if (selectedShippingMethod) {
            // Parsear el objeto JSON
            selectedShippingMethod = JSON.parse(selectedShippingMethod);
            
            // Actualizar el valor deseado
            selectedShippingMethod[key] = value;
            
            // Guardar el objeto modificado de nuevo en localStorage
            localStorage.setItem('selectedShippingMethod', JSON.stringify(selectedShippingMethod));
        } else {
            console.error('No se encontró el objeto selectedShippingMethod en localStorage.');
        }
    }

    function updateBarProgress(amount, shipping_free, generalData, shippingMethod) {
        const barProgress = document.getElementById('js_bar_progress_active');
        const barProgressCheck = document.getElementById('js_bar_progress_check');
        const shipFreeRestMessage = document.getElementById('js_ship_free_rest_message');
        const shipFreeRestAmount = document.getElementById('js_ship_free_dif');

        if (amount >= shipping_free) {
            barProgress.style.width = '100%';
            barProgressCheck.classList.add('active');
            shipFreeRestMessage.classList.remove('condition');
            shipFreeRestMessage.classList.remove('amount');
            shipFreeRestMessage.classList.add('success');
        } else {
            barProgress.style.width = `${amount / shipping_free * 100}%`;
            barProgressCheck.classList.remove('active');
            shipFreeRestMessage.classList.remove('success');
            shipFreeRestMessage.classList.remove('amount');
            shipFreeRestMessage.classList.add('condition');
            if(amount > (shipping_free * 0.75)) {
                shipFreeRestMessage.classList.remove('condition');
                shipFreeRestMessage.classList.add('amount');
                shipFreeRestAmount.textContent = `$${shipping_free - amount}`;
            }
        }
        if(shippingMethod) {
            handleShippingMethodSelection(null, amount, generalData, shipping_free);
        }
    }

    function createShippingOption(id, label, description, price, amount, shipping_free, generalData) {
        if(id === 'featured_shipping_1') {
            if(amount >= shipping_free) {
                shipping_freeHTML = `
                    <h5 class="text-accent mb-0 d-inline-block">${generalData.page_cart.shipping.free} <span class="price-compare text-foreground font-small opacity-50 mr-0">$${price}</span></h5>
                `;
                price = 0;
            }
        }

        return `
            <li class="js-shipping-list-item radio-button-item float-left w-100">
                <label class="js-shipping-radio radio-button list-item">
                    <input id="${id}" class="js-shipping-method shipping-method" data-label="${label}" data-price="${price}" data-description="${description}" type="radio" name="option" style="display:none">
                    <div class="radio-button-content">
                        <div class="radio-button-icons-container">
                            <span class="radio-button-icons">
                                <span class="radio-button-icon unchecked"></span>
                                <span class="radio-button-icon checked">
                                    <svg class="icon-inline icon-sm svg-icon-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"></path></svg>
                                </span>
                            </span>
                        </div>
                        <div class="radio-button-label">
                            <div class="radio-button-text row">
                                <div class="col-8 col-md-9 font-small pr-0">
                                    <div class="mb-2">${label}<span class="ml-1"></span></div>
                                    <div class="opacity-60">
                                        <span class="d-table float-left">
                                            <svg class="icon-inline icon-sm svg-icon-text mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M20 24h10c6.627 0 12 5.373 12 12v94.625C85.196 57.047 165.239 7.715 256.793 8.001 393.18 8.428 504.213 120.009 504 256.396 503.786 393.181 392.834 504 256 504c-63.926 0-122.202-24.187-166.178-63.908-5.113-4.618-5.354-12.561-.482-17.433l7.069-7.069c4.503-4.503 11.749-4.714 16.482-.454C150.782 449.238 200.935 470 256 470c117.744 0 214-95.331 214-214 0-117.744-95.331-214-214-214-82.862 0-154.737 47.077-190.289 116H164c6.627 0 12 5.373 12 12v10c0 6.627-5.373 12-12 12H20c-6.627 0-12-5.373-12-12V36c0-6.627 5.373-12 12-12zm321.647 315.235l4.706-6.47c3.898-5.36 2.713-12.865-2.647-16.763L272 263.853V116c0-6.627-5.373-12-12-12h-8c-6.627 0-12 5.373-12 12v164.147l84.884 61.734c5.36 3.899 12.865 2.714 16.763-2.646z"></path></svg>
                                        </span>
                                        <span class="d-table">${description}</span>
                                    </div>
                                </div>
                                <div class="col-4 col-md-3 text-right">
                                    <h5 class="text-primary mb-0 d-inline-block">${price == 0 ? shipping_freeHTML : `$&nbsp;${price}`}</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </label>
            </li>
        `;
    }

    function createBranchOption(id, title, address, price, generalData) {
        if(price === 0) {
            shipping_freeHTML = generalData.page_cart.shipping.free;
        }

        return `
            <li class="radio-button-item">
                <label class="js-shipping-radio js-branch-radio radio-button">
                    <input id="${id}" data-price="${price}" data-label="${title}" data-description="${address}" class="js-shipping-method js-branch-method shipping-method js-selected-shipping-method" type="radio" name="option" style="display:none">
                    <div class="shipping-option row-fluid radio-button-content">
                        <div class="radio-button-icons-container">
                            <span class="radio-button-icons">
                                <span class="radio-button-icon unchecked"></span>
                                <span class="radio-button-icon checked">
                                    <svg class="icon-inline icon-sm svg-icon-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"></path></svg>
                                </span>
                            </span>
                        </div>
                        <div class="radio-button-label">
                            <div class="row">
                                <div class="col-9 font-small">
                                    <div>${title} - ${address}</div>
                                </div>
                                <div class="col-3 text-right">
                                    <h5 class="text-primary mb-0 d-inline-block">${price == 0 ? shipping_freeHTML : `$&nbsp;${price}`}</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </label>
            </li>
        `;
    }

    function createBranchOptions(generalData) {
        const branches = [
            {
                id: 'featured_shipping_6',
                title: generalData.store_info.title_brand,
                address: generalData.data.address.text,
                price: 0
            }
        ];
    
        return branches.map(branch => createBranchOption(branch.id, branch.title, branch.address, branch.price, generalData)).join('');
    }
    
    function createZipcodeSection(generalData) {
        return `
            <div id="js_cart_saved_zipcode" class="js-shipping-calculator-with-zipcode mb-4 w-100 transition-up position-absolute transition-up-active">
                <div class="container p-0">
                    <div class="row align-items-center">
                        <span class="col pr-0">
                            <span class="font-small align-bottom">
                                <span>${generalData.page_cart.shipping.js_cart_saved_zipcode.title}</span>
                                <strong id="js_shipping_calculator_current_zip" class="js_shipping_calculator_current_zip_value"></strong>
                            </span>
                        </span>
                        <div class="col-auto pl-0">
                            <btn id="js_shipping_calculator_change_zipcode" class="btn btn-primary btn-small float-right py-1 px-2 px-sm-3">${generalData.page_cart.shipping.js_cart_saved_zipcode.change_zip}</btn>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    function createShippingCalculatorForm(generalData) {
        return `
            <div id="js_shipping_calculator_form" class="js-shipping-calculator-with-zipcode mb-4 w-100 transition-up position-absolute transition-up-active">
                <div class="form-group form-row form-group-inline align-items-center">
                    <div class="form-control-container col-6 col-lg-7 pr-0">
                        <input type="tel" id="js_shipping_input" class="form-control form-control-inline p-4" placeholder="${generalData.page_cart.shipping.js_shipping_calculator_form.zipCode}">
                    </div>
                    <div class="col-6 col-lg-5 pl-0">
                        <button id="js_calculate_shipping" class="btn btn-primary btn-block" id="calculateShippingButton">
                            <span id="js_calculate_shipping_wording" style="display: inline;">${generalData.page_cart.shipping.js_shipping_calculator_form.calculate}</span>
                            <span id="js_calculating_shipping_wording" style="display: none;">${generalData.page_cart.shipping.js_shipping_calculator_form.calculating}</span>
                            <span id="js_calculating_shipping_wording_logo" class="float-right loading" style="display: none;">
                                <svg class="icon-inline icon-smd icon-spin svg-icon-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M288 24.103v8.169a11.995 11.995 0 0 0 9.698 11.768C396.638 63.425 472 150.461 472 256c0 118.663-96.055 216-216 216-118.663 0-216-96.055-216-216 0-104.534 74.546-192.509 174.297-211.978A11.993 11.993 0 0 0 224 32.253v-8.147c0-7.523-6.845-13.193-14.237-11.798C94.472 34.048 7.364 135.575 8.004 257.332c.72 137.052 111.477 246.956 248.531 246.667C393.255 503.711 504 392.789 504 256c0-121.187-86.924-222.067-201.824-243.704C294.807 10.908 288 16.604 288 24.103z"></path></svg>
                            </span>
                        </button>
                    </div>
                    <div class="col-12">
                        <a class="font-small text-primary mt-2 mb-2 d-block" href="https://www.correoargentino.com.ar/formularios/cpa">${generalData.page_cart.shipping.js_shipping_calculator_form.dontKnowZipCode}</a>
                    </div>
                    <div class="col-12">
                        <small id="js_danger_postal" class="help-block text-danger" style="display: none;">${generalData.page_cart.shipping.js_shipping_calculator_form.misspelled}</small>	
                        <small id="js_danger_zipcode" class="help-block text-danger" style="display: none;">${generalData.page_cart.shipping.js_shipping_calculator_form.error}</small>
                        <small id="js_danger_external" class="help-block text-danger" style="display: none;">${generalData.page_cart.shipping.js_shipping_calculator_form.external}</small>
                    </div>
                </div>
            </div>
        `;
    }
    
    function updateCartInput() {
        const cartItems = JSON.parse(localStorage.getItem('productsCart')) || [];
        const quantityInputs = document.querySelectorAll('.cart-quantity-input');
    
        quantityInputs.forEach(input => {
            const id = input.dataset.id;
            const size = input.dataset.size;
            const newAmount = parseInt(input.value, 10);
    
            const item = cartItems.find(item => item.id == id && (!size || item.size == size));
            if (item && newAmount > 0) {
                item.amount = newAmount;
            }
        });
    
        localStorage.setItem('productsCart', JSON.stringify(cartItems));
        cartTable(); // Actualizar la tabla del carrito
        updateCart(); // Actualizar el número del carrito
    }
    
    function clearCart() {
        localStorage.removeItem('productsCart');
        cartTable(); // Actualizar la tabla del carrito
        updateCart(); // Actualizar el número del carrito
    }
    
    function updateQuantity(id, size, change) {
        const productsCart = JSON.parse(localStorage.getItem('productsCart')) || [];
        const item = productsCart.find(item => item.id == id && (!size || item.size == size)); // Usar == para comparar id como string y número
        if (item) {
            if (item.amount + change >= 1) {
                item.amount += change;
                localStorage.setItem('productsCart', JSON.stringify(productsCart));
                cartTable(); // Actualizar la tabla del carrito
                updateCart(); // Actualizar el número del carrito
            }
        }
    }
    
    function removeItem(id, size) {
        let productsCart = JSON.parse(localStorage.getItem('productsCart')) || [];
        productsCart = productsCart.filter(item => !(item.id == id && (!size || item.size == size))); // Usar != para comparar id como string y número
        localStorage.setItem('productsCart', JSON.stringify(productsCart));
        cartTable(); // Actualizar la tabla del carrito
        updateCart(); // Actualizar el número del carrito
    }
    
    function removeItem(id, size) {
        let productsCart = JSON.parse(localStorage.getItem('productsCart')) || [];
        productsCart = productsCart.filter(item => !(item.id == id && (!size || item.size == size))); // Usar != para comparar id como string y número
        localStorage.setItem('productsCart', JSON.stringify(productsCart));
        cartTable(); // Actualizar la tabla del carrito
        updateCart(); // Actualizar el número del carrito
    }

    function checkoutForm() {
        const checkoutFormContainer = document.getElementById('checkoutFormId');
        let countries = ["Afganistán","Albania","Alemania","Andorra","Angola","Antigua y Barbuda","Arabia Saudita","Argelia","Argentina","Armenia","Australia","Austria","Azerbaiyán","Bahamas","Bangladés","Barbados","Baréin","Bélgica","Belice","Benín","Bielorrusia","Birmania","Bolivia","Bosnia y Herzegovina","Botsuana","Brasil","Brunéi","Bulgaria","Burkina Faso","Burundi","Bután","Cabo Verde","Camboya","Camerún","Canadá","Catar","Chad","Chile","China","Chipre","Ciudad del Vaticano","Colombia","Comoras","Corea del Norte","Corea del Sur","Costa de Marfil","Costa Rica","Croacia","Cuba","Dinamarca","Dominica","Ecuador","Egipto","El Salvador","Emiratos Árabes Unidos","Eritrea","Eslovaquia","Eslovenia","España","Estados Unidos","Estonia","Etiopía","Filipinas","Finlandia","Fiyi","Francia","Gabón","Gambia","Georgia","Ghana","Granada","Grecia","Guatemala","Guyana","Guinea","Guinea ecuatorial","Guinea-Bisáu","Haití","Honduras","Hungría","India","Indonesia","Irak","Irán","Irlanda","Islandia","Islas Marshall","Islas Salomón","Israel","Italia","Jamaica","Japón","Jordania","Kazajistán","Kenia","Kirguistán","Kiribati","Kuwait","Laos","Lesoto","Letonia","Líbano","Liberia","Libia","Liechtenstein","Lituania","Luxemburgo","Madagascar","Malasia","Malaui","Maldivas","Malí","Malta","Marruecos","Mauricio","Mauritania","México","Micronesia","Moldavia","Mónaco","Mongolia","Montenegro","Mozambique","Namibia","Nauru","Nepal","Nicaragua","Níger","Nigeria","Noruega","Nueva Zelanda","Omán","Países Bajos","Pakistán","Palaos","Palestina","Panamá","Papúa Nueva Guinea","Paraguay","Perú","Polonia","Portugal","Reino Unido","República Centroafricana","República Checa","República de Macedonia","República del Congo","República Democrática del Congo","República Dominicana","República Sudafricana","Ruanda","Rumanía","Rusia","Samoa","San Cristóbal y Nieves","San Marino","San Vicente y las Granadinas","Santa Lucía","Santo Tomé y Príncipe","Senegal","Serbia","Seychelles","Sierra Leona","Singapur","Siria","Somalia","Sri Lanka","Suazilandia","Sudán","Sudán del Sur","Suecia","Suiza","Surinam","Tailandia","Tanzania","Tayikistán","Timor Oriental","Togo","Tonga","Trinidad y Tobago","Túnez","Turkmenistán","Turquía","Tuvalu","Ucrania","Uganda","Uruguay","Uzbekistán","Vanuatu","Venezuela","Vietnam","Yemen","Yibuti","Zambia","Zimbabue"];
        Promise.all([loadJSON(generalJson)])
        .then(([generalData]) => {
            let zipCode = '';
            let selectedShippingMethod = localStorage.getItem('selectedShippingMethod');
            if (selectedShippingMethod) {
                selectedShippingMethod = JSON.parse(selectedShippingMethod);
                if (selectedShippingMethod.zipCode) {
                    zipCode = selectedShippingMethod.zipCode;
                }
            }
            const checkoutFormHTML = `
                <div class="row px-xl-5">
                    <div class="col-lg-8">
                        <div class="mb-4">
                            <h4 class="font-weight-semi-bold mb-4">${generalData.checkout.datos.title}</h4>
                            <div class="row">
                                <div class="col-md-6 form-group">
                                    <label>${generalData.checkout.datos.firstname.text}<text class="text-red"> *</text></label>
                                    <input class="form-control" type="text" placeholder="${generalData.checkout.datos.firstname.placeholder}">
                                </div>
                                <div class="col-md-6 form-group">
                                    <label>${generalData.checkout.datos.lastname.text}<text class="text-red"> *</text></label>
                                    <input class="form-control" type="text" placeholder="${generalData.checkout.datos.lastname.placeholder}">
                                </div>
                                <div class="col-md-6 form-group">
                                    <label>${generalData.checkout.datos.email.text}<text class="text-red"> *</text></label>
                                    <input class="form-control" type="text" placeholder="${generalData.checkout.datos.email.placeholder}">
                                </div>
                                <div class="col-md-6 form-group">
                                    <label>${generalData.checkout.datos.phone.text}<text class="text-red"> *</text></label>
                                    <input class="form-control" type="text" placeholder="${generalData.checkout.datos.phone.placeholder}">
                                </div>
                                <div class="col-md-6 form-group">
                                    <label>${generalData.checkout.datos.country.text}<text class="text-red"> *</text></label>
                                    <select class="custom-select">
                                        <option selected>${generalData.checkout.datos.country.selected}</option>
                                        ${arrayCountries(countries)}
                                    </select>
                                </div>
                                <div class="col-md-6 form-group">
                                    <label>${generalData.checkout.datos.province.text}<text class="text-red"> *</text></label>
                                    <input class="form-control" type="text" placeholder="${generalData.checkout.datos.province.placeholder}">
                                </div>
                                <div class="col-md-6 form-group">
                                    <label>${generalData.checkout.datos.city.text}<text class="text-red"> *</text></label>
                                    <input class="form-control" type="text" placeholder="${generalData.checkout.datos.city.placeholder}">
                                </div>
                                <div class="col-md-6 form-group">
                                    <label>${generalData.checkout.datos.address.text}<text class="text-red"> *</text></label>
                                    <input class="form-control" type="text" placeholder="${generalData.checkout.datos.address.placeholder}">
                                </div>
                                <div class="col-md-6 form-group">
                                    <label>${generalData.checkout.datos.additional.text}</label>
                                    <input class="form-control" type="text" placeholder="${generalData.checkout.datos.additional.placeholder}">
                                </div>
                                <div class="col-md-6 form-group">
                                    <label>${generalData.checkout.datos.postal_code.text}<text class="text-red"> *</text></label>
                                    <input class="form-control" type="text" placeholder="${generalData.checkout.datos.postal_code.placeholder}">
                                </div>
                                <div class="col-md-12 form-group">
                                    <div class="custom-control custom-checkbox">
                                        <input type="checkbox" class="custom-control-input" id="shipto">
                                        <label class="custom-control-label" for="shipto" data-toggle="collapse"
                                            data-target="#shipping-address">${generalData.checkout.datos.skipAddress.text}</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="collapse mb-4" id="shipping-address">
                            <h4 class="font-weight-semi-bold mb-4">${generalData.checkout.datos.skipAddress.title}</h4>
                            <div class="row">
                                <div class="col-md-6 form-group">
                                    <label>${generalData.checkout.datos.firstname.text}<text class="text-red"> *</text></label>
                                    <input class="form-control" type="text" placeholder="${generalData.checkout.datos.firstname.placeholder}">
                                </div>
                                <div class="col-md-6 form-group">
                                    <label>${generalData.checkout.datos.lastname.text}<text class="text-red"> *</text></label>
                                    <input class="form-control" type="text" placeholder="${generalData.checkout.datos.lastname.placeholder}">
                                </div>
                                <div class="col-md-6 form-group">
                                    <label>${generalData.checkout.datos.country.text}<text class="text-red"> *</text></label>
                                    <select class="custom-select">
                                        <option selected>${generalData.checkout.datos.country.selected}</option>
                                        ${arrayCountries(countries)}
                                    </select>
                                </div>
                                <div class="col-md-6 form-group">
                                    <label>${generalData.checkout.datos.province.text}<text class="text-red"> *</text></label>
                                    <input class="form-control" type="text" placeholder="${generalData.checkout.datos.province.placeholder}">
                                </div>
                                <div class="col-md-6 form-group">
                                    <label>${generalData.checkout.datos.city.text}<text class="text-red"> *</text></label>
                                    <input class="form-control" type="text" placeholder="${generalData.checkout.datos.city.placeholder}">
                                </div>
                                <div class="col-md-6 form-group">
                                    <label>${generalData.checkout.datos.address.text}<text class="text-red"> *</text></label>
                                    <input class="form-control" type="text" placeholder="${generalData.checkout.datos.address.placeholder}">
                                </div>
                                <div class="col-md-6 form-group">
                                    <label>${generalData.checkout.datos.additional.text}</label>
                                    <input class="form-control" type="text" placeholder="${generalData.checkout.datos.additional.placeholder}">
                                </div>
                                <div class="col-md-6 form-group">
                                    <label>${generalData.checkout.datos.postal_code.text}<text class="text-red"> *</text></label>
                                    <input class="form-control" type="text" placeholder="${generalData.checkout.datos.postal_code.placeholder}">
                                </div>
                                <div class="col-md-12 form-group">
                                    <div class="custom-control custom-checkbox">
                                        <input type="checkbox" class="custom-control-input" id="shipto">
                                        <label class="custom-control-label" for="shipto" data-toggle="collapse"
                                            data-target="#shipping-address">${generalData.checkout.datos.skipAddress.text}</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4">
                        <div class="card border-secondary mb-5">
                            <div class="card-header bg-secondary border-0">
                                <h4 class="font-weight-semi-bold m-0">${generalData.checkout.bill.title}</h4>
                            </div>
                            <div class="card-body">
                                <h5 class="font-weight-medium mb-3">${generalData.checkout.bill.table.product}</h5>
                                <div class="d-flex justify-content-between">
                                    <p>Colorful Stylish Shirt 1</p>
                                    <p>$150</p>
                                </div>
                                <div class="d-flex justify-content-between">
                                    <p>Colorful Stylish Shirt 2</p>
                                    <p>$150</p>
                                </div>
                                <div class="d-flex justify-content-between">
                                    <p>Colorful Stylish Shirt 3</p>
                                    <p>$150</p>
                                </div>
                                <hr class="mt-0">
                                <div class="d-flex justify-content-between mb-3 pt-1">
                                    <h6 class="font-weight-medium">Subtotal</h6>
                                    <h6 class="font-weight-medium">$150</h6>
                                </div>
                                <div class="d-flex justify-content-between">
                                    <h6 class="font-weight-medium">Shipping</h6>
                                    <h6 class="font-weight-medium">$10</h6>
                                </div>
                            </div>
                            <div class="card-footer border-secondary bg-transparent">
                                <div class="d-flex justify-content-between mt-2">
                                    <h5 class="font-weight-bold">Total</h5>
                                    <h5 class="font-weight-bold">$160</h5>
                                </div>
                            </div>
                        </div>
                        <div class="card border-secondary mb-5">
                            <div class="card-header bg-secondary border-0">
                                <h4 class="font-weight-semi-bold m-0">${generalData.checkout.payment.title}</h4>
                            </div>
                            <div class="card-body">
                                <div class="form-group">
                                    <div class="custom-control custom-radio">
                                        <input type="radio" class="custom-control-input" name="payment"
                                            id="directcheck">
                                        <label class="custom-control-label" for="directcheck">${generalData.checkout.payment.table.directcheck}</label>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <div class="custom-control custom-radio">
                                        <input type="radio" class="custom-control-input" name="payment"
                                            id="banktransfer">
                                        <label class="custom-control-label" for="banktransfer">${generalData.checkout.payment.table.banktransfer}</label>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <div class="custom-control custom-radio">
                                        <input type="radio" class="custom-control-input" name="payment"
                                            id="mercadopago">
                                        <label class="custom-control-label" for="mercadopago">${generalData.checkout.payment.table.mercadopago}</label>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <div class="custom-control custom-radio">
                                        <input type="radio" class="custom-control-input" name="payment" id="paypal">
                                        <label class="custom-control-label" for="paypal">${generalData.checkout.payment.table.paypal}</label>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <div class="custom-control custom-radio">
                                        <input type="radio" class="custom-control-input" name="payment"
                                            id="debitcard">
                                        <label class="custom-control-label" for="debitcard">${generalData.checkout.payment.table.debitcard}</label>
                                    </div>
                                </div>
                                <div class="">
                                    <div class="custom-control custom-radio">
                                        <input type="radio" class="custom-control-input" name="payment"
                                            id="creditcard">
                                        <label class="custom-control-label" for="creditcard">${generalData.checkout.payment.table.creditcard}</label>
                                    </div>
                                </div>
                            </div>
                            <div class="card-footer border-secondary bg-transparent">
                                <button class="btn btn-lg btn-block btn-primary font-weight-bold my-3 py-3">Place
                                    Order</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            checkoutFormContainer.innerHTML = checkoutFormHTML;
        })
        .catch(error => {
            console.error('Error al cargar los archivos JSON:', error);
        });
    }

    function arrayCountries(countries) {
        let options = '';
        countries.forEach(country => {
            options += `<option value="${country}">${country}</option>`;
        });
        return options;
    }

    /* 
    <div class="col-md-12 form-group">
        <div class="custom-control custom-checkbox">
            <input type="checkbox" class="custom-control-input" id="newaccount">
            <label class="custom-control-label" for="newaccount">Create an account</label>
        </div>
    </div>

    
    <div class="justify-content-between" id="discountSection" style="display: none;">
        <h6 class="font-weight-medium">${generalData.page_cart.cart.table.discount}</h6>
        <h6 class="font-weight-medium" id="discount"></h6>
    </div>

    <form class="mb-5" id="discountForm">
        <div class="input-group">
            <input type="text" class="form-control p-4" id="discountCode" placeholder="${generalData.page_cart.cupon.placeholder}">
            <div class="input-group-append">
                <button type="button" class="btn btn-primary" id="applyDiscount">${generalData.page_cart.cupon.btn}</button>
            </div>
        </div>
    </form>
            // Añadir event listener para el botón de aplicar descuento
            document.getElementById('applyDiscount').addEventListener('click', () => {
                const discountCode = document.getElementById('discountCode').value;
                let discount = 0;
                let discountText = "";
                let total = null;
                // Aquí puedes agregar la lógica para verificar el código de descuento
                // Por ejemplo, si el código es "DESC10", aplicar un 10% de descuento
                if (discountCode === 'DESC10') {
                    discount = subtotal * 0.10;
                    discountText = "10%";
                    total = subtotal + shippingCost - discount;
                    // Actualizar los valores en el HTML
                    document.getElementById('discount').textContent = `${discountText}`;
                    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
                } else if (discountCode === 'DESC20') {
                    discount = subtotal * 0.20;
                    discountText = "20%";
                    total = subtotal + shippingCost - discount;
                    // Actualizar los valores en el HTML
                    document.getElementById('discount').textContent = `${discountText}`;
                    document.getElementById('total').textContent = `$&nbsp;${total.toFixed(2)}`;
                }
        
                // Mostrar la sección de descuento si hay un descuento aplicado
                const discountSection = document.getElementById('discountSection');
                if (discount > 0) {
                    discountSection.style = '';
                    discountSection.classList.add('d-flex');
                } else {
                    discountSection.style.display = 'none';
                }
        
                // Guardar el descuento en el localStorage
                document.getElementById('checkoutButton').addEventListener('click', () => {
                    if (total && discountText) {
                        localStorage.setItem('discount', JSON.stringify({ discountCode, total, discountText }));
                    }
                });
            }); */

    // Funciones de Paginas especificas

    function index() {
        loadCarouselContent();
        titleDynamic('shop');
        featured();
    }

    function contact() {
        pageHeader('contact', 'contact_us', 'background-image-contact');
        titleDynamic('contact');
        formContact();
        contactInfo();
    }

    function cart() {
        pageHeader('cart', 'cart', 'background-image-cart');
        cartTable();
    }

    function checkout() {
        pageHeader('checkout', 'checkout', 'background-image-checkout');
        checkoutForm();
    }
    
    const promises = [
        head(),
        header(),
        navbarSecondary(),
        navbarPrimary(),
        footer()
    ];

    // Verificar si estamos en la página de inicio
    if (pathname.endsWith('/index.html') || pathname.endsWith('/')) { //pathname === "/VolleyballArt/"
        promises.push(index());
        promises.push(displayProducts(null, null, 8, null, 1)); // Limitar a 8 productos en index
    } else if (pathname.endsWith("/shop.html")) {
        promises.push(pageHeader('shop', 'our_products', 'background-image-shop'));
        promises.push(loadFilters(12, 1)); // 12 elementos por página, página 1
    } else if (pathname.endsWith("/contact.html")) {
        promises.push(contact());
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
    } else if (pathname.endsWith('/cart.html')) {
        promises.push(cart());
    } else if (pathname.endsWith('/checkout.html')) {
        promises.push(checkout());
    }

    // Cargar el contenido de los archivos HTML y los archivos JSON, luego aplicar las traducciones
    Promise.all(promises).then(() => {
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