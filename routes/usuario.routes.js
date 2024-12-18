const authMiddleware = require("../middlewares/authMiddleware");
const validarAdmin = require("../middlewares/authMiddleware");

module.exports = (app) => {
  let router = require("express").Router();

  const controller = require("../controllers/usuario.controller.js");

  router.get("/", controller.listUsuario);
  router.get("/:id",authMiddleware, controller.getUsuarioById);
  router.post("/",authMiddleware , validarAdmin, controller.createUsuario);
  router.put("/:id", authMiddleware,validarAdmin,controller.updateUsuario);
  router.delete("/:id", authMiddleware,validarAdmin,controller.deleteUsuario);

  //login
  router.post("/login", controller.login);

  //change password
  router.put("/:id/password", validarAdmin, controller.changePassword);

  app.use("/usuario", router);
};
