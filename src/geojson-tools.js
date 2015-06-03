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
 * returns an object with result, and error message if provided
 *
 * @param {Boolean} error, can also take any JavaScript object
 * @param {Boolean} indicator of whether to return error message
 * @param {Object} object containing error message
 * @returns {Object} result and error message
 */
var _returnError = function (err, returnError, options) {
  if (!returnError) {
    return err;
  }
  if (!options) {
    options = {};
  }
  if (options.message) {
    return {result: err, message: options.message};
  }
  return {result: err};
};

var _isPosition = function (coordinates, returnError) {
  if (coordinates.length < 2 || !_.isNumber(coordinates[0]) || !_.isNumber(coordinates[1])) {
    return _returnError(false, returnError, {message: 'invalid coordinates for GeoJSON Point'});
  }
  // Position is valid
  return true;
};

var _isLinearRing = function (arr, returnError) {
  var invalid = _.find(arr, function (coordinates) {
    if (coordinates.length < 4) {
      return _returnError(false, returnError, {message: 'expecting coordinates of GeoJSON object to have at least 4 positions'});
    }
    if (!_.isEqual(_.last(coordinates), coordinates[0])) {
      return _returnError(false, returnError, {message: 'the first and last positions of GeoJSON LinearRing are not the same'});
    }
    return _isPosition(coordinates);
  });
  if (invalid) {
    return _returnError(false, returnError, {message: ''});
  }
  return true;
};

var _isLineString = function (coordinates, returnError) {
  var invalid = _.find(coordinates, function (xy) {
    return !_isPosition(xy);
  });
  if (invalid) {
    return _returnError(false, returnError, {message: 'one of the coordinates of the LineString are invalid'});
  }
  // GeoJSON LineString coordinates are valid
  return true;
};

/**
 * converts degrees to radians
 *
 * @param {Number} coordinates in degrees
 * @returns {Number} coordinates in radians
 */
var _toRadian = function (degree) {
  return degree * Math.PI / 180;
};

/**
 *
 * @param {Array} array
 * @param {String} type
 * @returns {object} GeoJSON object
 */
var toGeoJSON = function (array, type) {
  var georesult = {},
    arr,
    error,
    nested;
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
    } else if (type === 'multipoint') {
      type = 'MultiPoint';
    }
    georesult = {
      type: type,
      coordinates: arr
    };
    break;
  case 'polygon':
    if (_.isArray(array) && _.isArray(array[0]) && !_.isArray(array[0][0])) {
      array = [array];
    }
    arr = [];
    _.find(array, function (_array) {
      if (_array.length < 3) {
        error = new Error("Expecting 'array' to have at length of at least 3 sets of coordinates.");
        return true;
      }
      if (_array.toString() !== _.last(_array).toString()) {
        _array.push(_array[0]);
      }
      nested = [];
      _.each(_array, function (a) {
        nested.push([parseFloat(a[1]), parseFloat(a[0])]);
      });
      arr.push(nested);
      return false;
    });
    if (!error) {
      georesult = {
        type: "Polygon",
        coordinates: arr
      };
    }
    break;
  case 'multilinestring':
    arr = [];
    // validate multilinestring
    _.find(array, function (a) {
      if (a.length < 2 && !error) {
        error = new Error("Expecting each LineString in MultiLineString to have at least 2 points.");
        return true;
      }
      nested = [];
      _.each(a, function (_a) {
        nested.push([parseFloat(_a[1]), parseFloat(_a[0])]);
      });
      arr.push(nested);
      return false;
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
    error = new Error("type not recognised or supported");
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
    error,
    poly,
    multiline,
    line;
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
    line = [];
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
    array = [];
    // check if valid object
    _.find(geoobj.coordinates, function (a) {
      if (!a.length) {
        error = new Error("the object specified is not a valid GeoJSON Polygon");
        return true;
      }
      poly = [];
      if (a[0].toString() !== _.last(a).toString()) {
        error = new Error("The first and last coordinates of the Polygon are not the same");
        return true;
      }
      if (a.length < 4) {
        error = new Error("A valid Polygon should have a minimum set of 4 points");
        return true;
      }
      _.each(_.initial(a), function (pl) {
        poly.push([parseFloat(pl[1]), parseFloat(pl[0])]);
      });
      array.push(poly);
      if (!error) {
        array = poly;
      }
      return false;
    });
    break;
  case 'multipoint':
    array = [];
    // REVIEW should we check if valid object? Or can we do it at the top?
    _.each(geoobj.coordinates, function (pt) {
      array.push([parseFloat(pt[1]), parseFloat(pt[0])]);
    });
    break;
  case 'multilinestring':
    array = [];
    // check if valid object
    _.find(geoobj.coordinates, function (a) {
      if (!a.length) {
        error = new Error("the object specified is not a valid GeoJSON MultiLineString");
        return true;
      }
      multiline = [];
      _.each(a, function (pl) {
        multiline.push([parseFloat(pl[1]), parseFloat(pl[0])]);
      });
      array.push(multiline);
      return false;
    });
    break;
  case 'multipolygon':
    array = [];
    _.each(geoobj.coordinates, function (coord) {
      _.find(coord, function (a) {
        if (!a.length) {
          error = new Error("the object specified is not a valid GeoJSON Polygon");
          return true;
        }
        poly = [];
        if (a[0].toString() !== _.last(a).toString()) {
          error = new Error("The first and last coordinates of the Polygon are not the same");
          return true;
        }
        if (a.length < 4) {
          error = new Error("A valid Polygon should have a minimum set of 4 points");
          return true;
        }
        _.each(_.initial(a), function (pl) {
          poly.push([parseFloat(pl[1]), parseFloat(pl[0])]);
        });
        array.push(poly);
        return false;
      });
      // return?
    });
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

    dLat = _toRadian(lat2 - lat1);
    dLon = _toRadian(lon2 - lon1);
    lat1 = _toRadian(lat1);
    lat2 = _toRadian(lat2);

    a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    d = earthRadius * c;
    distance += d;
  }
  distance = Math.round(distance * Math.pow(10, decimals)) / Math.pow(10, decimals);
  return distance;
};

/**
 * takes a `LineString` or an array of coordinates, and returns one with more coordinates
 + having the distance parameter as the maximum distance between each set of coordinates.
 *
 * @param {Object} either a valid LineString, or an array of coordinates
 * @param {Number} maximum distance in meters between points
 * @returns {Object} either a LineString or array of coordinates
 */
var complexify = function (linestring, distance) {
  if (!_.isNumber(distance) || distance < 0.01) {
    console.error(new Error('distance should be a number greater than 10 meters'));
    return null;
  }
  var returnGeoJSON;
  if (!_.isArray(linestring)) {
    // check if it is a GeoJSON LineString and convert it
    if (linestring.coordinates && _.isArray(linestring.coordinates) && linestring.type.toLowerCase() === 'linestring') {
      returnGeoJSON = true;
      linestring = toArray(linestring);
    } else {
      console.error(new Error('distance should be a number greater than 10 meters'));
      return null;
    }
  }
  var t, // threshold
    cur,
    prev, // temporary points
    result = [],
    points = [],
    d;
  cur = linestring.shift();
  result.push(cur);
  points.push(cur);
  // variables used in the loop
  var reasonable,
    ratio,
    _d,
    totalDistance,
    a,
    b,
    bearing,
    c;
  _.each(linestring, function (point) {
    prev = cur;
    cur = point;
    d = getDistance([cur, prev]);
    if (d > distance) {
      t = 0;
      reasonable = false;
      // estimate where distance could be, then perform a binary search to find the best-fit coordinates
      ratio = distance / d;
      _d = distance;
      totalDistance = 0;
      while (!reasonable || (totalDistance + distance < d)) {
        a = _.last(result);
        b = cur;
        bearing = [];
        if (a[0] > b[0]) {
          bearing.push(-1);
        } else {
          bearing.push(1);
        }
        if (a[1] > b[1]) {
          bearing.push(-1);
        } else {
          bearing.push(1);
        }
        c = [(b[0] - a[0]) * ratio * bearing[0], (b[1] - a[1]) * ratio * bearing[1]];
        if (bearing[0] > 0) {
          c[0] = c[0] + a[0];
        } else {
          c[0] = a[0] - c[0];
        }
        if (bearing[1] > 0) {
          c[1] = c[1] + a[1];
        } else {
          c[1] = a[1] - c[1];
        }
        bearing = [];
        _d = getDistance([a, c]);
        if (_d !== distance) {
          t = (_d / distance); // goalseek threshold and search for next nearest point
          ratio = ratio + (ratio * (1 - t));
        } else {
          totalDistance += distance;
          reasonable = true;
          result.push(c);
        }
      }
      totalDistance = 0;
      reasonable = false;
      result.push(cur);
    } else {
      result.push(cur);
    }
  });
  if (returnGeoJSON) {
    return toGeoJSON(result, 'linestring');
  }
  return result;
};

/**
 * takes an input of an object, and returns a `true` or `false`. Include a `Boolean`
 + to return a validation message for invalid objects.
 *
 * @param {Object} either a valid LineString, or an array of coordinates
 * @param {Boolean} Optional true/false to return error message on invalid object
 * @returns {Boolean} either true, false, or an object if `returnError` is not falsy
 */
var isGeoJSON = function (obj, returnError) {
  var validTypes = [
    "Point",
    "MultiPoint",
    "LineString",
    "MultiLineString",
    "Polygon",
    "MultiPolygon",
    "Feature",
    "FeatureCollection",
    "GeometryCollection"
  ];
  var invalid;
  var index = _.indexOf(validTypes, obj.type);
  if (!obj.type || index < 0) {
    return _returnError(false, returnError, {message: 'invalid GeoJSON type supplied'});
  }
  if (index < 6) {
    if (!obj.coordinates || !_.isArray(obj.coordinates)) {
      return _returnError(false, returnError, {message: 'invalid GeoJSON type supplied'});
    }
    if (obj.type === 'Point') {
      // expect a single set of coordinates, or an array where the first 2 elements are numbers
      return _isPosition(obj.coordinates, returnError);
    }
    if (obj.type === 'MultiPoint') {
      if (obj.coordinates.length < 2) {
        return _returnError(false, returnError, {message: 'expecting array with at least 2 elements for GeoJSON MultiPoint'});
      }
      invalid = _.find(obj.coordinates, function (xy) {
        return !_isPosition(xy);
      });
      if (invalid) {
        return _returnError(false, returnError, {message: 'one of the coordinates of the GeoJSON MultiPoint are invalid'});
      }
      // GeoJSON MultiPoint is valid
      return true;
    }
    if (obj.type === 'LineString') {
      if (obj.coordinates.length < 2) {
        return _returnError(false, returnError, {message: 'expecting array with at least 2 elements for GeoJSON LineString'});
      }

      return _isLineString(obj.coordinates, returnError);
    }
    if (obj.type === 'MultiLineString') {
      if (obj.coordinates.length < 2) {
        return _returnError(false, returnError, {message: 'expecting array of multiple set of coordinates for GeoJSON MultiLineString'});
      }
      invalid = _.find(obj.coordinates, function (coordinates) {
        return !_isLineString(coordinates, returnError);
      });
      if (invalid) {
        return _returnError(false, returnError, {message: 'one of the coordinates of the GeoJSON MultiLineString are invalid'});
      }
      // GeoJSON MultiLineString is valid
      return true;
    }
    if (obj.type === 'Polygon') {
      return _isLinearRing(obj.coordinates, returnError);
    }
    if (obj.type === 'MultiPolygon') {
      invalid = _.find(obj.coordinates, function (coordinates) {
        return !_isLinearRing(coordinates, returnError);
      });
      if (invalid) {
        return _returnError(false, returnError, {message: 'one of the coordinateof the GeoJSON MultiPolygon are invalid'});
      }
      // GeoJSON MultiPolygon is valid
      return true;
    }
  }
  if (index === 6) {
    if (!obj.geometry) {
      return _returnError(false, returnError, {message: 'expected GeoJSON Feature to have a geometry'});
    }
    if (!obj.properties) {
      return _returnError(false, returnError, {message: 'expected GeoJSON Feature to have properties'});
    }
    // NOTE that we use recursion here, don't like the practise but we had to do it
    // a feature can have an `id` but it is optional, we do not check it.
    return isGeoJSON(obj.geometry, returnError);
  }
  if (index === 7) {
    if (!obj.features) {
      return _returnError(false, returnError, {message: "expected GeoJSON FeatureCollection to have features"});
    }
    if (!_.isArray(obj.features)) {
      return _returnError(false, returnError, {message: "expected GeoJSON FeatureCollection's features to be an array"});
    }
    invalid = _.find(obj.features, function (feature) {
      return !isGeoJSON(feature);
    });
    if (invalid) {
      return _returnError(false, returnError, {message: "one of the GeoJSON FeatureCollection's features is invalid"});
    }
    return true;
  }
  if (index === 8) {
    if (!obj.geometries) {
      return _returnError(false, returnError, {message: "expected GeoJSON GeometryCollection to have geometries"});
    }
    if (!_.isArray(obj.geometries)) {
      return _returnError(false, returnError, {message: 'expected GeoJSON GeometryCollection\'s geometries to be an array'});
    }
    invalid = _.find(obj.geometries, function (geometry) {
      return !isGeoJSON(geometry);
    });
    if (invalid) {
      return _returnError(false, returnError, {message: 'one of the GeoJSON GeometryCollection\'s geometries is invalid'});
    }
    // GeoJSON GeometryCollection is valid
    return true;
  }
};

/*
 * Export functions
 */
exports.toGeoJSON = toGeoJSON;
exports.toArray = toArray;
exports.getDistance = getDistance;
exports.complexify = complexify;
exports.isGeoJSON = isGeoJSON;
