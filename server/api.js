import express from "express";
import mongoose from "mongoose";
import xlstojson from "xls-to-json-lc";
import xlsxtojson from "xlsx-to-json-lc";
import { upload } from "./utils";
import { Data } from "./db";

const router = express.Router();

var exceltojson = xlstojson;

// GET

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
      console.log(result);
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
    /** Multer gives us file info in req.file object */
    if (!req.file) {
      res.json({ error_code: 1, err_desc: "No file passed" });
      return;
    }
    // tu je potrebne zistit, ci je subor xls alebo xlsx a podla toho pouzit spravnu funkciu
    if (req.file.originalname.split(".")[req.file.originalname.split(".").length - 1] === "xlsx") {
      exceltojson = xlsxtojson;
    } else {
      exceltojson = xlstojson;
    }
    console.log(req.file.path);
    try {
      exceltojson(
        {
          input: req.file.path,
          output: null,
          lowerCaseHeaders: true,
        },
        function(err, result) {
          if (err) {
            return res.json({ error_code: 1, err_desc: err, data: null });
          }
          const doc = new Data({
            _id: new mongoose.Types.ObjectId(),
            name: req.file.originalname,
            filePath: req.file.path,
            data: result,
            status: "NOT_TESTED",
          });
          doc.save(result, function(err, success) {
            if (err) {
              console.error(err);
              return;
            }
            res.json({ error_code: 0, err_desc: null, data: result });
          });
        }
      );
    } catch (e) {
      res.json({ error_code: 1, err_desc: "Corupted excel file" });
    }
  });
});

export default router;