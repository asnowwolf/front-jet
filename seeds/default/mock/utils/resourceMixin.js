'use strict';
var restify = require('restify');
var _ = require('lodash');

module.exports = function (server) {
  server.resource = function (name, items) {
    server.get('/' + name, function (req, res, next) {
      var offset = +req.params.offset || 0;
      var size = +req.params.size || 200;
      if (size > 200) {
        next(new restify.InvalidArgumentError("Size parameter must be <= 200"));
      } else {
        res.send(200, items.slice(offset, size));
        next();
      }
    });
    server.head('/' + name, function (req, res, next) {
      res.send(200, '', {'X-Record-Count': items.length});
      next();
    });
    server.get('/' + name + '/:id', function (req, res, next) {
      var item = findById(items, req.params.id);
      if (!item) {
        next(new restify.NotFoundError('Object with ' + req.params.id + ' not found!'))
      } else {
        res.send(200, item);
        next();
      }
    });
    server.post('/' + name, function (req, res, next) {
      var item = _.extend({}, req.body, {id: (items.length + 1).toString()});
      items.push(item);
      res.header('Location', '/' + name + '/' + item.id);
      res.send(201);
      next();
    });
    server.put('/' + name + '/:id', function (req, res, next) {
      var item = findById(items, req.params.id);
      if (!item) {
        next(new restify.NotFoundError('Object with ' + req.params.id + ' not found!'))
      } else {
        _.extend(item, req.body);
        res.header('Location', '/' + name + '/' + item.id);
        res.send(200);
        next();
      }
    });
    server.del('/' + name + '/:id', function (req, res, next) {
      var item = findById(items, req.params.id);
      if (!item) {
        next(new restify.NotFoundError('Object with ' + req.params.id + ' not found!'))
      } else {
        var index = items.indexOf(item);
        items.splice(index, 1);
        res.send(204);
        next();
      }
    });
    // 支持资源列表中使用数字型id
    function findById(items, id) {
      return _.find(items, function (item) {
        return item.id == id;
      });
    }
  };
};
