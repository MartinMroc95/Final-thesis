import express from "express";
import mongoose from "mongoose";
import xlstojson from "xls-to-json-lc";
import xlsxtojson from "xlsx-to-json-lc";
import { upload } from "./utils";
import { Data } from "./db";

const router = express.Router();

var exceltojson = xlstojson;

// GET

router.get("/okdata", function(req, res) {
  Data.find({ status: "Vyhovujúci" }, function(err, result) {
    if (err) {
      res.json({ error_code: 1, err_desc: "Empty dataset" });
    } else {
      res.json({ error_code: 0, err_desc: null, data: result });
    }
  });
});

router.get("/data", function(req, res) {
  Data.find({}, function(err, result) {
    if (err) {
      res.json({ error_code: 1, err_desc: "Empty dataset" });
    } else {
      res.json({ error_code: 0, err_desc: null, data: result });
    }
  });
});

router.get("/data/:id", function(req, res) {
  Data.findById(req.params.id, function(err, result) {
    if (err) {
      res.json({ error_code: 1, err_desc: "Empty dataset" });
    } else {
      res.json({ error_code: 0, err_desc: null, data: result });
    }
  });
});

// POST

router.post("/upload", function(req, res) {
  upload(req, res, function(err) {
    if (err) {
      res.json({ error_code: 1, err_desc: err });
      return;
    }

    if (req.files.length === 0) {
      res.json({ error_code: 1, err_desc: "No files passed" });
      return;
    }
    req.files.forEach((file, index) => {
      /** Multer gives us file info in req.file object */
      if (!file) {
        res.json({ error_code: 1, err_desc: "No file passed" });
        return;
      }
      // Tu je potrebné zistiť, či je súbor xls alebo xlsx a podľa toho použiť správnu funkciu
      if (file.originalname.split(".")[file.originalname.split(".").length - 1] === "xlsx") {
        exceltojson = xlsxtojson;
      } else {
        exceltojson = xlstojson;
      }
      try {
        exceltojson(
          {
            input: file.path,
            output: null,
            lowerCaseHeaders: true,
          },
          function(err, result) {
            if (err) {
              return res.json({ error_code: 1, err_desc: err, data: null });
            }
            const doc = new Data({
              _id: new mongoose.Types.ObjectId(),
              name: file.originalname,
              filePath: file.path,
              data: result,
              status: "Netestovaný",
            });
            doc.save(result, function(err, success) {
              if (err) {
                console.error(err);
                return;
              }
              if (index === req.files.length - 1) {
                res.json({ error_code: 0, err_desc: null, data: result });
              }
            });
          }
        );
      } catch (e) {
        res.json({ error_code: 1, err_desc: "Corupted excel file" });
      }
    });
  });
});

router.post("/set-status/:id", function(req, res) {
  Data.updateOne({ _id: req.params.id }, { status: req.body.status }, function(err, result) {
    if (err) {
      res.json({ error_code: 1, err_desc: "Empty dataset" });
    } else {
      Data.findById(req.params.id, function(err, result) {
        if (err) {
          res.json({ error_code: 1, err_desc: "Empty dataset" });
        } else {
          res.json({ error_code: 0, err_desc: null, data: result });
        }
      });
    }
  });
});

export default router;
