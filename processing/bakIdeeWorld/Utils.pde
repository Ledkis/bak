float absToCartX(float xWindow) {
  return width/2-xWindow;
}

float absToCartY(float yWindow) {
  return height/2-yWindow;
}

float absToCartX(Rect rect, float x) {
  return rect.x + rect.w/2-x;
}

float absToCartY(Rect rect, float y) {
  return rect.y + rect.h/2-y;
}

/**
 TODO : rename to rectToAbs
 */
float absToRectX(Rect rect, float x) {
  return rect.x + x;
}

/**
 TODO : rename to rectToAbs
 */
float absToRectY(Rect rect, float y) {
  return rect.y + y;
}

PVector absToCart(Rect rect, PVector p) {
  return new PVector(absToCartX(rect, p.x), absToCartY(rect, p.y));
}

PVector absToRect(Rect rect, PVector p) {
  return new PVector(absToRectX(rect, p.x), absToRectY(rect, p.y));
}

PVector[] absToRect(Rect rect, PVector[] ps) {
  PVector[] nps = new PVector[ps.length];
  for (int i = 0; i < nps.length; i++) {
    nps[i] = new PVector(absToRectX(rect, ps[i].x), absToRectY(rect, ps[i].y));
  } 
  return nps;
}

PVector[] absToCart(Rect rect, PVector[] ps) {
  PVector[] nps = new PVector[ps.length];
  for (int i = 0; i < nps.length; i++) {
    nps[i] = new PVector(absToCartX(rect, ps[i].x), absToCartY(rect, ps[i].y));
  } 
  return nps;
}


public class PVectorTraj {

  PVector[] traj;

  public PVectorTraj(int trajSize) {
    this.traj = new PVector[trajSize];
    for (int i=0; i < this.traj.length; i++) {         
      //this.data[i] = getVal(i);
      this.traj[i] = new PVector(0, 0);
    }
  }

  public void updateTraj(PVector newPoint) {
    for (int i=1; i < this.traj.length; i++) {
      this.traj[this.traj.length-i] = this.traj[this.traj.length-i-1];
    }

    this.traj[0] = new PVector(newPoint.x, newPoint.y);
  }
}

public class Rect {

  float x;
  float y;
  float w;
  float h;

  public Rect(float x, float y, float w, float h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
  
  Rect getCopy(){
   return new Rect(x, y, w, h); 
  }
}

public class Sphere {

  PVector position;
  float r;


  public Sphere(PVector position, float r) {
    this.position = position;
    this.r = r;
  }
}

/**
 * Utility class to convert between geo-locations and Cartesian screen coordinates.
 * Can be used with a bounding box defining the map section.
 *
 * (c) 2011 Till Nagel, tillnagel.com
 */
public class MercatorMap {

  public static final float DEFAULT_TOP_LATITUDE = 80;
  public static final float DEFAULT_BOTTOM_LATITUDE = -80;
  public static final float DEFAULT_LEFT_LONGITUDE = -180;
  public static final float DEFAULT_RIGHT_LONGITUDE = 180;

  /** Horizontal dimension of this map, in pixels. */
  protected float mapScreenWidth;
  /** Vertical dimension of this map, in pixels. */
  protected float mapScreenHeight;

  /** Northern border of this map, in degrees. */
  protected float topLatitude;
  /** Southern border of this map, in degrees. */
  protected float bottomLatitude;
  /** Western border of this map, in degrees. */
  protected float leftLongitude;
  /** Eastern border of this map, in degrees. */
  protected float rightLongitude;

  private float topLatitudeRelative;
  private float bottomLatitudeRelative;
  private float leftLongitudeRadians;
  private float rightLongitudeRadians;

  public MercatorMap(float mapScreenWidth, float mapScreenHeight) {
    this(mapScreenWidth, mapScreenHeight, DEFAULT_LEFT_LONGITUDE, DEFAULT_RIGHT_LONGITUDE, DEFAULT_BOTTOM_LATITUDE, DEFAULT_TOP_LATITUDE);
  }

  /**
   * Creates a new MercatorMap with dimensions and bounding box to convert between geo-locations and screen coordinates.
   *
   * @param mapScreenWidth Horizontal dimension of this map, in pixels.
   * @param mapScreenHeight Vertical dimension of this map, in pixels.
   * @param topLatitude Northern border of this map, in degrees.
   * @param bottomLatitude Southern border of this map, in degrees.
   * @param leftLongitude Western border of this map, in degrees.
   * @param rightLongitude Eastern border of this map, in degrees.
   */
  public MercatorMap(float mapScreenWidth, float mapScreenHeight, float leftLongitude, float rightLongitude, float bottomLatitude, float topLatitude) {
    this.mapScreenWidth = mapScreenWidth;
    this.mapScreenHeight = mapScreenHeight;
    this.leftLongitude = leftLongitude;
    this.rightLongitude = rightLongitude;
    this.topLatitude = topLatitude;
    this.bottomLatitude = bottomLatitude;

    this.topLatitudeRelative = getScreenYRelative(topLatitude);
    this.bottomLatitudeRelative = getScreenYRelative(bottomLatitude);
    this.leftLongitudeRadians = getRadians(leftLongitude);
    this.rightLongitudeRadians = getRadians(rightLongitude);
  }

  /**
   * Projects the geo location to Cartesian coordinates, using the Mercator projection.
   *
   * @param geoLocation Geo location with (latitude, longitude) in degrees.
   * @returns The screen coordinates with (x, y).
   */
  public PVector getScreenLocation(PVector geoLocation) {
    float longitudeInDegrees = geoLocation.x;
    float latitudeInDegrees = geoLocation.y;

    return new PVector(getScreenX(longitudeInDegrees), getScreenY(latitudeInDegrees));
  }

  private float getScreenYRelative(float latitudeInDegrees) {
    return log(tan(latitudeInDegrees / 360f * PI + PI / 4));
  }

  private float getLatDegree(float screenYRelative) {
    return (360f/PI)*(atan(exp(screenYRelative)) - PI/4);
  }

  protected float getScreenY(float latitudeInDegrees) {
    return mapScreenHeight * (getScreenYRelative(latitudeInDegrees) - topLatitudeRelative) / (bottomLatitudeRelative - topLatitudeRelative);
  }

  private float getRadians(float deg) {
    return deg * PI / 180;
  }

  private float getDegree(float rad) {
    return 180*rad / PI;
  }

  protected float getScreenX(float longitudeInDegrees) {
    float longitudeInRadians = getRadians(longitudeInDegrees);
    return mapScreenWidth * (longitudeInRadians - leftLongitudeRadians) / (rightLongitudeRadians - leftLongitudeRadians);
  }

  public PVector getScreenGeoPosition(PVector screenPosition) {
    return new PVector(getGeoLong(screenPosition.x), getGeoLat(screenPosition.y));
  }

  protected float getGeoLong(float screenX) {
    float longitudeInRadians = (rightLongitudeRadians - leftLongitudeRadians)*(screenX/mapScreenWidth) + leftLongitudeRadians;
    return getDegree(longitudeInRadians);
  }

  protected float getGeoLat(float screenY) {
    float longitudeInRadians = (bottomLatitudeRelative - topLatitudeRelative)*(screenY/mapScreenHeight) + topLatitudeRelative;   
    return getLatDegree(longitudeInRadians);
  }
}


float getDeg(float deg, float min, float sec) {
  return deg + min/60f + sec/(60f*60f);
}

String strip(String s) {
  return s.replaceAll("^\\s+|\\s+$", "");
}

String stripLeft(String s) {
  return s.replaceAll("^\\s+", "");
}

String stripRight(String s) {
  return s.replaceAll("\\s+$", "");
}

String removeChars(String s) {
  return s.replaceAll("[^-?0-9]", "");
}

boolean contains(String s, String reg) {
  return s.matches("(?i).*" + reg + ".*");
}

boolean isIn(Rect rect, PVector p) {
  return p.x > rect.x && p.x < (rect.x + rect.w) && p.y > rect.y && p.y < (rect.y + rect.h);
}


float getTextHeight(float scalar) {
  float a = textAscent() * scalar;  // Calc ascent
  float d = textDescent() * scalar;  // Calc ascent
  return a+d;
}