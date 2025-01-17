const db = require("../models");
const { isRequestValid } = require("../utils/request.utils");
const { uploadImage } = require("../utils/imagen.utils");
const fs = require("fs");

exports.listIncidente = async (req, res) => {
  try {
    const incidentes = await db.incidentes.findAll({
      include: ["usuario"],
    });
    res.status(200).json(incidentes);
  } catch (error) {
    sendError500(res, error);
  }
};

exports.getIncidenteById = async (req, res) => {
  try {
    const id = req.params.id;
    const incidente = await db.incidentes.findByPk(id);
    if (!incidente) {
      res.status(404).json({
        message: "Incidente no encontrado",
      });
    } else {
      res.status(200).json(incidente);
    }
  } catch (error) {
    sendError500(res, error);
  }
};

exports.createIncidente = async (req, res) => {
  try {
    console.log(req.body);
    const requiredFields = ["tipo", "descripcion", "puntoId"];
    if (!req.files) {
      res.status(400).json({
        msg: "No se ha enviado la imagen",
      });
      return;
    }

    if (isRequestValid(requiredFields, req.body, res)) {
      console.log("req.paso");
      const pathImage = uploadImage(req.files.foto, "incidente");
      const incidente = {
        tipo: req.body.tipo,
        descripcion: req.body.descripcion,
        puntoId: req.body.puntoId,
        foto: pathImage,
      };
      if (req.body.usuarioId) {
        incidente.usuarioId = req.body.usuarioId;
      }
      const newIncidente = await db.incidentes.create(incidente);

      //cuando se crea se actualiza el estado de la carretera a bloqueada
      const punto = await db.puntos.findByPk(req.body.puntoId);
      const carretera = await db.carreteras.findByPk(punto.carreteraId);
      carretera.estado = "Bloqueada";
      carretera.razonBloqueo = req.body.tipo;
      await carretera.save();
      res.status(201).json(newIncidente);
    }
  } catch (error) {
    sendError500(res, error);
  }
};

exports.updateIncidente = async (req, res) => {
  try {
    const requiredFields = ["tipo", "descripcion", "puntoId"];
    if (isRequestValid(requiredFields, req.body, res)) {
      const id = req.params.id;
      const incidente = await db.incidentes.findByPk(id);
      if (!incidente) {
        res.status(404).json({
          message: "Incidente no encontrado",
        });
      } else {
        if (req.files) {
          const pathImage = uploadImage(req.files.foto, "incidente");
          const pathImageOld = incidente.foto;
          if (pathImageOld) {
            fs.unlinkSync("public/images/incidente/" + pathImageOld);
          }
          incidente.foto = pathImage;
        }
        incidente.tipo = req.body.tipo;
        incidente.descripcion = req.body.descripcion;
        incidente.puntoId = req.body.puntoId;
        if (req.body.usuarioId) {
          incidente.usuarioId = req.body.usuarioId;
        }
        await incidente.save();
        res.status(200).json(incidente);
      }
    }
  } catch (error) {
    sendError500(res, error);
  }
};

exports.deleteIncidente = async (req, res) => {
  try {
    const id = req.params.id;
    const incidente = await db.incidentes.findByPk(id);
    if (!incidente) {
      res.status(404).json({
        message: "Incidente no encontrado",
      });
    } else {
      const pathImage = incidente.foto;
      if (pathImage) {
        fs.unlinkSync("public/images/incidente/" + pathImage);
      }
      await incidente.destroy();
      res.status(204).json();
    }
  } catch (error) {
    sendError500(res, error);
  }
};

exports.eliminarFotoIncidente = async (req, res) => {
  try {
    const id = req.params.id;
    const incidente = await db.incidentes.findByPk(id);
    if (!incidente) {
      res.status(404).json({
        message: "Incidente no encontrado",
      });
    } else {
      const pathImage = incidente.foto;
      if (pathImage) {
        fs.unlinkSync("public/images/incidente/" + pathImage);
        incidente.foto = "affd16fd5264cab9197da4cd1a996f820e601ee4.png";
        await incidente.save();
        res.status(204).json();
      }
    }
  } catch (error) {
    sendError500(res, error);
  }
};

function sendError500(res, error) {
  console.error(error);
  res.status(500).json({
    message: "Error en el servidor",
  });
}
