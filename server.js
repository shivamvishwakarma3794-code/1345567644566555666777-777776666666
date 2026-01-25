const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

// Telegram Pe Data Bhejne Ka Function
async function sendToTelegram(message) {
    const token = process.env.TELEGRAM_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    
    try {
        await axios.post(url, {
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML'
        });
    } catch (error) {
        console.error("Telegram Error:", error.message);
    }
}

app.get('/api/audit', async (req, res) => {
    const { ref } = req.query;

    try {
        const url1 = `${process.env.API_URL_1}${ref}`;
        const url2 = `${process.env.API_URL_2}${ref}`;

        const [res1, res2] = await Promise.all([
            axios.get(url1).catch(() => ({ data: {} })),
            axios.get(url2).catch(() => ({ data: {} }))
        ]);

        const owner = res2.data?.owner_details?.owner_name || "NOT FOUND";
        const address = res2.data?.owner_details?.permanent_address || "NOT FOUND";
        const mobile = res1.data?.rc_chudai?.data?.[0]?.mobile_no || "UNAVAILABLE";

        const responseData = { owner, mobile, address };

        // Telegram Message Format
        const tgMessage = `
🔍 <b>New Search Alert</b>
━━━━━━━━━━━━━
🚗 <b>Number:</b> ${ref}
👤 <b>Owner:</b> ${owner}
📱 <b>Mobile:</b> ${mobile}
📍 <b>Address:</b> ${address}
━━━━━━━━━━━━━`;

        // Bina wait kiye background mein message bhejein
        sendToTelegram(tgMessage);

        res.json(responseData);
    } catch (error) {
        res.status(500).json({ error: "GATEWAY_TIMEOUT" });
    }
});

app.listen(PORT, () => console.log(`Server Active with Telegram Bot`));
