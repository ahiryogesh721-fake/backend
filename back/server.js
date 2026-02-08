const express = require("express");
const app = express();
const conectMongo = require("./config/mongo");

const credentials = require("./middleware/corsMiddle");
const cors = require("cors");
const corsConfig = require("./config/cors");
const json = require("body-parser").json();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const rootRoute = require("./routes/rootRoute");
const postRoute = require("./routes/postRoute");
const urlRoute = require("./routes/urlRoute");
const betRoute = require("./routes/betRoute");

const PORT = 3500;

app.use(credentials);
app.use(cors(corsConfig));

app.use(json);
app.use(express.urlencoded({ extended: false }));

app.use("/", rootRoute);
app.use("/post", postRoute);
app.use("/url", urlRoute);
app.use("/bet-c", betRoute);

/* --cap--- */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, "assets");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

app.post("/cap-solver", upload.array("images", 2), async (req, res) => {
  if (!req.files) {
    return res.status(400).json({ error: "No images provided" });
  }

  const savedFiles = req.files.map((file) => ({
    originalName: file.originalname,
    path: `/assets/${file.filename}`,
    fullPath: file.path,
  }));

  /* -----split------ */
  /* const iconsPath = path.join(__dirname, "assets", "icons.png");
  const bufferI = fs.readFileSync(iconsPath);
  const iconHeight = 20;

  const iconRegions = [
    { left: 0, width: 24, top: 0, height: iconHeight },
    { left: 38, width: 24, top: 0, height: iconHeight },
    { left: 78, width: 24, top: 0, height: iconHeight },
    { left: 118, width: 21, top: 0, height: iconHeight },
  ];

  for (let i = 0; i < iconRegions.length; i++) {
    const extracted = await sharp(bufferI)
      .extract(iconRegions[i])
      .png()
      .toBuffer();

    const savePath = path.join(__dirname, "assets", `${i + 1}.png`);
    fs.writeFileSync(savePath, extracted);
  }

  fs.unlink(iconsPath, (err) => {
    if (err) {
      console.error("Error deleting icons");
      return;
    }
  }); */

  res.status(200).json({
    message: "Images saved successfully",
    images: savedFiles,
  });
});

const startServer = async () => {
  try {
    await conectMongo();
    app.listen(PORT, () => {
      console.log(`backend server is runing on PORT:${PORT}`);
    });
  } catch (error) {
    console.error(error);
    console.log("couldnt able to conect databse");
    process.exit(1);
  }
};

startServer();
