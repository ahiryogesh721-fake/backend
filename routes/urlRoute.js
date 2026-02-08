const router = require("express").Router();
const urlControler = require("../controllers/urlContorler");

router.post("/", urlControler.urlPost);
router.get("/", urlControler.urlGet);
router.delete("/:id?", urlControler.urlDelete);

module.exports = router;
