window.addEventListener('load', () => {
    const form = document.getElementById('appForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const postalCode = document.getElementById('field3').value;
        
        if (!postalCode.includes('4261')) {
            alert("Vi servicerer kun 4261 Dalmose området. Kontakt os venligst hvis du har spørgsmål.");
            return;
        }
        
        const { data: { user } } = await _supabase.auth.getUser();
        
        const bookingData = {
            user_email: user?.email || 'Anonym',
            field1: document.getElementById('field1').value,
            field2: document.getElementById('field2').value,
            field3: document.getElementById('field3').value,
            field4: document.getElementById('field4').value,
            field5: document.getElementById('field5').value,
            field6: document.getElementById('field6').value,
            status: 'pending'
        };

        try {
            const { error } = await _supabase
                .from('bookings')
                .insert([bookingData]);

            if (error) {
                alert("Der skete en fejl: " + error.message);
            } else {
                alert("Din booking er modtaget!");
                window.location.href = 'index.html';
            }
        } catch (err) {
            console.error("Systemfejl:", err);
            alert("Der skete en uventet fejl. Prøv igen senere.");
        }
    });
});
