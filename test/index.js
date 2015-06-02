
/**
 * GeoJSON-Tools tests
 *
 * @since 0.2.0
 */

var expect = require('chai').expect,
  geojson = require('../');

describe('GeoJSON', function () {
  describe('.toGeoJSON()', function () {
    describe('#Point', function () {
      it("should convert an array of lat,lng to a GeoJSON Point", function () {
        var pt = [-20.225, 25.35];
        var result = geojson.toGeoJSON(pt);

        expect(result).to.have.a.property('type', 'Point');
        expect(result).to.deep.equal({"type":"Point","coordinates":[25.35,-20.225]});
      });
      it("should parse a string array to a GeoJSON Point", function () {
        var pt = ["-20.225", "25.35"];
        var result = geojson.toGeoJSON(pt);

        expect(result).to.have.a.property('type', 'Point');
        expect(result).to.deep.equal({"type":"Point","coordinates":[25.35,-20.225]});
      });
    });
    describe('#LineString', function () {
      it("should convert an array of lat,lng coordinates to a GeoJSON LineString", function () {
        var pts = [
          [-20.225, 25.35],
          [-20.234, 25.42]
        ];
        var result = geojson.toGeoJSON(pts, "LineString");

        expect(result).to.have.a.property('type', 'LineString');
        expect(result).to.deep.equal({"type": "LineString", "coordinates": [[25.35, -20.225], [25.42, -20.234]]});
      });
      it("should parse a nested string array to a GeoJSON LineString", function () {
        var pts = [
          ["-20.225", "25.35"],
          ["-20.234", "25.42"]
        ];
        var result = geojson.toGeoJSON(pts, "LineString");

        expect(result).to.have.a.property('type', 'LineString');
        expect(result).to.deep.equal({"type": "LineString", "coordinates": [[25.35, -20.225], [25.42, -20.234]]});
      });
    });
  });
  // toArray
  describe('.toArray()', function () {
    var point, linestring, polygon, multipoint, multilinestring, multipolygon
    it('should return correct array from GeoJSON Point with reversed coordinates', function () {
      point = {"type": "Point", "coordinates": [-20.1, 28.5]};
      result = geojson.toArray(point);
      expect(result).to.eql([28.5, -20.1]);
    });
    // TODO test incorrect one
    it('should return correct array from GeoJSON MultiPoint with reversed coordinates', function () {
      multipoint = {"type": "MultiPoint", "coordinates": [[-20.1, 28.5], [-21.1, 28.3]]};
      result = geojson.toArray(multipoint);
      expect(result).to.eql([[28.5, -20.1], [28.3, -21.1]]);
    });
    // TODO test incorrect one
    it('should return correct array from GeoJSON LineString with reversed coordinates', function () {
      linestring = {"type": "LineString", "coordinates": [[-20.1, 28.5], [-21.1, 28.3]]};
      result = geojson.toArray(linestring);
      expect(result).to.eql([[28.5, -20.1], [28.3, -21.1]]);
    });
    // TODO test incorrect one
    it('should return correct array from GeoJSON MultiLineString with reversed coordinates', function () {
      multilinestring = {"type": "MultiLineString", "coordinates": [[[-20.1, 28.5], [-21.1, 28.3]], [[-21.1, 27.6], [-21.1, 28.3], [-26.6, 28.3]]]};
      result = geojson.toArray(multilinestring);
      expect(result).to.eql([[[28.5, -20.1], [28.3, -21.1]], [[27.6, -21.1], [28.3, -21.1], [28.3, -26.6]]]);
    });
    // TODO test incorrect one
    it('should return correct array from GeoJSON Polygon with reversed coordinates', function () {
      polygon = {"type": "Polygon", "coordinates": [
        [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0],
          [100.0, 1.0], [100.0, 0.0]
        ]
      ]};
      result = geojson.toArray(polygon);
      expect(result).to.eql([[0.0, 100.0], [0.0, 101.0], [1.0, 101.0], [1.0, 100.0]]);
    });
    // TODO test incorrect one
    it('should return correct array from GeoJSON MultiPolygon with reversed coordinates', function () {
      multipolygon = {
        "type": "MultiPolygon",
        "coordinates": [
          [[[102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0]]],
          [[[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 0.0]],
           [[100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2]]]
        ]
      };
      result = geojson.toArray(multipolygon);
      expect(result).to.eql([
        [
          [2.0, 102.0], [2.0, 103.0], [3.0, 103.0], [3.0, 102.0]
        ],
        [
          [0.0, 100.0], [0.0, 101.0], [1.0, 101.0]
        ],
        [
          [0.2, 100.2], [0.2, 100.8], [0.8, 100.8], [0.8, 100.2]
        ]
      ]);
    });
  });
  // isGeoJSON
  describe('.isGeoJSON()', function () {
    it("should not return true for invalid GeoJSON types", function () {
      var obj = {"type": "Points"};
      var result = geojson.isGeoJSON(obj);
      expect(result).to.equal(false);
    });
    it("should reject the correct GeoJSON property with the wrong case", function () {
      var obj = {"type": "point", "coordinates": [-20.1, 28.5]};
      var result = geojson.isGeoJSON(obj);
      expect(result).to.equal(false);
      obj = {"type": "Point", "Coordinates": [-20.1, 28.5]};
      result = geojson.isGeoJSON(obj);
      expect(result).to.equal(false);
    });
    describe('#Point', function () {
      it("should validate a valid GeoJSON Point", function () {
        var point = geojson.toGeoJSON([-20.225, 25.35]);
        var result = geojson.isGeoJSON(point, true);
        expect(result).to.deep.equal(true);
      });
      it("should return an error for an invalid GeoJSON Point, where coordinates are strings", function () {
        var invalidPoint = {"type":"Point","coordinates":["25.35",-20.225]};
        var result = geojson.isGeoJSON(invalidPoint, true);
        expect(result).to.have.a.property('result', false);
        expect(result).to.have.a.property('message', 'invalid coordinates for GeoJSON Point');
      });
      it("should return an error for an invalid GeoJSON Point, where there aren't enough coordinates", function () {
        var invalidPoint = {"type":"Point","coordinates":[25.35]};
        var result = geojson.isGeoJSON(invalidPoint, true);
        expect(result).to.have.a.property('result', false);
        expect(result).to.have.a.property('message', 'invalid coordinates for GeoJSON Point');
      });
    });
    describe('#MultiPoint', function () {
      it("should validate a valid GeoJSON MultiPoint", function () {
        var mpoint = {"type": "MultiPoint", "coordinates": [ [100.0, 0.0], [101.0, 1.0], [102.0, 2.0] ]};
        var result = geojson.isGeoJSON(mpoint, true);
        expect(result).to.equal(true);
      });
      it("should return an error for an invalid GeoJSON MultiPoint, where one of coordinates is a string", function () {
        var invalidMPoint = {"type": "MultiPoint", "coordinates": [ [100.0, 0.0], [101.0, 1.0], [102.0, "2.0"] ]};
        var result = geojson.isGeoJSON(invalidMPoint, true);
        expect(result).to.have.a.property('result', false);
        expect(result).to.have.a.property('message', 'one of the coordinates of the GeoJSON MultiPoint are invalid');
      });
    });
    describe("#LineString", function () {
      it("should validate a valid GeoJSON LineString", function () {
        var linestring = geojson.toGeoJSON([[0.3, -1.3], [0.4, -1.4], [0.5, -1.5]], "linestring");
        var result = geojson.isGeoJSON(linestring, true);
        expect(result).to.equal(true);
        linestring = geojson.toGeoJSON([[0.3, -1.3], [0.4, -1.4], [0.5, -1.5], [0.6, -1.4]], "linestring");
        result = geojson.isGeoJSON(linestring, true);
        expect(result).to.equal(true);
      });
    });
    describe("#MultiLineString", function () {
      it("should validate a valid GeoJSON MultiLineString", function () {
        var multilinestring = {
          "type": "MultiLineString",
          "coordinates": [
            [ [100.0, 0.0], [101.0, 1.0] ],
            [ [102.0, 2.0], [103.0, 3.0] ]
          ]
        };
        var result = geojson.isGeoJSON(multilinestring, true);
        expect(result).to.equal(true);
        multilinestring = {
          "type": "MultiLineString",
          "coordinates": [
            [ [100.0, 0.0], [101.0, 1.0] ],
            [ [102.0, 2.0], [103.0, 3.0] ],
            [ [103.0, 3.0], [104.0, -2.34] ]
          ]
        };
        result = geojson.isGeoJSON(multilinestring, true);
        expect(result).to.equal(true);
      });
    });
    describe("#Polygon", function () {
      it("should validate a valid GeoJSON Polygon", function () {
        var polygon = geojson.toGeoJSON([[0.3, -1.3], [0.4, -1.4], [0.5, -1.5]], "Polygon");
        var result = geojson.isGeoJSON(polygon, true);
        expect(result).to.equal(true);
        polygon = geojson.toGeoJSON([[0.3, -1.3], [0.4, -1.4], [0.5, -1.5], [0.6, -1.4]], "Polygon");
        result = geojson.isGeoJSON(polygon, true);
        expect(result).to.equal(true);
      });
    });
    describe("#MultiPolygon", function () {
      it("should validate a valid GeoJSON Polygon", function () {
        var multipolygon = {
          "type": "MultiPolygon",
          "coordinates": [
            [[[102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0]]],
            [[[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]],
             [[100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2]]]
          ]
        };
        var result = geojson.isGeoJSON(multipolygon, true);
        expect(result).to.equal(true);
      });
    });
    describe("#Feature", function () {
      it("should validate a valid GeoJSON Feature", function () {
        var feature = {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [125.6, 10.1]
          },
          "properties": {
            "name": "Dinagat Islands"
          }
        };
        var result = geojson.isGeoJSON(feature, true);
        expect(result).to.equal(true);
      });
      it("should invalidate a valid GeoJSON Feature with an invalid geometry", function () {
        var feature = {
          "type": "Feature",
          "geometry": {
            "type": "Points",
            "coordinates": [125.6, 10.1]
          },
          "properties": {
            "name": "Dinagat Islands"
          }
        };
        var result = geojson.isGeoJSON(feature, true);
        expect(result).to.deep.equal({ result: false, message: 'invalid GeoJSON type supplied' });
        feature = {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [125.6, '10.1']
          },
          "properties": {
            "name": "Dinagat Islands"
          }
        };
        result = geojson.isGeoJSON(feature, true);
        expect(result).to.deep.equal({ result: false, message: 'invalid coordinates for GeoJSON Point' });
      });
    });
    describe("#FeatureCollection", function () {
      it("should validate a valid GeoJSON FeatureCollection", function () {
        var collection = {
          "type": "FeatureCollection",
          "features": [
            { "type": "Feature",
              "geometry": {"type": "Point", "coordinates": [102.0, 0.5]},
              "properties": {"prop0": "value0"}
              },
            { "type": "Feature",
              "geometry": {
                "type": "LineString",
                "coordinates": [
                  [102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]
                  ]
                },
              "properties": {
                "prop0": "value0",
                "prop1": 0.0
                }
              },
            { "type": "Feature",
               "geometry": {
                 "type": "Polygon",
                 "coordinates": [
                   [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0],
                     [100.0, 1.0], [100.0, 0.0] ]
                   ]
               },
               "properties": {
                 "prop0": "value0",
                 "prop1": {"this": "that"}
                 }
               }
             ]
        };
        var result = geojson.isGeoJSON(collection, true);
        expect(result).to.be.true;
      });
      it("should invalidate an invalid GeoJSON FeatureCollection", function () {
        var collection = {
          "type": "FeatureCollection",
          "features": [
            { "type": "Features",
              "geometry": {"type": "Point", "coordinates": [102.0, 0.5]},
              "properties": {"prop0": "value0"}
              },
            { "type": "Feature",
              "geometry": {
                "type": "LineString",
                "coordinates": [
                  [102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]
                  ]
                },
              "properties": {
                "prop0": "value0",
                "prop1": 0.0
                }
              },
            { "type": "Feature",
               "geometry": {
                 "type": "Polygon",
                 "coordinates": [
                   [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0],
                     [100.0, 1.0], [100.0, 0.0] ]
                   ]
               },
               "properties": {
                 "prop0": "value0",
                 "prop1": {"this": "that"}
                 }
               }
             ]
        };
        var result = geojson.isGeoJSON(collection, true);
        expect(result).to.deep.equal({result: false, message: "one of the GeoJSON FeatureCollection's features is invalid"});
      });
    });
    describe("#GeometryCollection", function () {
      it("should validate a valid GeoJSON GeometryCollection", function () {
        var collection = {
          "type": "GeometryCollection",
          "geometries": [
            { "type": "Point",
              "coordinates": [100.0, 0.0]
              },
            { "type": "LineString",
              "coordinates": [ [101.0, 0.0], [102.0, 1.0] ]
              }
          ]
        };
        var result = geojson.isGeoJSON(collection, true);
        expect(result).to.be.true;
      });
      it("should invalidate an invalid GeoJSON GeometryCollection", function () {
        var collection = {
          "type": "GeometryCollection",
          "geometry": [
            { "type": "Point",
              "coordinates": [100.0, 0.0]
              },
            { "type": "LineString",
              "coordinates": [ [101.0, 0.0], [102.0, 1.0] ]
              }
          ]
        };
        var result = geojson.isGeoJSON(collection, true);
        expect(result).to.deep.equal({result: false, message: "expected GeoJSON GeometryCollection to have geometries"});

        collection = {
          "type": "GeometryCollection",
          "geometries": [
            { "types": "Points",
              "coordinates": [100.0, 0.0]
              },
            { "type": "LineString",
              "coordinates": [ [101.0, 0.0], [102.0, 1.0] ]
              }
          ]
        };
        result = geojson.isGeoJSON(collection, true);
        expect(result).to.deep.equal({result: false, message: "one of the GeoJSON GeometryCollection's geometries is invalid"});
      });
    });
  });
});
