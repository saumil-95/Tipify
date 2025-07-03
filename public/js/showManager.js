
/// Initialize the application
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

// Global variables
let showPassword = false;

// Popup functions
function openPopup() {
    const popup = document.getElementById('popup-overlay');
    popup.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Add animation class
    const popupContent = popup.querySelector('.popup-content');
    popupContent.style.animation = 'scaleIn 0.3s ease-out';
}

function closePopup() {
    const popup = document.getElementById('popup-overlay');
    const popupContent = popup.querySelector('.popup-content');
    
    // Add exit animation
    popupContent.style.animation = 'scaleOut 0.3s ease-out';
    
    setTimeout(() => {
        popup.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Reset form
        const form = document.getElementById('manager-form');
        if (form) {
            // Reset to original values instead of clearing
            document.getElementById('username').value = 'Sarah Johnson';
            document.getElementById('email').value = 'sarah.johnson@grandpalace.com';
            document.getElementById('password').value = '';
            document.getElementById('phone').value = '+1 (555) 123-4567';
        }
    }, 300);
}

// Password toggle function
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eye-icon');
    const eyeOffIcon = document.getElementById('eye-off-icon');
    
    showPassword = !showPassword;
    
    if (showPassword) {
        passwordInput.type = 'text';
        eyeIcon.style.display = 'none';
        eyeOffIcon.style.display = 'block';
    } else {
        passwordInput.type = 'password';
        eyeIcon.style.display = 'block';
        eyeOffIcon.style.display = 'none';
    }
}

// Form submission handler
function handleSubmit(event) {
    event.preventDefault();
    
    // Get form data
    const formData = new FormData(event.target);
    const data = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
        phone: formData.get('phone')
    };
    
    // Simulate form submission
    console.log('Form submitted with data:', data);
    
    // Show success message (you can customize this)
    // alert('Manager details updated successfully!');
    
    // Close popup
    closePopup();
}

// Delete handler
// function handleDelete() {
//     if (confirm('Are you sure you want to delete this manager? This action cannot be undone.')) {
//         // Simulate delete operation
//         console.log('Manager deleted');
//         // alert('Manager has been deleted successfully!');
        
//         // In a real application, you would redirect to the managers list
//         // window.location.href = '/managers';
//     }
// }

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Close popup when clicking outside
    const popup = document.getElementById('popup-overlay');
    if (popup) {
        popup.addEventListener('click', function(e) {
            if (e.target === popup || e.target.classList.contains('popup-backdrop')) {
                closePopup();
            }
        });
    }
    
    // Close popup with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const popup = document.getElementById('popup-overlay');
            if (popup && popup.style.display === 'flex') {
                closePopup();
            }
        }
    });
    
    // Form validation
    const form = document.getElementById('manager-form');
    if (form) {
        const inputs = form.querySelectorAll('input[required]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    validateField(this);
                }
            });
        });
    }
});

// Field validation function
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Remove existing error styling
    field.classList.remove('error');
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }
    
    // Phone validation
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number';
        }
    }
    
    // Show error if validation failed
    if (!isValid) {
        field.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = errorMessage;
        errorDiv.style.color = '#e74c3c';
        errorDiv.style.fontSize = '0.75rem';
        errorDiv.style.marginTop = '0.25rem';
        field.parentNode.appendChild(errorDiv);
    }
    
    return isValid;
}

// Add CSS for error states
const style = document.createElement('style');
style.textContent = `
    .form-input.error {
        border-color: #e74c3c !important;
        box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1) !important;
    }
    
    @keyframes scaleOut {
        from {
            opacity: 1;
            transform: scale(1);
        }
        to {
            opacity: 0;
            transform: scale(0.9);
        }
    }
    
    .fade-in {
        animation: fadeInUp 0.6s ease-out;
    }
    
    .hover-lift {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .hover-lift:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
`;
document.head.appendChild(style);

// Add smooth scrolling behavior
document.documentElement.style.scrollBehavior = 'smooth';

// Initialize animations on page load
window.addEventListener('load', function() {
    // Add fade-in animation to main elements
    const animatedElements = document.querySelectorAll('.manager-card, .page-title');
    animatedElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 200);
    });
});

// Add hover effects to interactive elements
document.addEventListener('DOMContentLoaded', function() {
    const hoverElements = document.querySelectorAll('.btn, .info-item, .stat-item');
    hoverElements.forEach(element => {
        element.classList.add('hover-lift');
    });
});



