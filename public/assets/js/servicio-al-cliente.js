function openWhatsApp() {
    const phoneNumber = '+573107669804'; 
    const message = '¡Hola! Necesito ayuda con un servicio de Zabal.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

class ServicioCliente extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.innerHTML = `
            <style>
                .hero-section {
                    min-height: 100vh;
                    background: linear-gradient(135deg,rgb(64, 156, 255),rgb(0, 68, 141));
                    color: white;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    padding: 20px;
                }

                .hero-section h1 {
                    font-size: 3.5rem;
                    margin-bottom: 20px;
                    font-weight: bold;
                }

                .hero-section p {
                    font-size: 1.2rem;
                    margin-bottom: 30px;
                }

                .hero-cta {
                    display: flex;
                    gap: 50px;
                }

                .hero-cta a {
                    text-decoration: none;
                    padding: 10px 20px;
                    border-radius: 50px;
                    background: white;
                    color: #007BFF;
                    font-weight: bold;
                    transition: background-color 0.3s ease;
                }

                .hero-cta a:hover {
                    background: linear-gradient(135deg, #459fff, #00c69f);
                    color: white;
                }
            </style>
            <header class="hero-section">
                <div class="hero-content">
                    <h1>Atención al Cliente Zabal</h1>
                    <p>Soluciones personalizadas. Experiencia excepcional. Siempre a tu lado.</p>
                    <div class="hero-cta">
                        <a href="#services" class="btn btn-primary">Descubre Nuestros Servicios</a>
                        <a href="#contact" class="btn btn-outline">Contáctanos</a>
                    </div>
                </div>
            </header>
        `;
    }
}

// Define el Web Component
customElements.define('servicio-cliente', ServicioCliente);


function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.5s forwards';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}

// Handle form submission
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.modern-contact-form');
    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const formData = {
                name: form.querySelector('#name').value,
                email: form.querySelector('#email').value,
                subject: form.querySelector('#subject').value,
                message: form.querySelector('#message').value
            };

            try {
                const response = await fetch('/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
            
                if (response.ok) {
                    const result = await response.json();
                    showNotification(result.message, 'success');
                    form.reset();
                } else {
                    throw new Error('Error en el servidor');
                }
            } catch (error) {
                console.error('Error:', error);
                showNotification('Hubo un problema al enviar el mensaje. Por favor, intente nuevamente.', 'error');
            }
        });
    }
});