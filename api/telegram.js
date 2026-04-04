export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  const { name, phone, car, service, date } = req.body || {};

  if (!name || !phone) {
    return res.status(400).json({ ok: false, error: 'Missing required fields (name, phone)' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    // During local development or if not configured, we just log the message
    console.log('--- FORM SUBMISSION (No Telegram Config) ---');
    console.log(`Name: ${name}`);
    console.log(`Phone: ${phone}`);
    console.log(`Car: ${car}`);
    console.log(`Service: ${service}`);
    console.log(`Date: ${date}`);
    console.log('---------------------------------------------');
    return res.status(200).json({ 
      ok: true, 
      message: 'Logged locally. (Configure TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in Vercel for live notifications)' 
    });
  }

  const message = `
🚗 **Новая заявка на сервис!**

👤 **Имя:** ${name}
📞 **Телефон:** ${phone}
🚘 **Авто:** ${car || 'Не указано'}
🛠 **Услуга:** ${service || 'Не указана'}
📅 **Желаемая дата:** ${date || 'Не указана'}
  `.trim();

  try {
    const telegramRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    const result = await telegramRes.json();

    if (!result.ok) {
      throw new Error(result.description || 'Failed to send to Telegram');
    }

    return res.status(200).json({ ok: true, message: 'Message sent successfully' });

  } catch (error) {
    console.error('Telegram Error:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}
