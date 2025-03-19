document.getElementById('resetPasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const newPassword = document.querySelector('input[name="newPassword"]').value;
    const confirmPassword = document.querySelector('input[name="confirmPassword"]').value;
    const token = document.querySelector('input[name="token"]').value;

    if (newPassword !== confirmPassword) {
        showNotification('Las contraseñas no coinciden', 'error');
        return;
    }

    try {
        const response = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token,
                newPassword
            })
        });

        const data = await response.json();

        if (response.ok) {
            showNotification('Contraseña actualizada exitosamente', 'success');
            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);
        } else {
            showNotification(data.message || 'Error al restablecer la contraseña', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al procesar la solicitud', 'error');
    }
});