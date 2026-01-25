const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/api/audit', async (req, res) => {
    const { ref } = req.query;
    console.log("Searching for:", ref); // Debugging line

    try {
        const url1 = `${process.env.API_URL_1}${ref}`;
        const url2 = `${process.env.API_URL_2}${ref}`;

        const [res1, res2] = await Promise.all([
            axios.get(url1).catch(e => ({ data: {} })),
            axios.get(url2).catch(e => ({ data: {} }))
        ]);

        const finalData = {
            entity: res2.data.owner_name || res2.data.owner || "DATA_NOT_FOUND",
            cid: res1.data.mobile_no || res1.data.phone || "UNAVAILABLE",
            loc: res2.data.permanent_address || res2.data.address || "NO_LOCATION_FOUND"
        };

        console.log("Result Sent:", finalData); // Debugging line
        res.json(finalData);
    } catch (error) {
        console.error("Fetch Error:", error.message);
        res.status(500).json({ error: "GATEWAY_TIMEOUT" });
    }
});

app.listen(PORT, () => console.log(`Server Running on ${PORT}`));
