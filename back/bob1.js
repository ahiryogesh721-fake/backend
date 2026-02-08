let players = 0;
let money = 0;

const itrater = () => {
  let btn = document.querySelector(
    "#main-content > div > div.content.svelte-aj9tu.stacked > div.game-sidebar.svelte-2ftx9j.stacked > button > div > span"
  ).textContent;

  let XSpam = document.querySelector(
    "#main-content > div > div.content.svelte-aj9tu.stacked > div.game-content.svelte-1ku0r3.stacked > div.wrap.svelte-pv9k1i > div.past-bets.svelte-pv9k1i.full > div:nth-child(1) > button > div > span"
  ).textContent;

  let playersSpan = document.querySelector(
    "#main-content > div > div.content.svelte-aj9tu.stacked > div.game-sidebar.svelte-2ftx9j.stacked > div.wrap.svelte-1faf6u3 > span > span"
  ).textContent;

  let moneySpan = document.querySelector(
    "#main-content > div > div.content.svelte-aj9tu.stacked > div.game-sidebar.svelte-2ftx9j.stacked > div.wrap.svelte-1faf6u3 > div > span > span > span"
  ).textContent;

  if (btn === "Bet") {
    console.log("sending");
    fetch("http://localhost:3500/post1", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Request-Private-Network": "true",
      },
      body: JSON.stringify({
        players: players,
        X: XSpam,
        money: money,
      }),
    });
  } else {
    console.log("recording data");
    players = playersSpan;
    money = moneySpan;
  }
};

setInterval(itrater, 1000);
/* ------------------------------*/
