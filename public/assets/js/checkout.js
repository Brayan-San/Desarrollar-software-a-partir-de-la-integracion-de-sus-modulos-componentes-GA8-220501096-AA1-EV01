document.addEventListener('DOMContentLoaded', () => {
    let currentStep = 1;
    const SHIPPING_COST = 10000;
    let shippingSelected = false;
    let cartTotal = 0;

    function updateTotalDisplay() {
        const shippingCheckbox = document.getElementById('shipping-option');
        shippingSelected = shippingCheckbox.checked;
        
        const shippingAmount = document.querySelector('.shipping-amount');
        const totalAmount = document.querySelector('.total-amount');
        const subtotalAmount = document.querySelector('.subtotal-amount');
        
        // Update shipping display
        shippingAmount.textContent = shippingSelected ? `$${SHIPPING_COST.toLocaleString('es-CO')}` : '$0';
        
        // Update total with shipping
        const total = cartTotal + (shippingSelected ? SHIPPING_COST : 0);
        totalAmount.textContent = `$${total.toLocaleString('es-CO')}`;
        subtotalAmount.textContent = `$${cartTotal.toLocaleString('es-CO')}`;
    }

    // Cart Summary
    const loadCartSummary = () => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const cartItemsContainer = document.querySelector('.cart-items');
        cartTotal = 0;
        console.log('Contenido del carrito:', cart);
        if (!cart.length) {
            cartItemsContainer.innerHTML = '<p>El carrito está vacío</p>';
            updateTotalDisplay();
            return;
        }
        cartItemsContainer.innerHTML = cart.map(item => {
            // Convertir el precio a cadena antes de usar replace
            const priceString = String(item.price).replace('$', '').replace(/\./g, '').trim();
            const price = parseInt(priceString);
            const quantity = parseInt(item.quantity);
            const itemTotal = price * quantity;
            cartTotal += itemTotal;
            console.log('Precio original:', item.price);
            console.log('Precio procesado:', price);
            console.log('Cantidad:', quantity);
            console.log('Total item:', itemTotal);
            return `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.title}">
                    <div class="item-details">
                        <h3>${item.title}</h3>
                        <p>Talla: ${item.talla}</p>
                        <p>Cantidad: ${quantity}</p>
                        <p>Precio unitario: $${price.toLocaleString('es-CO')}</p>
                        <p class="price">Total: $${itemTotal.toLocaleString('es-CO')}</p>
                    </div>
                </div>
            `;
        }).join('');
        console.log('Total del carrito:', cartTotal);
        updateTotalDisplay();
    };

    // City and Locality Selection
    const citySelect = document.getElementById('city');
    const localitySelect = document.getElementById('locality');
    const bogotaLocalities = [
        'Usaquén', 'Chapinero', 'Santa Fe', 'San Cristóbal', 'Usme',
        'Tunjuelito', 'Bosa', 'Kennedy', 'Fontibón', 'Engativá',
        'Suba', 'Barrios Unidos', 'Teusaquillo', 'Los Mártires',
        'Antonio Nariño', 'Puente Aranda', 'La Candelaria',
        'Rafael Uribe Uribe', 'Ciudad Bolívar'
    ];

    citySelect.addEventListener('change', () => {
        const selectedCity = citySelect.value;
        localitySelect.innerHTML = '<option value="">Selecciona una localidad</option>';
        
        if (selectedCity === 'bogota') {
            localitySelect.disabled = false;
            bogotaLocalities.forEach(locality => {
                const option = document.createElement('option');
                option.value = locality.toLowerCase();
                option.textContent = locality;
                localitySelect.appendChild(option);
            });
        } else {
            localitySelect.disabled = true;
        }
    });

    const generatePaymentMethods = () => {
        const container = document.getElementById('payment-methods-container');
        
        const methods = {
            // Transferencias Bancarias
            nequi: { 
                name: 'Nequi', 
                logo: '/assets/images/payment/nequi.png',
                description: 'Pago con Nequi',
                category: 'bank'
            },
            daviplata: { 
                name: 'Daviplata', 
                logo: '/assets/images/payment/Daviplata.png',
                description: 'Pago con Daviplata',
                category: 'bank'
            },
            pse: { 
                name: 'PSE', 
                logo: '/assets/images/payment/pse.jpg',
                description: 'Transferencia PSE',
                category: 'bank'
            },
            bancolombia: { 
                name: 'Bancolombia', 
                logo: '/assets/images/payment/Bancolombia.jpg',
                description: 'Transferencia Bancolombia',
                category: 'bank'
            },
            // Tarjetas
            visa: {
                name: 'Visa',
                logo: '/assets/images/payment/visa.png',
                description: 'Pago con tarjeta Visa',
                category: 'card'
            },
            mastercard: {
                name: 'Mastercard',
                logo: '/assets/images/payment/mastercard.png',
                description: 'Pago con tarjeta Mastercard',
                category: 'card'
            },
            // Pasarelas de pago
            wompi: { 
                name: 'Wompi', 
                logo: '/assets/images/payment/Wompi.png',
                description: 'Pago con Wompi',
                category: 'gateway'
            },
            epayco: { 
                name: 'ePayco', 
                logo: '/assets/images/payment/epayco.png',
                description: 'Pago con ePayco',
                category: 'gateway'
            },
            payu: { 
                name: 'PayU', 
                logo: '/assets/images/payment/PayU.png',
                description: 'Pago con PayU',
                category: 'gateway'
            },
            // Otros métodos
            contra_entrega: { 
                name: 'Contra Entrega', 
                logo: '/assets/images/payment/Contra-Entrega.png',
                description: 'Pago contra entrega (+$15,000 COP)',
                category: 'other'
            },
            recoger: { 
                name: 'Recoger en Tienda', 
                logo: '/assets/images/payment/recoger.png',
                description: 'Pago en tienda (Sin costo adicional)',
                category: 'other'
            }
        };
    
        container.innerHTML = '';
    
        // Agregar título principal
        const mainTitle = document.createElement('h2');
        mainTitle.className = 'payment-main-title';
        mainTitle.textContent = 'Métodos de Pagos 100% Seguros Procesados (Wompi, PayU, ePayco)';
        container.appendChild(mainTitle);
    
        // Definir categorías y sus títulos
        const categories = {
            bank: {
                title: 'Transferencias Bancarias',
                methods: []
            },
            card: {
                title: 'Pago con Tarjetas Débito y Crédito',
                methods: []
            },
            gateway: {
                title: 'Pasarelas de Pago',
                methods: []
            },
            other: {
                title: 'Otros Métodos de Pago',
                methods: []
            }
        };
    
        // Organizar métodos por categoría
        Object.entries(methods).forEach(([key, method]) => {
            categories[method.category].methods.push({key, ...method});
        });
    
        // Crear secciones en el DOM
        Object.entries(categories).forEach(([categoryKey, category]) => {
            if (category.methods.length > 0) {
                const sectionContainer = document.createElement('div');
                sectionContainer.className = 'payment-section';
    
                const categoryTitle = document.createElement('h3');
                categoryTitle.className = 'payment-category-title';
                categoryTitle.textContent = category.title;
                sectionContainer.appendChild(categoryTitle);
    
                const methodsContainer = document.createElement('div');
                methodsContainer.className = 'payment-methods-grid';
                
                category.methods.forEach(method => {
                    const button = document.createElement('button');
                    button.className = 'payment-button';
                    button.setAttribute('data-method', method.key);
                    button.innerHTML = `
                        <img src="${method.logo}" alt="${method.name}" class="payment-logo">
                        <span class="payment-name">${method.name}</span>
                        <span class="payment-description">${method.description}</span>
                    `;
                    methodsContainer.appendChild(button);
                });
    
                sectionContainer.appendChild(methodsContainer);
                container.appendChild(sectionContainer);
            }
        });
    
        // Event listener para la selección de método de pago
        container.addEventListener('click', (e) => {
            const button = e.target.closest('.payment-button');
            if (button) {
                document.querySelectorAll('.payment-button').forEach(btn => 
                    btn.classList.remove('selected'));
                button.classList.add('selected');
            }
        });
    };

    // Validation Functions
    const validateShippingInfo = () => {
        const required = ['fullName', 'whatsapp', 'email', 'document', 'city', 'address'];
        let isValid = true;
        required.forEach(field => {
            const input = document.getElementById(field);
            const value = input.value.trim();
            
            if (!value) {
                input.classList.add('error');
                isValid = false;
            } else {
                input.classList.remove('error');
            }
        });
        if (!isValid) {
            alert('Por favor complete todos los campos requeridos');
        }
        return isValid;
    };

    // Step Navigation
    const updateStep = (step) => {
        // Update step indicators
        document.querySelectorAll('.step').forEach((s, index) => {
            s.classList.toggle('active', index + 1 <= step);
        });
        // Hide all sections first
        document.querySelectorAll('.checkout-section').forEach(section => {
            section.classList.remove('active');
        });
        // Show appropriate section
        if (step === 1) {
            document.querySelector('.shipping-form').classList.add('active');
        } else if (step === 2) {
            document.querySelector('.payment-methods').classList.add('active');
        } else if (step === 3) {
            document.querySelector('.cart-summary').classList.add('active');
            loadCartSummary();
        }
        currentStep = step;
        
        // Scroll to active section
        document.querySelector('.checkout-section.active').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    };

    // Update the validatePaymentMethod function
    const validatePaymentMethod = () => {
        const selectedMethod = document.querySelector('.payment-button.selected');
        if (!selectedMethod) {
            alert('Por favor seleccione un método de pago para continuar');
            return false;
        }
        return true;
    };

    // Add payment processing handler
    const handlePayment = async () => {
        const selectedMethod = document.querySelector('.payment-button.selected');
        const methodType = selectedMethod.getAttribute('data-method');
        const orderData = {
            shippingInfo: {
                fullName: document.getElementById('fullName').value,
                whatsapp: document.getElementById('whatsapp').value,
                email: document.getElementById('email').value,
                document: document.getElementById('document').value,
                city: document.getElementById('city').value,
                locality: document.getElementById('locality').value,
                address: document.getElementById('address').value
            },
            cartItems: JSON.parse(localStorage.getItem('cart') || '[]'),
            total: cartTotal + (shippingSelected ? SHIPPING_COST : 0),
            shippingCost: shippingSelected ? SHIPPING_COST : 0
        };

        try {
            if (methodType === 'epayco') {
                // Redirect to ePayco payment
                window.location.href = `/payment/epayco?orderId=${orderData.id}`;
            } else {
                alert('Por favor seleccione un método de pago válido');
            }
        } catch (error) {
            console.error('Error al procesar el pago:', error);
            alert('Error al procesar el pago. Por favor intente nuevamente.');
        }
    };

    // Navigation button handlers
    document.querySelectorAll('.next-step').forEach(button => {
        button.addEventListener('click', () => {
            if (currentStep === 1 && validateShippingInfo()) {
                updateStep(2);
                generatePaymentMethods();
            } else if (currentStep === 2) {
                if (validatePaymentMethod()) {
                    updateStep(3);
                    loadCartSummary();
                }
            } else if (currentStep === 3) {
                handlePayment();
            }
        });
    });

    document.querySelectorAll('.prev-step').forEach(button => {
        button.addEventListener('click', () => {
            updateStep(currentStep - 1);
        });
    });

    // Initialize
    const verifyAuth = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Por favor inicia sesión para continuar');
            window.location.href = '/login';
            return false;
        }
        return true;
    };

    // Prevent form submission since we're using buttons now
    const checkoutForm = document.getElementById('checkoutForm');
    checkoutForm.onsubmit = (e) => e.preventDefault();

    // Initialize shipping checkbox handling
    const shippingCheckbox = document.getElementById('shipping-option');
    shippingCheckbox.addEventListener('change', () => {
        shippingSelected = shippingCheckbox.checked;
        localStorage.setItem('shippingSelected', shippingSelected);
        updateTotalDisplay();
    });

    // Initialize cart and shipping state
    if (verifyAuth()) {
        loadCartSummary();
        const savedShippingState = localStorage.getItem('shippingSelected') === 'true';
        if (shippingCheckbox) {
            shippingCheckbox.checked = savedShippingState;
            shippingSelected = savedShippingState;
            updateTotalDisplay();
        }
    }
});
