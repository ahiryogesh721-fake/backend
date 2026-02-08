const app = require("express")();
const router = require("express").Router();
const moneyController = require("../controllers/moneyControler");

router.post("/", moneyController.moneyPost);
router.get("/", moneyController.moneyGet);
router.delete("/:id", moneyController.moneyDellet);

module.exports = router;
