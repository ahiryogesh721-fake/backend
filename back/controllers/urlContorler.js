const { urlModel } = require("../models/urlMOdel");
const accountSid = "AC53582b43019ea9ca2083f698fa635a86";
const authToken = "6484ce9c4c51ccb1c962f2d164cde5e4";
const client = require("twilio")(accountSid, authToken);
const twiiloNumber = "+15313313815";
const axios = require("axios");

const isExp = (url) => {
  return url.split("error").length;
};
function urlFormate(urll) {
  let splitArrUrl = urll.split("view=Mobile&");
  let url;

  if (splitArrUrl.length === 2) {
    url = splitArrUrl[0] + splitArrUrl[1];
  } else url = urll;

  return url;
}
const urlPost = async (req, res) => {
  const { url, pin } = req.body;
  if (pin !== "2107") return res.sendStatus(200);
  if (url && url !== "" && url !== undefined && url !== null) {
    try {
      const lastDoc = await urlModel
        .findOne()
        .select("url I")
        .sort({ _id: -1 })
        .exec();
      if (url !== lastDoc?.url || lastDoc === undefined || lastDoc === null) {
        if (isExp(url) !== 1 && isExp(lastDoc?.url) !== 1) return;
        const result = await urlModel.create({
          I: lastDoc === null || undefined ? 1 : lastDoc.I + 1,
          url: urlFormate(url),
          time: new Date().toLocaleString("en-US", {
            timeZone: "Asia/Kolkata",
          }),
        });
        if (isExp(url) === 1) {
          await axios.post("https://sock-11f1.onrender.com/anounce", {
            stat: "up",
          });
        } else if (isExp(url) !== 1) {
          await axios.post("https://sock-11f1.onrender.com/anounce", {
            stat: "down",
          });
          try {
            client.messages.create({
              from: twiiloNumber,
              to: "+919924261500",
              body: "url exp",
            });
            client.calls.create({
              url: "https://handler.twilio.com/twiml/EH57516756caa85958634e98330853bc4d",
              to: "+919924261500",
              from: twiiloNumber,
            });
          } catch (error) {
            console.log("could not make an call and msg for exp error:", error);
          }
        }
        console.log(result);
        res.json(result);
      } else res.sendStatus(200);
    } catch (error) {
      console.log("some error in posting prev url");
      res.sendStatus(500);
    }
  }
};

const urlGet = async (req, res) => {
  try {
    const includeEntries =
      req.query.entries === "true" || req.query.includeEntries === "true";
    const projection = includeEntries ? undefined : "-entries";

    if (req.query.I !== undefined) {
      const rawI = req.query.I;
      const parsedI = Number.isNaN(Number(rawI)) ? rawI : Number(rawI);

      const doc = await urlModel.findOne({ I: parsedI }).select(projection).exec();
      if (!doc) return res.status(404).json({ error: "url not found" });
      return res.json(doc);
    }

    const Data = await urlModel.find().select(projection).exec();
    return res.json(Data);
  } catch (error) {
    console.log("some error in geting url");
    res.sendStatus(500);
  }
};

const urlDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const hasId = Boolean(id);
    const hasI = req.query.I !== undefined;

    if (!hasId && !hasI) {
      return res.status(400).json({ error: "id param or I query is required" });
    }

    let deleted;
    if (hasId) {
      deleted = await urlModel.findByIdAndDelete(id).exec();
    } else if (hasI) {
      const rawI = req.query.I;
      const parsedI = Number.isNaN(Number(rawI)) ? rawI : Number(rawI);
      deleted = await urlModel.findOneAndDelete({ I: parsedI }).exec();
    }

    if (!deleted) return res.status(404).json({ error: "url not found" });

    return res.json({ success: true, deletedId: deleted._id, deletedI: deleted.I });
  } catch (error) {
    console.log("some error in deleting url", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { urlPost, urlGet, urlDelete };
