// Referencias a elementos del DOM
const signInBtn = document.getElementById("signIn");
const signUpBtn = document.getElementById("signUp");
const fistForm = document.getElementById("form1");
const secondForm = document.getElementById("form2");
const container = document.querySelector(".container");

// Manejar animación de transición entre formularios
signInBtn.addEventListener("click", () => {
    container.classList.remove("right-panel-active");
});

signUpBtn.addEventListener("click", () => {
    container.classList.add("right-panel-active");
});

// Prevenir comportamiento por defecto de los formularios
fistForm.addEventListener("submit", (e) => e.preventDefault());
secondForm.addEventListener("submit", (e) => e.preventDefault());

// Función genérica para enviar datos al servidor
const sendData = async (url, data) => {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            showNotification(result.message || 'Error en la respuesta del servidor', 'error');
            return null;
        }

        return result;
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al procesar la solicitud', 'error');
        return null;
    }
};

// Manejar registro
fistForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = fistForm.querySelector('input[name="name"]').value;
    const email = fistForm.querySelector('input[name="email"]').value;
    const password = fistForm.querySelector('input[name="password"]').value;

    const result = await sendData('/api/auth/register', { name, email, password });

    if (result) {
        showNotification('¡Registro exitoso! Por favor, inicie sesión.', 'success');
        setTimeout(() => {
            container.classList.remove("right-panel-active");
        }, 1500);
    }
});

// Manejar inicio de sesión
secondForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = secondForm.querySelector('input[name="email"]').value;
    const password = secondForm.querySelector('input[name="password"]').value;

    const result = await sendData('/api/auth/login', { email, password });

    if (result) {
        const userData = {
            id: result.user._id,
            name: result.user.name,
            email: result.user.email,
            avatarUrl: result.user.avatarUrl || null
        };
        
        localStorage.setItem('token', result.token);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        showNotification('¡Inicio de sesión exitoso!', 'success');
        setTimeout(() => {
            window.location.href = '/customer-panel';
        }, 1500);
    }
});

document.querySelector('.link').addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = '/forgot-password';
});