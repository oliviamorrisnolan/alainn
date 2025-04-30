document.addEventListener('DOMContentLoaded', function () {
    const titleElement = document.getElementById('weekTitle');  // The title element for the graph
    const nextWeekButton = document.getElementById('nextWeekButton');  // The next week button
    const previousWeekButton = document.getElementById('previousWeekButton');  // The previous week button

    let currentDate = new Date();

    // Automatically calculate start and end date for the current week
    let startOfWeek = getStartOfWeek(currentDate);
    let endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);  // End date is 6 days after the start

    let currentWeekStartDate = formatDate(startOfWeek); // Store the start date of the current week
    let currentWeekEndDate = formatDate(endOfWeek); // Store the end date of the current week

    let currentWeekData = { start: currentWeekStartDate, end: currentWeekEndDate };

    // Update the title for the current week
    updateGraphTitle(currentWeekStartDate, currentWeekEndDate);

    const flavourSelect = document.getElementById('flavour');  // Select input for flavours
    const flavour = flavourSelect ? flavourSelect.value : 'all';  // Default to 'all' if no flavour is selected

    // Fetch production data for the current week
    fetchProductionData(currentWeekData.start, currentWeekData.end, flavour);

    // Event listener for the Previous Week Button
    if (previousWeekButton) {
        previousWeekButton.addEventListener('click', function () {
            // Calculate the previous week's start and end date
            startOfWeek = new Date(startOfWeek);
            startOfWeek.setDate(startOfWeek.getDate() - 7); // Move back 7 days to the previous week

            endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6); // The previous week's end date is 6 days after the start

            currentWeekStartDate = formatDate(startOfWeek);
            currentWeekEndDate = formatDate(endOfWeek);

            currentWeekData = { start: currentWeekStartDate, end: currentWeekEndDate };

            // Update the title for the previous week
            updateGraphTitle(currentWeekStartDate, currentWeekEndDate);

            // Fetch production data for the previous week
            fetchProductionData(currentWeekData.start, currentWeekData.end, flavour);
        });
    }

    // Event listener for the Next Week Button
    if (nextWeekButton) {
        nextWeekButton.addEventListener('click', function () {
            // Calculate the next week's start and end date
            startOfWeek = new Date(startOfWeek);
            startOfWeek.setDate(startOfWeek.getDate() + 7); // Move forward 7 days to the next week

            endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6); // The next week's end date is 6 days after the start

            currentWeekStartDate = formatDate(startOfWeek);
            currentWeekEndDate = formatDate(endOfWeek);

            currentWeekData = { start: currentWeekStartDate, end: currentWeekEndDate };

            // Update the title for the next week
            updateGraphTitle(currentWeekStartDate, currentWeekEndDate);

            // Fetch production data for the next week
            fetchProductionData(currentWeekData.start, currentWeekData.end, flavour);
        });
    }

    // Fetch production data from the server based on the date range
    function fetchProductionData(startDate, endDate, flavour) {
        // Fetch production data for the specified week and flavour
        fetch(`http://localhost:3000/get-production?startDate=${startDate}&endDate=${endDate}&flavour=${flavour}`)
            .then(response => response.json())  // Expecting JSON response from the server
            .then(data => {
                console.log('Fetched Data:', data);  // Log the raw response from the backend

                // Initialize arrays to store production data for each flavour
                const labels = [];  // To store days of the week
                const acaiData = []; // To store Acai production data per day
                const pitayaData = []; // To store Pitaya production data per day
                const mangoData = []; // To store Mango production data per day
                const oceaniaData = []; // To store Oceania production data per day

                // Create an object to store total production per specific date (YYYY-MM-DD format)
                const productionByDate = {};

                // Loop through the data and aggregate by date
                data.forEach(row => {
                    // Log the row to ensure we're capturing all relevant data
                    console.log('Processing Row:', row);

                    const rowDate = new Date(row.date).toISOString().split('T')[0];  // Convert to YYYY-MM-DD format
                    const acaiProduction = parseInt(row.acai);  // Acai production value
                    const pitayaProduction = parseInt(row.pitaya);  // Pitaya production value
                    const mangoProduction = parseInt(row.mango);  // Mango production value
                    const oceaniaProduction = parseInt(row.oceania);  // Oceania production value

                    // Initialize the date's production if not already present
                    if (!productionByDate[rowDate]) {
                        productionByDate[rowDate] = { acai: 0, pitaya: 0, mango: 0, oceania: 0 };
                    }

                    // Aggregate the production data for each flavour
                    productionByDate[rowDate].acai += acaiProduction;
                    productionByDate[rowDate].pitaya += pitayaProduction;
                    productionByDate[rowDate].mango += mangoProduction;
                    productionByDate[rowDate].oceania += oceaniaProduction;
                });

                console.log('Aggregated Data:', productionByDate);  // Check the aggregated data

                // Prepare the labels (days of the week) and production data for each flavour
                for (const [date, totalProduction] of Object.entries(productionByDate)) {
                    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
                    labels.push(dayOfWeek);  // Add the day of the week (e.g., "Monday", "Tuesday")
                    acaiData.push(totalProduction.acai);
                    pitayaData.push(totalProduction.pitaya);
                    mangoData.push(totalProduction.mango);
                    oceaniaData.push(totalProduction.oceania);
                }

                console.log('Processed Data (acaiData):', acaiData);  // Check the processed data before passing to the chart
                console.log('Processed Labels (days of the week):', labels);  // Check the labels

                // Create or update the chart with the processed data
                createChart(acaiData, pitayaData, mangoData, oceaniaData, labels);
            })
            .catch(error => {
                console.error('Error fetching production data:', error);
                alert("Error fetching production data.");
            });
    }

    // Create stacked bar chart function
    function createChart(acaiData, pitayaData, mangoData, oceaniaData, labels) {
        const ctx = document.getElementById('sorbetChart').getContext('2d');

        // If a chart already exists, destroy it
        if (window.chartInstance) {
            window.chartInstance.destroy();
        }

        // Create a new chart with stacked bars
        window.chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,  // Labels (days of the week)
                datasets: [
                    {
                        label: 'Acai',
                        data: acaiData,  // Acai production values for each day
                        backgroundColor: '#6A0DAD',  // Deep Purple for Acai
                    },
                    {
                        label: 'Pitaya',
                        data: pitayaData,  // Pitaya production values for each day
                        backgroundColor: '#FF007F',  // Vibrant Pink for Pitaya
                    },
                    {
                        label: 'Mango',
                        data: mangoData,  // Mango production values for each day
                        backgroundColor: '#FFCC00',  // Yellow for Mango
                    },
                    {
                        label: 'Oceania',
                        data: oceaniaData,  // Oceania production values for each day
                        backgroundColor: '#008B8B',  // Teal for Oceania
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,  // Allow manual control of the chart's aspect ratio
                plugins: {
                    legend: {
                        labels: {
                            color: '#333',
                            font: {
                                family: 'Poppins'
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        ticks: {
                            color: '#333'
                        }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: {
                            color: '#333'
                        }
                    }
                }
            }
        });
    }

    // Helper function to get the start of the current week (Sunday)
    function getStartOfWeek(date) {
        const day = date.getDay(),
              diff = date.getDate() - day; // Get the start date (Sunday)
        return new Date(date.setDate(diff));
    }

    // Helper function to format a date to 'YYYY-MM-DD'
    function formatDate(date) {
        const yyyy = date.getFullYear();
        let mm = date.getMonth() + 1; // Months are 0-indexed
        let dd = date.getDate();
        if (mm < 10) mm = '0' + mm;
        if (dd < 10) dd = '0' + dd;
        return `${yyyy}-${mm}-${dd}`;  // Return date in 'YYYY-MM-DD' format
    }

    // Helper function to update the title of the graph
    function updateGraphTitle(startDate, endDate) {
        titleElement.textContent = `Sorbets Production - Week of ${startDate} to ${endDate}`;
    }
});
