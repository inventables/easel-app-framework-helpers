EASEL = {};

var slice = [].slice;

var alert = function() {};

EASEL.linearizer = (function() {
  var CIRCLE_SAMPLE_COUNT, that;
  that = {};
  CIRCLE_SAMPLE_COUNT = 150;
  that.unitCircle = function() {
    var angle, index, middlePoints, sampleCount;
    sampleCount = CIRCLE_SAMPLE_COUNT;
    middlePoints = (function() {
      var i, ref, results;
      results = [];
      for (index = i = 1, ref = sampleCount; 1 <= ref ? i < ref : i > ref; index = 1 <= ref ? ++i : --i) {
        angle = 2 * Math.PI * index / sampleCount;
        results.push({
          x: Math.cos(angle),
          y: Math.sin(angle)
        });
      }
      return results;
    })();
    return [{
        x: 1,
        y: 0
      }].concat(slice.call(middlePoints), [{
        x: 1,
        y: 0
      }]);
  };
  that.unitArc = function(startAngle, endAngle) {
    var angle, arcAngle, i, index, ref, results, sampleCount;
    arcAngle = endAngle - startAngle;
    sampleCount = Math.ceil(CIRCLE_SAMPLE_COUNT * Math.abs(arcAngle) / (2 * Math.PI));
    results = [];
    for (index = i = 0, ref = sampleCount; 0 <= ref ? i <= ref : i >= ref; index = 0 <= ref ? ++i : --i) {
      angle = startAngle + arcAngle * index / sampleCount;
      results.push({
        x: Math.cos(angle),
        y: Math.sin(angle)
      });
    }
    return results;
      };
  return that;
})();

// Generated by CoffeeScript 1.7.1
(function() {
  EASEL.matrix = function(a, b, c, d, tx, ty) {
    var inverse, isIdentity, premultipliedBy, rotatedBy, scaledBy, that, toArray, transformedPoint, translatedBy;
    if (a == null) {
      a = 1;
    }
    if (b == null) {
      b = 0;
    }
    if (c == null) {
      c = 0;
    }
    if (d == null) {
      d = 1;
    }
    if (tx == null) {
      tx = 0;
    }
    if (ty == null) {
      ty = 0;
    }
    that = {};
    isIdentity = function() {
      return a === 1 && b === 0 && c === 0 && d === 1 && tx === 0 && ty === 0;
    };
    translatedBy = function(x, y) {
      return premultipliedBy(EASEL.matrix(1, 0, 0, 1, x, y));
    };
    scaledBy = function(x, y) {
      if (!(isFinite(x) && isFinite(y))) {
        throw new Error("Inputs to #scaledBy must by numbers: x=" + x + ", y=" + y);
      }
      return premultipliedBy(EASEL.matrix(x, 0, 0, y, 0, 0));
    };
    rotatedBy = function(angle) {
      var cos, sin;
      cos = Math.cos(angle);
      sin = Math.sin(angle);
      return premultipliedBy(EASEL.matrix(cos, sin, -sin, cos, 0, 0));
    };
    premultipliedBy = function(matrix) {
      var _a, _b, _c, _d, _ref, _tx, _ty;
      _ref = matrix.toArray(), _a = _ref[0], _b = _ref[1], _c = _ref[2], _d = _ref[3], _tx = _ref[4], _ty = _ref[5];
      return EASEL.matrix(_a * a + _c * b, _b * a + _d * b, _a * c + _c * d, _b * c + _d * d, _a * tx + _c * ty + _tx, _b * tx + _d * ty + _ty);
    };
    inverse = function() {
      var scale, scaleInverse, x, y, _a, _b, _c, _d, _ref, _ref1;
      scale = 1 / (a * d - b * c);
      scaleInverse = EASEL.matrix(scale * d, -scale * b, -scale * c, scale * a, 0, 0);
      _ref = scaleInverse.transformedPoint({
        x: tx,
        y: ty
      }), x = _ref.x, y = _ref.y;
      _ref1 = scaleInverse.toArray(), _a = _ref1[0], _b = _ref1[1], _c = _ref1[2], _d = _ref1[3];
      return EASEL.matrix(_a, _b, _c, _d, -x, -y);
    };
    transformedPoint = function(point) {
      return {
        x: a * point.x + c * point.y + tx,
        y: b * point.x + d * point.y + ty
      };
    };
    toArray = function() {
      return [a, b, c, d, tx, ty];
    };
    that.isIdentity = isIdentity;
    that.translatedBy = translatedBy;
    that.scaledBy = scaledBy;
    that.rotatedBy = rotatedBy;
    that.premultipliedBy = premultipliedBy;
    that.transformedPoint = transformedPoint;
    that.inverse = inverse;
    that.toArray = toArray;
    return that;
  };

}).call(this);

EASEL.volumeHelper = (function() {
  var boundingBoxBottom, boundingBoxHeight, boundingBoxHorizontalCenter, boundingBoxLeft, boundingBoxRight, boundingBoxTop, boundingBoxVerticalCenter, boundingBoxWidth, shapeBoundingBoxBottom, shapeBoundingBoxLeft, shapeBoundingBoxRight, shapeBoundingBoxTop, boundingBox, intersect, offset, expand;

  boundingBox = function(volumes) {
    var box = {
      right: boundingBoxRight(volumes),
      left: boundingBoxLeft(volumes),
      top: boundingBoxTop(volumes),
      bottom: boundingBoxBottom(volumes)
    };

    box.width = box.right - box.left;
    box.height = box.top - box.bottom;

    return box;
  };

  boundingBoxLeft = function(volumes) {
    var shape, values;
    values = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = volumes.length; i < len; i++) {
        shape = volumes[i].shape;
        results.push(shapeBoundingBoxLeft(shape));
      }
      return results;
    })();
    return Math.min.apply(null, values);
  };

  shapeBoundingBoxLeft = function(shape) {
    var cornerDistance, topRightCornerAngle;
    if (shape.type === "line") {
      return Math.min(shape.point1.x, shape.point2.x);
    } else {
      cornerDistance = Math.hypot(shape.width / 2, shape.height / 2);
      topRightCornerAngle = Math.atan2(shape.height / 2, shape.width / 2);
      return shape.center.x + cornerDistance * Math.min(Math.cos(topRightCornerAngle + shape.rotation), Math.cos(Math.PI - topRightCornerAngle + shape.rotation), Math.cos(Math.PI + topRightCornerAngle + shape.rotation), Math.cos(-topRightCornerAngle + shape.rotation));
    }
  };

  boundingBoxRight = function(volumes) {
    var shape, values;
    values = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = volumes.length; i < len; i++) {
        shape = volumes[i].shape;
        results.push(shapeBoundingBoxRight(shape));
      }
      return results;
    })();
    return Math.max.apply(null, values);
  };

  shapeBoundingBoxRight = function(shape) {
    var cornerDistance, topRightCornerAngle;
    if (shape.type === "line") {
      return Math.max(shape.point1.x, shape.point2.x);
    } else {
      cornerDistance = Math.hypot(shape.width / 2, shape.height / 2);
      topRightCornerAngle = Math.atan2(shape.height / 2, shape.width / 2);
      return shape.center.x + cornerDistance * Math.max(Math.cos(topRightCornerAngle + shape.rotation), Math.cos(Math.PI - topRightCornerAngle + shape.rotation), Math.cos(Math.PI + topRightCornerAngle + shape.rotation), Math.cos(-topRightCornerAngle + shape.rotation));
    }
  };

  boundingBoxBottom = function(volumes) {
    var shape, values;
    values = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = volumes.length; i < len; i++) {
        shape = volumes[i].shape;
        results.push(shapeBoundingBoxBottom(shape));
      }
      return results;
    })();
    return Math.min.apply(null, values);
  };

  shapeBoundingBoxBottom = function(shape) {
    var cornerDistance, topRightCornerAngle;
    if (shape.type === "line") {
      return Math.min(shape.point1.y, shape.point2.y);
    } else {
      cornerDistance = Math.hypot(shape.width / 2, shape.height / 2);
      topRightCornerAngle = Math.atan2(shape.height / 2, shape.width / 2);
      return shape.center.y + cornerDistance * Math.min(Math.sin(topRightCornerAngle + shape.rotation), Math.sin(Math.PI - topRightCornerAngle + shape.rotation), Math.sin(Math.PI + topRightCornerAngle + shape.rotation), Math.sin(-topRightCornerAngle + shape.rotation));
    }
  };

  boundingBoxTop = function(volumes) {
    var shape, values;
    values = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = volumes.length; i < len; i++) {
        shape = volumes[i].shape;
        results.push(shapeBoundingBoxTop(shape));
      }
      return results;
    })();
    return Math.max.apply(null, values);
  };

  shapeBoundingBoxTop = function(shape) {
    var cornerDistance, topRightCornerAngle;
    if (shape.type === "line") {
      return Math.max(shape.point1.y, shape.point2.y);
    } else {
      cornerDistance = Math.hypot(shape.width / 2, shape.height / 2);
      topRightCornerAngle = Math.atan2(shape.height / 2, shape.width / 2);
      return shape.center.y + cornerDistance * Math.max(Math.sin(topRightCornerAngle + shape.rotation), Math.sin(Math.PI - topRightCornerAngle + shape.rotation), Math.sin(Math.PI + topRightCornerAngle + shape.rotation), Math.sin(-topRightCornerAngle + shape.rotation));
    }
  };

  boundingBoxHorizontalCenter = function(volumes) {
    return (boundingBoxLeft(volumes) + boundingBoxRight(volumes)) / 2;
  };

  boundingBoxVerticalCenter = function(volumes) {
    return (boundingBoxBottom(volumes) + boundingBoxTop(volumes)) / 2;
  };

  boundingBoxWidth = function(volumes) {
    return boundingBoxRight(volumes) - boundingBoxLeft(volumes);
  };

  boundingBoxHeight = function(volumes) {
    return boundingBoxTop(volumes) - boundingBoxBottom(volumes);
  };

  var scale = 32768; // Clipper can only deal with ints
  var lightenThreshold = 32; // /32768" (about 0.001")

  var scaleUpLine = function(line) {
    return line.map(function(point) {
      return {X: point.x * scale, Y: point.y * scale};
    });
  };

  var scaleDownLine = function(line) {
    return line.map(function(point) {
      return {x: point.X / scale, y: point.Y / scale};
    });
  };

  var isClosed = function(line) {
    if (line.length < 2) return false;

    var firstPoint = line[0];
    var lastPoint = line[line.length - 1];

    return (firstPoint.X === lastPoint.X && firstPoint.Y === lastPoint.Y);
  };

  var toSegments = function(volume) {
    return EASEL.segmentVisitor.visit(volume.shape).map(scaleUpLine)
  };

  var flatMap = function(array) {
    var result = [];
    array.forEach(function(e) {
      if (e.constructor === Array) {
        result = result.concat(e);
      } else {
        result.push(e);
      }
    });
    return result;
  };

  offset = function(volumes, step) {
    var scaledStep = step * scale;

    return volumes.map(function(volume) {
      var polygons = flatMap(toSegments(volume));
      polygons = ClipperLib.JS.Lighten(polygons, lightenThreshold);

      var clipperJoinType = ClipperLib.JoinType.jtRound;
      var clipperEndType = ClipperLib.EndType.etClosedPolygon;
      var offsetPolygons = new ClipperLib.Paths();
      var offsetter = new ClipperLib.ClipperOffset();

      offsetter.MiterLimit = 5;
      offsetter.Clear();
      offsetter.AddPaths(polygons, clipperJoinType, clipperEndType, true);
      offsetter.Execute(offsetPolygons, scaledStep);

      offsetPolygons = ClipperLib.JS.Lighten(offsetPolygons, lightenThreshold);
      if (offsetPolygons.length > 0 && offsetPolygons[0].length > 0) {
        offsetPolygons.forEach(function(polygon) {
          polygon.push(polygon[0]); // re-close the path
        });
      }

      offsetPolygons = offsetPolygons.map(scaleDownLine);

      var newVolume = EASEL.pathUtils.fromPointArrays(offsetPolygons);
      if (newVolume) {
        newVolume.cut = volume.cut;
      }
      return newVolume;
    });
  };

  intersect = function(subjectVolumes, clipVolumes, operation) {
    operation = operation || ClipperLib.ClipType.ctIntersection;

    subjectLines = flatMap(subjectVolumes.map(toSegments));

    clipLines = flatMap(clipVolumes.map(toSegments));

    clipLines.forEach(function(clipLine) {
      clipper.AddPath(clipLine, ClipperLib.PolyType.ptClip, true);
    });

    //subjectLines.forEach(function(subjectLine) {
    clipper.AddPaths(subjectLines, ClipperLib.PolyType.ptSubject, true);
    //});

    var solution = new ClipperLib.Paths();

    clipper.Execute(operation, solution);

    solution = solution.map(scaleDownLine);

    return EASEL.pathUtils.fromPointArrays(solution);
  };
  
  expand = function(subjectVolumes, delta) {
    var clipper = new ClipperLib.ClipperOffset();

    subjectLines = flatMap(subjectVolumes.map(toSegments));
    clipper.AddPaths(subjectLines, ClipperLib.JoinType.jtMiter, ClipperLib.EndType.etClosedPolygon);
    var solution = new ClipperLib.Paths();
    clipper.Execute(solution, delta * scale);

    solution = ClipperLib.JS.Lighten(solution, lightenThreshold);
    if (solution.length > 0 && solution[0].length > 0) {
      solution.forEach(function(polygon) {
        polygon.push(polygon[0]); // re-close the path
     });
    }

    solution = solution.map(scaleDownLine);

    return EASEL.pathUtils.fromPointArrays(solution);
  };
  
  return {
    boundingBox: boundingBox,
    boundingBoxLeft: boundingBoxLeft,
    boundingBoxHorizontalCenter: boundingBoxHorizontalCenter,
    boundingBoxRight: boundingBoxRight,
    boundingBoxBottom: boundingBoxBottom,
    boundingBoxVerticalCenter: boundingBoxVerticalCenter,
    boundingBoxTop: boundingBoxTop,
    boundingBoxWidth: boundingBoxWidth,
    boundingBoxHeight: boundingBoxHeight,
    intersect: intersect,
    offset: offset,
    expand: expand
  };
})();

(function() {
  EASEL.math = (function() {
    var add, clamp, dist2, distToSegment, distance, moveToward, scaleTo, sqr, sub;
    clamp = function(value, min, max) {
      return Math.min(max, Math.max(min, value));
    };
    sqr = function(x) {
      return x * x;
    };
    dist2 = function(v, w) {
      return sqr(v.x - w.x) + sqr(v.y - w.y);
    };
    distance = function(v1, v2) {
      return Math.sqrt(Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2));
    };
    distToSegment = function(p, v, w) {
      var l2, projectedPoint, t;
      l2 = dist2(v, w);
      if (l2 === 0) {
        return {
          distance: distance(p, v),
          point: v
        };
      }
      t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
      switch (false) {
        case !(t < 0):
          return {
            distance: distance(p, v),
            point: v
          };
        case !(t > 1):
          return {
            distance: distance(p, w),
            point: w
          };
        default:
          projectedPoint = {
            x: v.x + t * (w.x - v.x),
            y: v.y + t * (w.y - v.y)
          };
          return {
            distance: distance(p, projectedPoint),
            point: projectedPoint
          };
      }
    };
    sub = function(v1, v2) {
      return {
        x: v1.x - v2.x,
        y: v1.y - v2.y
      };
    };
    add = function(v1, v2) {
      return {
        x: v1.x + v2.x,
        y: v1.y + v2.y
      };
    };
    scaleTo = function(v, length) {
      var scale;
      scale = length / distance(v, {
        x: 0,
        y: 0
      });
      return {
        x: v.x * scale,
        y: v.y * scale
      };
    };
    moveToward = function(p1, p2, dist) {
      return add(p1, scaleTo(sub(p2, p1), dist));
    };
    return {
      clamp: clamp,
      distance: distance,
      distToSegment: distToSegment,
      moveToward: moveToward
    };
  })();

}).call(this);

(function() {
  EASEL.subdivider = (function() {
    var cache, fingerprint, maxError, pointOnLineSegment, splitCubicBezier, subdivide, subdivideCubicBezier, that;
    that = {};
    cache = {};
    fingerprint = function(curve, err) {
      var points;
      points = curve.map(function(p) {
        return "" + p.x + "_" + p.y;
      }).join("-");
      return "" + points + "-" + err;
    };
    maxError = function(curve) {
      var dist1, dist2, end, start;
      start = curve[0];
      end = curve[curve.length - 1];
      dist1 = EASEL.math.distToSegment(curve[1], start, end).distance;
      dist2 = EASEL.math.distToSegment(curve[2], start, end).distance;
      return Math.max(dist1, dist2) * 0.75;
    };
    subdivide = function(curve, split, err) {
      var l, r, _ref;
      if (maxError(curve) < err) {
        return [curve[curve.length - 1]];
      } else {
        _ref = split(curve), l = _ref.l, r = _ref.r;
        return subdivide(l, split, err).concat(subdivide(r, split, err));
      }
    };
    subdivideCubicBezier = function(start, control1, control2, end, err) {
      var curve, _name;
      curve = [start, control1, control2, end];
      return cache[_name = fingerprint(curve, err)] != null ? cache[_name] : cache[_name] = subdivide(curve, splitCubicBezier, err);
    };
    pointOnLineSegment = function(t, start, end) {
      var p, u;
      u = 1 - t;
      return p = {
        x: start.x * u + end.x * t,
        y: start.y * u + end.y * t
      };
    };
    splitCubicBezier = function(curve) {
      var control1, control2, end, join, l1, l2, m, r1, r2, result, start;
      start = curve[0], control1 = curve[1], control2 = curve[2], end = curve[3];
      l1 = pointOnLineSegment(0.5, start, control1);
      m = pointOnLineSegment(0.5, control1, control2);
      r2 = pointOnLineSegment(0.5, control2, end);
      l2 = pointOnLineSegment(0.5, l1, m);
      r1 = pointOnLineSegment(0.5, m, r2);
      join = pointOnLineSegment(0.5, l2, r1);
      return result = {
        l: [start, l1, l2, join],
        r: [join, r1, r2, end]
      };
    };
    that.subdivideCubicBezier = subdivideCubicBezier;
    return that;
  })();

}).call(this);

(function() {
  EASEL.pathNormalizer = (function() {
    var absolutize, isRelative, lastX, lastY, offsetSingle, offsetXY, process, startX, startY, that;
    that = {};
    startX = null;
    startY = null;
    lastX = null;
    lastY = null;
    isRelative = function(path) {
      return path[0] === path[0].toLowerCase();
    };
    offsetXY = function(path, offsetX, offsetY) {
      var i, pointList, _, _i, _len;
      pointList = path.slice(1);
      for (i = _i = 0, _len = pointList.length; _i < _len; i = _i += 2) {
        _ = pointList[i];
        path[i + 1] = pointList[i] + offsetX;
        path[i + 2] = pointList[i + 1] + offsetY;
      }
      return path;
    };
    offsetSingle = function(path, offset) {
      var i, point, _i, _len, _ref;
      _ref = path.slice(1);
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        point = _ref[i];
        path[i + 1] = point + offset;
      }
      return path;
    };
    absolutize = function(path) {
      if (isRelative(path)) {
        path[0] = path[0].toUpperCase();
        path = (function() {
          switch (path[0]) {
            case 'H':
              return offsetSingle(path, lastX);
            case 'V':
              return offsetSingle(path, lastY);
            default:
              return offsetXY(path, lastX, lastY);
          }
        })();
      }
      if (path[0] === 'M') {
        startX = path[1];
        startY = path[2];
      }
      lastX = (function() {
        switch (path[0]) {
          case 'H':
            return path[1];
          case 'V':
            return lastX;
          case 'Z':
            return startX;
          default:
            return path[path.length - 2];
        }
      })();
      lastY = (function() {
        switch (path[0]) {
          case 'H':
            return lastY;
          case 'V':
            return path[1];
          case 'Z':
            return startY;
          default:
            return path[path.length - 1];
        }
      })();
      return path;
    };
    process = function(commands) {
      var command, _i, _len, _results;
      lastX = lastY = 0;
      _results = [];
      for (_i = 0, _len = commands.length; _i < _len; _i++) {
        command = commands[_i];
        _results.push(absolutize(command.slice(0)));
      }
      return _results;
    };
    that.process = process;
    return that;
  })();
}).call(this);

EASEL.pathStringParser = (function() {
  var that = {}

  var commandLengths = {
    m: 2,
    l: 2,
    h: 1,
    v: 1,
    c: 6,
    s: 4,
    q: 4,
    t: 2,
    a: 7
  };

  var repeatedCommands = {
    m: 'l',
    M: 'L'
  };

  var parse = function(string) {
    var path = string.match(/[mzlhvcsqta][^mzlhvcsqta]*/gi);
    var result = [ ],
        coords = [ ],
        currentPath,
        parsed,
        re = /([-+]?((\d+\.\d+)|((\d+)|(\.\d+)))(?:e[-+]?\d+)?)/ig,
        match,
        coordsStr;

    for (var i = 0, coordsParsed, len = path.length; i < len; i++) {
      currentPath = path[i];

      coordsStr = currentPath.slice(1).trim();
      coords.length = 0;

      while ((match = re.exec(coordsStr))) {
        coords.push(match[0]);
      }

      coordsParsed = [ currentPath.charAt(0) ];

      for (var j = 0, jlen = coords.length; j < jlen; j++) {
        parsed = parseFloat(coords[j]);
        if (!isNaN(parsed)) {
          coordsParsed.push(parsed);
        }
      }

      var command = coordsParsed[0],
          commandLength = commandLengths[command.toLowerCase()],
          repeatedCommand = repeatedCommands[command] || command;

      if (coordsParsed.length - 1 > commandLength) {
        for (var k = 1, klen = coordsParsed.length; k < klen; k += commandLength) {
          result.push([ command ].concat(coordsParsed.slice(k, k + commandLength)));
          command = repeatedCommand;
        }
      }
      else {
        result.push(coordsParsed);
      }
    }

    return result;
  }

  that.parse = parse;

  return that;
})();


(function() {
  EASEL.pathPolylineGenerator = function(maxError, matrix) {
    var bezierWithRelativeControls, move, that, toPolyline, toPolylines, zero;
    that = {};
    zero = {
      x: 0,
      y: 0
    };
    move = function(point) {
      return [matrix.transformedPoint(point)];
    };
    bezierWithRelativeControls = function(start, c1, c2, end) {
      if (c1 == null) {
        c1 = zero;
      }
      if (c2 == null) {
        c2 = zero;
      }
      c1 = {
        x: start.x + c1.x,
        y: start.y + c1.y
      };
      c2 = {
        x: end.x + c2.x,
        y: end.y + c2.y
      };
      return EASEL.subdivider.subdivideCubicBezier(matrix.transformedPoint(start), matrix.transformedPoint(c1), matrix.transformedPoint(c2), matrix.transformedPoint(end), maxError);
    };
    toPolyline = function(points) {
      var point, previousPoint, result, _i, _len;
      result = [];
      previousPoint = null;
      for (_i = 0, _len = points.length; _i < _len; _i++) {
        point = points[_i];
        if ((previousPoint != null) && ((previousPoint.rh != null) || (point.lh != null))) {
          result = result.concat(bezierWithRelativeControls(previousPoint, previousPoint.rh, point.lh, point));
        } else {
          result = result.concat(move(point));
        }
        previousPoint = point;
      }
      return result;
    };
    toPolylines = function(pointArrays) {
      var subpathPoints, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = pointArrays.length; _i < _len; _i++) {
        subpathPoints = pointArrays[_i];
        _results.push(toPolyline(subpathPoints));
      }
      return _results;
    };
    that.toPolyline = toPolyline;
    that.toPolylines = toPolylines;
    return that;
  };

}).call(this);

(function() {
  EASEL.pathToControlPoints = function(pathComponents) {
    var addPoint, arc, close, commandMapping, cubicBezier, currentSubpath, horizontal, lastCubicControl, lastPoint, lastQuadraticControl, line, move, pathStart, quadraticBezier, reflectedCubicBezier, reflectedQuadraticBezier, result, setLastCubicControl, setLastQuadraticControl, vertical;
    result = [];
    currentSubpath = [];
    lastPoint = {
      x: 0,
      y: 0
    };
    lastQuadraticControl = {
      x: null,
      y: null
    };
    lastCubicControl = {
      x: null,
      y: null
    };
    pathStart = null;
    move = function(endX, endY) {
      if (currentSubpath.length > 1) {
        result.push(currentSubpath);
      }
      currentSubpath = [];
      addPoint(endX, endY);
      return pathStart = {
        x: endX,
        y: endY
      };
    };
    close = function() {
      if (pathStart) {
        addPoint(pathStart.x, pathStart.y);
      }
      if (currentSubpath.length > 2) {
        result.push(currentSubpath);
      }
      currentSubpath = [];
      return addPoint(pathStart.x, pathStart.y);
    };
    line = function(endX, endY) {
      return addPoint(endX, endY);
    };
    vertical = function(endY) {
      return addPoint(lastPoint.x, endY);
    };
    horizontal = function(endX) {
      return addPoint(endX, lastPoint.y);
    };
    cubicBezier = function(c1X, c1Y, c2X, c2Y, endX, endY) {
      lastPoint.rh = {
        x: c1X - lastPoint.x,
        y: c1Y - lastPoint.y
      };
      addPoint(endX, endY);
      lastPoint.lh = {
        x: c2X - lastPoint.x,
        y: c2Y - lastPoint.y
      };
      return setLastCubicControl(c2X, c2Y);
    };
    quadraticBezier = function(c1X, c1Y, endX, endY) {
      lastPoint.rh = {
        x: (2 / 3) * (c1X - lastPoint.x),
        y: (2 / 3) * (c1Y - lastPoint.y)
      };
      addPoint(endX, endY);
      lastPoint.lh = {
        x: (2 / 3) * (c1X - lastPoint.x),
        y: (2 / 3) * (c1Y - lastPoint.y)
      };
      return setLastQuadraticControl(c1X, c1Y);
    };
    reflectedCubicBezier = function(c2X, c2Y, endX, endY) {
      var c1X, c1Y;
      c1X = lastCubicControl.x != null ? 2 * lastPoint.x - lastCubicControl.x : lastPoint.x;
      c1Y = lastCubicControl.y != null ? 2 * lastPoint.y - lastCubicControl.y : lastPoint.y;
      return cubicBezier(c1X, c1Y, c2X, c2Y, endX, endY);
    };
    reflectedQuadraticBezier = function(endX, endY) {
      var c1X, c1Y;
      c1X = lastQuadraticControl.x != null ? 2 * lastPoint.x - lastQuadraticControl.x : lastPoint.x;
      c1Y = lastQuadraticControl.y != null ? 2 * lastPoint.y - lastQuadraticControl.y : lastPoint.y;
      return quadraticBezier(c1X, c1Y, endX, endY);
    };
    arc = function(rx, ry, xAxisRotation, largeArc, sweep, end) {
      return console.error("Path command error: arc not implemented");
    };
    addPoint = function(x, y) {
      var point;
      point = {
        x: x,
        y: y
      };
      currentSubpath.push(point);
      lastPoint = point;
      setLastCubicControl(null, null);
      return setLastQuadraticControl(null, null);
    };
    setLastCubicControl = function(x, y) {
      lastCubicControl.x = x;
      return lastCubicControl.y = y;
    };
    setLastQuadraticControl = function(x, y) {
      lastQuadraticControl.x = x;
      return lastQuadraticControl.y = y;
    };
    commandMapping = {
      'M': move,
      'Z': close,
      'L': line,
      'V': vertical,
      'H': horizontal,
      'C': cubicBezier,
      'S': reflectedCubicBezier,
      'Q': quadraticBezier,
      'T': reflectedQuadraticBezier,
      'A': arc
    };
    return (function() {
      var component, _i, _len;
      pathComponents = EASEL.pathNormalizer.process(pathComponents);
      for (_i = 0, _len = pathComponents.length; _i < _len; _i++) {
        component = pathComponents[_i];
        commandMapping[component[0]].apply(commandMapping, component.slice(1));
      }
      if (currentSubpath.length > 1) {
        result.push(currentSubpath);
      }
      return result;
    })();
  };

}).call(this);

EASEL.pathUtils = (function() {
  var infiniteBox = function() {
    return {
      minX: Infinity,
      maxX: -Infinity,
      minY: Infinity,
      maxY: -Infinity
    };
  };

  var pointsBoundingBox = function(points) {
    var bb, i, len, point;
    bb = infiniteBox();
    for (i = 0, len = points.length; i < len; i++) {
      point = points[i];
      bb.minX = Math.min(bb.minX, point.x);
      bb.maxX = Math.max(bb.maxX, point.x);
      bb.minY = Math.min(bb.minY, point.y);
      bb.maxY = Math.max(bb.maxY, point.y);
    }
    return bb;
  };

  var cubicBezierDimensionalExtrema = function(start, c1, c2, end) {
    var a, b, bezier, c, constant, t, t1coeff, t2coeff, t3coeff, ts, values;
    t3coeff = -start + 3 * c1 - 3 * c2 + end;
    t2coeff = 3 * start - 6 * c1 + 3 * c2;
    t1coeff = -3 * start + 3 * c1;
    constant = start;
    bezier = function(t) {
      return t3coeff * t * t * t + t2coeff * t * t + t1coeff * t + constant;
    };
    a = 3 * t3coeff;
    b = 2 * t2coeff;
    c = t1coeff;
    ts = [0, 1, -c / b, (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a), (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a)];
    values = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = ts.length; i < len; i++) {
        t = ts[i];
        if ((0 <= t && t <= 1)) {
          results.push(bezier(t));
        }
      }
      return results;
    })();
    return {
      min: Math.min.apply(null, values),
      max: Math.max.apply(null, values)
    };
  };

  var zero = {
    x: 0,
    y: 0
  };

  var cubicBezierBounds = function(start, c1, c2, end) {
    var xs, ys;
    if (c1 == null) {
      c1 = zero;
    }
    if (c2 == null) {
      c2 = zero;
    }
    xs = cubicBezierDimensionalExtrema(start.x, start.x + c1.x, end.x + c2.x, end.x);
    ys = cubicBezierDimensionalExtrema(start.y, start.y + c1.y, end.y + c2.y, end.y);
    return {
      minX: xs.min,
      minY: ys.min,
      maxX: xs.max,
      maxY: ys.max
    };
  };

  var subpathBoundingBox = function(pathPoints) {
    var bb, curveBounds, i, len, point, previousPoint;
    bb = pointsBoundingBox(pathPoints);
    previousPoint = null;
    for (i = 0, len = pathPoints.length; i < len; i++) {
      point = pathPoints[i];
      if (previousPoint && ((previousPoint.rh != null) || (point.lh != null))) {
        curveBounds = cubicBezierBounds(previousPoint, previousPoint.rh, point.lh, point);
        bb.minX = Math.min(bb.minX, curveBounds.minX);
        bb.maxX = Math.max(bb.maxX, curveBounds.maxX);
        bb.minY = Math.min(bb.minY, curveBounds.minY);
        bb.maxY = Math.max(bb.maxY, curveBounds.maxY);
      }
      previousPoint = point;
    }
    return bb;
  };

  var pathBoundingBox = function(pathPoints) {
    var bb, i, len, subpath, totalBounds;
    totalBounds = infiniteBox();
    for (i = 0, len = pathPoints.length; i < len; i++) {
      subpath = pathPoints[i];
      bb = subpathBoundingBox(subpath);
      totalBounds.minX = Math.min(bb.minX, totalBounds.minX);
      totalBounds.maxX = Math.max(bb.maxX, totalBounds.maxX);
      totalBounds.minY = Math.min(bb.minY, totalBounds.minY);
      totalBounds.maxY = Math.max(bb.maxY, totalBounds.maxY);
    }
    return totalBounds;
  };

  var fromPointArrays = function(pointArrays) {
    if (pointArrays.length === 0) {
      return null;
    }
    var boundingBox = pathBoundingBox(pointArrays);
    var pointArraysCenter = {
      x: (boundingBox.minX + boundingBox.maxX) / 2,
      y: (boundingBox.minY + boundingBox.maxY) / 2
    };

    return {
      shape: {
        type: 'path',
        center: {
          x: pointArraysCenter.x,
          y: pointArraysCenter.y
        },
        width: boundingBox.maxX - boundingBox.minX,
        height: boundingBox.maxY - boundingBox.minY,
        rotation: 0,
        points: pointArrays,
        flipping: {}
      }
    };
  };

  var fromSvgPathDataString = function(dataString) {
    return fromPointArrays(EASEL.pathToControlPoints(EASEL.pathStringParser.parse(dataString)));
  };

  return {
    pathBoundingBox: pathBoundingBox,
    pointsBoundingBox: pointsBoundingBox,
    fromPointArrays: fromPointArrays,
    fromSvgPathDataString: fromSvgPathDataString
  };

}).call(this);

EASEL.polylineGenerator = (function() {
  var boundingBoxMatrix, close, fromEllipse, fromLine, fromPath, fromPolygon, fromPolyline, fromRectangle, fromRoundedRectangle, process, processors, shapeMatrix, that;
  that = {};
  close = function(segs) {
    if (segs.length > 0) {
      segs.push(segs[0]);
    }
    return segs;
  };
  boundingBoxMatrix = function(shape, boundingBox) {
    var boundingBoxHeight, boundingBoxScaleX, boundingBoxScaleY, boundingBoxWidth;
    boundingBoxWidth = boundingBox.maxX - boundingBox.minX;
    boundingBoxHeight = boundingBox.maxY - boundingBox.minY;
    boundingBoxScaleX = boundingBoxWidth === 0 ? 0 : shape.width / (boundingBox.maxX - boundingBox.minX);
    boundingBoxScaleY = boundingBoxHeight === 0 ? 0 : shape.height / (boundingBox.maxY - boundingBox.minY);
    return EASEL.matrix().translatedBy(-(boundingBox.minX + boundingBox.maxX) / 2, -(boundingBox.minY + boundingBox.maxY) / 2).scaledBy(boundingBoxScaleX, boundingBoxScaleY);
  };
  shapeMatrix = function(shape) {
    var ref, ref1;
    return EASEL.matrix().scaledBy((((ref = shape.flipping) != null ? ref.horizontal : void 0) ? -1 : 1), (((ref1 = shape.flipping) != null ? ref1.vertical : void 0) ? -1 : 1)).rotatedBy(shape.rotation || 0).translatedBy(shape.center.x, shape.center.y);
  };
  fromPath = function(shape, parentMatrix) {
    var boundingBox, matrix, maxError;
    if (shape.points.length === 0) {
      return [];
    }
    boundingBox = EASEL.pathUtils.pathBoundingBox(shape.points);
    matrix = EASEL.matrix().premultipliedBy(boundingBoxMatrix(shape, boundingBox)).premultipliedBy(shapeMatrix(shape)).premultipliedBy(parentMatrix);
    maxError = 0.001;
    return EASEL.pathPolylineGenerator(maxError, matrix).toPolylines(shape.points);
  };
  fromPolyline = function(shape, parentMatrix) {
    var boundingBox, i, len, matrix, point, ref, results;
    if (shape.points.length === 0) {
      return [];
    }
    boundingBox = EASEL.pathUtils.pointsBoundingBox(shape.points);
    matrix = EASEL.matrix().premultipliedBy(boundingBoxMatrix(shape, boundingBox)).premultipliedBy(shapeMatrix(shape)).premultipliedBy(parentMatrix);
    ref = shape.points;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      point = ref[i];
      results.push(matrix.transformedPoint(point));
    }
    return results;
  };
  fromPolygon = function(shape, parentMatrix) {
    return close(fromPolyline(shape, parentMatrix));
  };
  fromEllipse = function(shape, parentMatrix) {
    var i, len, matrix, point, ref, results;
    matrix = EASEL.matrix().scaledBy(shape.width / 2, shape.height / 2).premultipliedBy(shapeMatrix(shape)).premultipliedBy(parentMatrix);
    ref = EASEL.linearizer.unitCircle();
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      point = ref[i];
      results.push(matrix.transformedPoint(point));
    }
    return results;
  };
  fromLine = function(shape, parentMatrix) {
    return [parentMatrix.transformedPoint(shape.point1), parentMatrix.transformedPoint(shape.point2)];
  };
  fromRectangle = function(shape, parentMatrix) {
    var matrix, point, points;
    if ((shape.cornerRadius != null) && (shape.cornerRadius.x !== 0 || shape.cornerRadius.y !== 0)) {
      return fromRoundedRectangle(shape, parentMatrix);
    }
    matrix = EASEL.matrix().premultipliedBy(shapeMatrix(shape)).premultipliedBy(parentMatrix);
    points = [
      {
        x: -shape.width / 2,
        y: -shape.height / 2
      }, {
        x: -shape.width / 2,
        y: shape.height / 2
      }, {
        x: shape.width / 2,
        y: shape.height / 2
      }, {
        x: shape.width / 2,
        y: -shape.height / 2
      }
    ];
    return close((function() {
      var i, len, results;
      results = [];
      for (i = 0, len = points.length; i < len; i++) {
        point = points[i];
        results.push(matrix.transformedPoint(point));
      }
      return results;
    })());
  };
  fromRoundedRectangle = function(shape, parentMatrix) {
    var blCornerMatrix, brCornerMatrix, cornerSizeMatrix, cornerStartX, cornerStartY, matrix, point, points, rx, ry, tlCornerMatrix, trCornerMatrix;
    matrix = EASEL.matrix().premultipliedBy(shapeMatrix(shape)).premultipliedBy(parentMatrix);
    rx = Math.min(shape.cornerRadius.x, shape.width / 2);
    ry = Math.min(shape.cornerRadius.y, shape.height / 2);
    cornerStartX = shape.width / 2 - rx;
    cornerStartY = shape.height / 2 - ry;
    cornerSizeMatrix = EASEL.matrix().scaledBy(rx, ry);
    trCornerMatrix = cornerSizeMatrix.translatedBy(cornerStartX, cornerStartY);
    tlCornerMatrix = cornerSizeMatrix.translatedBy(-cornerStartX, cornerStartY);
    blCornerMatrix = cornerSizeMatrix.translatedBy(-cornerStartX, -cornerStartY);
    brCornerMatrix = cornerSizeMatrix.translatedBy(cornerStartX, -cornerStartY);
    points = [];
    points = points.concat((function() {
      var i, len, ref, results;
      ref = EASEL.linearizer.unitArc(0, 0.5 * Math.PI);
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        point = ref[i];
        results.push(trCornerMatrix.transformedPoint(point));
      }
      return results;
    })());
    points = points.concat((function() {
      var i, len, ref, results;
      ref = EASEL.linearizer.unitArc(0.5 * Math.PI, Math.PI);
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        point = ref[i];
        results.push(tlCornerMatrix.transformedPoint(point));
      }
      return results;
    })());
    points = points.concat((function() {
      var i, len, ref, results;
      ref = EASEL.linearizer.unitArc(Math.PI, 1.5 * Math.PI);
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        point = ref[i];
        results.push(blCornerMatrix.transformedPoint(point));
      }
      return results;
    })());
    points = points.concat((function() {
      var i, len, ref, results;
      ref = EASEL.linearizer.unitArc(1.5 * Math.PI, 2 * Math.PI);
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        point = ref[i];
        results.push(brCornerMatrix.transformedPoint(point));
      }
      return results;
    })());
    return close((function() {
      var i, len, results;
      results = [];
      for (i = 0, len = points.length; i < len; i++) {
        point = points[i];
        results.push(matrix.transformedPoint(point));
      }
      return results;
    })());
  };
  processors = {
    'path': fromPath,
    'polygon': fromPolygon,
    'polyline': fromPolyline,
    'ellipse': fromEllipse,
    'line': fromLine,
    'rectangle': fromRectangle
  };
  process = function(shape, parentMatrix) {
    var processor;
    processor = processors[shape.type];
    if (processor) {
      return processor(shape, parentMatrix);
    } else {
      return [
        {
          x: 0,
          y: 0
        }
      ];
    }
  };
  that.process = process;
  return that;
})();


EASEL.segmentVisitor = (function() {
  var that, visit, visitObject, visitPath, visitText;
  that = {};
  visit = function(shape) {
    switch (shape.type) {
      case 'text':
        return visitText(shape);
      case 'path':
        return visitPath(shape);
      default:
        return visitObject(shape);
    }
  };
  visitText = function(shape, matrix, params) {
    throw new Error("Segment generation not yet supported for text");
  };

  visitPath = function(shape, matrix, params) {
    return EASEL.polylineGenerator.process(shape, EASEL.matrix());
  };
  visitObject = function(shape) {
    var segments;
    segments = EASEL.polylineGenerator.process(shape, EASEL.matrix());
    return [segments];
  };
  that.visit = visit;
  return that;
})();
