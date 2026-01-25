const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/api/audit', async (req, res) => {
    const { ref } = req.query;
    console.log("Fetching details for:", ref);

    try {
        const url1 = `${process.env.API_URL_1}${ref}`;
        const url2 = `${process.env.API_URL_2}${ref}`;

        // Dono APIs ko parallel call karna
        const [res1, res2] = await Promise.all([
            axios.get(url1).catch(() => ({ data: {} })),
            axios.get(url2).catch(() => ({ data: {} }))
        ]);

        // Exact Field Extraction
        const responseData = {
            owner: res2.data?.owner_name || "NOT FOUND",
            address: res2.data?.permanent_address || "NOT FOUND",
            mobile: res1.data?.mobile_no || res1.data?.Mobile_no || "UNAVAILABLE"
        };

        res.json(responseData);
    } catch (error) {
        res.status(500).json({ error: "API_TIMEOUT" });
    }
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
