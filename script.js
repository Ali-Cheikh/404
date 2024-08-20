const scriptURL = 'https://script.google.com/macros/s/AKfycbwmjZcAzNnR_B7X6t7nZdxNaaEefG3WrcHXecgyfqbpd2mbvVJhlyK3FY3fMH6yUqfk/exec';

$(document).ready(function () {
    // Initialize the carousel
    $('.carousel').slick({
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2200,
        pauseOnHover: true,
        arrows: true,
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    });

    // Handle contact form submission
    $('#contact-form').on('submit', function (e) {
        e.preventDefault();

        // Gather and store registration data
        const registrationData = {
            name: $('#name').val(),
            email: $('#email').val(),
            phone: $('#phone').val(),
            comments: $('#comments').val()
        };
        sessionStorage.setItem('registrationData', JSON.stringify(registrationData));

        // Switch to payment method form
        toggleForms('registration-form', 'payment-method-form');
    });

    // Handle payment method selection
    $('input[name="payment-method"]').on('change', function () {
        const selectedMethod = $(this).val();
        const methodDetails = {
            'qr-code': 'Please scan the QR code in your paying app to proceed with the payment process.',
            'bank-transfer': 'Please enter your bank RIB to verify. The receiving account details will appear after verification.',
            'cash': 'Cash payment selected. No further details required.'
        };

        $('#selected-payment-method').html(`
            <h2>Selected Payment Method: ${selectedMethod}</h2>
            <p>${methodDetails[selectedMethod] || ''}</p>
        `);

        $('#payment-instructions').toggle(selectedMethod === 'cash');
        $('#qr-code').toggle(selectedMethod === 'qr-code');
        $('#bank-transfer').toggle(selectedMethod === 'bank-transfer');
    });

    // Verify bank details
    $('#verify-bank').on('click', function () {
        const rib = $('#bankRib').val();
        if (rib.length === 20) {
            $('#bank-account-details').show();
        } else {
            showError('Bank RIB must be 20 characters long.');
        }
    });

    // Handle payment form submission
    $('#payment-form').on('submit', function (e) {
        e.preventDefault();
        showProcessing();

        // Retrieve registration data and gather payment data
        const registrationData = JSON.parse(sessionStorage.getItem('registrationData'));
        const paymentData = {
            paymentMethod: $('input[name="payment-method"]:checked').val(),
            bankRib: $('#bankRib').val() || ''
        };
        const combinedData = { ...registrationData, ...paymentData };

        // Send data to Google Sheets
        submitData(combinedData);
    });
});

// Function to switch between forms
function toggleForms(hideId, showId) {
    document.getElementById(hideId).style.display = 'none';
    document.getElementById(showId).style.display = 'block';
}

// Function to show processing state
function showProcessing() {
    Swal.fire({
        icon: 'info',
        title: 'Processing...',
        text: 'Please wait while we process your payment.',
        willOpen: () => {
            Swal.showLoading();
        },
        showConfirmButton: false,
        allowOutsideClick: false,
    });
}

// Function to submit data
function submitData(data) {
    fetch(scriptURL, {
        method: 'POST',
        body: new URLSearchParams(data)
    })
    .then(response => response.text())
    .then(result => {
        Swal.close(); // Close the processing alert
        Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Your registration and payment information has been submitted successfully.',
            showConfirmButton : false,
            timer : 3000,
            showProcessing : true
        }).then(() => {
            window.location.href = 'thank-you.html'; // Redirect after successful submission
        });
    })
    .catch(error => {
        Swal.close(); // Close the processing alert
        console.error('Error:', error);
        Swal.fire({
            icon: 'warning',
            title: 'Registration submitted with difficulties',
            text: 'If you are unsure if the submission was successful, please resubmit.',
            showConfirmButton : false,
            timer : 3000,
            showProcessing : true
        });
    });
}


// Function to show error alerts
function showError(message) {
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: message,
        confirmButtonText: 'OK'
    });
}

// Function to go back to registration form
function goBack() {
    toggleForms('payment-method-form', 'registration-form');
}

//=====the image overlay
document.addEventListener('DOMContentLoaded', function() {
    const image = document.getElementById('bank-account-image');
    const ribText = '74108520741085207410';

    // Handle image click
    image.addEventListener('click', function() {
        // Copy RIB to clipboard
        navigator.clipboard.writeText(ribText).then(() => {
            // Show SweetAlert
            Swal.fire({
                icon: 'success',
                title: 'RIB Copied!',
                text: 'The RIB has been copied to your clipboard.',
                showConfirmButton: false,
                timer: 2000,
                position: 'top-center'
            });
        }).catch(err => {
            console.error('Failed to copy: ', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to copy RIB to clipboard.',
                showConfirmButton: false,
                timer: 2000,
                position: 'top-center'
            });
        });
    });

    // Handle overlay click (close overlay)
    overlay.addEventListener('click', function(event) {
        // Ensure only clicks on overlay close it
        if (event.target === overlay) {
            overlay.classList.add('hidden');
        }
    });
});


