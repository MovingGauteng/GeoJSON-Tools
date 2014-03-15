/**
 *
 * @since 0.1.0
 */

'use strict';
/*
 * Required dependencies
 */
var _ = require('underscore');

/**
 *
 * @param {Array} array
 * @param {String} type
 * @returns {object} GeoJSON object
 */
var toGeoJSON = function (array, type) {
  var georesult = {};
  if ( !type ) {
    type = "point";
  }
  type = type.toLowerCase();
  switch (type) {
    case 'point':
      var _array = _.flatten(array);
      var _a = JSON.stringify(array) || {};
      if (_array.length !== 2) {
        return new Error("expected a single set of coordinates in [lat, lng] format. \nReceived " + _a);
      }
      var arr = [_array[1], _array[0]];
      georesult = {
        type: "Point",
        coordinates: arr
      };
      return georesult;
    break;
    case 'linestring':
      var arr = [];
      _.each(array, function (a) {
        arr.push([a[1], a[0]]);
      });
      georesult = {
        type: "LineString",
        coordinates: _.uniq(arr, true, function (x) {
          return JSON.stringify(x) ;
        })
      };
      return georesult;
    break;
    case 'polygon':
      var arr = [[[]]];
      if (array.length < 3) {
        return new Error("Expecting 'array' to have at length of at least 3 sets of coordinates.");
      }
      if (array[0].toString() !== _.last(array).toString()) {
        array.push(array[0]);
      }
      _.each(array, function (a) {
        arr[0][0].push([a[1], a[0]]);
      });
      georesult = {
        type: "Polygon",
        coordinates: arr
      };
      return georesult;
    break;
    default:
      return new Error("type not recognised. Should be 'point', 'linestring', or 'polygon'");
  }
};

/**
 *
 * @param {type} geoobj GeoJSON object
 * @returns {Array}
 */
var toArray = function (geoobj) {
  if (!geoobj.type || !geoobj.coordinates) {
    return new Error("The object specified is not a a valid GeoJSON object");
  }
  switch (geoobj.type.toLowerCase()) {
    case 'point':
      var point = [geoobj.coordinates[1],geoobj.coordinates[0]];
      return point;
    break;
    case 'linestring':
      // check if it is a valid line
      var array = geoobj.coordinates;
      var line = [];
      _.each(array, function (ln) {
        if (typeof ln === 'object') {
          line.push([ln[1], ln[0]]);
        }
        else {
          return new Error("the object specified is not a valid GeoJSON LineString");
        }
      });
      return line;
    break;
    case 'polygon':
      var array = geoobj.coordinates[0];
      var poly = [];
      if (array[0].toString() !== _.last(array).toString()) {
        return new Error("The first and last coordinates of a Polygon are not the same");
      }
      _.each(_.initial(array), function (pl) {
        poly.push([pl[1], pl[0]]);
      });
      return poly;
    break;
    default:
      return new Error("unknown GeoJSON type specified");
  }
};

/**
 *
 * @param {Array} array array of coordinates
 * @param {Number} decimals number of decimals to return
 * @returns {Number}
 */
var getDistance = function (array, decimals) {
  if(typeof(Number.prototype.toRad) === "undefined") {
      Number.prototype.toRad = function () {
      return this * Math.PI / 180;
    };
  }

  decimals = decimals || 3;
  var earthRadius = 6378.137, // km
  	distance = 0,
  	len = array.length;
  for (var i = 0; (i + 1) < len; i++) {
    var x1 = array[i];
    var x2 = array[i + 1];

    var lat1 = parseFloat(x1[0]);
    var lat2 = parseFloat(x2[0]);
    var lon1 = parseFloat(x1[1]);
    var lon2 = parseFloat(x2[1]);

    var dLat = (lat2 - lat1).toRad();
    var dLon = (lon2 - lon1).toRad();
    lat1 = lat1.toRad();
    lat2 = lat2.toRad();

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = earthRadius * c;
    distance += d;
  }
  distance = Math.round(distance * Math.pow(10, decimals)) / Math.pow(10, decimals);
  return distance;
};

/*
 * Export functions
 */
exports.toGeoJSON = toGeoJSON;
exports.toArray = toArray;
exports.getDistance = getDistance;