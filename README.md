# geojson-tools.js

GeoJSON-Tools is a JavaScript module for working with location data, primarily using the GeoJSON specification.

We created GeoJSON-Tools from [rwt.to](//rwt.to) in order to use it on related projects that rely on GeoJSON (primarily for MongoDB's GeoJSON support).

You are welcome to use it, submit bug reports, add feature and pull requests!

## Installation

Install [node.js](http://nodejs.org/), then:

```sh
$ npm install geojson-tools
```

## Documentation

### Calculations

* [getDistance](#getDistance)

### Conversions

* [toGeoJSON](#toGeoJSON)
* [toArray](#toArray)

## Calculations

<a name="getDistance" />
### getDistance(array, decimals [optional])

Calculates the distance of an array of locations.

__Arguments__

* array - an array of locations, in the format `[lat, lng]`.
* decimals - the decimal points to round answer to, defaults to 3 decimal points.

__Example__

```js
var array = [
    [20, 30],
  [20.5, 29.5]
];
getDistance(array, 4);

// 76.321
```

To get the distance between two points, pass two points in the array, to get the distance of a linestring, pass the coordinates of the linestring.

## Conversions

<a name="toGeoJSON" />
### toGeoJSON(array, type)

Takes an input of an array and a `GeoJSON` type, and returns that `GeoJSON` object.

__Arguments__

* array - an array of locations, in the format `[lat, lng]`.
* type - the type of `GeoJSON` object to return (note that this is not case-sensitive.
The default type is 'Point', which is returned when pushing an array of a single set of coordinates.
Other types are `LineString` and `Polygon`.

<b>Note:</b> Other `GeoJSON` types will be supported in future versions. 

__Examples__

To convert to `GeoJSON::Point`

_Note that the array can be shallow or nested, but has to contain only one set of coordinates._
```js
var array = [[20, 30]];
toGeoJSON(array); // or toGeoJSON(array, 'point');

// {"type":"Point","coordinates":[30,20]}
```

To convert to `GeoJSON::LineString`
```js
var array = [
  [20, 30],
  [20.5, 29.5]
];
toGeoJSON(array, 'linestring');

// {"type":"LineString","coordinates":[[30,20],[29.5,20.5]]}
```

To convert to `GeoJSON::Polygon`

_The minimum number of coordinates should be 3, and there is no need to add the last coordinate in the array.._
```js
var array = [
  [20, 30],
  [20.5, 29.5],
  [21, 30.5]
];
toGeoJSON(array, 'polygon');

// {"type":"Polygon","coordinates":[[[[30,20],[29.5,20.5],[30.5,21],[30,20]]]]}
```

<a name="toArray" />
### toArray(geoobj)

Takes an input of a `GeoJSON` type, and returns coordinates in `[lat, lng]` format.
A single set of coordinates for a `Point`, or an array for other types.

__Arguments__

* geoobj - a valid `GeoJSON` object of the following types: `Point`, `LineString` or `Polygon`.

**Note:** Other `GeoJSON` types will be supported in future versions. 

__Examples__

To convert from `GeoJSON::Point`

_Note that the array can be shallow or nested, but has to contain only one set of coordinates._
```js
var geoobj = {"type":"Point","coordinates":[30,20]};
toArray(geoobj);

// [20,30]
```

To convert from `GeoJSON::LineString`
```js
var geoobj = {"type":"LineString","coordinates":[[30,20],[29.5,20.5]]};
toArray(geoobj);

// [[20,30],[20.5,29.5]]
```

To convert from `GeoJSON::Polygon`

_The minimum number of coordinates should be 3, and there is no need to add the last coordinate in the array.._
```js
var geoobj = {"type":"Polygon","coordinates":[[[[30,20],[29.5,20.5],[30.5,21],[30,20]]]]};
toArray(geoobj);

// [[20,30],[20.5,29.5],[21,30.5]]
```
