const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/api/audit', async (req, res) => {
    const { ref } = req.query;
    console.log("Deep Scanning for:", ref);

    try {
        const url1 = `${process.env.API_URL_1}${ref}`;
        const url2 = `${process.env.API_URL_2}${ref}`;

        // Dono APIs call ho rahi hain
        const [res1, res2] = await Promise.all([
            axios.get(url1).catch(() => ({ data: {} })),
            axios.get(url2).catch(() => ({ data: {} }))
        ]);

        // API 1 se mobile nikalna (data array ke andar se)
        const mobile = res1.data?.rc_chudai?.data?.[0]?.mobile_no || "UNAVAILABLE";

        // API 2 se owner aur address nikalna (owner_details object se)
        const owner = res2.data?.owner_details?.owner_name || "NOT FOUND";
        const address = res2.data?.owner_details?.permanent_address || "NOT FOUND";

        const finalOutput = {
            owner: owner,
            mobile: mobile,
            address: address
        };

        console.log("Successfully Matched:", finalOutput.owner);
        res.json(finalOutput);
    } catch (error) {
        console.error("Fetch Error");
        res.status(500).json({ error: "GATEWAY_TIMEOUT" });
    }
});

app.listen(PORT, () => console.log(`Gateway Ready`));
