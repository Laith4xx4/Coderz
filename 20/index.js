// Initialize AOS (Animate On Scroll)
AOS.init({
    duration: 1000,
    once: true
});

import { authAPI } from './api.js'; // Import authAPI

// User data storage (in memory - no localStorage)
let currentUser = null;
let users = [
    {
        email: 'student@coderz.com',
        password: '123456',
        firstName: 'أحمد',
        lastName: 'محمد'
    }
];

// Course playlists
const coursePlaylists = {
    'Web Development Basics': [
        { title: 'مقدمة في HTML', url: 'https://www.youtube.com/embed/UB1O30fR-EE' },
        { title: 'أساسيات CSS', url: 'https://www.youtube.com/embed/yfoY53QXEnI' },
        { title: 'JavaScript للمبتدئين', url: 'https://www.youtube.com/embed/PkZNo7MFNFg' },
        { title: 'Bootstrap Framework', url: 'https://www.youtube.com/embed/-qfEOE4vtxE' }
    ],
    'Flutter Development': [
        { title: 'مقدمة في Flutter', url: 'https://www.youtube.com/embed/1ukSR1GRtMU' },
        { title: 'Dart Programming', url: 'https://www.youtube.com/embed/Ej_Pcr4uC2Q' },
        { title: 'Flutter Widgets', url: 'https://www.youtube.com/embed/14SL-yWts9M' },
        { title: 'State Management', url: 'https://www.youtube.com/embed/HrBiNHEqSYU' }
    ],
    'ASP.NET Core': [
        { title: 'مقدمة في ASP.NET Core', url: 'https://www.youtube.com/embed/4EJGWHaLlOw' },
        { title: 'MVC Pattern', url: 'https://www.youtube.com/embed/1ck9LIBxO14' },
        { title: 'Entity Framework', url: 'https://www.youtube.com/embed/qkJ9keBmQWo' },
        { title: 'Web API Development', url: 'https://www.youtube.com/embed/fmvcAzHpsk8' }
    ],
    'UX/UI Design': [
        { title: 'أساسيات UX Design', url: 'https://www.youtube.com/embed/c9Wg6Cb_YlU' },
        { title: 'UI Design Principles', url: 'https://www.youtube.com/embed/0JCUH5daCCE' },
        { title: 'Figma Tutorial', url: 'https://www.youtube.com/embed/FTFaQWZBqQ8' },
        { title: 'Prototyping', url: 'https://www.youtube.com/embed/KWZGCCBuUyc' }
    ]
};

// Page navigation
window.showPage = function(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    AOS.refresh();
}

// New functions to show login and register pages and clear forms
window.showLoginPage = function() {
    showPage('login');
    document.getElementById('loginForm').reset();
    // Clear any previous error messages on the login form
    // document.getElementById('loginError').textContent = ''; 
}

window.showRegisterPage = function() {
    showPage('register');
    document.getElementById('registerForm').reset();
    // Clear any previous error messages on the register form
    // document.getElementById('registerError').textContent = '';
}

// Dashboard sections
window.showDashboardSection = function(sectionId) {
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById('dashboard' + sectionId.charAt(0).toUpperCase() + sectionId.slice(1)).style.display = 'block';
}

// Login form handler
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const result = await authAPI.login({ email, password });

    if (result.success) {
        currentUser = result.data; // Assuming the API returns user data upon successful login
        localStorage.setItem('currentUser', JSON.stringify(currentUser)); // Store user data
        console.log('Current User after login:', currentUser); // Add this line
        updateNavigation();
        showPage('dashboard');
        showDashboardSection('courses');
        showAlert(result.message, 'success');
    } else {
        showAlert(result.message || 'فشل تسجيل الدخول. الرجاء التحقق من بيانات الاعتماد.', 'error');
    }
});

// Register form handler
document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        showAlert('كلمات المرور غير متطابقة', 'error');
        return;
    }

    const role = document.getElementById('registerRole').value; // Get the role from the hidden input
    const userData = { email, password, role }; // Include role in userData
    console.log("🚀 Sent body:", JSON.stringify(userData)); // Log the userData before sending
    const result = await authAPI.register(userData);

    if (result.success) {
        currentUser = result.data; // Assuming the API returns user data upon successful registration
        localStorage.setItem('currentUser', JSON.stringify(currentUser)); // Store user data
        console.log('Current User after registration:', currentUser); // Add this line
        updateNavigation();
        showPage('dashboard');
        showDashboardSection('courses');
        showAlert(result.message, 'success');
    } else {
        showAlert(result.message || 'فشل إنشاء الحساب. الرجاء المحاولة مرة أخرى.', 'error');
    }
});

// Update navigation based on login status
function updateNavigation() {
    const navButtons = document.getElementById('navButtons');
    const userNav = document.getElementById('userNav');
    const myCoursesNav = document.getElementById('myCoursesNav'); // Get the new navigation item
    const welcomeText = document.getElementById('welcomeText');
    const productsNav = document.getElementById('productsNav'); // Get the products navigation item

    if (currentUser) {
        navButtons.classList.add('d-none');
        userNav.classList.remove('d-none');
        myCoursesNav.classList.remove('d-none'); // Show 'My Courses' link
        // const userName =  currentUser.email;
        const userRole = currentUser.role ? ` (${currentUser.role})` : '';
        welcomeText.textContent = `مرحباً ${userRole}`;

        // Show productsNav only if the user is an Admin
        if (currentUser.role === 'Admin') {
            productsNav.classList.remove('d-none');
        } else {
            productsNav.classList.add('d-none');
        }
    } else {
        navButtons.classList.remove('d-none');
        userNav.classList.add('d-none');
        myCoursesNav.classList.add('d-none'); // Hide 'My Courses' link
        productsNav.classList.add('d-none'); // Hide productsNav if not logged in
    }
}

// Logout function
window.logout = function() {
    currentUser = null;
    localStorage.removeItem('currentUser'); // Clear user data from localStorage
    localStorage.removeItem('jwtToken'); // Clear the token on logout
    localStorage.removeItem('userRole'); // Clear the user role on logout
    updateNavigation();
    showPage('home');
    showAlert('تم تسجيل الخروج بنجاح', 'success');
}

// Video player function
window.openVideoPlayer = function(courseTitle, videoUrl) {
    document.getElementById('videoTitle').textContent = courseTitle;
    document.getElementById('videoFrame').src = videoUrl;
    const playlist = coursePlaylists[courseTitle] || [];
    const playlistContainer = document.getElementById('videoPlaylist');
    playlistContainer.innerHTML = '';
    playlist.forEach((video, index) => {
        const listItem = document.createElement('div');
        listItem.className = 'list-group-item list-group-item-action d-flex align-items-center p-3';
        listItem.innerHTML = `
            <div class="me-3">
                <i class="fas fa-play-circle text-primary fa-lg"></i>
            </div>
            <div class="flex-grow-1">
                <h6 class="mb-1">${video.title}</h6>
                <small class="text-muted">الدرس ${index + 1}</small>
            </div>
        `;
        listItem.onclick = () => {
            document.getElementById('videoFrame').src = video.url;
            document.querySelectorAll('.list-group-item').forEach(item => item.classList.remove('active'));
            listItem.classList.add('active');
        };
        if (index === 0) listItem.classList.add('active');
        playlistContainer.appendChild(listItem);
    });
    showPage('videoPlayer');
}

// Alert system
window.showAlert = function(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || href.startsWith('#!')) {
            e.preventDefault();
            // Do nothing, as these are often handled by specific onclick events or are placeholder links.
            // Or, you could scroll to top: window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Add floating particles animation
function createParticle() {
    const particle = document.createElement('div');
    particle.style.cssText = `
        position: fixed;
        width: 4px;
        height: 4px;
        background: rgba(0, 123, 255, 0.3);
        border-radius: 50%;
        pointer-events: none;
        z-index: 1;
        left: ${Math.random() * 100}vw;
        animation: float-up 8s linear infinite;
    `;
    document.body.appendChild(particle);
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, 8000);
}

// Add CSS for particle animation
const style = document.createElement('style');
style.textContent = `
    @keyframes float-up {
        from { transform: translateY(100vh) rotate(0deg); opacity: 1; }
        to { transform: translateY(-100px) rotate(360deg); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Create particles periodically
setInterval(createParticle, 3000);

// Add parallax effect to hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero-section');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Add typing animation to hero text
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

// Initialize typing animation when page loads
document.addEventListener('DOMContentLoaded', () => {
    const heroTitle = document.querySelector('.hero-section h1');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        setTimeout(() => { typeWriter(heroTitle, originalText, 100); }, 1000);
    }
});

// Add hover effects to course cards
document.querySelectorAll('.course-card').forEach(card => {
    card.addEventListener('mouseenter', function() { this.style.transform = 'translateY(-10px) scale(1.02)'; });
    card.addEventListener('mouseleave', function() { this.style.transform = 'translateY(0) scale(1)'; });
});

// Add ripple effect to buttons
function addRippleEffect(button) {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
        `;
        this.appendChild(ripple);
        setTimeout(() => { ripple.remove(); }, 600);
    });
}

// Add ripple animation CSS
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    .btn { position: relative; overflow: hidden; }
    @keyframes ripple-animation { to { transform: scale(4); opacity: 0; } }
`;
document.head.appendChild(rippleStyle);

// Apply ripple effect to all buttons
document.querySelectorAll('.btn').forEach(addRippleEffect);

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        updateNavigation();
    }
    showLoading();
    setTimeout(() => {
        hideLoading();
        AOS.init({ duration: 1000, once: true, offset: 100 });
    }, 1500);
    updateNavigation();
});

// Loading animation
function showLoading() {
    const loading = document.createElement('div');
    loading.id = 'loadingOverlay';
    loading.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(255, 255, 255, 0.9); display: flex; justify-content: center; align-items: center; z-index: 9999;
    `;
    loading.innerHTML = `
        <div class="spinner-border text-primary" style="width: 4rem; height: 4rem;">
            <span class="visually-hidden">جاري التحميل...</span>
        </div>
    `;
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.getElementById('loadingOverlay');
    if (loading) { loading.remove(); }
}





