
// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupNavbarScroll();
    setupScrollAnimations();
    setupFormValidation();
    checkManagerStatus();
    animateStepProgress();
}

// Navbar scroll effect
function setupNavbarScroll() {
    const navbar = document.querySelector('.custom-navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Scroll animations
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);

    // Observe all elements with fade-in-up class
    document.querySelectorAll('.fade-in-up').forEach(el => {
        observer.observe(el);
    });
}

// Form validation
function setupFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });
}

// Check manager status and show appropriate content
function checkManagerStatus() {
    // Simulate checking if manager has a hotel registered
    const hasHotel = true; // Change to false to show add hotel card
    
    const hotelCard = document.getElementById('hotelCard');
    const addHotelCard = document.getElementById('addHotelCard');
    
    if (hasHotel) {
        hotelCard.style.display = 'block';
        addHotelCard.style.display = 'none';
    } else {
        hotelCard.style.display = 'none';
        addHotelCard.style.display = 'block';
    }
}

// Animate step progress
function animateStepProgress() {
    const steps = document.querySelectorAll('.step-item');
    
    steps.forEach((step, index) => {
        setTimeout(() => {
            step.style.animation = 'slideInLeft 0.5s ease-out forwards';
        }, index * 200);
    });
}

// Hotel management functions
function viewHotelDetails() {
    showNotification('Redirecting to hotel details page...', 'info');
    // In real app: window.location.href = '/hotel/details';
}

function manageStaff() {
    showNotification('Opening staff management panel...', 'info');
    // In real app: window.location.href = '/staff/manage';
}

function viewAnalytics() {
    showNotification('Loading analytics dashboard...', 'info');
    // In real app: window.location.href = '/analytics';
}

function editHotel() {
    showNotification('Opening hotel edit form...', 'info');
    // In real app: window.location.href = '/hotel/edit';
}

// Quick action functions
function addNewStaff() {
    showNotification('Opening staff registration form...', 'info');
    // In real app: window.location.href = '/staff/add';
}

function generateQR() {
    showNotification('Generating QR code for tip collection...', 'info');
    // In real app: window.location.href = '/qr/generate';
}

function viewReports() {
    showNotification('Loading performance reports...', 'info');
    // In real app: window.location.href = '/reports';
}

function manageSettings() {
    showNotification('Opening settings panel...', 'info');
    // In real app: window.location.href = '/settings';
}

// Modal functions
function openAddHotelModal() {
    const modal = new bootstrap.Modal(document.getElementById('addHotelModal'));
    modal.show();
}

function registerHotel() {
    const form = document.getElementById('hotelForm');
    
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }
    
    // Show loading state
    const submitBtn = document.querySelector('#addHotelModal .btn-primary');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Registering...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addHotelModal'));
        modal.hide();
        
        // Reset form
        form.reset();
        form.classList.remove('was-validated');
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Show success message
        showNotification('Hotel registered successfully! Welcome to Grand Palace Management.', 'success');
        
        // Update UI to show hotel card
        setTimeout(() => {
            document.getElementById('hotelCard').style.display = 'block';
            document.getElementById('addHotelCard').style.display = 'none';
            
            // Update step progress
            const activeStep = document.querySelector('.step-item.active');
            if (activeStep) {
                activeStep.classList.remove('active');
                activeStep.classList.add('completed');
                
                const nextStep = activeStep.nextElementSibling;
                if (nextStep) {
                    nextStep.classList.add('active');
                }
            }
        }, 1000);
        
    }, 2000);
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 4000);
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Initialize tooltips
document.addEventListener('DOMContentLoaded', function() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

// Add loading animation
function showLoading() {
    const loader = document.createElement('div');
    loader.id = 'pageLoader';
    loader.innerHTML = `
        <div class="d-flex justify-content-center align-items-center position-fixed w-100 h-100" style="top: 0; left: 0; background: rgba(255,255,255,0.9); z-index: 9999;">
            <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;"></div>
        </div>
    `;
    document.body.appendChild(loader);
}

function hideLoading() {
    const loader = document.getElementById('pageLoader');
    if (loader) {
        loader.remove();
    }
}

// Performance metrics animation
function animateMetrics() {
    const metricValues = document.querySelectorAll('.metric-value');
    
    metricValues.forEach(metric => {
        const finalValue = metric.textContent;
        const isNumber = !isNaN(parseFloat(finalValue.replace(/[^0-9.]/g, '')));
        
        if (isNumber) {
            const finalNum = parseFloat(finalValue.replace(/[^0-9.]/g, ''));
            const prefix = finalValue.replace(/[0-9.]/g, '');
            let currentNum = 0;
            const increment = finalNum / 50;
            
            const timer = setInterval(() => {
                currentNum += increment;
                if (currentNum >= finalNum) {
                    metric.textContent = finalValue;
                    clearInterval(timer);
                } else {
                    metric.textContent = prefix + Math.floor(currentNum);
                }
            }, 30);
        }
    });
}

// Trigger metrics animation when section comes into view
const metricsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateMetrics();
            metricsObserver.unobserve(entry.target);
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const hotelCard = document.querySelector('.manager-hotel-card');
    if (hotelCard) {
        metricsObserver.observe(hotelCard);
    }
});

// // Welcome message based on time of day
// function setWelcomeMessage() {
//     const hour = new Date().getHours();
//     const welcomeTitle = document.querySelector('.welcome-title');
    
//     if (welcomeTitle) {
//         let greeting = 'Welcome';
        
//         if (hour < 12) {
//             greeting = 'Good Morning';
//         } else if (hour < 17) {
//             greeting = 'Good Afternoon';
//         } else {
//             greeting = 'Good Evening';
//         }
        
//         welcomeTitle.textContent = `${greeting}, John Smith!`;
//     }
// }


function setWelcomeMessage() {
    const hour = new Date().getHours();
    const welcomeTitle = document.querySelector('.welcome-title');

    if (welcomeTitle) {
      let greeting = 'Welcome';

      if (hour < 12) {
        greeting = 'Good Morning';
      } else if (hour < 17) {
        greeting = 'Good Afternoon';
      } else {
        greeting = 'Good Evening';
      }

      // Replace only the "Welcome" part
      welcomeTitle.textContent = welcomeTitle.textContent.replace(/^Welcome/, greeting);
    }
  }

// Initialize welcome message
document.addEventListener('DOMContentLoaded', setWelcomeMessage);