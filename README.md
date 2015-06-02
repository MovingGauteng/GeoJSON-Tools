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
* [complexify](#complexify)

### Conversions

* [toGeoJSON](#toGeoJSON)
* [toArray](#toArray)

### Validations

* [isGeoJSON](#isGeoJSON)

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

<a name="complexify" />
### complexify(linestring, distance)

Convert `LineString` or array of coordinates to a 'complex' line with specified maximum distance between each set of points.

__Arguments__

* linestring - a valid GeoJSON `LineString`, or an array of locations, in the format `[lat, lng]`.
* distance - the maximum distance between each two locations, in meters. Minimum distance must be 10 meters.

__Example__

```js
var array = [
    [20, 30],
  [20.5, 29.5]
];
complexify(array, .5); // 500 meters

/*
[
  [
    20,
    30
  ],
  [
    20.01374457881841,
    29.98625542118159
  ],
  [
    20.02749358953798,
    29.97250641046202
  ],
  [
    20.04124228409795,
    29.95875771590205
  ],
  [
    20.054991756377518,
    29.945008243622482
  ],
  [
    20.068742346786582,
    29.931257653213418
  ],
  [
    20.082493595207826,
    29.917506404792174
  ],
  [
    20.09624419012715,
    29.90375580987285
  ],
  [
    20.109998454446686,
    29.890001545553314
  ],
  [
    20.1237529737179,
    29.8762470262821
  ],
  [
    20.13750307275061,
    29.86249692724939
  ],
  [
    20.151256033129513,
    29.848743966870487
  ],
  [
    20.165010879444292,
    29.834989120555708
  ],
  [
    20.17876504224938,
    29.82123495775062
  ],
  [
    20.192520769690717,
    29.807479230309283
  ],
  [
    20.206277898630216,
    29.793722101369784
  ],
  [
    20.22003390658687,
    29.77996609341313
  ],
  [
    20.233790231590877,
    29.766209768409123
  ],
  [
    20.247544863923423,
    29.752455136076577
  ],
  [
    20.261305062529242,
    29.738694937470758
  ],
  [
    20.275060711787024,
    29.724939288212976
  ],
  [
    20.288822447172574,
    29.711177552827426
  ],
  [
    20.3025819531983,
    29.6974180468017
  ],
  [
    20.3163428239271,
    29.6836571760729
  ],
  [
    20.330106243909288,
    29.669893756090712
  ],
  [
    20.34386828218919,
    29.65613171781081
  ],
  [
    20.357630509669633,
    29.642369490330367
  ],
  [
    20.37139577415928,
    29.62860422584072
  ],
  [
    20.385162033041937,
    29.614837966958063
  ],
  [
    20.398927945160654,
    29.601072054839346
  ],
  [
    20.412692053486403,
    29.587307946513597
  ],
  [
    20.426458446138625,
    29.573541553861375
  ],
  [
    20.4402208587639,
    29.5597791412361
  ],
  [
    20.45398897904669,
    29.54601102095331
  ],
  [
    20.467757803444808,
    29.532242196555192
  ],
  [
    20.481524285475142,
    29.518475714524858
  ],
  [
    20.49529252216346,
    29.50470747783654
  ],
  [
    20.5,
    29.5
  ]
];
*/

distance of 'simple' linestring: 76.321 km
distance of 'complex' linesting: 76.321 km
```

<b>Note:</b> The algorithms works relatively well, and will return results that are > 99.9% accurate over short distances. Specifying distances > 500 km might return undesireable results.
We have also not added the option to specify precision, and precision is set at the default rounding of 3 decimals, this is to avoid infinite loops.

## Conversions

<a name="toGeoJSON" />
### toGeoJSON(array, type)

Takes an input of an array and a `GeoJSON` type, and returns that `GeoJSON` object.

__Arguments__

* array - an array of locations, in the format `[lat, lng]`.
* type - the type of `GeoJSON` object to return (note that this is not case-sensitive).
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

_The minimum number of coordinates should be 4, and there is no need to add the last coordinate in the array.
`Polygons` with holes are supported, however we currently do not test the validity of the holes._
```js
var array = [
  [20, 30],
  [20.5, 29.5],
  [21, 30.5]
];
toGeoJSON(array, 'polygon');

// {"type":"Polygon","coordinates":[[[30,20],[29.5,20.5],[30.5,21],[30,20]]]}
```

<a name="toArray" />
### toArray(geoobj)

Takes an input of a `GeoJSON` type, and returns coordinates in `[lat, lng]` format.
A single set of coordinates for a `Point`, or an array for other types.

__Arguments__

* geoobj - a valid `GeoJSON` object of the following types: `Point`, `LineString`, `Polygon`, `MultiPoint`, `MultiLineString` or `MultiPolygon`.

**Note:** The `Feature`, `FeatureCollection` and `GeometryCollection` objects are unsupported.
The logic being that it would make it difficult to work with such deeply nested arrays, and that the primary `GeoJSON` objects
would be mixed.

To convert the above to arrays, rather convert the individual geometries in the feature etc.

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

_The minimum number of coordinates should be 3, and there is no need to add the last coordinate in the array._
```js
var geoobj = {"type":"Polygon","coordinates":[[[30,20],[29.5,20.5],[30.5,21],[30,20]]]};
toArray(geoobj);

// [[20,30],[20.5,29.5],[21,30.5]]
```
## Validations

<a name="isGeoJSON" />
### isGeoJSON(obj[, returnError])

Takes an input of an object, and returns a `true` or `false`. Include a `Boolean` to return a validation message for invalid objects.

__Arguments__

* obj - an object, either valid or invalid `GeoJSON`.
* returnError - a `Boolean` indicating whether to return a validation message if obj is invalid.
The default `returnError` is `true`.

**Note:** All `GeoJSON` types are supported in the `isGeoJSON` check. They are:

* `Point`
* `MultiPoint`
* `LineString`
* `MultiLineString`
* `Polygon`
* `MultiPolygon`
* `Feature`
* `FeatureCollection`
* `GeometryCollection`

Nested GeoJSON objects are validated as part of the supplied object.

#### Caveats

1. We currently do not check the order of `LinearRings` inside a `Polygon`
2. All `coordinates` supplied are expected to be numbers, we do not `parseFloat`s
3. Though the library expects users to be using WGS84, we do not check bounds of lat and lng

__Examples__

To validate a valid `GeoJSON::Point`

```js
var geoobj = {"type":"Point","coordinates":[30,20]};
isGeoJSON(geoobj, true);

// true
```

To validate an invalid `GeoJSON::LineString`
```js
var geoobj = {"type":"LineString","coordinate":[[30,20],[29.5,20.5]]};
// note the 'coordinate', expecting 'coordinates'
isGeoJSON(geoobj, true);

// {result: false, message: "invalid GeoJSON type supplied"}
```
