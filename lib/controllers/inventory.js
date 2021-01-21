const { Router } = require("express");
const Inventory = require("../models/Inventory");
const ensureAuth = require("../middleware/ensure-auth");

module.exports = Router()
  .get("/:gameId", ensureAuth, (req, res, next) => {
    Inventory.viewInventory(req.params.gameId, req.user.userId)
      .then((data) => res.send(data))
      .catch(next);
  })

  .post("/", ensureAuth, (req, res, next) => {
    Inventory.addToInventory(
      req.body.gameId,
      req.user.userId,
      req.body.itemName
    )
      .then((data) => res.send(data))
      .catch(next);
  })

  .delete("/:gameId/:itemName", ensureAuth, (req, res, next) => {
    Inventory.removeFromInventory(
      req.params.gameId,
      req.user.userId,
      req.params.itemName
    )
      .then((data) => res.send(data))
      .catch(next);
  });
