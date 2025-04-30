// Function to adjust quantity
function adjustQuantity(id, amount) {
    const input = document.getElementById(id);
    let current = parseInt(input.value) || 0;
    current += amount;
    if (current < 0) current = 0;
    input.value = current;
}

document.getElementById('addProductionForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get entered values
    const acai = parseInt(document.getElementById('acai').value) || 0;
    const pitaya = parseInt(document.getElementById('pitaya').value) || 0;
    const mango = parseInt(document.getElementById('mango').value) || 0;
    const oceania = parseInt(document.getElementById('oceania').value) || 0;

    // Get today's date
    const date = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // Create an array of flavours with their production values
    const flavours = [
        { flavour: 'Acai', production: acai },
        { flavour: 'Pitaya', production: pitaya },
        { flavour: 'Mango', production: mango },
        { flavour: 'Oceania', production: oceania }
    ];

    // Loop through the flavours and send each as a separate request
    flavours.forEach(flavourData => {
        if (flavourData.production > 0) {  // Only send data if the production is greater than 0
            // Prepare the data to send to the backend for each flavour
            const productionData = {
                date,
                flavour: flavourData.flavour,
                production: flavourData.production
            };

            // Send the data to the backend to save in CSV
            fetch('http://localhost:3000/add-production', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productionData)
            })
            .then(response => {
                if (response.ok) {
                    alert(`Production data for ${flavourData.flavour} added successfully!`);
                } else {
                    alert(`Failed to add production data for ${flavourData.flavour}.`);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert(`Error submitting production data for ${flavourData.flavour}.`);
            });
        }
    });

    // Reset the form after submission
    document.getElementById('addProductionForm').reset();
});
