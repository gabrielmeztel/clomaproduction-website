document.addEventListener('DOMContentLoaded', function() {
    // Animation for elements when they come into view
    const animatedCards = document.querySelectorAll('.animated-card');
    
    // Function to check if element is in viewport and apply animation
    function animateOnScroll() {
        animatedCards.forEach(card => {
            if (isElementInViewport(card)) {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }
        });
    }
    
    // Helper function to check if element is in viewport
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom >= 0
        );
    }
    
    // Initial check on page load
    animateOnScroll();
    
    // Listen for scroll events
    window.addEventListener('scroll', animateOnScroll);
    
    // Projects filter functionality on works page
    if (document.querySelector('.project-filters')) {
        initProjectFilters();
    }
    
    // Contact form validation on contact page
    if (document.querySelector('#contact-form')) {
        initContactForm();
    }
});

function initProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projects = document.querySelectorAll('.project-item');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            projects.forEach(project => {
                if (filter === 'all') {
                    project.style.display = 'block';
                } else if (project.classList.contains(filter)) {
                    project.style.display = 'block';
                } else {
                    project.style.display = 'none';
                }
            });
        });
    });
}

function initContactForm() {
    const contactForm = document.querySelector('#contact-form');
    
    contactForm.addEventListener('submit', function(e) {
        let isValid = true;
        
        // Get form fields
        const nameField = document.querySelector('#name');
        const emailField = document.querySelector('#email');
        const messageField = document.querySelector('#message');
        
        // Validate name
        if (nameField.value.trim() === '') {
            isValid = false;
            nameField.classList.add('error');
        } else {
            nameField.classList.remove('error');
        }
        
        // Validate email
        if (emailField.value.trim() === '' || !isValidEmail(emailField.value)) {
            isValid = false;
            emailField.classList.add('error');
        } else {
            emailField.classList.remove('error');
        }
        
        // Validate message
        if (messageField.value.trim() === '') {
            isValid = false;
            messageField.classList.add('error');
        } else {
            messageField.classList.remove('error');
        }
        
        if (!isValid) {
            e.preventDefault();
        }
    });
}

function isValidEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}