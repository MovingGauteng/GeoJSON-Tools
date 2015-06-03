0.2.1 / 2015-06-03
==================

  * Fixed a reference error on `_toRadian()`

0.2.0 / 2015-06-02
==================

  * Add `isGeoJSON()` check
  * Add support for all GeoJSON types
  * Add unit tests (coverage incomplete)

0.1.7 / 2014-06-13
==================

  * Fix validation where I incorrectly checked distance against a minimum of 100 meters. Dyslexia at times wins.

0.1.6 / 2014-06-13
==================

  * Add support for making a `LineString` or array of coordinates complex by reducing the maximum distance between each points
  * [WIP] Add support for some additional GeoJSON objects. This has not been tested, and has thus not yet been documented

0.1.5 / 2014-03-21
==================

  * Fix `toGeoJSON()` parsing of `Polygon` geometry
  * Add support for `Polygon`s geometries with holes in `toArray()`
  * Update documentation for fixes above

0.1.4 / 2014-03-18
==================

  * Fix `toArray()` parsing of `Polygon` geometry

0.1.3 / 2014-03-15
==================

  * Versioning issues

0.1.2 / 2014-03-15
==================

  * Fix `toArray(Polygon)`

0.1.1 / 2014-03-15
==================

  * Document API functions
  * Minor fixes of functions

0.1.0 / 2014-03-15
==================

  * Initial port from [rwt.to](//rwt.to)
