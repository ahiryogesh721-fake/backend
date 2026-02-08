const router = require("express").Router();
const betControler = require("../controllers/betControler");

router.post("/", betControler.betConSet);
router.get("/", betControler.betGet);

module.exports = router;
