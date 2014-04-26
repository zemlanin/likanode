var express = require('express');
var cons = require('consolidate');
var sqlite3 = require('sqlite3');
var utils = require('./utils.js');

var app = express();

var db = new sqlite3.Database("likamag.sqlite");

app.engine('mustache', cons.mustache);
app.set('view engine', 'mustache');
app.set('views', __dirname + '/tpl');

app.use('/static', express.static(__dirname + '/public'));

app.get('/', function (req, res){  // index
  res.render('foo', {
    siteUrl: process.env.SITEURL || 'localhost',
    userTwitter: 'zemlanin',
  });
});

app.post(/\/-(.*)$/, function (req, res){  // shrink
  var uri = req.params[0];

  if (uri != 'magnet:') {
    res.json(400, {
      'error': 'magnets only',
    });
  } else {
    if (!req.query.xt) {
      res.json(400, {
        'error': 'incorrect magnet, xt param required',
      });
    } else {
      db.all(
        "SELECT * FROM links WHERE url=$xt LIMIT 1",
        {"$xt": req.query.xt},
        function (err, rows) {
          if (rows && rows.length) {
            var magnet = rows[0];
            res.json(200, {
              'code': utils.encode(magnet.id),
            });
          } else {
            db.run(
              "INSERT INTO links (url, clx) VALUES ($xt, 0)",
              {"$xt": req.query.xt},
              function () {
                res.json(200, {
                  'code': utils.encode(this.lastID),
                });
              }
            );
          }
        }
      );
    }
  }
});

app.get(/\/(\w+)$/, function (req, res){  // redirect
  var code = req.params[0];
  var id = utils.decode(code);
  if (!id) {
    res.json(400, {
      'error': 'wrong code'
    });
  } else {
    db.all(
      "SELECT * FROM links WHERE id=$id LIMIT 1",
      {"$id": id},
      function (err, rows) {
        if (rows.length) {
          var magnet = rows[0];
          res.redirect(301, 'magnet:?xt='+magnet.url);
          db.run("UPDATE links SET clx=$clx WHERE id=$id", {
            "$clx": magnet.clx+1,
            "$id": magnet.id,
          });
        } else {
          res.json(404, {
            'error': 'not found'
          });
        }
      }
    );
  }
});

app.get(/\/(\w+)\+$/, function (req, res){  // stats
  var code = req.params[0];
  var id = utils.decode(code);
  if (!id) {
    res.json(400, {
      'error': 'wrong code'
    });
  } else {
    db.all(
      "SELECT * FROM links WHERE id=$id LIMIT 1",
      {"$id": id},
      function (err, rows) {
        if (rows.length) {
          var magnet = rows[0];
          res.json(200, {
            'code': code,
            'url': 'magnet:?xt='+magnet.url,
            'clicks': magnet.clx,
          });
        } else {
          res.json(404, {
            'error': 'not found'
          });
        }
      }
    );
  }
});

app.listen(process.env.PORT || 3000);
