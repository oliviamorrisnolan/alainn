const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const Papa = require('papaparse');
const cors = require('cors');

const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON data in POST request bodies
app.use(bodyParser.json());

// Path to CSV file where production data is saved
const dataFilePath = path.join(__dirname, 'production_data_april_2025.csv');

// POST route for adding production data
app.post('/add-production', (req, res) => {
    // Log the request body to verify it's coming through
    console.log('POST request received at /add-production');
    console.log('Request Body:', req.body);

    const { date, flavour, production } = req.body;

    // Check if the required fields are missing
    if (!date || !flavour || !production) {
        return res.status(400).send('Missing required fields');
    }

    // Prepare data to append to CSV
    const newData = [{ date, flavour, production }];
    const csv = Papa.unparse(newData);

    // Log the CSV data that will be appended
    console.log('CSV Data to be appended:', csv);

    // Append to CSV file
    fs.appendFile(dataFilePath, csv + '\n', (err) => {
        if (err) {
            console.error('Error saving data:', err);
            return res.status(500).send('Error saving production data.');
        }
        console.log('Data saved successfully!');
        res.status(200).send('Production data saved.');
    });
});
// API to get production data (GET)
app.get('/get-production', (req, res) => {
    const { startDate, endDate, flavour } = req.query;

    console.log(`Received GET request with params - startDate: ${startDate}, endDate: ${endDate}, flavour: ${flavour}`);

    // Read the production data from the CSV file
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading data file:', err);
            return res.status(500).send('Error retrieving production data.');
        }

        // Parse CSV data
        const parsedData = Papa.parse(data, { header: true, skipEmptyLines: true }).data;

        console.log('Parsed Data:', parsedData); // Log parsed data to verify it's being read correctly

        // Create an object to aggregate production by date and flavour
        const aggregatedData = {};

        parsedData.forEach(row => {
            const rowDate = row.date;
            const rowFlavour = row.flavour.toLowerCase(); // Case-insensitive flavour comparison
            const rowProduction = parseInt(row.production) || 0; // Ensure it's a number

            if (!aggregatedData[rowDate]) {
                aggregatedData[rowDate] = { acai: 0, pitaya: 0, mango: 0, oceania: 0 };
            }

            // Aggregate the production for each flavour on this date
            if (rowFlavour === 'acai') {
                aggregatedData[rowDate].acai += rowProduction;
            } else if (rowFlavour === 'pitaya') {
                aggregatedData[rowDate].pitaya += rowProduction;
            } else if (rowFlavour === 'mango') {
                aggregatedData[rowDate].mango += rowProduction;
            } else if (rowFlavour === 'oceania') {
                aggregatedData[rowDate].oceania += rowProduction;
            }
        });

        console.log('Aggregated Data:', aggregatedData); // Log aggregated data for debugging

        // Filter the aggregated data based on the date range and flavour
        const filteredData = [];

        // Convert start and end date from strings to Date objects
        const start = new Date(startDate);
        const end = new Date(endDate);

        Object.entries(aggregatedData).forEach(([date, flavours]) => {
            const rowDate = new Date(date);  // Convert row date to Date object
            const withinDateRange = rowDate >= start && rowDate <= end;

            if (withinDateRange) {
                if (flavour === 'all') {
                    // If 'flavour' is 'all', return all flavours for the date
                    filteredData.push({ date: rowDate, ...flavours });
                } else if (flavours[flavour.toLowerCase()]) {
                    // If a specific flavour is requested, return the production for that flavour
                    filteredData.push({ date: rowDate, flavour, production: flavours[flavour.toLowerCase()] });
                }
            }
        });

        console.log('Filtered Data:', filteredData); // Check if data is filtered correctly

        res.json(filteredData);  // Send the filtered data to the frontend
    });
});


// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

