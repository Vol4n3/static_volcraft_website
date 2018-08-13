"use strict";
let express = require('express');
let http = require('http');
let bodyParser = require('body-parser');
let router = express.Router();
let fs = require('fs');
let app = express();
let server = http.createServer(app);
let fetch = require('node-fetch');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

app.use('', router);
server.listen(9080, () => {
    console.log('Api listen on http://localhost:9080');
});
const cacheUser = {};
router.get('/stats', function (req, res) {
    try {
        fs.readdir('../stats/', (err, files) => {
            const data = [];
            if (err) {
                res.status(200).json({user: []});
                return;
            }
            for (let i = 0; i < files.length; i++) {
                const withoutExt = files[i].replace('.json', '');
                const userUUID = withoutExt.replace(/[-]/g, '');
                if (cacheUser[userUUID]) {
                    fs.readFile('../stats/' + files[i], 'utf-8', function (err, content) {
                        const userSave = cacheUser[userUUID];
                        let stats = {};
                        if (!err) {
                            stats = JSON.parse(content);
                            userSave.stats = stats;
                        }
                        data.push(userSave);
                        if (i === files.length - 1) {
                            res.status(200).json(data);
                        }
                    });
                } else {
                    fetch(`https://api.mojang.com/user/profiles/${userUUID}/names`).then(res => res.json()).then(json => {
                        fs.readFile('../stats/' + files[i], 'utf-8', function (err, content) {
                            let stats = {};
                            if (!err) {
                                stats = JSON.parse(content);
                            }
                            let user = {
                                pseudos: json,
                                uuid: withoutExt,
                                stats
                            };
                            data.push(user);
                            cacheUser[userUUID] = user;
                            if (i === files.length - 1) {
                                res.status(200).json(data);
                            }
                        });
                    });
                }
            }
        });
    } catch (e) {
        res.status(404).json({});
    }

});

router.get('/stats/:user', function (req, res) {
    try {
        const params = req.params || {};
        const user = params.user.replace(/[\/.\\]/g, '');
        fs.readFile('../stats/' + user + '.json', 'utf-8', function (err, content) {
            if (err) {
                res.status(404).json({});
                return;
            }

            res.status(200).json(JSON.parse(content));
        });
    } catch (e) {
        res.status(404).json({});
    }
});