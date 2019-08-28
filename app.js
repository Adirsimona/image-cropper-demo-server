const express       = require('express');
const bodyParser    = require('body-parser');
const multer        = require('multer');
var fs              = require('fs');
const app           = express();
const MongoClient   = require('mongodb').MongoClient;
const myurl         = 'mongodb://localhost:27017';
const DIR           = './uploads/';
const storage       = multer.diskStorage({
    destination: DIR,
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}_${file.originalname}`)
    }
})
const upload            = multer({storage})
const DB_NAME           = 'uploads';
const COLLECTION_NAME   = 'images';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
}); 
 
MongoClient.connect(myurl, (err, client) => {
    if (err) return console.log(err);

    db = client.db(DB_NAME);

    app.post('/upload', upload.single('photo'), (req, res) => {
        const img            = fs.readFileSync(req.file.path);
        const encode_image   = img.toString('base64');
        const finalImg       = {
            contentType: req.file.mimetype,
            image: new Buffer(encode_image, 'base64')
        };

        return db.collection(COLLECTION_NAME).insertOne(finalImg, (err, result) => {
            if (err) return console.log(err)
            return res.send({ result }, 200); 
        })
    })

    app.listen(3000, () => {
        console.log('listening on 3000');
    })
})
