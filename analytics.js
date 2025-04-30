document.addEventListener('DOMContentLoaded', function () {
    const applyFilterButton = document.getElementById('apply-filter');

    if (applyFilterButton) {
        applyFilterButton.addEventListener('click', function () {
            const startDate = document.getElementById('start-date').value;
            const endDate = document.getElementById('end-date').value;
            const flavour = document.getElementById('flavour').value;

            if (!startDate || !endDate) {
                alert("Please select both a start and end date.");
                return;
            }

            // Fetch production data from the server
            fetch(`http://localhost:3000/get-production?startDate=${startDate}&endDate=${endDate}&flavour=${flavour}`)
                .then(response => response.json())  // Expecting a JSON response
                .then(data => {
                    console.log('Raw Data:', data);  // Log the raw response from the backend

                    const labels = [];
                    const productionData = [];

                    // Create an object to store total production per specific date (YYYY-MM-DD format)
                    const productionByDate = {};

                    // Loop through the data and aggregate by date
                    data.forEach(row => {
                        const rowDate = new Date(row.date).toISOString().split('T')[0];  // Convert to YYYY-MM-DD format
                        const production = parseInt(row.production);  // Convert production to a number

                        // Log each row data to verify the structure
                        console.log('Row Data:', row);

                        // Initialize the date's production if not already present
                        if (!productionByDate[rowDate]) {
                            productionByDate[rowDate] = 0;
                        }

                        // Aggregate the production data for each flavour
                        if (flavour === 'all') {
                            // For 'all' flavours, sum all the production values (acai, pitaya, mango, oceania)
                            productionByDate[rowDate] += (parseInt(row.acai) || 0) + (parseInt(row.pitaya) || 0) + (parseInt(row.mango) || 0) + (parseInt(row.oceania) || 0);
                        } else {
                            // For specific flavours, sum only the selected flavour's production
                            productionByDate[rowDate] += production || 0;
                        }
                    });

                    // Debug: Check the aggregated data
                    console.log('Aggregated Data:', productionByDate);

                    // Prepare the labels (days of the week) and production data for the chart
                    for (const [date, totalProduction] of Object.entries(productionByDate)) {
                        // Get the day of the week
                        const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
                        labels.push(dayOfWeek);  // Add the day of the week (e.g., "Monday", "Tuesday")
                        productionData.push(totalProduction);  // Add the total production for that date
                    }

                    // Debug: Check the processed data before passing to the chart
                    console.log('Processed Data (productionData):', productionData);
                    console.log('Processed Labels (days of the week):', labels);

                    // Determine bar colors based on the selected flavour
                    let barColor;
                    switch(flavour) {
                        case 'acai':
                            barColor = '#6A0DAD';  // Deep Purple for Acai
                            break;
                        case 'pitaya':
                            barColor = '#FF007F';  // Vibrant Pink for Pitaya
                            break;
                        case 'mango':
                            barColor = '#FFCC00';  // Yellow for Mango
                            break;
                        case 'oceania':
                            barColor = '#008B8B';  // Teal for Oceania
                            break;
                        default:
                            barColor = '#f15c22';  // Default to Álainn Orange if 'all' is selected or no flavour
                            break;
                    }

                    // Create or update the chart with the processed data
                    createChart(productionData, labels, barColor);  // Pass the processed data and bar color
                })
                .catch(error => {
                    console.error('Error fetching production data:', error);
                    alert("Error fetching production data.");
                });
        });
    }

    // Create chart function
    function createChart(data, labels, barColor) {
        const ctx = document.getElementById('analyticsChart').getContext('2d');

        // If a chart already exists, destroy it
        if (window.chartInstance) {
            window.chartInstance.destroy();
        }

        // Create a new chart
        window.chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,  // Labels (days of the week)
                datasets: [{
                    label: 'Production by Day',
                    data: data,  // Production values for each day
                    backgroundColor: barColor,  // Dynamically set the bar color
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: { ticks: { color: '#333' } },
                    y: { 
                        ticks: { 
                            color: '#333', 
                            beginAtZero: true, 
                            stepSize: 10 
                        },
                        title: { display: true, text: 'Units Produced' }
                    }
                }
            }
        });
    }
});
