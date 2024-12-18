const authMiddleware = require("../middlewares/authMiddleware");

module.exports = (app) => {
  let router = require("express").Router();

  const controller = require("../controllers/incidente.controller.js");

  router.get("/", controller.listIncidente);
  router.get("/:id",authMiddleware, controller.getIncidenteById);
  router.post("/",authMiddleware, controller.createIncidente);
  router.put("/:id",authMiddleware, controller.updateIncidente);
  router.delete("/:id", authMiddleware,controller.deleteIncidente);

  //delete foto
  router.delete("/:id/foto/",authMiddleware, controller.eliminarFotoIncidente);

  app.use("/incidente", router);
};
