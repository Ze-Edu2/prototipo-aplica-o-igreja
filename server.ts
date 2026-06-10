import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dns from "dns";

// Ensure we bind to IPv4 properly if needed
dns.setDefaultResultOrder("ipv4first");

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Proxy Route for WhatsApp (CallMeBot)
  app.post("/api/send-prayer-whatsapp", async (req, res) => {
    try {
      const { phone, apikey, senderName, message } = req.body;

      if (!phone || !apikey) {
        return res.status(200).json({
          status: "simulated",
          message: "WhatsApp simulado (configurações ausentes do painel ADM)."
        });
      }

      // Format message body for WhatsApp
      const formattedMessage = `*Novo Pedido de Oração*\n\nDe: *${senderName}*\n\n"${message}"`;
      
      // CallMeBot API expects phone, apikey, and text URL encoded
      const targetUrl = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(formattedMessage)}&apikey=${encodeURIComponent(apikey)}`;

      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 8000); // 8-second timeout

      try {
        const fetchResponse = await fetch(targetUrl, { signal: controller.signal });
        clearTimeout(id);
        
        if (fetchResponse.ok) {
          const text = await fetchResponse.text();
          return res.json({ status: "success", info: text });
        } else {
          const errText = await fetchResponse.text();
          return res.status(502).json({ error: `CallMeBot respondeu com erro: ${errText}` });
        }
      } catch (fetchErr: any) {
        clearTimeout(id);
        console.error("Erro na API CallMeBot:", fetchErr);
        return res.status(504).json({ error: "Tempo esgotado ou falha de rede ao conectar com CallMeBot." });
      }

    } catch (err: any) {
      console.error("Erro geral no proxy de WhatsApp:", err);
      return res.status(500).json({ error: "Erro interno no servidor de envio." });
    }
  });

  // Vite configuration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((e) => {
  console.error("Falha ao iniciar o servidor express:", e);
});
