	
    var express = require('express'); 
    var app = express(); 
    var bodyParser = require('body-parser');
    var multer = require('multer');
    var xlstojson = require("xls-to-json-lc");
    var xlsxtojson = require("xlsx-to-json-lc");

    app.use(bodyParser.json());  

    var storage = multer.diskStorage({ //multers disk storage settings
        destination: function (req, file, cb) {
            cb(null, './uploads/')
        },
        filename: function (req, file, cb) {
            var datetimestamp = Date.now();
            cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
        }
    });

    var upload = multer({ //multer settings
                    storage: storage,
                    fileFilter : function(req, file, callback) { //file filter
                        if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
                            return callback(new Error('Wrong extension type'));
                        }
                        callback(null, true);
                    }
                }).single('file');

    /** API path that will upload the files */
    app.post('/upload', function(req, res) {
        var exceltojson;
        upload(req,res,function(err){
            if(err){
                 res.json({error_code:1,err_desc:err});
                 return;
            }
            /** Multer gives us file info in req.file object */
            if(!req.file){
                res.json({error_code:1,err_desc:"No file passed"});
                return;
            }
            /** Check the extension of the incoming file and 
             *  use the appropriate module
             */
            if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
                exceltojson = xlsxtojson;
            } else {
                exceltojson = xlstojson;
            }
            console.log(req.file.path);
            try {
                exceltojson({
                    input: req.file.path,
                    output: __dirname + '/test.json', //null - since we don't need output.json
                    lowerCaseHeaders: true
                }, function(err,result){
                    if(err) {
                        return res.json({error_code:1,err_desc:err, data: null});
                    } 
                     res.json(result);
                });
            } catch (e){
                res.json({error_code:1,err_desc:"Corupted excel file"});
            }
            
        })
       
    });

    const fs = require('fs')

    fs.readFile('./test.json', (err, data) => {
      if (err) throw err;
      console.log(data);
    });

    // const storeData = (data, path) => {
    //   try {
    //     fs.writeFileSync('./test.json', JSON.stringify(data))
    //   } catch (err) {
    //     console.error(err)
    //   }
    // }

    // var result = result();

    // const fs = require('fs');
    // fs.writeFile("data.json", result, function(err) {
    // if(err) {
    //     return console.log(err);
    // }

    // console.log("The file was saved!");
    // }); 
	
    app.use('/css', express.static('css'));
    app.use('/js', express.static('js'));
    app.use('/images', express.static('images'));

	app.get('/',function(req,res){
		res.sendFile(__dirname + "/index.html");
	});

    app.listen('3000', function(){
        console.log('running on 3000...');
    });