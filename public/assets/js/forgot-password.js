document.getElementById('resetForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.querySelector('input[name="email"]').value;
    
    try {
        const response = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
            showNotification('Se ha enviado un correo con las instrucciones', 'success');
            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);
        } else {
            showNotification(data.message || 'Error al procesar la solicitud', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al procesar la solicitud', 'error');
    }
});