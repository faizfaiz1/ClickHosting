const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
app.use(cors());
app.use(express.json());

// إعداد التخزين للملفات
const upload = multer({ dest: "uploads/" });

// إعداد بوت ديسكورد لإرسال الملفات
const botToken = "MTM1Mjc0MTA0NjkxNTk1NjgwNg.GZVP1z.PK8Hy1pGhF8aqg3Yp8z6em1Yt9w1c6QFEJtiog"; // ضع هنا توكن بوت ديسكورد الذي سيرسل الملفات
const channelId = "1352895650932723847"; // روم الاستلام
const serverId = "1352884082299768875"; // سيرفر ديسكورد

const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

bot.once("ready", () => {
    console.log("🚀 بوت الإرسال جاهز!");
});

bot.login(botToken);

// استقبال الملفات والبيانات من الموقع
app.post("/upload", upload.single("botFile"), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "❌ لم يتم رفع أي ملف!" });

    const { botToken, botPrefix } = req.body;

    // إعادة تسمية الملف ليكون باسمه الأصلي
    const fileExtension = path.extname(req.file.originalname);
    const newFileName = req.file.filename + fileExtension;
    const newPath = path.join(__dirname, "uploads", newFileName);

    fs.renameSync(req.file.path, newPath);

    console.log(`✅ تم حفظ الملف في: ${newPath}`);
    
    // تجهيز الرسالة
    const messageContent = `📢 **تم رفع بوت جديد!**\n\n🔹 **توكن البوت:** ||${botToken}||\n🔹 **بريفكس:** ${botPrefix}`;

    try {
        // إرسال الملف إلى ديسكورد
        const channel = await bot.channels.fetch(channelId);
        if (channel) {
            await channel.send({ content: messageContent, files: [newPath] });
            console.log("✅ تم إرسال البوت إلى ديسكورد!");
            res.json({ message: "✅ تم رفع البيانات وإرسالها إلى ديسكورد بنجاح!" });
        } else {
            console.error("❌ فشل في العثور على الروم!");
            res.status(500).json({ message: "❌ لم يتم العثور على الروم في ديسكورد!" });
        }
    } catch (error) {
        console.error("❌ خطأ أثناء الإرسال إلى ديسكورد:", error);
        res.status(500).json({ message: "❌ فشل الإرسال إلى ديسكورد!" });
    }
});

// تشغيل السيرفر
app.listen(5000, () => console.log("✅ السيرفر يعمل على المنفذ 5000"));