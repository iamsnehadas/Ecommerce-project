document.addEventListener('DOMContentLoaded', () => {
    const payButton = document.querySelector('.pay');
    payButton.addEventListener('click', () => {
        const selectedRadio = document.querySelector('input[name="payment-method"]:checked');
        if (!selectedRadio) {
            alert('Please select a payment method.');
            return;
        }
        const payOption = selectedRadio.value;
        console.log('Processing for:', payOption);
        payButton.innerText = 'Processing Payment...';
        payButton.disabled = true; 
        setTimeout(() => {
            payButton.innerText = 'Paid!';
            setTimeout(() => {
                window.location.href = "confirmation.html"; 
            }, 500); 
        }, 2000); 
    });

});
