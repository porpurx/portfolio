document.addEventListener('DOMContentLoaded', function () {
		// Animación al hacer scroll para las secciones
		const scrollSections = document.querySelectorAll('.section-scroll-animate');
		const observer = new window.IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.classList.add('visible');
				} else {
					entry.target.classList.remove('visible');
				}
			});
		}, {
			threshold: 0.3
		});
		scrollSections.forEach(section => {
			observer.observe(section);
		});
	const menuBtn = document.querySelector('button[class*="md:hidden"]');
	const mobileMenu = document.getElementById('mobileMenu');


	// Botón flotante para volver a Home
	const backToHomeBtn = document.getElementById('backToHomeBtn');

	// Click en botón flotante para volver a Home
	if (backToHomeBtn) {
		backToHomeBtn.addEventListener('click', function () {
			const homeSection = document.getElementById('home');
			if (homeSection) {
				homeSection.scrollIntoView({ behavior: 'smooth' });
			}
		});
	}


	// Enlaces de navegación scroll suave
	document.querySelectorAll('.nav-link').forEach(link => {
		link.addEventListener('click', function (e) {
			const targetId = this.getAttribute('href').replace('#', '');
			const targetSection = document.getElementById(targetId);
			if (targetSection) {
				e.preventDefault();
				targetSection.scrollIntoView({ behavior: 'smooth' });
				// Si es móvil, cerrar menú
				if (mobileMenu && mobileMenu.classList.contains('translate-y-0')) {
					mobileMenu.classList.remove('translate-y-0');
					mobileMenu.classList.add('-translate-y-full');
				}
			}
		});
	});

	// Menú móvil
	if (menuBtn && mobileMenu) {
		menuBtn.addEventListener('click', function () {
			if (mobileMenu.classList.contains('-translate-y-full')) {
				mobileMenu.classList.remove('-translate-y-full');
				mobileMenu.classList.add('translate-y-0');
			} else {
				mobileMenu.classList.remove('translate-y-0');
				mobileMenu.classList.add('-translate-y-full');
			}
		});

		// Cerrar menú al hacer clic en un enlace
		mobileMenu.querySelectorAll('a').forEach(link => {
			link.addEventListener('click', () => {
				mobileMenu.classList.remove('translate-y-0');
				mobileMenu.classList.add('-translate-y-full');
			});
		});
	}
});