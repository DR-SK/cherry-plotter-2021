const { Router } = require("express");
const Inventory = require("../models/Inventory");

module.exports = Router()
  .get("/view/:gameId/:userId", (req, res, next) => {
    Inventory.viewInventory(req.params.gameId, req.params.userId)
      .then((data) => res.send(data))
      .catch(next);
  })

  .get("/add/:gameId/:userId/:itemName", (req, res, next) => {
    Inventory.addToInventory(
      req.params.gameId,
      req.params.userId,
      req.params.itemName
    )
      .then((data) => res.send(data))
      .catch(next);
  })

  .get("/remove/:gameId/:userId/:itemName", (req, res, next) => {
    Inventory.removeFromInventory(
      req.params.gameId,
      req.params.userId,
      req.params.itemName
    )
      .then((data) => res.send(data))
      .catch(next);
  });
