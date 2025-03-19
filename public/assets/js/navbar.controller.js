class NavbarController {
    constructor() {
        this.userIcon = document.querySelector('.nav__user');
        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.userIcon.addEventListener('click', () => this.handleUserIconClick());
    }

    handleUserIconClick() {
        const token = localStorage.getItem('token');
        console.log('Token exists:', !!token); // Debug
        if (token) {
            window.location.href = '/customer-panel';
        } else {
            window.location.href = '/login';
        }
    }

    checkAuthStatus() {
        const token = localStorage.getItem('token');
        if (token) {
            this.userIcon.classList.add('logged');
            console.log('Usuario logueado'); // Debug
        }
    }
}

new NavbarController();