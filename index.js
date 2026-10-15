const express = require("express");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const axios = require("axios");
const cron = require("node-cron");

const app = express();
const port = 3000;

// const GROUP_ID = "120363319758545161@g.us"; // The Jembuters & Hisabers ✅
// const GROUP_ID = "628111742324-1519091710@g.us"; // Keluarga Kreasi Bintang Edukasi
const GROUP_ID = "";
const KOTA = "Bekasi";
const NEGARA = "Indonesia";
const TANGGAL_TUGAS = "2026-09-18";

let jadwalSholatHariIni = {};

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.on("qr", (qr) => {
  console.log("Scan QR Code ini menggunakan WhatsApp Anda:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Bot WhatsApp sudah siap dan terhubung!");
  ambilJadwalSholat();
});

// client.on("ready", async () => {
//   console.log("Bot WhatsApp sudah siap dan terhubung!");
//   ambilJadwalSholat();

//   // --- FITUR VERIFIKASI NAMA GRUP ---
//   try {
//     console.log("Mengecek ID Grup...");
//     // Mengambil data chat spesifik berdasarkan GROUP_ID
//     const chatTarget = await client.getChatById(GROUP_ID);

//     console.log(`\n✅ VERIFIKASI BERHASIL:`);
//     console.log(`ID tersebut adalah grup dengan nama: "${chatTarget.name}"`);
//     console.log(`Jumlah anggota grup: ${chatTarget.participants.length} orang\n`);

//   } catch (error) {
//     console.error(`\n❌ VERIFIKASI GAGAL: Tidak dapat menemukan grup dengan ID tersebut. Pastikan ID-nya benar dan bot sudah masuk ke grup itu.\n`);
//   }
// });

client.on("message_create", async (msg) => {
  if (
    msg.body.toLowerCase().includes("a") ||
    msg.body.toLowerCase().includes("b") ||
    msg.body.toLowerCase().includes("c") ||
    msg.body.toLowerCase().includes("d") ||
    msg.body.toLowerCase().includes("e") ||
    msg.body.toLowerCase().includes("f") ||
    msg.body.toLowerCase().includes("g") ||
    msg.body.toLowerCase().includes("h") ||
    msg.body.toLowerCase().includes("i") ||
    msg.body.toLowerCase().includes("j") ||
    msg.body.toLowerCase().includes("k") ||
    msg.body.toLowerCase().includes("l") ||
    msg.body.toLowerCase().includes("m") ||
    msg.body.toLowerCase().includes("n") ||
    msg.body.toLowerCase().includes("o") ||
    msg.body.toLowerCase().includes("p") ||
    msg.body.toLowerCase().includes("q") ||
    msg.body.toLowerCase().includes("r") ||
    msg.body.toLowerCase().includes("s") ||
    msg.body.toLowerCase().includes("t") ||
    msg.body.toLowerCase().includes("u") ||
    msg.body.toLowerCase().includes("v") ||
    msg.body.toLowerCase().includes("w") ||
    msg.body.toLowerCase().includes("x") ||
    msg.body.toLowerCase().includes("y") ||
    msg.body.toLowerCase().includes("z") ||
    msg.body.toLowerCase().includes(" ") ||
    msg.body.toLowerCase().includes("1") ||
    msg.body.toLowerCase().includes("2") ||
    msg.body.toLowerCase().includes("3") ||
    msg.body.toLowerCase().includes("4") ||
    msg.body.toLowerCase().includes("5") ||
    msg.body.toLowerCase().includes("6") ||
    msg.body.toLowerCase().includes("7") ||
    msg.body.toLowerCase().includes("8") ||
    msg.body.toLowerCase().includes("9") ||
    msg.body.toLowerCase().includes("0") ||
    msg.body.toLowerCase().includes(".") ||
    msg.body.toLowerCase().includes(",") ||
    msg.body.toLowerCase().includes("!") ||
    msg.body.toLowerCase().includes("?") ||
    msg.body.toLowerCase().includes(":") ||
    msg.body.toLowerCase().includes(";") ||
    msg.body.toLowerCase().includes("-") ||
    msg.body.toLowerCase().includes("_") ||
    msg.body.toLowerCase().includes("+") ||
    msg.body.toLowerCase().includes("=") ||
    msg.body.toLowerCase().includes("*") ||
    msg.body.toLowerCase().includes("/") ||
    msg.body.toLowerCase().includes("<") ||
    msg.body.toLowerCase().includes(">") ||
    msg.body.toLowerCase().includes("(") ||
    msg.body.toLowerCase().includes(")") ||
    msg.body.toLowerCase().includes("[") ||
    msg.body.toLowerCase().includes("]") ||
    msg.body.toLowerCase().includes("{") ||
    msg.body.toLowerCase().includes("}") ||
    msg.body.toLowerCase().includes("|") ||
    msg.body.toLowerCase().includes("\\") ||
    msg.body.toLowerCase().includes("~") ||
    msg.body.toLowerCase().includes("`")
  ) {
    try {
      const chatId = msg.fromMe ? msg.to : msg.from;
      if (chatId.endsWith("@g.us")) {
        let namaGrup = "Tidak diketahui";
        try {
          const contact = await client.getContactById(chatId);
          if (contact && contact.name) {
            namaGrup = contact.name;
          }
        } catch (err) {}
        console.log(`\n✅ GRUP DITEMUKAN!`);
        console.log(`   Nama Grup : ${namaGrup}`);
        console.log(`   ID Grup   : ${chatId}\n`);
      } else {
        console.log(
          `\n❌ Pesan mengandung kata "sholat", tapi dikirim dari pesan pribadi (bukan grup).\n`,
        );
      }
    } catch (error) {
      console.error("Gagal memproses pesan:", error);
    }
  }
});

client.initialize();

async function ambilJadwalSholat() {
  try {
    const response = await axios.get(
      `http://api.aladhan.com/v1/timingsByCity?city=${KOTA}&country=${NEGARA}&method=11`,
    );
    const timings = response.data.data.timings;
    jadwalSholatHariIni = {
      Tahajud: "03:00",
      Subuh: timings.Fajr,
      Dzuhur: timings.Dhuhr,
      Ashar: timings.Asr,
      Maghrib: timings.Maghrib,
      Isya: timings.Isha,
    };
    console.log("Jadwal sholat hari ini diperbarui:", jadwalSholatHariIni);
  } catch (error) {
    console.error("Gagal mengambil jadwal sholat:", error);
  }
}

cron.schedule("0 1 * * *", () => {
  console.log("Memperbarui jadwal sholat harian...");
  ambilJadwalSholat();
});
cron.schedule("* * * * *", () => {
  const sekarang = new Date();
  const tahun = sekarang.getFullYear();
  const bulan = String(sekarang.getMonth() + 1).padStart(2, "0");
  const tanggal = String(sekarang.getDate()).padStart(2, "0");
  const tanggalSekarang = `${tahun}-${bulan}-${tanggal}`;
  if (tanggalSekarang !== TANGGAL_TUGAS) {
    return;
  }
  const jam = String(sekarang.getHours()).padStart(2, "0");
  const menit = String(sekarang.getMinutes()).padStart(2, "0");
  const waktuSekarang = `${jam}:${menit}`;
  for (const [namaSholat, waktuSholat] of Object.entries(jadwalSholatHariIni)) {
    const [jamSholat, menitSholat] = waktuSholat.split(":");
    let waktuTarget = new Date();
    waktuTarget.setHours(
      parseInt(jamSholat, 10),
      parseInt(menitSholat, 10),
      0,
      0,
    );
    waktuTarget.setMinutes(waktuTarget.getMinutes() - 15);
    const jamReminder = String(waktuTarget.getHours()).padStart(2, "0");
    const menitReminder = String(waktuTarget.getMinutes()).padStart(2, "0");
    const waktuReminder = `${jamReminder}:${menitReminder}`;
    if (waktuSekarang === waktuReminder) {
      kirimReminder(namaSholat, waktuSholat);
    }
  }
});

function kirimReminder(namaSholat, waktu) {
  if (GROUP_ID === "MASUKKAN_ID_GRUP_DI_SINI") {
    console.log("Reminder gagal dikirim: ID Grup belum diatur!");
    return;
  }
  const daftarPesan = {
    Tahajud:
      "Waktu sepertiga malam telah tiba. Jangan Lupa bangun sejenak untuk menunaikan sholat Tahajud teman-teman.",
    Subuh:
      "Awali hari dengan sholat Subuh sebelum mulai beraktivitas teman-teman.",
    Dzuhur: "Jangan lupa dengan sholat Dzuhur sejenak teman-teman",
    Ashar: "Jangan lupa tunaikan kewajiban sholat Ashar ya teman-teman.",
    Maghrib: "Jangan lupa menunaikan ibadah sholat Maghrib teman-teman.",
    Isya: "Jangan tutup hari ini tanpa bersujud sebelum beristirahat teman-teman.",
  };

  const pesanKhusus =
    daftarPesan[namaSholat] || "Mari segera menunaikan ibadah sholat.";
  const pesan = `Sebentar lagi waktunya sholat ${namaSholat}.\n\n${pesanKhusus}`;

  try {
    const namaFileGambar = `banner_${namaSholat.toLowerCase()}.jpeg`;
    const imagePath = `./assets/images/${namaFileGambar}`;

    const media = MessageMedia.fromFilePath(imagePath);

    client
      .sendMessage(GROUP_ID, media, { caption: pesan })
      .then(() => {
        console.log(
          `Berhasil mengirim reminder ${namaSholat} dengan gambar ${namaFileGambar}.`,
        );
      })
      .catch((err) => {
        console.error("Gagal mengirim pesan WhatsApp:", err);
      });
  } catch (error) {
    console.error(
      `Gambar untuk ${namaSholat} tidak ditemukan! Mengirim pesan teks saja...`,
    );
    client.sendMessage(GROUP_ID, pesan).catch((err) => {
      console.error("Gagal mengirim pesan teks WhatsApp:", err);
    });
  }
}

app.get("/", (req, res) => {
  res.send("Bot WhatsApp Reminder Sholat sedang berjalan.");
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
