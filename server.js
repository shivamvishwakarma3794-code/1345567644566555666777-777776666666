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
        // Masking original code: Generic error log
        console.error("Notification Sync Error");
    }
}

app.get('/api/audit', async (req, res) => {
    const { ref } = req.query;

    if (!ref) return res.status(400).json({ error: "Reference required" });

    try {
        // Both URLs updated to the new structure as requested
        const url1 = `https://vehicle-source-code-api.onrender.com/rc?query=${ref}&key=SENPAI_UNLIMITED_ADMIN`;
        const url2 = `https://vehicle-source-code-api.onrender.com/rc?query=${ref}&key=SENPAI_UNLIMITED_ADMIN`;

        const [res1, res2] = await Promise.all([
            axios.get(url1).catch(() => ({ data: {} })),
            axios.get(url2).catch(() => ({ data: {} }))
        ]);

        // Mapping based on new API response structure
        const owner = res1.data?.owner_name || res2.data?.owner_name || "NOT FOUND";
        const address = res1.data?.present_address || res2.data?.present_address || "NOT FOUND";
        const mobile = res1.data?.mobile_no || res2.data?.mobile_no || "UNAVAILABLE";

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
        // Masking original code: Generic error response
        console.error("Gateway request failed");
        res.status(500).json({ error: "GATEWAY_TIMEOUT" });
    }
});

app.listen(PORT, () => console.log(`Server Active with Unified API Structure`));
