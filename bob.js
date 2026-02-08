const init = () => {
  let players, playersBets, playersGets, X;
  sessionStorage.setItem("call", JSON.stringify({ allow: false }));

  const itrater = () => {
    let playersSpanVal = document
      .querySelector(
        "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__total.crash-total > div:nth-child(1) > span"
      )
      .textContent.trim();
    let playersBetsSpanVal = document
      .querySelector(
        "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__total.crash-total > div:nth-child(2) > span"
      )
      .textContent.trim()
      .split(" ")[0];

    let playersGetsSpanVal = document
      .querySelector(
        "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__total.crash-total > div:nth-child(3) > span"
      )
      .textContent.trim()
      .split(" ")[0];

    let xGVal = document
      .querySelector(
        "#games_page > div.crash.games-container__game > div > div > div.crash__wrap.crash__wrap--main > div.crash__game.crash-game > div.crash-game__timeline > svg > g:nth-child(5) > text"
      )
      .textContent.trim();

    let userTag1 = document
      .querySelector(
        "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(1)"
      )
      .classList.contains("crash-results__row--loss");

    let userTag2 = document
      .querySelector(
        "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(2)"
      )
      .classList.contains("crash-results__row--loss");

    let userTag3 = document
      .querySelector(
        "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(3)"
      )
      .classList.contains("crash-results__row--loss");

    let userTag4 = document
      .querySelector(
        "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(4)"
      )
      .classList.contains("crash-results__row--loss");

    let userTag5 = document
      .querySelector(
        "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(5)"
      )
      .classList.contains("crash-results__row--loss");

    let userTag6 = document
      .querySelector(
        "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(6)"
      )
      .classList.contains("crash-results__row--loss");

    let userTag7 = document
      .querySelector(
        "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(7)"
      )
      .classList.contains("crash-results__row--loss");

    let userTag8 = document
      .querySelector(
        "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(8)"
      )
      .classList.contains("crash-results__row--loss");

    let userTag9 = document
      .querySelector(
        "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(9)"
      )
      .classList.contains("crash-results__row--loss");

    let userTag10 = document
      .querySelector(
        "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(10)"
      )
      .classList.contains("crash-results__row--loss");

    let userTag11 = document
      .querySelector(
        "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(11)"
      )
      .classList.contains("crash-results__row--loss");

    let userTag12 = document
      .querySelector(
        "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(12)"
      )
      .classList.contains("crash-results__row--loss");

    let userTag13 = document
      .querySelector(
        "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(13)"
      )
      .classList.contains("crash-results__row--loss");

    let userTag14 = document
      .querySelector(
        "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(14)"
      )
      .classList.contains("crash-results__row--loss");

    let userTag15 = document
      .querySelector(
        "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(15)"
      )
      .classList.contains("crash-results__row--loss");

    let userTag16 = document
      .querySelector(
        "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(16)"
      )
      .classList.contains("crash-results__row--loss");

    let userTag17 = document
      .querySelector(
        "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(17)"
      )
      .classList.contains("crash-results__row--loss");

    let userTag18 = document
      .querySelector(
        "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(18)"
      )
      .classList.contains("crash-results__row--loss");

    let userTag19 = document
      .querySelector(
        "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(19)"
      )
      .classList.contains("crash-results__row--loss");

    let userTag20 = document
      .querySelector(
        "#games_page > div.crash.games-container__game > div > div > div.crash-players-bets.crash__wrap.crash__wrap--left > div.crash-players-bets__results.crash-results > div > table > tbody > tr:nth-child(20)"
      )
      .classList.contains("crash-results__row--loss");

    if (
      userTag1 ||
      userTag2 ||
      userTag3 ||
      userTag4 ||
      userTag5 ||
      userTag6 ||
      userTag7 ||
      userTag8 ||
      userTag9 ||
      userTag10 ||
      userTag11 ||
      userTag12 ||
      userTag13 ||
      userTag14 ||
      userTag15 ||
      userTag16 ||
      userTag17 ||
      userTag18 ||
      userTag19 ||
      userTag20
    ) {
      if (JSON.parse(sessionStorage.getItem("call")).allow) {
        console.log("sending erly");
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
    } else if (playersGetsSpanVal === "0" && xGVal === "x") {
      if (JSON.parse(sessionStorage.getItem("call")).allow) {
        console.log("sending at 0");
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
    } else {
      console.log("recording data");
      playersSpanVal === "0" ? (players = players) : (players = playersSpanVal);
      playersBetsSpanVal === "0"
        ? (playersBets = playersBets)
        : (playersBets = playersBetsSpanVal);
      playersGetsSpanVal === "0"
        ? (playersGets = playersGets)
        : (playersGets = playersGetsSpanVal);
      xGVal === "x" ? (X = X) : (X = xGVal);
    }
  };
  const inItIt = setInterval(itrater, 200);
};

const allow = () => {
  let xGVal = document
    .querySelector(
      "#games_page > div.crash.games-container__game > div > div > div.crash__wrap.crash__wrap--main > div.crash__game.crash-game > div.crash-game__timeline > svg > g:nth-child(5) > text"
    )
    .textContent.trim();

  if (
    +xGVal.split("x")[0] === 1 &&
    JSON.parse(sessionStorage.getItem("call")).allow === false
  ) {
    console.log("allowed");
    sessionStorage.setItem("call", JSON.stringify({ allow: true }));
  }
};

let allowI = setInterval(allow, 100);

const chek = () => {
  let xv = document
    .querySelector(
      "#games_page > div.crash.games-container__game > div > div > div.crash__wrap.crash__wrap--main > div.crash__game.crash-game > div.crash-game__timeline > svg > g:nth-child(5) > text"
    )
    .textContent.trim();
  if (xv !== "x") {
    init();
    clearInterval(fun);
    console.log("init inter cleared");
  } else {
    console.log("waiting for injecting script");
  }
};

const fun = setInterval(chek, 200);

const exp = () => {
  let refreshBtn = document.querySelector(
    "#modals-container > div > div > div.v--modal-box.v--modal.s-games-popup > div > div.games-popup__content > button"
  );

  let expUrl = "https://so.1xbet.com/games-frame/error?lg=en";

  if (refreshBtn !== null) {
    refreshBtn.click();
    console.log("url needs to be changed");
    clearInterval(expireError);
    clearInterval(allowI);
    clearInterval(fun);
    fetch("http://localhost:3500/url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Request-Private-Network": "true",
      },
      body: JSON.stringify({ url: expUrl }),
    });
  } else if (expUrl === window.location.href) {
    fetch("http://localhost:3500/url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Request-Private-Network": "true",
      },
      body: JSON.stringify({ url: expUrl }),
    });
    console.log("url needs to be changed");
    clearInterval(expireError);
    clearInterval(allowI);
    clearInterval(fun);
  }
};

let expireError = setInterval(exp, 10000);

/* --------------------------------------- */

/* 

counter=document.querySelector("#games_page > div.crash.games-container__game > div > div > div.crash__wrap.crash__wrap--main > div.crash__game.crash-game > div.crash-game__timer.crash-timer.crash-timer--countdown > p")


*/
