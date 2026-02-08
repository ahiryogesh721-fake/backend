const { urlModel } = require("../models/urlMOdel");

const sendToSock = async (data, url) => {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Request-Private-Network": "true",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      console.warn("fetch to sock failed with status:", res.status);
    } else {
      console.log("api call succ");
    }
  } catch (error) {
    console.log("couldn't make an API call for sock:", error.message);
  }
};

const toNumber = (value) => {
  const num = parseFloat(value);
  return Number.isFinite(num) ? num : 0;
};

const getTargetUrl = async (urlId) => {
  if (urlId) return urlModel.findById(urlId).exec();
  return urlModel.findOne().sort({ _id: -1 }).exec();
};

const getPrevLastEntryI = async (currentId) => {
  const prev = await urlModel
    .findOne({
      _id: { $lt: currentId },
      entries: { $exists: true, $not: { $size: 0 } },
    })
    .sort({ _id: -1 })
    .select({ entries: { $slice: -1 } })
    .exec();

  return prev?.entries?.[0]?.I;
};

const moneyPost = async (req, res) => {
  const { players, playersBets, playersGets, X } = req.body;
  console.log(`req in for X with::${X}`);

  if (
    X === "x" ||
    X === null ||
    X === undefined ||
    players === null ||
    players === undefined ||
    playersBets === null ||
    playersBets === undefined ||
    playersGets === null ||
    playersGets === undefined
  ) {
    res.sendStatus(200);
    return;
  }

  try {
    const currentUrl = await getTargetUrl();
    if (!currentUrl) {
      return res
        .status(400)
        .json({ error: "No active url found. Post a url first." });
    }

    const entries = Array.isArray(currentUrl.entries)
      ? currentUrl.entries
      : [];
    const lastEntry = entries[entries.length - 1];

    if (X === lastEntry?.X) {
      res.sendStatus(200);
      return;
    }

    const inoutRaw = toNumber(playersGets) - toNumber(playersBets);
    const inout = Number.isFinite(inoutRaw)
      ? Number(inoutRaw.toFixed(2))
      : 0;
    let nextI;
    if (lastEntry) {
      nextI = toNumber(lastEntry.I) + 1;
    } else {
      const prevLastI = await getPrevLastEntryI(currentUrl._id);
      nextI = toNumber(prevLastI) + 1;
    }
    const bugerBase = Number.parseInt(lastEntry?.buger ?? 0) || 0;
    const buger = bugerBase + (Number.parseInt(inout) || 0);

    const newEntry = {
      I: nextI,
      X,
      players,
      playersBets,
      playersGets,
      inout: Number.parseInt(inout) || 0,
      time: new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      }),
      buger,
    };

    currentUrl.entries.push(newEntry);
    await currentUrl.save();

    sendToSock(
      { ...newEntry, urlId: currentUrl._id, url: currentUrl.url },
      "https://sock-11f1.onrender.com/send"
    );

    res.sendStatus(200);
    console.log("entry stored:", newEntry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const moneyGet = async (req, res) => {
  const { from, to, urlId } = req.query;

  try {
    const targetUrl = await getTargetUrl(urlId);
    if (!targetUrl) {
      return res.status(404).json({ error: "No url found" });
    }

    let entries = Array.isArray(targetUrl.entries) ? targetUrl.entries : [];

    if (!to || !from) {
      const limit = 10000;
      if (entries.length > limit) {
        entries = entries.slice(entries.length - limit);
      }
      return res.json(entries);
    }

    const fromNumber = parseInt(from, 10);
    const toNumber = parseInt(to, 10);

    if (isNaN(fromNumber) || isNaN(toNumber)) {
      return res
        .status(400)
        .json({ error: '"from" and "to" must be valid numbers.' });
    }

    if (fromNumber > toNumber) {
      return res
        .status(400)
        .json({ error: '"from" must be less than or equal to "to".' });
    }

    const filtered = entries.filter(
      (entry) => entry.I >= fromNumber && entry.I <= toNumber
    );

    return res.json(filtered);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const moneyDellet = async (req, res) => {
  const id = req.params.id;
  const { urlId } = req.query;

  try {
    const targetUrl = await getTargetUrl(urlId);
    if (!targetUrl) {
      return res.status(404).json({ error: "No url found" });
    }

    const before = targetUrl.entries?.length || 0;

    targetUrl.entries = (targetUrl.entries || []).filter(
      (entry) =>
        entry._id?.toString() !== id &&
        (entry.I !== Number(id) || Number.isNaN(Number(id)))
    );

    if (before === targetUrl.entries.length) {
      return res.status(404).json({ error: "Entry not found" });
    }

    targetUrl.markModified("entries");
    await targetUrl.save();

    return res.json(targetUrl.entries);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  moneyPost,
  moneyGet,
  moneyDellet,
};
