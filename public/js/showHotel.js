// const staffData = [
//     {
//         id: 1,
//         name: "John Smith",
//         role: "manager",
//         email: "john@grandpalace.com",
//         phone: "+1-555-0101",
//         photo: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300",
//         rating: 4.9,
//         experience: "8 years",
//         department: "Management",
//         joinDate: "2016-03-15",
//         upiId: "john@paytm"
//     },
//     {
//         id: 2,
//         name: "Sarah Johnson",
//         role: "chef",
//         email: "sarah@grandpalace.com",
//         phone: "+1-555-0102",
//         photo: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300",
//         rating: 4.7,
//         experience: "5 years",
//         department: "Kitchen",
//         joinDate: "2019-07-22",
//         upiId: "sarah@gpay"
//     },
//     {
//         id: 3,
//         name: "Mike Chen",
//         role: "waiter",
//         email: "mike@grandpalace.com",
//         phone: "+1-555-0103",
//         photo: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300",
//         rating: 4.8,
//         experience: "3 years",
//         department: "Service",
//         joinDate: "2021-01-10",
//         upiId: "mike@phonepe"
//     },
//     {
//         id: 4,
//         name: "Emma Davis",
//         role: "receptionist",
//         email: "emma@grandpalace.com",
//         phone: "+1-555-0104",
//         photo: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300",
//         rating: 4.6,
//         experience: "2 years",
//         department: "Front Desk",
//         joinDate: "2022-05-18",
//         upiId: "emma@paytm"
//     },
//     {
//         id: 5,
//         name: "David Wilson",
//         role: "bartender",
//         email: "david@grandpalace.com",
//         phone: "+1-555-0105",
//         photo: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=300",
//         rating: 4.5,
//         experience: "4 years",
//         department: "Bar",
//         joinDate: "2020-09-12",
//         upiId: "david@gpay"
//     },
//     {
//         id: 6,
//         name: "Lisa Anderson",
//         role: "housekeeping",
//         email: "lisa@grandpalace.com",
//         phone: "+1-555-0106",
//         photo: "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=300",
//         rating: 4.4,
//         experience: "6 years",
//         department: "Housekeeping",
//         joinDate: "2018-11-05",
//         upiId: "lisa@phonepe"
//     }
// ];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupNavbarScroll();
    setupScrollAnimations();
    setupStaffFilters();
    renderStaffCards();
    setupFormValidation();
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

// Staff filter functionality
function setupStaffFilters() {
    const filterButtons = document.querySelectorAll('.staff-filters .btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            filterStaff(filter);
        });
    });
}

// Filter staff members
function filterStaff(filter) {
    const filteredData = filter === 'all' ? staffData : staffData.filter(staff => {
        if (filter === 'service') {
            return ['waiter', 'receptionist', 'bartender'].includes(staff.role);
        }
        return staff.role === filter;
    });
    
    renderStaffCards(filteredData);
}

// Render staff cards
function renderStaffCards(data = staffData) {
    const staffGrid = document.getElementById('staffGrid');
    
    staffGrid.innerHTML = data.map(staff => `
        <div class="col-lg-4 col-md-6">
            <div class="staff-card fade-in-up" onclick="showStaffDetail(${staff.id})">
                <div class="staff-status"></div>
                <div class="text-center">
                    <img src="${staff.photo}" alt="${staff.name}" class="staff-photo">
                    <h4 class="staff-name">${staff.name}</h4>
                    <p class="staff-role">${staff.role}</p>
                    <div class="staff-rating">
                        <div class="rating-stars">
                            ${generateStars(staff.rating)}
                        </div>
                        <span class="ms-2">${staff.rating}</span>
                    </div>
                </div>
                <div class="staff-details">
                    <div class="detail-item">
                        <i class="fas fa-envelope"></i>
                        <span>${staff.email}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-phone"></i>
                        <span>${staff.phone}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-clock"></i>
                        <span>${staff.experience} experience</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-building"></i>
                        <span>${staff.department}</span>
                    </div>
                </div>
                <button class="btn view-profile-btn">
                    <i class="fas fa-user me-2"></i>View Full Profile
                </button>
            </div>
        </div>
    `).join('');
    
    // Re-setup scroll animations for new elements
    setupScrollAnimations();
}

// Generate star rating
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// Show staff detail modal
function showStaffDetail(staffId) {
    const staff = staffData.find(s => s.id === staffId);
    if (!staff) return;
    
    const modalContent = document.getElementById('staffDetailContent');
    modalContent.innerHTML = `
        <div class="row">
            <div class="col-md-4 text-center">
                <img src="${staff.photo}" alt="${staff.name}" class="img-fluid rounded-circle mb-3" style="width: 150px; height: 150px; object-fit: cover;">
                <div class="staff-rating mb-3">
                    <div class="rating-stars text-warning">
                        ${generateStars(staff.rating)}
                    </div>
                    <div class="mt-1">${staff.rating} out of 5</div>
                </div>
            </div>
            <div class="col-md-8">
                <h4 class="mb-3">${staff.name}</h4>
                <div class="row">
                    <div class="col-sm-6">
                        <p><strong>Role:</strong> ${staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}</p>
                        <p><strong>Department:</strong> ${staff.department}</p>
                        <p><strong>Experience:</strong> ${staff.experience}</p>
                    </div>
                    <div class="col-sm-6">
                        <p><strong>Join Date:</strong> ${new Date(staff.joinDate).toLocaleDateString()}</p>
                        <p><strong>Email:</strong> ${staff.email}</p>
                        <p><strong>Phone:</strong> ${staff.phone}</p>
                    </div>
                </div>
                ${staff.upiId ? `<p><strong>UPI ID:</strong> ${staff.upiId}</p>` : ''}
                <div class="mt-4">
                    <button class="btn btn-primary me-2">
                        <i class="fas fa-edit me-2"></i>Edit Profile
                    </button>
                    <button class="btn btn-success me-2">
                        <i class="fas fa-money-bill-wave me-2"></i>View Tips
                    </button>
                    <button class="btn btn-info">
                        <i class="fas fa-chart-bar me-2"></i>Performance
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const modal = new bootstrap.Modal(document.getElementById('staffDetailModal'));
    modal.show();
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

// Add new staff member
function addStaff() {
    const form = document.getElementById('staffForm');
    
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }
    
    const formData = new FormData(form);
    const newStaff = {
        id: staffData.length + 1,
        name: formData.get('fullName') || document.getElementById('fullName').value,
        role: formData.get('role') || document.getElementById('role').value,
        email: formData.get('email') || document.getElementById('email').value,
        phone: formData.get('phone') || document.getElementById('phone').value,
        photo: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=300", // Default photo
        rating: 4.0,
        experience: "New",
        department: getDepartmentByRole(formData.get('role') || document.getElementById('role').value),
        joinDate: new Date().toISOString().split('T')[0],
        upiId: formData.get('upiId') || document.getElementById('upiId').value
    };
    
    // Add to staff data
    staffData.push(newStaff);
    
    // Re-render staff cards
    renderStaffCards();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addStaffModal'));
    modal.hide();
    
    // Reset form
    form.reset();
    form.classList.remove('was-validated');
    
    // Show success message
    showNotification('Staff member added successfully!', 'success');
}

// Get department by role
function getDepartmentByRole(role) {
    const departments = {
        'manager': 'Management',
        'chef': 'Kitchen',
        'waiter': 'Service',
        'receptionist': 'Front Desk',
        'bartender': 'Bar',
        'housekeeping': 'Housekeeping'
    };
    return departments[role] || 'General';
}

// Download QR Code
function downloadQR() {
    const qrImage = document.querySelector('.qr-image');
    const imageUrl = qrImage.src;
    const hotelName = qrImage.alt.replace('QR Code for ', ''); // Extract hotel name from alt text
    
    fetch(imageUrl)
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${hotelName}_QR_Code.png`; // You can change the filename format
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('Error downloading QR code:', error);
            // Fallback to Method 2 if fetch fails
            downloadQRFallback();
        });
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
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

// Initialize tooltips
document.addEventListener('DOMContentLoaded', function() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});





















// showEmployee script

	 // Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupNavbarScroll();
    setupScrollAnimations();
    setupFormValidation();
    loadEmployeeData();
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

// // Load employee data (mock data for demo)
// function loadEmployeeData() {
//     // This would typically come from your backend
//     const employeeData = {
//         id: "emp123",
//         username: "John Smith",
//         email: "john.smith@grandpalace.com",
//         phone: "+1 (555) 123-4567",
//         role: "manager",
//         upiID: "john@paytm",
//         photo: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400",
//         isActive: true,
//         hotel: {
//             name: "Grand Palace Hotel",
//             location: "New York, NY"
//         },
//         department: "Management",
//         rating: 4.8,
//         experience: "3 Years",
//         totalTips: "$2,450",
//         attendance: "98%",
//         reviews: 156
//     };

//     // Update UI with employee data
//     updateEmployeeDisplay(employeeData);
// }

// // Update employee display
// function updateEmployeeDisplay(data) {
//     document.getElementById('employeeName').textContent = data.username;
//     document.getElementById('employeeRole').textContent = data.role.charAt(0).toUpperCase() + data.role.slice(1);
//     document.getElementById('employeeEmail').textContent = data.email;
//     document.getElementById('employeePhone').textContent = data.phone;
//     document.getElementById('employeeUPI').textContent = data.upiID || 'Not provided';
//     document.getElementById('hotelName').textContent = data.hotel.name;
//     document.getElementById('hotelLocation').textContent = data.hotel.location;
//     document.getElementById('employeeDepartment').textContent = data.department;
//     document.getElementById('employeePhoto').src = data.photo;
    
//     // Update form fields
//     document.getElementById('updateEmail').value = data.email;
//     document.getElementById('updateUsername').value = data.username;
//     document.getElementById('updatePhone').value = data.phone;
//     document.getElementById('updateRole').value = data.role;
//     document.getElementById('updateUpiID').value = data.upiID || '';
//     document.getElementById('updateIsActive').value = data.isActive.toString();
//     document.getElementById('currentPhotoPreview').src = data.photo;
// }

// Open update popup
function openUpdatePopup() {
    const modal = new bootstrap.Modal(document.getElementById('updateEmployeeModal'));
    modal.show();
}

// // Update employee
// function updateEmployee() {
//     const form = document.getElementById('updateEmployeeForm');
    
//     if (!form.checkValidity()) {
//         form.classList.add('was-validated');
//         return;
//     }
    
//     // Collect form data
//     const formData = {
//         email: document.getElementById('updateEmail').value,
//         username: document.getElementById('updateUsername').value,
//         phone: document.getElementById('updatePhone').value,
//         role: document.getElementById('updateRole').value,
//         upiID: document.getElementById('updateUpiID').value,
//         isActive: document.getElementById('updateIsActive').value === 'true'
//     };
    
//     // Show loading state
//     const submitBtn = document.querySelector('#updateEmployeeModal .btn-primary');
//     const originalText = submitBtn.innerHTML;
//     submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Updating...';
//     submitBtn.disabled = true;
    
//     // Simulate API call
//     setTimeout(() => {
//         // Update the display with new data
//         updateEmployeeDisplay({
//             ...formData,
//             photo: document.getElementById('currentPhotoPreview').src,
//             hotel: {
//                 name: "Grand Palace Hotel",
//                 location: "New York, NY"
//             },
//             department: getDepartmentByRole(formData.role),
//             rating: 4.8,
//             experience: "3 Years",
//             totalTips: "$2,450",
//             attendance: "98%",
//             reviews: 156
//         });
        
//         // Close modal
//         const modal = bootstrap.Modal.getInstance(document.getElementById('updateEmployeeModal'));
//         modal.hide();
        
//         // Reset button
//         submitBtn.innerHTML = originalText;
//         submitBtn.disabled = false;
        
//         // Show success message
//         showNotification('Employee updated successfully!', 'success');
        
//         // Reset form validation
//         form.classList.remove('was-validated');
        
//     }, 2000);
// }

// Get department by role
function getDepartmentByRole(role) {
    const departments = {
        'manager': 'Management',
        'chef': 'Kitchen',
        'waiter': 'Service',
        'receptionist': 'Front Desk',
        'bartender': 'Bar',
        'housekeeping': 'Housekeeping',
        'other': 'General'
    };
    return departments[role] || 'General';
}

// Confirm delete
function confirmDelete() {
    const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    modal.show();
}

// Delete employee

// function deleteEmployee() {
//     // Show loading state
//     const deleteBtn = document.querySelector('#deleteConfirmModal .btn-danger');
//     const originalText = deleteBtn.innerHTML;
//     deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Deleting...';
//     deleteBtn.disabled = true;
    
//     // Simulate API call
//     setTimeout(() => {
//         // Close modal
//         const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
//         modal.hide();
        
//         // Show success message
//         showNotification('Employee deleted successfully!', 'success');
        
//         // Redirect to hotels page after a short delay
//         setTimeout(() => {
//             window.location.href = '/hotel';
//         }, 1500);
        
//     }, 2000);
// }

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
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Handle photo upload preview
document.getElementById('updatePhoto').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('currentPhotoPreview').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

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
    const metrics = document.querySelectorAll('.metric-value');
    
    metrics.forEach(metric => {
        const finalValue = metric.textContent;
        const isNumber = !isNaN(parseFloat(finalValue));
        
        if (isNumber) {
            const finalNum = parseFloat(finalValue);
            let currentNum = 0;
            const increment = finalNum / 50;
            
            const timer = setInterval(() => {
                currentNum += increment;
                if (currentNum >= finalNum) {
                    metric.textContent = finalValue;
                    clearInterval(timer);
                } else {
                    metric.textContent = Math.floor(currentNum).toString();
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
    const performanceSection = document.querySelector('.performance-section');
    if (performanceSection) {
        metricsObserver.observe(performanceSection);
    }
});

















