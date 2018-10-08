import java.util.Map;

int POINT_WIDTH = 10;
int POINT_HEIGHT = 10;
int TAILWIDTH = 2;

String POL_FILE = "conf/pol_stand.json";
String IDEE_FILE = "conf/idee_stand.json"; 


public class IdeeWorld {

  BakFrame bakFrame;

  HashMap<Integer, Pol> pols;
  HashMap<Integer, RIdee> rIdees;
  HashMap<Integer, BRIdee> bRIdees;
  HashMap<Integer, RIdeeHyp> rIdeeHyps;
  HashMap<Integer, BRIdeeHyp> bRIdeeHyps;

  public IdeeWorld () {
    bakFrame = new BakFrame();

    pols = new HashMap<Integer, Pol>();
    rIdees = new HashMap<Integer, RIdee>();
    bRIdees = new HashMap<Integer, BRIdee>();
    rIdeeHyps = new HashMap<Integer, RIdeeHyp>();
    bRIdeeHyps = new HashMap<Integer, BRIdeeHyp>();

    initFromJSON(bakFrame.mainM);
  }

  public void initFromJSON(Rect rect) {

    JSONArray jPpols =  loadJSONObject(POL_FILE).getJSONArray("pols");

    for (int i = 0; i < jPpols.size(); i++) {
      JSONObject jPol = jPpols.getJSONObject(i);


      int id = jPol.getInt("id");
      float amp = jPol.getFloat("amp");
      float pQuant = jPol.getFloat("pQuant");
      float pTps = jPol.getFloat("pTps");
      float phQuant = jPol.getFloat("phQuant");
      float phTps = jPol.getFloat("phTps");


      Pol pol = new Pol(id, amp*rect.w, pQuant, pTps*FRAMERATE, phQuant, phTps);
      pols.put(pol.id, pol);
    }


    JSONArray jAIdees =  loadJSONObject(IDEE_FILE).getJSONArray("aIdees");

    if (null != jAIdees) {
      for (int i = 0; i < jAIdees.size(); i++) {
        JSONObject jIdee = jAIdees.getJSONObject(i);

        int idIdee = jIdee.getInt("id");
        float idee = jIdee.getFloat("idee");

        int idPolx = jIdee.getInt("idPolx");
        int idPoly = jIdee.getInt("idPoly");

        Pol polx = pols.get(idPolx);
        Pol poly = pols.get(idPoly);

        color col = unhex(jIdee.getString("color"));

        RIdee rIdee = new RIdee(idIdee, idee, polx, poly);
        RIdeeHyp rIdeeHyp = new RIdeeHyp(rIdee, col);

        rIdees.put(idIdee, rIdee);
        rIdeeHyps.put(idIdee, rIdeeHyp);
      }
    }

    JSONArray jRIdees =  loadJSONObject(IDEE_FILE).getJSONArray("rIdees");

    if (null != jRIdees) {
      for (int i = 0; i < jRIdees.size(); i++) {
        JSONObject jIdee = jRIdees.getJSONObject(i);

        int idIdee = jIdee.getInt("id");
        int idAIdee = jIdee.getInt("idAIdee");

        RIdee rIdee = rIdees.get(idAIdee);

        float ridee = jIdee.getFloat("ridee");

        int idPolx = jIdee.getInt("idPolx");
        int idPoly = jIdee.getInt("idPoly");

        Pol polx = pols.get(idPolx);
        Pol poly = pols.get(idPoly);

        color col = unhex(jIdee.getString("color"));

        RIdee rId = new RIdee(idIdee, rIdee, ridee, polx, poly);
        RIdeeHyp rIdeeHyp = new RIdeeHyp(rId, col);

        rIdees.put(idIdee, rId);
        rIdeeHyps.put(idIdee, rIdeeHyp);
      }
    }


    JSONArray jBRIdees =  loadJSONObject(IDEE_FILE).getJSONArray("bRIdees");

    if (null != jBRIdees) {
      for (int i = 0; i < jBRIdees.size(); i++) {
        JSONObject jBRIdee = jBRIdees.getJSONObject(i);

        int idIdee = jBRIdee.getInt("id");
        int idPol = jBRIdee.getInt("idPol");

        Pol pol = pols.get(idPol);

        int idPosIdee = jBRIdee.getInt("idPosIdee");
        int idNegIdee = jBRIdee.getInt("idNegIdee");

        RIdee posIdee = rIdees.get(idPosIdee);
        RIdee negIdee = rIdees.get(idNegIdee);

        color col = unhex(jBRIdee.getString("color"));

        BRIdee bRIdee = new BRIdee(posIdee, negIdee, pol);
        BRIdeeHyp bRIdeeHyp = new BRIdeeHyp(bRIdee, col);

        bRIdees.put(idIdee, bRIdee);
        bRIdeeHyps.put(idIdee, bRIdeeHyp);
      }
    }
  }


  public void evolve(float tps) {

    bakFrame.draw();

    for (Map.Entry me : rIdeeHyps.entrySet()) {

      RIdeeHyp rIdeeHyp  = (RIdeeHyp) me.getValue(); 
      rIdeeHyp.drawIdee(bakFrame.mainM, 0, tps, 1);
      rIdeeHyp.drawXTemp(bakFrame.bottomM);
      rIdeeHyp.drawYTemp(bakFrame.rightM);
      //if drawTpsTraj
      //if drawTail
    }

    for (Map.Entry me : bRIdeeHyps.entrySet()) {
      BRIdeeHyp bRIdeeHyp  = (BRIdeeHyp) me.getValue(); 
      bRIdeeHyp.drawIdee(bakFrame.mainM, 0, tps, 1);
      bRIdeeHyp.drawXTemp(bakFrame.bottomM);
      bRIdeeHyp.drawYTemp(bakFrame.rightM);
    }
  }
}


// IDEE_MODEL


boolean BNOISE = true;
float noiseFactor = width/10;
int TRAJ_TAIL_SIZE = 100;

/**
 Polarisation function
 */
public class Pol {
  int id;
  float amp;
  float pQuant;
  float pTps;
  float phQuant;
  float phTps;


  public Pol(int id, float amp, float pQuant, float pTps, float phQuant, float phTps) {
    this.id = id;
    this.amp = amp;
    this.pQuant = pQuant;
    this.pTps = pTps;
    this.phQuant = phQuant;
    this.phTps = phTps;
  }

  //public Pol(JSONObject jPol) {
  //  this.id = jPol.getInt("id");
  //  this.amp = jPol.getFloat("amp");
  //  this.pQuant = jPol.getFloat("pQuant");
  //  this.pTps = jPol.getFloat("pTps");
  //  this. phQuant = jPol.getFloat("phQuant");
  //  this.phTps = jPol.getFloat("phTps");
  //}

  public Pol() {
    this(-1, 0, 1, 1, 0, 0);
  }

  public float getPol(float qual, float tps) {
    return this.amp*sin((2*PI/this.pQuant)*qual + phQuant + (2*PI/this.pTps)*tps + this.phTps);
  }
}



/**
 Idée pure/absolue : se polarise uniquement par rapport à l'absolue
 
 */
public abstract class AIdee extends PVectorTraj {

  int id;
  float idee;
  Pol polx;
  Pol poly;


  public AIdee(int id, float idee, Pol polx, Pol poly) {
    super(TRAJ_TAIL_SIZE);
    this.id = id;
    this.idee = idee;
    this.polx = polx;
    this.poly = poly;
  }

  public PVector getPol(float qual, float tps) {

    float xpolx = this.polx.getPol(qual, tps)*cos(this.idee);
    float ypolx = this.polx.getPol(qual, tps)*sin(this.idee);

    float xpoly = this.poly.getPol(qual, tps)*cos(this.idee + PI/2);
    float ypoly = this.poly.getPol(qual, tps)*sin(this.idee + PI/2); 
    return new PVector(xpolx + xpoly, ypolx + ypoly);
  }

  float getPTps() {
    return this.polx.pTps + this.poly.pTps;
  }
}


/**
 Qualitée/Idée relative : se polarise par rapport à une autre qualité, absolue ou relative
 
 */
public class RIdee extends AIdee {

  float rIdee;
  RIdee refIdee;


  public RIdee(int id, RIdee refIdee, float rIdee, Pol polx, Pol poly) {
    super(id, refIdee.idee, polx, poly);
    this.refIdee = refIdee;
    this.rIdee = rIdee;
  }



  public RIdee(int id, float aIdee, Pol polx, Pol poly) {
    // TODO : double constructeur
    super(id, aIdee, polx, poly);
    this.rIdee = 0;
  }


  float getAIdee() {
    if (null != this.refIdee) {
      return this.refIdee.getAIdee() + this.rIdee;
    } else {
      return + this.rIdee;
    }
  }


  PVector getAAmp() {
    if (null != this.refIdee) {
      return getRAmp().add(this.refIdee.getAAmp());
    } else {
      return this.getRAmp();
    }
  }

  PVector getRAmp() {
    float xpolx = this.polx.amp*cos(getAIdee());
    float ypolx = this.polx.amp*sin(getAIdee());

    float xpoly = this.poly.amp*cos(getAIdee() + PI/2);
    float ypoly = this.poly.amp*sin(getAIdee() + PI/2);

    float ampx = abs(xpolx) + abs(xpoly);
    float ampy = abs(ypolx) + abs(ypoly);
    return new PVector(ampx, ampy);
  }

  float getAPTps() {
    if (null != this.refIdee) {
      return this.refIdee.getAPTps() + getPTps();
    } else {
      return getPTps();
    }
  }


  public PVector getPol(float qual, float tps) {
    // Polarisation absolue
    PVector a_pol;
    // Polarisaiton relative
    PVector r_pol = getRPol(qual, tps);
    if (null != this.refIdee) {
      r_pol.add(this.refIdee.getPol(qual, tps));
      a_pol = r_pol;
    } else {
      a_pol = super.getPol(qual, tps);
    }
    return a_pol;
  }

  public PVector getRPol(float qual, float tps) {
    float xpolx = this.polx.getPol(qual, tps)*cos(getAIdee());
    float ypolx = this.polx.getPol(qual, tps)*sin(getAIdee());

    float xpoly = this.poly.getPol(qual, tps)*cos(getAIdee() + PI/2);
    float ypoly = this.poly.getPol(qual, tps)*sin(getAIdee() + PI/2); 
    return new PVector(xpolx + xpoly, ypolx + ypoly);
  }

  public PVector[] getTpsTraj(float qual, int pointNbr) {
    PVector[] traj = new PVector[pointNbr];

    float pTps = getAPTps();

    for (int i=0; i < traj.length; i++) {         
      float tps = i*(pTps/pointNbr);
      traj[i] = getPol(qual, tps);
    }

    return traj;
  }

  public void updateTrajTail(float qual, float tps) {
    PVector newPoint = getPol(qual, tps);

    updateTraj(newPoint);
  }
}

/**
  TODO REFACTOR : changer le nom
*/
public class BRIdee extends PVectorTraj {
  
  RIdee posIdee;
  RIdee negIdee;
  Pol pol;
  

  public BRIdee(RIdee posIdee, RIdee negIdee, Pol pol) {
    super(TRAJ_TAIL_SIZE);
    this.posIdee = posIdee;
    this.negIdee = negIdee;
    this.pol = pol;
  }

  public PVector getPol(float qual, float tps) {
    // Polarisation absolue
    PVector posPoint = this.posIdee.getPol(qual, tps);
    PVector negPoint = this.negIdee.getPol(qual, tps);

    float currentPol = this.pol.getPol(qual, tps);

    float x = map(currentPol, -this.pol.amp, this.pol.amp, posPoint.x, negPoint.x);
    
    float y = map(currentPol, -this.pol.amp, this.pol.amp, posPoint.y, negPoint.y);

    return new PVector(x, y);
  }

  public void updateTrajTail(float qual, float tps) {
    PVector newPoint = getPol(qual, tps);

    updateTraj(newPoint);
  }
}


// IDEE_UI

public class RIdeeHyp {

  RIdee rIdee;

  PVectorHyp pVectorHyp;
  PVectorTrajHyp pVectorTrajHyp;

  public RIdeeHyp (RIdee rIdee, color col) {
    this.rIdee = rIdee;

    pVectorHyp = new PVectorHyp(POINT_WIDTH, POINT_HEIGHT, col);
    pVectorTrajHyp = new PVectorTrajHyp(col, TAILWIDTH);
  }

  public void drawIdee(Rect rect, float qual, float tps, float frameR) {
    // TODO : structure
    updateTrajTail(qual, tps, frameR);

    PVector p = this.rIdee.getPol(qual, tps);

    this.pVectorHyp.drawPVector(rect, absToCart(rect, p));
  }

  public void drawTpsTraj(Rect rect, float qual, int trajSize) {
    PVector[] traj = this.rIdee.getTpsTraj(qual, trajSize);
    this.pVectorTrajHyp.drawTraj(rect, traj);
  }


  public void drawTail(Rect rect) {
    this.pVectorTrajHyp.drawTraj(rect, this.rIdee.traj);
  }

  public void drawTemp(Rect rect) {
    drawXTemp(rect);
    drawYTemp(rect);
  }


  public void drawXTemp(Rect rect) {
    this.pVectorTrajHyp.drawXTraj(rect, absToCart(rect, this.rIdee.traj));
  }

  public void drawYTemp(Rect rect) {
    this.pVectorTrajHyp.drawYTraj(rect, absToCart(rect, this.rIdee.traj));
  }



  public void updateTrajTail(float qual, float tps, float frameR) {
    if (tps % ((int) frameR) == 0 ) {
      this.rIdee.updateTrajTail(qual, tps);
    }
  }

  public void drawRAmp(Rect rect, float qual, float tps, color col) {
    PVector refP = this.rIdee.refIdee.getPol(qual, tps);

    stroke(col);
    line(0, absToCartY(rect, refP.y + this.rIdee.getRAmp().y), rect.w, absToCartY(rect, refP.y + this.rIdee.getRAmp().y)); 
    line(0, absToCartY(rect, refP.y - this.rIdee.getRAmp().y), rect.w, absToCartY(rect, refP.y - this.rIdee.getRAmp().y));
    line(absToCartX(rect, (refP.x + this.rIdee.getRAmp().x)), 0, absToCartY(rect, refP.x + this.rIdee.getRAmp().x), rect.h);
    line(absToCartX(rect, refP.x - this.rIdee.getRAmp().x), 0, absToCartY(rect, refP.x - this.rIdee.getRAmp().x), rect.h);
  }

  public void drawAAmp(Rect rect, color col) {
    stroke(col);
    line(0, absToCartY(rect, this.rIdee.getAAmp().y), rect.w, absToCartY(rect, this.rIdee.getAAmp().y)); 
    line(0, absToCartY(rect, -this.rIdee.getAAmp().y), rect.w, absToCartY(rect, -this.rIdee.getAAmp().y));
    line(absToCartX(rect, this.rIdee.getAAmp().x), 0, absToCartY(rect, this.rIdee.getAAmp().x), rect.h);
    line(absToCartX(rect, -this.rIdee.getAAmp().x), 0, absToCartY(rect, -this.rIdee.getAAmp().x), rect.h);
  }
}


/**
 TODO STRUCTURE : similaire à RIdeeHyp
 */
public class BRIdeeHyp {

  BRIdee bRIdee;

  PVectorHyp pVectorHyp;
  PVectorTrajHyp pVectorTrajHyp;

  public BRIdeeHyp (BRIdee bRIdee, color col) {
    this.bRIdee = bRIdee;

    pVectorHyp = new PVectorHyp(POINT_WIDTH, POINT_HEIGHT, col);
    pVectorTrajHyp = new PVectorTrajHyp(col, TAILWIDTH);
  }

  public void drawIdee(Rect rect, float qual, float tps, float frameR) {
    // TODO : structure
    updateTrajTail(qual, tps, frameR);

    PVector p = this.bRIdee.getPol(qual, tps);

    this.pVectorHyp.drawPVector(rect, absToCart(rect, p));
  }

  public void drawXTemp(Rect rect) {

    this.pVectorTrajHyp.drawXTraj(rect, absToCart(rect, this.bRIdee.traj));
  }

  public void drawYTemp(Rect rect) {
    this.pVectorTrajHyp.drawYTraj(rect, absToCart(rect, this.bRIdee.traj));
  }

  public void updateTrajTail(float qual, float tps, float frameR) {
    if (tps % ((int) frameR) == 0 ) {
      this.bRIdee.updateTrajTail(qual, tps);
    }
  }
}


// WORLD_UI

boolean BGRID = true;
boolean BLOG = true;

color GRID_COLOR = color(0, 0, 0);

public class BakFrame {

  MainMonitor mainM;
  BottomMonitor bottomM;
  RightMonitor rightM;
  BottomRightMonitor bottomRightM;

  int HEIGHT_RATIO = 3*height/4;
  int WIDTH_RATIO = 3*width/4;

  public BakFrame () {
    mainM = new MainMonitor(0, 0, WIDTH_RATIO, HEIGHT_RATIO);
    bottomM = new BottomMonitor(0, HEIGHT_RATIO, WIDTH_RATIO, width-HEIGHT_RATIO);
    rightM = new RightMonitor(WIDTH_RATIO, 0, width - WIDTH_RATIO, HEIGHT_RATIO);
    bottomRightM = new BottomRightMonitor(WIDTH_RATIO, HEIGHT_RATIO, width - WIDTH_RATIO, height - HEIGHT_RATIO);
  }

  public void draw() {
    mainM.draw();
    bottomM.draw();
    rightM.draw();
    bottomRightM.draw();
  }
}

public class Monitor extends Rect {

  public Monitor(int x, int y, int w, int h) {
    super(x, y, w, h);
  }

  public void draw() {
    noFill();
    stroke(GRID_COLOR);
    strokeWeight(1);
    rect(x, y, w, h);
  }
}



public class MainMonitor extends Monitor {
  public MainMonitor(int x, int y, int w, int h) {
    super(x, y, w, h);
  }


  void draw() {
    super.draw();
    drawGrid();
  }


  public void drawGrid() {
    if (!BGRID) {
      return;
    }

    stroke(GRID_COLOR);
    strokeWeight(1);

    // X Axis

    line(this.x, this.h/4, this.w, this.h/4);
    line(this.x, this.h/2, this.w, this.h/2);
    line(this.x, 3*this.h/4, this.w, 3*this.h/4);

    //Y Axis

    line(this.w/4, this.y, this.w/4, this.h);
    line(this.w/2, this.y, this.w/2, this.h);
    line(3*this.w/4, this.y, 3*this.w/4, this.h);

    // Cercle

    stroke(GRID_COLOR);
    strokeWeight(1);
    noFill();
    ellipse(this.w/2, this.h/2, this.w/8, this.h/8);
    ellipse(this.w/2, this.h/2, this.w/4, this.h/4);
    ellipse(this.w/2, this.h/2, this.w/2, this.h/2);
    ellipse(this.w/2, this.h/2, 3*this.w/4, 3*this.h/4);
    ellipse(this.w/2, this.h/2, this.w, this.h);
  }
}





public class BottomMonitor extends Monitor {
  public BottomMonitor(int x, int y, int w, int h) {
    super(x, y, w, h);
  }
}

public class RightMonitor extends Monitor {

  public RightMonitor(int x, int y, int w, int h) {
    super(x, y, w, h);
  }
}

public class BottomRightMonitor extends Monitor {

  public BottomRightMonitor(int x, int y, int w, int h) {
    super(x, y, w, h);
  }

  public void draw() {
    super.draw();
  }
}