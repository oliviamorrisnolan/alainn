const ctx = document.getElementById('sorbetChart').getContext('2d');

// Retrieve saved production data from localStorage, or use default values if no data is available
const currentProduction = JSON.parse(localStorage.getItem('newProduction')) || { Acai: 0, Pitaya: 0, Mango: 0, Oceania: 0 };

// Set target production values
const targetProduction = {
    Acai: 150,
    Pitaya: 120,
    Mango: 150,
    Oceania: 100
};

// Define base colors for each flavor
const baseColors = {
    Acai: '#5e2b97',       // Deep Purple
    Pitaya: '#ec407a',     // Vibrant Pink
    Mango: '#ffca28',      // Yellow
    Oceania: '#26a69a'     // Teal
};

// Define lighter colors for when the production exceeds the target
const lightColors = {
    Acai: '#9b6fbb',       // Lighter Purple
    Pitaya: '#f8a5c2',     // Lighter Pink
    Mango: '#ffe082',      // Lighter Yellow
    Oceania: '#80cbc4'     // Lighter Teal
};

// Arrays to hold base and light colors for the stacked bars
const baseColorStack = [];
const lightColorStack = [];

// Generate the base and light color stacks dynamically for each fruit
Object.keys(currentProduction).forEach(fruit => {
    const currentValue = currentProduction[fruit];
    const targetValue = targetProduction[fruit];

    const aboveTarget = currentValue > targetValue ? currentValue - targetValue : 0;
    const belowTarget = currentValue > targetValue ? targetValue : currentValue;

    baseColorStack.push(belowTarget);
    lightColorStack.push(aboveTarget);
});

// Calculate missing production
const missingProduction = {};
Object.keys(currentProduction).forEach(fruit => {
    const missing = targetProduction[fruit] - currentProduction[fruit];
    missingProduction[fruit] = missing > 0 ? missing : 0;
});

// Build dashed target lines for each flavor dynamically
const annotations = {};
Object.keys(targetProduction).forEach((fruit, index) => {
    annotations[`targetLine${index}`] = {
        type: 'line',
        yMin: targetProduction[fruit],
        yMax: targetProduction[fruit],
        xMin: index - 0.35,
        xMax: index + 0.35,
        borderColor: '#666666',
        borderWidth: 1.5,
        borderDash: [4, 4]
    };
});

// Create the chart
new Chart(ctx, {
    type: 'bar',
    data: {
        labels: Object.keys(currentProduction),
        datasets: [
            {
                label: 'Base Production (Units)',
                data: baseColorStack,
                backgroundColor: [
                    baseColors.Acai, 
                    baseColors.Pitaya, 
                    baseColors.Mango, 
                    baseColors.Oceania
                ],
                stack: 'combined'
            },
            {
                label: 'Above Target Production (Units)',
                data: lightColorStack,
                backgroundColor: [
                    lightColors.Acai, 
                    lightColors.Pitaya, 
                    lightColors.Mango, 
                    lightColors.Oceania
                ],
                stack: 'combined'
            },
            {
                label: 'Missing to Target (Units)',
                data: Object.values(missingProduction),
                backgroundColor: '#eeeeee',  // Light grey for missing production
                stack: 'combined'
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
            },
            annotation: {
                annotations: annotations
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
