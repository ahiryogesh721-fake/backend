const axios = require("axios");
const puppeteer = require("puppeteer");
require("dotenv").config();
const app = require("express")();
const mongoose = require("mongoose");
const { lE } = require("./lastEntry");
let callAllow = { I: 0, val: true };
const cors = require("cors");
const json = require("body-parser").json();
const { moneyModel } = require("./moneyModel");
const { urlModel } = require("./urlModel");

  const accountSid = "AC53582b43019ea9ca2083f698fa635a86";
  const authToken = "6484ce9c4c51ccb1c962f2d164cde5e4";
  const client = require("twilio")(accountSid, authToken);
  const twiiloNumber = "+15313313815";

const PORT = 3500;

async function conectMongo() {
  try {
    await mongoose.connect(
      "mongodb+srv://ahiryogesh:ahiryogesh721@tocxic.fhprltu.mongodb.net/"
    );
    console.log("database is conencted");
  } catch (error) {
    console.log(error);
    console.log("couldnt able to conect databse");
  }
}

conectMongo().catch((err) => console.log(err));

app.use(
  cors({
    origin: (origin, callback) => {
      return callback(null, true);
    },
  })
);

app.use(json);
app.use(require("express").urlencoded({ extended: false }));

const sendToSock = async (data) => {
  try {
    fetch("https://sock-11f1.onrender.com/send", {
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

function urlFormate(urll) {
  let splitArrUrl = urll.split("view=Mobile&");
  let url;

  if (splitArrUrl.length === 2) {
    url = splitArrUrl[0] + splitArrUrl[1];
  } else url = urll;

  return url;
}

app.post("/post", async (req, res) => {
  let lastEntry;

  if (lE.I === undefined) {
    try {
      lastEntry = await moneyModel.findOne().sort({ _id: -1 }).exec();
    } catch (error) {
      console.log("could not finde last doc from database");
    }
  } else {
    lastEntry = lE;
  }

  const { players, playersBets, playersGets, X } = req.body;
  console.log(`req in for X:${X}`);

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

  if (X !== lastEntry?.X) {
    let inout = parseFloat(playersGets - playersBets).toFixed(2);

    try {
      const result = await moneyModel.create({
        I: lastEntry === null || undefined ? 1 : lastEntry.I + 1,
        X,
        players,
        playersBets,
        playersGets,
        inout: parseInt(inout) !== null ? parseInt(inout) : 0,
        time: new Date().toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
        }),
        buger:
          lastEntry === null || lastEntry === undefined
            ? 0
            : parseInt(lastEntry?.buger) + parseInt(inout),
      });
      if (result) {
        console.log(result);
        if (lE.I != result.I) {
          sendToSock(result);
        }
        lE.X = result.X;
        lE.I = result.I;
      }
      res.sendStatus(200);
    } catch (error) {
      console.log(error);
      console.log("couldnt save");
    }
  } else res.sendStatus(200);
});

app.get("/post", async (req, res) => {
  let allData = await moneyModel.find().sort({ _id: -1 }).limit(5000).exec();
  res.json(allData.reverse());
});

app.post("/url", async (req, res) => {
  const { url, pin } = req.body;
  if (pin !== "2107") return res.sendStatus(200);
  if (url && url !== "" && url !== undefined && url !== null) {
    try {
      const lastDoc = await urlModel.findOne().sort({ _id: -1 }).exec();
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
          axios.post("https://sock-11f1.onrender.com/anounce", {
            stat: "up",
          });
        } else if (isExp(url) !== 1) {
          axios.post("https://sock-11f1.onrender.com/anounce", {
            stat: "down",
          });
          try {
            client.messages.create({
              from: twiiloNumber,
              to: "+919924261500",
              body: "url exp",
            });
            client.calls.create({
              url: "https://handler.twilio.com/twiml/EHf860023008f17dee10a0f0b4c5768498",
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
      console.log("some error in geting prev url", error);
      res.sendStatus(500);
    }
  }
});

app.get("/url", async (req, res) => {
  try {
    const Data = await urlModel.find().exec();
    res.json(Data);
  } catch (error) {
    console.log("some error in geting url", error);
    res.sendStatus(500);
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`backend server is runing on PORT:${PORT}`);
});

/* ----------------------------------------------PUP------------------------------------------------- */

console.log("puppeterr INIT");

let currentUrl = null;
let browser = null;
let page = null;
let refreshAllow = false;

const isExp = (url) => {
  return url.split("error").length;
};

async function updateUrl(newUrl) {
  try {
    currentUrl = newUrl;

    if (browser) {
      await browser.close();
    }

    let opt = {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    };

    browser = await puppeteer.launch(opt);
    page = await browser.newPage();

    await page.goto(currentUrl, { waitUntil: "networkidle0", timeout: 0 });
    console.log("pup launched / page");

    await page.evaluate(() => {
      const sendToSock = async (data) => {
        try {
          fetch("https://sock-11f1.onrender.com/send", {
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
      const isExp = (url) => {
        return url.split("error").length;
      };
      sessionStorage.setItem("call", JSON.stringify({ allow: true }));
      console.log(`sendToSock and sessionStorage set `);

      const exp = () => {
        let refreshBtn = document.querySelector(
          "#modals-container > div > div > div.v--modal-box.v--modal.s-games-popup > div > div.games-popup__content > button"
        );

        if (refreshBtn !== null) {
          refreshBtn.click();
          clearInterval(expireError);

          fetch("http://localhost:3500/url", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Request-Private-Network": "true",
            },
            body: JSON.stringify({
              url: window.location.href,
              pin: "2107",
            }),
          });
          console.log("url needs to be changed : refresh button");
        } else if (isExp(window.location.href) !== 1) {
          clearInterval(expireError);
          fetch("http://localhost:3500/url", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Request-Private-Network": "true",
            },
            body: JSON.stringify({
              url: window.location.href,
              pin: "2107",
            }),
          });
          console.log("url needs to be changed : url");
        }
      };
      let expireError = setInterval(exp, 10000);

      function wholeDesktop() {
        console.log("desktop");
        const itrater = () => {
          let p1 = document
            .querySelector(
              "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(1)"
            )
            .classList.contains("crash-results__row--loss");
          let p2 = document
            .querySelector(
              "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(2)"
            )
            .classList.contains("crash-results__row--loss");
          let p3 = document
            .querySelector(
              "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(3)"
            )
            .classList.contains("crash-results__row--loss");
          let p4 = document
            .querySelector(
              "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(4)"
            )
            .classList.contains("crash-results__row--loss");
          let p5 = document
            .querySelector(
              "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(5)"
            )
            .classList.contains("crash-results__row--loss");
          let p6 = document
            .querySelector(
              "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(6)"
            )
            .classList.contains("crash-results__row--loss");
          let p7 = document
            .querySelector(
              "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(7)"
            )
            .classList.contains("crash-results__row--loss");
          let p8 = document
            .querySelector(
              "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(8)"
            )
            .classList.contains("crash-results__row--loss");
          let p9 = document
            .querySelector(
              "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(9)"
            )
            .classList.contains("crash-results__row--loss");
          let p10 = document
            .querySelector(
              "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(10)"
            )
            .classList.contains("crash-results__row--loss");
          let p11 = document
            .querySelector(
              "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(11)"
            )
            .classList.contains("crash-results__row--loss");
          let p12 = document
            .querySelector(
              "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(12)"
            )
            .classList.contains("crash-results__row--loss");
          let p13 = document
            .querySelector(
              "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(13)"
            )
            .classList.contains("crash-results__row--loss");
          let p14 = document
            .querySelector(
              "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(14)"
            )
            .classList.contains("crash-results__row--loss");
          let p15 = document
            .querySelector(
              "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(15)"
            )
            .classList.contains("crash-results__row--loss");
          let p16 = document
            .querySelector(
              "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(16)"
            )
            .classList.contains("crash-results__row--loss");
          let p17 = document
            .querySelector(
              "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(17)"
            )
            .classList.contains("crash-results__row--loss");
          let p18 = document
            .querySelector(
              "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(18)"
            )
            .classList.contains("crash-results__row--loss");
          let p19 = document
            .querySelector(
              "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(19)"
            )
            .classList.contains("crash-results__row--loss");
          let p20 = document
            .querySelector(
              "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(20)"
            )
            .classList.contains("crash-results__row--loss");
          let p21 = document
            .querySelector(
              "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(21)"
            )
            .classList.contains("crash-results__row--loss");
          let p22 = document
            .querySelector(
              "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(22)"
            )
            .classList.contains("crash-results__row--loss");
          let p23 = document
            .querySelector(
              "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(23)"
            )
            .classList.contains("crash-results__row--loss");
          let p24 = document
            .querySelector(
              "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(24)"
            )
            .classList.contains("crash-results__row--loss");
          let p25 = document
            .querySelector(
              "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(25)"
            )
            .classList.contains("crash-results__row--loss");
          let p26 = document
            .querySelector(
              "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(26)"
            )
            .classList.contains("crash-results__row--loss");
          let p27 = document
            .querySelector(
              "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(27)"
            )
            .classList.contains("crash-results__row--loss");
          let p28 = document
            .querySelector(
              "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(28)"
            )
            .classList.contains("crash-results__row--loss");
          let p29 = document
            .querySelector(
              "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(29)"
            )
            .classList.contains("crash-results__row--loss");
          let p30 = document
            .querySelector(
              "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(30)"
            )
            .classList.contains("crash-results__row--loss");

          let playersSpanVal = document
            .querySelector(
              "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__total.crash-total > div:nth-child(1) > span"
            )
            ?.textContent?.trim();
          let playersBetsSpanVal = document
            .querySelector(
              "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__total.crash-total > div:nth-child(2) > span"
            )
            ?.textContent?.trim()
            ?.split(" ")[0];

          let playersGetsSpanVal = document
            .querySelector(
              "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__total.crash-total > div:nth-child(3) > span"
            )
            ?.textContent?.trim()
            ?.split(" ")[0];

          let xGVal = document
            .querySelector(
              "#games_page > div.crash.games-container__game > div > div > div.crash__wrap.crash__wrap--main > div.crash__game.crash-game > div.crash-game__timeline > svg > g:nth-child(5) > text"
            )
            ?.textContent?.trim();

          if (
            document.querySelector(
              "#games_page > div.crash.games-container__game > div > div > div.crash__wrap.crash__wrap--main > div.crash__game.crash-game > div.crash-game__wrap > div.crash-game__pin.crash-game__pin--crash"
            ) !== null &&
            JSON.parse(sessionStorage.getItem("call")).allow
          ) {
            console.log("sending at crash");
            fetch("http://localhost:3500/post", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Request-Private-Network": "true",
              },
              body: JSON.stringify({
                players: playersSpanVal,
                playersBets: playersBetsSpanVal,
                playersGets: playersGetsSpanVal,
                X: xGVal,
              }),
            });
            sessionStorage.setItem("call", JSON.stringify({ allow: false }));
          }

          if (
            (p1 ||
              p2 ||
              p3 ||
              p4 ||
              p5 ||
              p6 ||
              p7 ||
              p8 ||
              p9 ||
              p10 ||
              p11 ||
              p12 ||
              p13 ||
              p14 ||
              p15 ||
              p16 ||
              p17 ||
              p18 ||
              p19 ||
              p20 ||
              p21 ||
              p22 ||
              p23 ||
              p24 ||
              p25 ||
              p26 ||
              p27 ||
              p28 ||
              p29 ||
              p30) &&
            JSON.parse(sessionStorage.getItem("call")).allow
          ) {
            console.log("sending at red");
            fetch("http://localhost:3500/post", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Request-Private-Network": "true",
              },
              body: JSON.stringify({
                players: playersSpanVal,
                playersBets: playersBetsSpanVal,
                playersGets: playersGetsSpanVal,
                X: xGVal,
              }),
            });
            sessionStorage.setItem("call", JSON.stringify({ allow: false }));
          }

          if (!JSON.parse(sessionStorage.getItem("call")).allow) {
            console.log("waiting");
          }
        };
        const inItIt = setInterval(itrater, 600);
        const allow = () => {
          let xGVal = document
            .querySelector(
              "#games_page > div.crash.games-container__game > div > div > div.crash__wrap.crash__wrap--main > div.crash__game.crash-game > div.crash-game__timeline > svg > g:nth-child(5) > text"
            )
            ?.textContent?.trim();

          if (
            +xGVal?.split("x")[0] === 1 &&
            JSON.parse(sessionStorage.getItem("call")).allow === false
          ) {
            console.log("allowed");
            sessionStorage.setItem("call", JSON.stringify({ allow: true }));
          }
        };
        let allowI = setInterval(allow, 100);
      }

      //desktop
      wholeDesktop();
      console.log(`wholeDesktop called`);

      /* --------------------------------------- */
    });
  } catch (error) {
    console.log(error);
  }
}

async function checkForNewUrl() {
  try {
    const res = await axios.get("http://localhost:3500/url");
    const newUrl = res.data[res.data.length - 1].url;

    if (newUrl !== currentUrl && newUrl !== undefined && isExp(newUrl) === 1) {
      await updateUrl(newUrl);
    } else {
      if (refreshAllow && isExp(newUrl) === 1) {
        refreshAllow = false;

        await page.setCacheEnabled(false);
        await page.reload({ waitUntil: "networkidle0", timeout: 0 });

        await page.evaluate(() => {
          const sendToSock = async (data) => {
            try {
              fetch("https://sock-11f1.onrender.com/send", {
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
          const isExp = (url) => {
            return url.split("error").length;
          };
          sessionStorage.setItem("call", JSON.stringify({ allow: true }));
          console.log(`sendToSock and sessionStorage set `);

          const exp = () => {
            let refreshBtn = document.querySelector(
              "#modals-container > div > div > div.v--modal-box.v--modal.s-games-popup > div > div.games-popup__content > button"
            );

            if (refreshBtn !== null) {
              refreshBtn.click();
              clearInterval(expireError);

              fetch("http://localhost:3500/url", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Access-Control-Request-Private-Network": "true",
                },
                body: JSON.stringify({
                  url: window.location.href,
                  pin: "2107",
                }),
              });
              console.log("url needs to be changed : refresh button");
            } else if (isExp(window.location.href) !== 1) {
              clearInterval(expireError);
              fetch("http://localhost:3500/url", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Access-Control-Request-Private-Network": "true",
                },
                body: JSON.stringify({
                  url: window.location.href,
                  pin: "2107",
                }),
              });
              console.log("url needs to be changed : url");
            }
          };
          let expireError = setInterval(exp, 10000);

          function wholeDesktop() {
            console.log("desktop");
            const itrater = () => {
              let p1 = document
                .querySelector(
                  "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(1)"
                )
                .classList.contains("crash-results__row--loss");
              let p2 = document
                .querySelector(
                  "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(2)"
                )
                .classList.contains("crash-results__row--loss");
              let p3 = document
                .querySelector(
                  "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(3)"
                )
                .classList.contains("crash-results__row--loss");
              let p4 = document
                .querySelector(
                  "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(4)"
                )
                .classList.contains("crash-results__row--loss");
              let p5 = document
                .querySelector(
                  "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(5)"
                )
                .classList.contains("crash-results__row--loss");
              let p6 = document
                .querySelector(
                  "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(6)"
                )
                .classList.contains("crash-results__row--loss");
              let p7 = document
                .querySelector(
                  "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(7)"
                )
                .classList.contains("crash-results__row--loss");
              let p8 = document
                .querySelector(
                  "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(8)"
                )
                .classList.contains("crash-results__row--loss");
              let p9 = document
                .querySelector(
                  "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(9)"
                )
                .classList.contains("crash-results__row--loss");
              let p10 = document
                .querySelector(
                  "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(10)"
                )
                .classList.contains("crash-results__row--loss");
              let p11 = document
                .querySelector(
                  "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(11)"
                )
                .classList.contains("crash-results__row--loss");
              let p12 = document
                .querySelector(
                  "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(12)"
                )
                .classList.contains("crash-results__row--loss");
              let p13 = document
                .querySelector(
                  "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(13)"
                )
                .classList.contains("crash-results__row--loss");
              let p14 = document
                .querySelector(
                  "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(14)"
                )
                .classList.contains("crash-results__row--loss");
              let p15 = document
                .querySelector(
                  "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(15)"
                )
                .classList.contains("crash-results__row--loss");
              let p16 = document
                .querySelector(
                  "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(16)"
                )
                .classList.contains("crash-results__row--loss");
              let p17 = document
                .querySelector(
                  "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(17)"
                )
                .classList.contains("crash-results__row--loss");
              let p18 = document
                .querySelector(
                  "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(18)"
                )
                .classList.contains("crash-results__row--loss");
              let p19 = document
                .querySelector(
                  "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(19)"
                )
                .classList.contains("crash-results__row--loss");
              let p20 = document
                .querySelector(
                  "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(20)"
                )
                .classList.contains("crash-results__row--loss");
              let p21 = document
                .querySelector(
                  "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(21)"
                )
                .classList.contains("crash-results__row--loss");
              let p22 = document
                .querySelector(
                  "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(22)"
                )
                .classList.contains("crash-results__row--loss");
              let p23 = document
                .querySelector(
                  "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(23)"
                )
                .classList.contains("crash-results__row--loss");
              let p24 = document
                .querySelector(
                  "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(24)"
                )
                .classList.contains("crash-results__row--loss");
              let p25 = document
                .querySelector(
                  "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(25)"
                )
                .classList.contains("crash-results__row--loss");
              let p26 = document
                .querySelector(
                  "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(26)"
                )
                .classList.contains("crash-results__row--loss");
              let p27 = document
                .querySelector(
                  "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(27)"
                )
                .classList.contains("crash-results__row--loss");
              let p28 = document
                .querySelector(
                  "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(28)"
                )
                .classList.contains("crash-results__row--loss");
              let p29 = document
                .querySelector(
                  "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(29)"
                )
                .classList.contains("crash-results__row--loss");
              let p30 = document
                .querySelector(
                  "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(30)"
                )
                .classList.contains("crash-results__row--loss");

              let playersSpanVal = document
                .querySelector(
                  "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__total.crash-total > div:nth-child(1) > span"
                )
                ?.textContent?.trim();
              let playersBetsSpanVal = document
                .querySelector(
                  "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__total.crash-total > div:nth-child(2) > span"
                )
                ?.textContent?.trim()
                ?.split(" ")[0];

              let playersGetsSpanVal = document
                .querySelector(
                  "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__total.crash-total > div:nth-child(3) > span"
                )
                ?.textContent?.trim()
                ?.split(" ")[0];

              let xGVal = document
                .querySelector(
                  "#games_page > div.crash.games-container__game > div > div > div.crash__wrap.crash__wrap--main > div.crash__game.crash-game > div.crash-game__timeline > svg > g:nth-child(5) > text"
                )
                ?.textContent?.trim();

              if (
                document.querySelector(
                  "#games_page > div.crash.games-container__game > div > div > div.crash__wrap.crash__wrap--main > div.crash__game.crash-game > div.crash-game__wrap > div.crash-game__pin.crash-game__pin--crash"
                ) !== null &&
                JSON.parse(sessionStorage.getItem("call")).allow
              ) {
                console.log("sending at crash");
                fetch("http://localhost:3500/post", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Request-Private-Network": "true",
                  },
                  body: JSON.stringify({
                    players: playersSpanVal,
                    playersBets: playersBetsSpanVal,
                    playersGets: playersGetsSpanVal,
                    X: xGVal,
                  }),
                });
                sessionStorage.setItem(
                  "call",
                  JSON.stringify({ allow: false })
                );
              }

              if (
                (p1 ||
                  p2 ||
                  p3 ||
                  p4 ||
                  p5 ||
                  p6 ||
                  p7 ||
                  p8 ||
                  p9 ||
                  p10 ||
                  p11 ||
                  p12 ||
                  p13 ||
                  p14 ||
                  p15 ||
                  p16 ||
                  p17 ||
                  p18 ||
                  p19 ||
                  p20 ||
                  p21 ||
                  p22 ||
                  p23 ||
                  p24 ||
                  p25 ||
                  p26 ||
                  p27 ||
                  p28 ||
                  p29 ||
                  p30) &&
                JSON.parse(sessionStorage.getItem("call")).allow
              ) {
                console.log("sending at red");
                fetch("http://localhost:3500/post", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Request-Private-Network": "true",
                  },
                  body: JSON.stringify({
                    players: playersSpanVal,
                    playersBets: playersBetsSpanVal,
                    playersGets: playersGetsSpanVal,
                    X: xGVal,
                  }),
                });
                sessionStorage.setItem(
                  "call",
                  JSON.stringify({ allow: false })
                );
              }

              if (!JSON.parse(sessionStorage.getItem("call")).allow) {
                console.log("waiting");
              }
            };
            const inItIt = setInterval(itrater, 600);
            const allow = () => {
              let xGVal = document
                .querySelector(
                  "#games_page > div.crash.games-container__game > div > div > div.crash__wrap.crash__wrap--main > div.crash__game.crash-game > div.crash-game__timeline > svg > g:nth-child(5) > text"
                )
                ?.textContent?.trim();

              if (
                +xGVal?.split("x")[0] === 1 &&
                JSON.parse(sessionStorage.getItem("call")).allow === false
              ) {
                console.log("allowed");
                sessionStorage.setItem("call", JSON.stringify({ allow: true }));
              }
            };
            let allowI = setInterval(allow, 100);
          }

          //desktop
          wholeDesktop();
          console.log(`wholeDesktop called`);

          /* --------------------------------------- */
        });
        console.log("refresh");
      }
      console.log("url cheked ");
    }
  } catch (error) {
    console.log(error);
  }
}

let refreshI = setInterval(() => {
  if (!refreshAllow) {
    refreshAllow = true;
  }
}, 300000);
let main = setInterval(checkForNewUrl, 10000);
