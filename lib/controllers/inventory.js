const { Router } = require("express");
const Inventory = require("../models/Inventory");
const ensureAuth = require("../middleware/ensure-auth");

module.exports = Router()
  .get("/:gameId", ensureAuth, (req, res, next) => {
    Inventory.viewInventory(req.params.gameId, req.body.userId)
      .then((data) => res.send(data))
      .catch(next);
  })

  .post("/:gameId/:itemName", ensureAuth, (req, res, next) => {
    Inventory.addToInventory(
      req.params.gameId,
      req.params.itemName,
      req.body.userId
    )
      .then((data) => res.send(data))
      .catch(next);
  })

  .delete("/:gameId/:itemName", ensureAuth, (req, res, next) => {
    Inventory.removeFromInventory(req.params.gameId, req.params.itemName)
      .then((data) => res.send(data))
      .catch(next);
  });

// option to use
