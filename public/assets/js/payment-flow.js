document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    let currentStep = 1;
    let selectedPaymentMethod = null;
    const shippingCost = 10000; // $10,000 COP
    
    // DOM Elements
    const steps = document.querySelectorAll('.step');
    const sections = document.querySelectorAll('.payment-section');
    const nextButtons = document.querySelectorAll('.next-step');
    const prevButtons = document.querySelectorAll('.prev-step');
    const paymentOptions = document.querySelectorAll('.payment-option-large');
    const shippingCheckbox = document.getElementById('shipping-option');
    
    // Initialize cart data
    initializeCart();
    
    // Event Listeners
    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (validateCurrentStep()) {
                goToStep(currentStep + 1);
            }
        });
    });

    prevButtons.forEach(button => {
        button.addEventListener('click', () => goToStep(currentStep - 1));
    });

    paymentOptions.forEach(option => {
        option.addEventListener('click', () => selectPaymentMethod(option));
    });

    // Initialize city-locality relationship
    const citySelect = document.getElementById('city');
    const localitySelect = document.getElementById('locality');
    
    const localities = {
        bogota: ['Usaquén', 'Chapinero', 'Santa Fe', 'San Cristóbal', 'Usme', 'Tunjuelito'],
        medellin: ['El Poblado', 'Laureles', 'La Candelaria', 'Belén', 'Robledo'],
        cali: ['Comuna 2', 'Comuna 3', 'Comuna 17', 'Comuna 19', 'Comuna 22']
    };

    citySelect.addEventListener('change', function() {
        localitySelect.disabled = !this.value;
        localitySelect.innerHTML = '<option value="">Selecciona una localidad</option>';
        
        if (this.value) {
            localities[this.value].forEach(locality => {
                const option = document.createElement('option');
                option.value = locality.toLowerCase().replace(/\s+/g, '-');
                option.textContent = locality;
                localitySelect.appendChild(option);
            });
        }
    });

    // Functions
    function initializeCart() {
        const cartItems = document.querySelector('.cart-items');
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        let subtotal = 0;
        cartItems.innerHTML = '';
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            cartItems.innerHTML += `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="item-details">
                        <h3>${item.name}</h3>
                        <p>Talla: ${item.size}</p>
                        <p>Cantidad: ${item.quantity}</p>
                        <p class="price">$${itemTotal.toLocaleString()}</p>
                    </div>
                </div>
            `;
        });

        updateTotalDisplay(subtotal);
    }

    function updateTotalDisplay(subtotal = 0) {
        const shipping = shippingCheckbox.checked ? shippingCost : 0;
        const total = subtotal + shipping;

        document.querySelector('.subtotal-amount').textContent = `$${subtotal.toLocaleString()}`;
        document.querySelector('.shipping-amount').textContent = `$${shipping.toLocaleString()}`;
        document.querySelector('.total-amount').textContent = `$${total.toLocaleString()}`;
    }

    function validateCurrentStep() {
        if (currentStep === 1) {
            return validatePersonalData();
        } else if (currentStep === 2) {
            return validatePaymentMethod();
        }
        return true;
    }

    function validatePersonalData() {
        const form = document.getElementById('personalDataForm');
        const inputs = form.querySelectorAll('input, select, textarea');
        let isValid = true;

        inputs.forEach(input => {
            if (input.required && !input.value) {
                input.classList.add('error');
                isValid = false;
            } else {
                input.classList.remove('error');
            }
        });

        if (!isValid) {
            alert('Por favor, completa todos los campos requeridos.');
        }

        return isValid;
    }

    function validatePaymentMethod() {
        if (!selectedPaymentMethod) {
            alert('Por favor, selecciona un método de pago.');
            return false;
        }
        return true;
    }

    function selectPaymentMethod(option) {
        // Remove selected class from all options
        paymentOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Add selected class to clicked option
        option.classList.add('selected');
        
        // Store selected method
        selectedPaymentMethod = option.dataset.method;
        
        // Hide all instruction blocks
        document.querySelectorAll('.transfer-instructions').forEach(inst => {
            inst.classList.remove('active');
        });
        
        // Show instructions for selected method if it's Nequi or Daviplata
        if (['nequi', 'daviplata'].includes(selectedPaymentMethod)) {
            document.getElementById(`${selectedPaymentMethod}-instructions`).classList.add('active');
        }

        // Initialize carousel if needed
        if (['nequi', 'daviplata'].includes(selectedPaymentMethod)) {
            initializeCarousel(selectedPaymentMethod);
        }
    }

    function goToStep(step) {
        if (step < 1 || step > 3) return;
        
        currentStep = step;
        
        // Update steps UI
        steps.forEach((stepEl, index) => {
            stepEl.classList.toggle('active', index + 1 === currentStep);
        });
        
        // Update sections UI
        sections.forEach((section, index) => {
            section.classList.toggle('active', index + 1 === currentStep);
        });

        // If going to confirmation step, update summary
        if (currentStep === 3) {
            updateConfirmationSummary();
        }
    }

    function updateConfirmationSummary() {
        // Update personal data
        document.getElementById('confirm-name').textContent = document.getElementById('fullName').value;
        document.getElementById('confirm-whatsapp').textContent = document.getElementById('whatsapp').value;
        document.getElementById('confirm-email').textContent = document.getElementById('email').value;
        document.getElementById('confirm-address').textContent = document.getElementById('address').value;
        document.getElementById('confirm-city').textContent = 
            `${document.getElementById('city').value} - ${document.getElementById('locality').value}`;

        // Update payment method
        const methodNames = {
            nequi: 'Nequi',
            daviplata: 'Daviplata',
            wompi: 'Wompi'
        };
        document.getElementById('confirm-payment-method').textContent = methodNames[selectedPaymentMethod];

        // Show payment instructions summary if applicable
        const instructionsSummary = document.getElementById('payment-instructions-summary');
        if (['nequi', 'daviplata'].includes(selectedPaymentMethod)) {
            instructionsSummary.innerHTML = `
                <p><strong>Número de cuenta:</strong> ${selectedPaymentMethod === 'nequi' ? '300 123 4567' : '310 987 6543'}</p>
                <p><strong>Titular:</strong> ZABAL STORE</p>
                <p><strong>Referencia:</strong> ${document.getElementById(`${selectedPaymentMethod}-reference`).textContent}</p>
            `;
        } else {
            instructionsSummary.innerHTML = '<p>Se procesará a través de Wompi</p>';
        }
    }

    // Carousel functionality
    function initializeCarousel(method) {
        const carousel = document.getElementById(`${method}-carousel`);
        const slides = carousel.querySelectorAll('.carousel-slide');
        const dots = document.getElementById(`${method}-dots`).querySelectorAll('.carousel-dot');
        let currentSlide = 0;

        function updateCarousel() {
            carousel.style.transform = `translateX(-${currentSlide * 100}%)`;
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });
        }

        // Event listeners for carousel controls
        carousel.parentElement.querySelector('.prev-slide').addEventListener('click', () => {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            updateCarousel();
        });

        carousel.parentElement.querySelector('.next-slide').addEventListener('click', () => {
            currentSlide = (currentSlide + 1) % slides.length;
            updateCarousel();
        });

        // Event listeners for dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentSlide = index;
                updateCarousel();
            });
        });
    }

    // Handle order confirmation
    document.querySelector('.confirm-order').addEventListener('click', async () => {
        try {
            const orderData = {
                items: JSON.parse(localStorage.getItem('cart')),
                shippingInfo: {
                    fullName: document.getElementById('fullName').value,
                    whatsapp: document.getElementById('whatsapp').value,
                    email: document.getElementById('email').value,
                    document: document.getElementById('document').value,
                    city: document.getElementById('city').value,
                    locality: document.getElementById('locality').value,
                    address: document.getElementById('address').value,
                    shipping: shippingCheckbox.checked
                },
                paymentMethod: selectedPaymentMethod
            };

            const response = await fetch('/api/orders/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(orderData)
            });

            const result = await response.json();

            if (result.success) {
                // Clear cart
                localStorage.removeItem('cart');
                
                // Redirect based on payment method
                if (selectedPaymentMethod === 'wompi') {
                    // Redirect to Wompi
                    window.location.href = result.wompiUrl;
                } else {
                    // Show success message for bank transfer
                    alert('¡Orden creada exitosamente! Por favor realiza la transferencia según las instrucciones proporcionadas.');
                    window.location.href = '/customer-panel';
                }
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error creating order:', error);
            alert('Hubo un error al procesar tu orden. Por favor intenta nuevamente.');
        }
    });
});