(function () {
    // Declaración de elementos del DOM
    const mainHeader = document.querySelector("header");
    const isLoginPage = window.location.pathname.includes("/login");
    const userIcon = document.querySelector(".bx-user");
    const menu = document.querySelector("#menu-icon");
    const navmenu = document.querySelector(".navmenu");

    /******************************************
     * FUNCIONALIDAD DE CAMBIO DE FONDO EN LOGIN
     ******************************************/
    document.addEventListener("DOMContentLoaded", function () {
        if (isLoginPage) {
            // Cambiar fondo de navbar en la página de login
            if (mainHeader) {
                mainHeader.classList.add("navbar-white");
            }
        } else {
            // Si no es login, aplica la funcionalidad sticky
            applyStickyHeader();
        }

        // Manejo del estado de usuario (logueado o no logueado)
        handleUserIcon();
    });

    /******************************************
     * FUNCIONALIDAD HEADER STICKY
     ******************************************/
    function applyStickyHeader() {
        window.addEventListener("scroll", function () {
            if (mainHeader) {
                mainHeader.classList.toggle("sticky", window.scrollY > 0);
            }
        });
    }

    /******************************************
     * MANEJO DEL ICONO DE USUARIO
     ******************************************/
    function handleUserIcon() {
        const token = localStorage.getItem('token');
        const userData = JSON.parse(localStorage.getItem('userData'));
        
        if (userIcon) {
            userIcon.href = token ? '/customer-panel' : '/login';
        }
    }

    /******************************************
     * MANEJO DEL MENÚ DESPLEGABLE
     ******************************************/
    menu.onclick = () => {
        menu.classList.toggle("bx-x");
        navmenu.classList.toggle("open");
    };
})();