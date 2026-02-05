const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

// Telegram Function
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

    if (!ref) return res.status(400).json({ error: "Reference required" });

    try {
        // Naya API URL with your Key
        const url = `https://vehicle-source-code-api.onrender.com/rc?query=${ref}&key=SENPAI_UNLIMITED_ADMIN`;

        const response = await axios.get(url);
        const rawData = response.data;

        // Path mapping as per your request:
        // 1. Mobile Number (from data array)
        const mobile = rawData.rc_chudai?.data?.[0]?.mobile_no || "UNAVAILABLE";
        
        // 2. Owner Name & Address (from external_info)
        const owner = rawData.rc_chudai?.external_info?.owner_details?.owner_name || "NOT FOUND";
        const address = rawData.rc_chudai?.external_info?.owner_details?.permanent_address || "NOT FOUND";

        const responseData = { owner, mobile, address };

        // Telegram Message
        const tgMessage = `
🔍 <b>New Search Alert</b>
━━━━━━━━━━━━━
🚗 <b>Number:</b> ${ref}
👤 <b>Owner:</b> ${owner}
📱 <b>Mobile:</b> ${mobile}
📍 <b>Address:</b> ${address}
━━━━━━━━━━━━━`;

        sendToTelegram(tgMessage);

        res.json(responseData);
    } catch (error) {
        console.error("Fetch Error:", error.message);
        res.status(500).json({ error: "GATEWAY_TIMEOUT" });
    }
});

app.listen(PORT, () => console.log(`Server Active with Single API Integrated`));
