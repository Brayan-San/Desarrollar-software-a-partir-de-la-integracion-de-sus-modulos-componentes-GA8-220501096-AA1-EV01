function showNotification(message, type = 'info') {
    const backgroundColor = {
        success: 'linear-gradient(to right, #00b09b, #96c93d)',
        error: 'linear-gradient(to right, #ff5f6d, #ffc371)',
        info: 'linear-gradient(to right, #2193b0, #6dd5ed)',
        warning: 'linear-gradient(to right, #f2994a, #f2c94c)'
    };

    Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
            background: backgroundColor[type],
            borderRadius: "8px",
            fontFamily: "Arial, sans-serif",
            fontSize: "16px",
            padding: "15px 25px"
        }
    }).showToast();
}