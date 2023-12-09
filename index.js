const http = require("http");
const TelegramBot = require("node-telegram-bot-api");
const websites = require("./websites.json");

const { TOKEN } = process.env;

const MARKDOWN = "Markdown";

const bot = new TelegramBot(TOKEN, { "polling": true });

bot.onText(/^\s*\/start\s*$/, async msg => {
    let message = websites.map((x, i) => `[${x.name}](${x.url}) → {${i}}`).join("\n");

    const sent = await bot.sendMessage(msg.chat.id, "Pinging...");
    const edit = () => bot.editMessageText(message, {
        "chat_id": sent.chat.id,
        "message_id": sent.message_id,
        "parse_mode": MARKDOWN,
        "disable_web_page_preview": true
    });

    let n = 0;

    for(let i in websites) {
        fetch(websites[i].url).then(async res => {
            const emoji = (res.status >= 200 && res.status < 300) ? "✅" : "❌";
            const status = res.status.toString();
            message = message.replace(`{${i}}`, `${emoji} (${status})`);
            n++;
            if(n == websites.length)
                await edit();
        }).catch(async err => {
            const emoji = "❌";
            const status = "ERR";
            message = message.replace(`{${i}}`, `${emoji} (${status})`);
            n++;
            if(n == websites.length)
                await edit();
        });
    }
});

http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("OK");
}).listen(9090);