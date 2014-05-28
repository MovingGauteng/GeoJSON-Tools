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
  var georesult = {},
    arr,
    error;
  if (!type) {
    type = "point";
  }
  type = type.toLowerCase();
  switch (type) {
  case 'point':
    var _array = _.flatten(array);
    var _a = JSON.stringify(array) || {};
    if (_array.length !== 2) {
      error = new Error("expected a single set of coordinates in [lat, lng] format. \nReceived " + _a);
    } else {
      arr = [parseFloat(_array[1]), parseFloat(_array[0])];
      georesult = {
        type: "Point",
        coordinates: arr
      };
    }
    break;
  case 'linestring':
  case 'multipoint':
    arr = [];
    _.each(array, function (a) {
      arr.push([parseFloat(a[1]), parseFloat(a[0])]);
    });
    if (type === 'linestring') {
      type = 'LineString';
    } else if (type === 'MultiPoint') {
      type = 'MultiPoint';
    }
    georesult = {
      type: type,
      coordinates: arr
    };
    break;
  case 'polygon':
    arr = [[]];
    if (array.length < 3) {
      error = new Error("Expecting 'array' to have at length of at least 3 sets of coordinates.");
    } else {
      if (array[0].toString() !== _.last(array).toString()) {
        array.push(array[0]);
      }
      _.each(array, function (a) {
        arr[0].push([parseFloat(a[1]), parseFloat(a[0])]);
      });
      georesult = {
        type: "Polygon",
        coordinates: arr
      };
    }
    break;
  case 'multilinestring':
    arr = [];
    var nested;
    // validate multilinestring
    _.find(array, function (a) {
      if (a.length < 2 && !error) {
        error = new Error("Expecting each LineString in MultiiLineString to have at least 2 points.");
        return true;
      } else {
        nested = [];
        _.each(a, function (_a) {
          nested.push([parseFloat(_a[1]), parseFloat(_a[0])]);
        });
        arr.push(nested);
        return false;
      }
    });
    if (!error) {
      georesult = {
        type: "MultiLineString",
        coordinates: arr
      };
    }
    break;
  case 'multipolygon':
    arr = [];
    var outer,
      inner;
    _.find(array, function (a) {
      outer = [];
      _.find(a, function (_a) {
        inner = [];
        if (_a.length < 3) {
          error = new Error("Expecting each array in MultiPolygon to have at least 3 points.");
          return true;
        }
        _.find(_a, function (__a) {
          inner.push([parseFloat(__a[1]), parseFloat(__a[0])]);
          return false;
        });
        outer.push(inner);
        return false;
      });
      arr.push(outer);
      return false;
    });
    if (!error) {
      georesult = {
        type: "MultiPolygon",
        coordinates: arr
      };
    }
    break;
  default:
    error = new Error("type not recognised. Should be 'point', 'linestring', or 'polygon'");
  }
  if (error) {
    return error;
  }
  return georesult;
};

/**
 *
 * @param {type} geoobj GeoJSON object
 * @returns {Array}
 */
var toArray = function (geoobj) {
  var array,
    error;
  if (!geoobj.type || !geoobj.coordinates) {
    return new Error("The object specified is not a a valid GeoJSON object");
  }
  switch (geoobj.type.toLowerCase()) {
  case 'point':
    array = [parseFloat(geoobj.coordinates[1]), parseFloat(geoobj.coordinates[0])];
    break;
  case 'linestring':
    // check if it is a valid line
    array = geoobj.coordinates;
    var line = [];
    _.find(array, function (ln) {
      if (typeof ln === 'object') {
        line.push([parseFloat(ln[1]), parseFloat(ln[0])]);
        return false;
      }
      error = new Error("the object specified is not a valid GeoJSON LineString");
      return true;
    });
    if (!error) {
      array = line;
    }
    break;
  case 'polygon':
    array = geoobj.coordinates[0];
    if (!array.length) {
      error = new Error("the object specified is not a valid GeoJSON Polygon");
    } else {
      var poly = [];
      _.find(array, function (a) {
        if (a[0].toString() !== _.last(a).toString()) {
          error = new Error("The first and last coordinates of a Polygon are not the same");
          return true;
        }
        if (a.length < 4) {
          error = new Error("A valid Polygon should have a minimum of 4 coordinates");
          return true;
        }
        _.each(_.initial(a), function (pl) {
          poly.push([parseFloat(pl[1]), parseFloat(pl[0])]);
        });
        return false;
      });
      if (!error) {
        array = poly;
      }
    }
    break;
  default:
    error = new Error("unknown GeoJSON type specified");
  }
  if (error) {
    return error;
  }
  return array;
};

/**
 *
 * @param {Array} array array of coordinates
 * @param {Number} decimals number of decimals to return
 * @returns {Number}
 */
var getDistance = function (array, decimals) {
  if (Number.prototype.toRad === undefined) {
    Number.prototype.toRad = function () {
      return this * Math.PI / 180;
    };
  }

  decimals = decimals || 3;
  var earthRadius = 6378.137, // km
    distance = 0,
    len = array.length,
    i,
    x1,
    x2,
    lat1,
    lat2,
    lon1,
    lon2,
    dLat,
    dLon,
    a,
    c,
    d;
  for (i = 0; (i + 1) < len; i++) {
    x1 = array[i];
    x2 = array[i + 1];

    lat1 = parseFloat(x1[0]);
    lat2 = parseFloat(x2[0]);
    lon1 = parseFloat(x1[1]);
    lon2 = parseFloat(x2[1]);

    dLat = (lat2 - lat1).toRad();
    dLon = (lon2 - lon1).toRad();
    lat1 = lat1.toRad();
    lat2 = lat2.toRad();

    a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    d = earthRadius * c;
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