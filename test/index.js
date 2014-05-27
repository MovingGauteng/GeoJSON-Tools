
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
      it("should convert a Point to a GeoJSON Point", function () {
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
      it("should return an error on invalid coordinates", function () {
        var pt = {"not": "valid"};
        var result = geojson.toGeoJSON(pt);

        expect(result).to.throw(Error("expected a single set of coordinates in [lat, lng] format. \nReceived " + pt));
      });
    });
  });
});