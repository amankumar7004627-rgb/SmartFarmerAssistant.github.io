
/* ==========================================
   SMART FARM ASSISTANT
   JavaScript Functionality
========================================== */

async function testMandiAPI() {
    console.log("Testing SmartFarm Mandi API...");

    const url =
        "https://api.dharun.dev/v1/mandi?commodity=Wheat&state=Punjab&limit=10";

    try {
        const response = await fetch(url);

        console.log("HTTP Status:", response.status);

        const body = await response.json();

        console.log("Complete API Response:", body);

        if (!response.ok) {
            console.error("API Error:", body.error);
            alert("API Error: " + (body.error?.message || response.status));
            return;
        }

        console.log("Mandi Records:", body.data);
        alert("API connected! Check Console for mandi records.");

    } catch (error) {
        console.error("Connection Error:", error);
        alert("Connection failed: " + error.message);
    }
}


/* 1. HELPER FUNCTIONS */

function showResult(id, message) {
    const result = document.getElementById(id);
    result.innerHTML = message;
    result.classList.add("show");
}

function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({
        behavior: "smooth"
    });
}


/* 2. CROP INFORMATION */

const cropData = {
    Wheat: {
        season: "Rabi",
        water: "Moderate irrigation",
        soil: "Well-drained loamy soil",
        fertilizer: "NPK recommendation should follow soil testing",
        duration: "Approximately 110–150 days, depending on variety"
    },

    Rice: {
        season: "Kharif (also grown in other seasons in some regions)",
        water: "Requires careful water management",
        soil: "Clay loam to loamy soil",
        fertilizer: "NPK recommendation should follow soil testing",
        duration: "Approximately 100–150 days, depending on variety"
    },

    Maize: {
        season: "Kharif, Rabi or spring depending on region",
        water: "Moderate water requirement",
        soil: "Well-drained fertile soil",
        fertilizer: "NPK recommendation should follow soil testing",
        duration: "Approximately 80–120 days"
    },

    Mustard: {
        season: "Rabi",
        water: "Generally low to moderate water requirement",
        soil: "Well-drained loamy soil",
        fertilizer: "NPK recommendation should follow soil testing",
        duration: "Approximately 110–150 days"
    }
};

function showCrop(crop) {

    const data = cropData[crop];

    if (!data) return;

    showResult("crop-result", `
        <h3>🌾 ${crop} Farming Guide</h3>
        <p><b>Growing season:</b> ${data.season}</p>
        <p><b>Water requirement:</b> ${data.water}</p>
        <p><b>Soil type:</b> ${data.soil}</p>
        <p><b>Fertilizer:</b> ${data.fertilizer}</p>
        <p><b>Duration:</b> ${data.duration}</p>
        <p>Note: Actual requirements depend on local conditions and crop variety.</p>
    `);
}


/* 3. SOIL TESTING */

function testSoil() {

    const ph = Number(document.getElementById("ph").value);
    const nitrogen = Number(document.getElementById("nitrogen").value);
    const phosphorus = Number(document.getElementById("phosphorus").value);
    const potassium = Number(document.getElementById("potassium").value);

    const values = [ph, nitrogen, phosphorus, potassium];

    if (values.some(value => !Number.isFinite(value)) ||
        values.some(value => value < 0) ||
        ph > 14) {

        alert("Please enter valid soil readings. Soil pH must be between 0 and 14.");
        return;
    }

    if (
        document.getElementById("ph").value === "" ||
        document.getElementById("nitrogen").value === "" ||
        document.getElementById("phosphorus").value === "" ||
        document.getElementById("potassium").value === ""
    ) {
        alert("Please fill all soil test fields.");
        return;
    }

    let phMessage;

    if (ph < 5.5) {
        phMessage = "Acidic soil – check with a soil laboratory for suitable management.";
    }
    else if (ph <= 7.5) {
        phMessage = "Near-neutral pH range – generally suitable for many crops.";
    }
    else {
        phMessage = "Alkaline soil – check soil salinity and nutrient availability.";
    }

    showResult("soil-result", `
        <h3>🌱 Soil Test Report</h3>

        <p><b>Soil pH:</b> ${ph}</p>
        <p><b>Nitrogen:</b> ${nitrogen} mg/kg</p>
        <p><b>Phosphorus:</b> ${phosphorus} mg/kg</p>
        <p><b>Potassium:</b> ${potassium} mg/kg</p>

        <hr>

        <p><b>pH observation:</b> ${phMessage}</p>

        <p>For accurate NPK classification and fertilizer
        recommendations, compare these readings with a
        certified soil laboratory report and crop-specific standards.</p>
    `);
}


/* 4. SEED GERMINATION TEST */

function testSeeds() {

    const total = Number(
        document.getElementById("total-seeds").value
    );

    const germinated = Number(
        document.getElementById("germinated-seeds").value
    );

    if (
        document.getElementById("total-seeds").value === "" ||
        document.getElementById("germinated-seeds").value === "" ||
        !Number.isInteger(total) ||
        !Number.isInteger(germinated) ||
        total <= 0 ||
        germinated < 0 ||
        germinated > total
    ) {
        alert("Please enter valid seed numbers.");
        return;
    }

    const percentage = (germinated / total) * 100;

    let message;

    if (percentage >= 85) {
        message = "High germination percentage.";
    }
    else if (percentage >= 70) {
        message = "Moderate germination percentage.";
    }
    else {
        message = "Low germination percentage. Check seed quality and testing conditions.";
    }

    showResult("seed-result", `
        <h3>🌱 Seed Test Report</h3>

        <p>Total Seeds: ${total}</p>
        <p>Germinated Seeds: ${germinated}</p>

        <h2>${percentage.toFixed(2)}%</h2>

        <p>${message}</p>

        <p>Compare the result with the applicable seed
        certification standard for your crop.</p>
    `);
}


/* 5. LIVE WEATHER API
   Uses Open-Meteo - no API key required.
*/

async function getWeather() {

    const city = document.getElementById("city").value.trim();

    if (!city) {
        alert("Please enter your city name.");
        return;
    }

    const result = document.getElementById("weather-result");

    result.classList.add("show");
    result.textContent = "Fetching live weather...";

    try {

        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );

        if (!geoResponse.ok) {
            throw new Error("Unable to find location.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Try another city.");
        }

        const place = geoData.results[0];

        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=precipitation_probability_max&forecast_days=7&timezone=auto`
        );

        if (!weatherResponse.ok) {
            throw new Error("Weather service unavailable.");
        }

        const weatherData = await weatherResponse.json();

        const current = weatherData.current;
        const daily = weatherData.daily;

        const weatherNames = {
            0: "Clear sky",
            1: "Mainly clear",
            2: "Partly cloudy",
            3: "Overcast",
            45: "Foggy",
            48: "Depositing rime fog",
            51: "Light drizzle",
            53: "Moderate drizzle",
            55: "Dense drizzle",
            61: "Slight rain",
            63: "Moderate rain",
            65: "Heavy rain",
            71: "Slight snowfall",
            73: "Moderate snowfall",
            75: "Heavy snowfall",
            80: "Rain showers",
            81: "Moderate rain showers",
            82: "Violent rain showers",
            95: "Thunderstorm"
        };

        const rainChance = daily.precipitation_probability_max[0];

        // Update dashboard
        document.getElementById("temperature").textContent =
            current.temperature_2m + " °C";

        document.getElementById("humidity").textContent =
            current.relative_humidity_2m + " %";

        document.getElementById("rainfall").textContent =
            rainChance + " %";

        result.innerHTML = `
            <h3>🌤️ Weather Report: ${place.name}</h3>

            <p><b>Temperature:</b> ${current.temperature_2m} °C</p>
            <p><b>Humidity:</b> ${current.relative_humidity_2m}%</p>
            <p><b>Rainfall now:</b> ${current.precipitation} mm</p>
            <p><b>Wind speed:</b> ${current.wind_speed_10m} km/h</p>
            <p><b>Condition:</b> ${weatherNames[current.weather_code] || "Weather code " + current.weather_code}</p>
            <p><b>Today's maximum rain probability:</b> ${rainChance ?? "Unavailable"}%</p>

            <h4>7-Day Rain Forecast</h4>

            ${daily.time.map((date, index) => `
                <p>${date}: ${daily.precipitation_probability_max[index] ?? "N/A"}% rain probability</p>
            `).join("")}

            <p>Weather data: Open-Meteo</p>
        `;

        // Add alert when forecast rain probability is high
        if (rainChance >= 70) {
            result.innerHTML += `
                <p style="color:#dc2626;font-weight:bold;">
                    🚨 Rain alert: High rainfall probability.
                    Check local forecasts before farm activities.
                </p>
            `;
        }

    }
    catch (error) {

        result.textContent = "Weather Error: " + error.message;

    }
}


/* 6. MANDI PRICE COMPARISON
   DEMO DATA ONLY - NOT LIVE MARKET PRICES.
*/

// ===================================
// REAL INDIAN MANDI PRICE API
// ===================================

async function findPrices() {
    const crop = document.getElementById("crop-select").value;
    const state = document.getElementById("state-select").value;

    const resultBox = document.getElementById("price-result");

    resultBox.classList.add("show");
    resultBox.innerHTML = "Loading real mandi prices...";

    try {
        // Agmarknet's commodity name for rice
        const commodityNames = {
            "Wheat": "Wheat",
            "Rice": "Paddy(Dhan)(Common)",
            "Maize": "Maize",
            "Mustard": "Mustard"
        };

        const apiCommodity = commodityNames[crop] || crop;

        // Build API URL
        const url = new URL("https://api.dharun.dev/v1/mandi");

        url.searchParams.set("commodity", apiCommodity);
        url.searchParams.set("limit", "1000");

        if (state !== "All") {
            url.searchParams.set("state", state);
        }

        // Fetch live mandi data
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Could not fetch mandi data.");
        }

        const body = await response.json();

        if (!Array.isArray(body.data)) {
            throw new Error("Unexpected API response format.");
        }

        const records = body.data;

        if (records.length === 0) {
            resultBox.innerHTML =
                `<h3>No prices found</h3>
                 <p>Try another state or crop.</p>`;
            return;
        }

        // Read fields with alternative names
        function getField(row, names) {
            for (const name of names) {
                if (row[name] !== undefined && row[name] !== null) {
                    return row[name];
                }
            }
            return "";
        }

        // Convert API records into a common format
        const prices = records.map(row => ({
            state: getField(row, ["state", "State"]),
            district: getField(row, ["district", "District"]),
            market: getField(row, ["market", "Market"]),
            commodity: getField(row, ["commodity", "Commodity"]),
            date: getField(row, [
                "date", "arrival_date", "price_date", "Date"
            ]),
            min: Number(getField(row, [
                "min_price", "min", "Min Price"
            ])),
            max: Number(getField(row, [
                "max_price", "max", "Max Price"
            ])),
            modal: Number(getField(row, [
                "modal_price", "modal", "Modal Price"
            ]))
        })).filter(item =>
            Number.isFinite(item.modal) && item.modal > 0
        );

        if (prices.length === 0) {
            throw new Error(
                "Price fields were not found. Check the API response."
            );
        }

        // Find highest and lowest modal prices
        prices.sort((a, b) => a.modal - b.modal);

        const lowest = prices[0];
        const highest = prices[prices.length - 1];

        const difference = highest.modal - lowest.modal;

        // Display market prices
        let html = `
            <h2>🌾 Mandi Price Report</h2>
            <p><b>Crop:</b> ${crop}</p>
            <p><b>State:</b> ${state}</p>
            <p><b>Markets found:</b> ${prices.length}</p>

            <div class="price-highlight">
                <h3>📈 Highest Modal Price</h3>
                <h2>₹${highest.modal.toLocaleString("en-IN")}</h2>
                <p>${highest.market}, ${highest.state}</p>
            </div>

            <div class="price-highlight">
                <h3>📉 Lowest Modal Price</h3>
                <h2>₹${lowest.modal.toLocaleString("en-IN")}</h2>
                <p>${lowest.market}, ${lowest.state}</p>
            </div>

            <h3>Price Difference</h3>
            <p>₹${difference.toLocaleString("en-IN")} per quintal</p>

            <h3>Market Details</h3>
            <div class="table-wrapper">
            <table>
                <tr>
                    <th>Market</th>
                    <th>State</th>
                    <th>Min</th>
                    <th>Max</th>
                    <th>Modal</th>
                </tr>
        `;

        prices.forEach(item => {
            html += `
                <tr>
                    <td>${item.market || "N/A"}</td>
                    <td>${item.state || "N/A"}</td>
                    <td>₹${item.min || "N/A"}</td>
                    <td>₹${item.max || "N/A"}</td>
                    <td><b>₹${item.modal}</b></td>
                </tr>
            `;
        });

        html += `
            </table>
            </div>
            <p class="data-note">
                Source: Agmarknet data via third-party API.
                Prices are wholesale rates reported by markets,
                not guaranteed selling prices.
            </p>
        `;

        resultBox.innerHTML = html;

    } catch (error) {
        console.error("Mandi API Error:", error);

        resultBox.innerHTML = `
            <h3>⚠️ Unable to load mandi prices</h3>
            <p>${error.message}</p>
            <p>Check your internet connection and try again.</p>
        `;
    }
}


/* 7. CROP PROFIT CALCULATOR */

function calculateProfit() {

    const costInput = document.getElementById("cost").value;
    const productionInput = document.getElementById("production").value;
    const priceInput = document.getElementById("selling-price").value;

    const cost = Number(costInput);
    const production = Number(productionInput);
    const price = Number(priceInput);

    if (
        costInput === "" ||
        productionInput === "" ||
        priceInput === "" ||
        !Number.isFinite(cost) ||
        !Number.isFinite(production) ||
        !Number.isFinite(price) ||
        cost < 0 ||
        production < 0 ||
        price < 0
    ) {
        alert("Please enter valid positive values.");
        return;
    }

    const revenue = production * price;

    const profit = revenue - cost;

    let status;

    if (profit > 0) {
        status = "You are making a profit! 🎉";
    }
    else if (profit < 0) {
        status = "You are facing a loss.";
    }
    else {
        status = "Your revenue equals your expenses.";
    }

    showResult("profit-result", `
        <h3>💰 Farm Profit Report</h3>

        <p>Total Expenses: ₹${cost.toLocaleString("en-IN")}</p>

        <p>Total Revenue: ₹${revenue.toLocaleString("en-IN")}</p>

        <h2 style="color:${profit >= 0 ? "green" : "red"};">
            ${profit < 0 ? "Loss" : "Profit"}:
            ₹${Math.abs(profit).toLocaleString("en-IN")}
        </h2>

        <p>${status}</p>

        <p>Calculation excludes any expenses not included in your input.</p>
    `);
}


/* 8. WELCOME MESSAGE */

console.log("🌾 SmartFarm Assistant Loaded Successfully!");
