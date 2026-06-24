const axios = require("axios");
const nodemailer = require("nodemailer");

function buildLowStockMessage(product) {
  const brand = product.brand?.name || product.brand || "";
  const name = `${brand} ${product.model} - Capinha ${product.caseType}`.trim();

  return `Atencao!

O estoque do produto:

${name}

atingiu o estoque minimo.

Quantidade atual: ${product.quantity} unidades.

Favor realizar novo pedido ao fornecedor.`;
}

async function sendEmail(message, to) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP nao configurado. Preencha SMTP_USER e SMTP_PASS.");
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: "Alerta de estoque minimo",
    text: message,
  });
}

async function sendWhatsApp(message, to) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    throw new Error("WhatsApp nao configurado. Preencha WHATSAPP_TOKEN e WHATSAPP_PHONE_NUMBER_ID.");
  }

  await axios.post(
    `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: message },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );
}

async function sendLowStockAlert(product, config = {}) {
  const message = buildLowStockMessage(product);
  const results = [];

  if (config.emailEnabled) {
    await sendEmail(message, config.emailTo || process.env.NOTIFICATION_EMAIL_TO || process.env.SMTP_USER);
    results.push("email");
  }

  if (config.whatsappEnabled) {
    await sendWhatsApp(message, config.whatsappTo || process.env.WHATSAPP_TO);
    results.push("whatsapp");
  }

  return { message, sentBy: results };
}

module.exports = {
  buildLowStockMessage,
  sendLowStockAlert,
};
