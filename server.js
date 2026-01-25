const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/api/audit', async (req, res) => {
    const { ref } = req.query;
    console.log("Inquiry for Subject:", ref);

    try {
        const url1 = `${process.env.API_URL_1}${ref}`;
        const url2 = `${process.env.API_URL_2}${ref}`;

        const [res1, res2] = await Promise.all([
            axios.get(url1).catch(() => ({ data: {} })),
            axios.get(url2).catch(() => ({ data: {} }))
        ]);

        // Exact mapping as per your requirement
        const finalReport = {
            owner: res2.data?.owner_name || "NOT FOUND",
            mobile: res1.data?.Mobile_no || res1.data?.mobile_no || "UNAVAILABLE",
            address: res2.data?.permanent_address || "ADDRESS NOT FOUND"
        };

        console.log("Data Payload Ready.");
        res.json(finalReport);
    } catch (error) {
        res.status(500).json({ error: "GATEWAY ERROR" });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
