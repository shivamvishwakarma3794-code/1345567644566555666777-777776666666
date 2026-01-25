const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/api/audit', async (req, res) => {
    const { ref } = req.query;
    if (!ref) return res.status(400).json({ error: "No reference provided" });

    try {
        // Render ke Environment Variables se URLs fetch honge
        const url1 = `${process.env.API_URL_1}${ref}`;
        const url2 = `${process.env.API_URL_2}${ref}`;

        const [res1, res2] = await Promise.all([
            axios.get(url1).catch(() => ({ data: {} })),
            axios.get(url2).catch(() => ({ data: {} }))
        ]);

        res.json({
            entity: res2.data.owner_name || "NOT_FOUND",
            cid: res1.data.mobile_no || "UNAVAILABLE",
            loc: res2.data.permanent_address || "NO RECORD"
        });
    } catch (error) {
        res.status(500).json({ error: "Gateway Interrupted" });
    }
});

app.listen(PORT, () => console.log(`Server active on ${PORT}`));
