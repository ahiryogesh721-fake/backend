const { betHestoryModel } = require("../models/betHestoryModel");

const sendToSock = async (data, url) => {
  try {
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Request-Private-Network": "true",
      },
      body: JSON.stringify(data),
    });
    console.log("api call succ");
  } catch (error) {
    console.log("couldnt make and api for sock");
  }
};

const betGet = async (_, res) => {
  try {
    const data = await betHestoryModel.find().exec();
    res.json(data);
  } catch (error) {
    console.log("some error in geting bet hestory", error);
    res.sendStatus(500);
  }
};

const betConSet = async (req, res) => {
  try {
    let lastBet = await betHestoryModel.findOne().sort({ _id: -1 });
    if (!lastBet) {
      console.log("No documents found.");
      return res.sendStatus(200);
    }
    if (lastBet.con === undefined) {
      lastBet.con = JSON.parse(req.body.con);
      lastBet.save();
      sendToSock(req.body, "https://sock-11f1.onrender.com/bet-con");
    }
    return res.sendStatus(200);
  } catch (error) {
    console.log("some error in seting bet-con", error);
    res.sendStatus(200);
  }
};

module.exports = { betGet, betConSet };
