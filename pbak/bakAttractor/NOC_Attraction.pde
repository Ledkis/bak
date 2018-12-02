// The Nature of Code //<>//
// Daniel Shiffman
// http://natureofcode.com

float GRAVITY = 0.15;

int MOVER_NBR = 10;

color UNCAPTURED_COLOR = color(100, 100, 100);
color CAPTURED_COLOR = color(0, 255, 0);
color HUNTED_COLOR = color(255, 0, 0);


boolean BUMP = true;
boolean CHECK_EDGE = !BUMP;
float BUMP_F = 0.5;
int TRAJ_SIZE = 100;
int VEL_F = 10;
int ACC_F = 1000;

public class Attraction {

  Rect rect;
  Sphere sphere;

  PVector center;

  Mover[] movers = new Mover[MOVER_NBR];
  Attractor a;
  Attractor bar;

  Tracker tracker;

  PVectorTraj trajPos;
  PVectorTraj trajVel;
  PVectorTraj trajAcc;

  PVectorTraj entropieCurve;

  PVectorTrajHyp trajHyp;

  Rect frame; 
  Rect bottom;
  Rect right;

  public Attraction(Rect rect) {
    this.rect = rect;

    float rayon = rect.w > rect.h ? rect.h/2 : rect.w/2;

    this.sphere = new Sphere(new PVector(rect.x+rect.w/2, rect.y+rect.h/2), rayon);
    this.center = new PVector(sphere.r/2, sphere.r/2);
    
    float moversMass = 0;
    for (int i = 0; i < movers.length; i++) {
      float mass = random(0.1, 2);
      moversMass += mass;
      movers[i] = new Mover(sphere, i, mass, random(-sphere.r, sphere.r), random(-sphere.r, sphere.r));
    }
    a = new Attractor(sphere, 0, 300, -sphere.r+5, 0);
    tracker = new Tracker(sphere, a, movers);
    tracker.updateMoversBar();
    
    PVector barPos = tracker.moversBar;
    bar = new Attractor(sphere, 1, 10*moversMass, barPos.x, barPos.y);
    
    
    trajPos = new PVectorTraj(TRAJ_SIZE);
    trajVel = new PVectorTraj(TRAJ_SIZE);
    trajAcc = new PVectorTraj(TRAJ_SIZE);
    entropieCurve = new PVectorTraj(TRAJ_SIZE);
    trajHyp = new PVectorTrajHyp(2, color(0, 0, 0));

    frame = new Rect(absToRectX(rect, 0), absToRectY(rect, 0), rect.w, rect.h);
    bottom = new Rect(absToRectX(rect, 0), absToRectY(rect, rect.h/2), rect.w, rect.h/2);
    right = new Rect(absToRectX(rect, rect.w/2), absToRectY(rect, 0), rect.w, rect.h);
  }

  public void display() {

    fill(230, 230, 230);
    ellipse(sphere.position.x, sphere.position.y, 2*sphere.r, 2*sphere.r);

    a.drag();
    a.hover(mouseX, mouseY);

    a.update();
    for (int i = 0; i < movers.length; i++) {
      PVector force = a.attract(movers[i]); //<>//
      PVector barForce = bar.attract(movers[i]); //<>//
      force.add(barForce);
      movers[i].applyForce(force);
     
      movers[i].update();
      movers[i].drag();
      movers[i].hover(mouseX, mouseY);
    }
    
    tracker.updateMoversBar();
    tracker.track();
    
    bar.setPosition(tracker.moversBar);

    a.display();
    for (int i = 0; i < movers.length; i++) {
      movers[i].display();
    }
    
    bar.display();


    displayDebug();
  }


  public void displayDebug() {

    //Debug
    a.displayDebug();
    tracker.displayDebug();
    for (int i = 0; i < movers.length; i++) {
      movers[i].displayDebug(color(0, 255, 0), color(0, 0, 255));
    }

    float cx = width/8+20;
    float cy = width/8+20;
    float ew = width/4;

    noFill();
    stroke(0);
    strokeWeight(1);
    ellipse(cx, cy, ew, ew);

    PVector moversMoyPos = new PVector(0, 0);
    PVector moversMoyVel = new PVector(0, 0);
    PVector moversMoyAcc = new PVector(0, 0);


    float entropie = 0;

    for (int i = 0; i < movers.length; i++) {
      Mover m = movers[i];
      PVector p = m.velocity.normalize();
      moversMoyVel.add(p);

      moversMoyAcc.add(m.acceleration.normalize());

      entropie += i*(2*PI)/movers.length - PVector.angleBetween(new PVector(1, 0), p);

      fill(0);
      ellipse(cx + p.x*ew/2, cy + p.y*ew/2, 5, 5);
    }

    moversMoyPos = PVector.add(sphere.position, tracker.moversBar);

    entropie = entropie/movers.length;
    entropieCurve.updateTraj(new PVector(0, -1*moversMoyVel.mag()*10+ew/2));
    trajHyp.drawYTraj(new Rect(cx, cy-ew/2, width, ew), entropieCurve.traj, color(255, 10, 0), 2);

    float magVel = map(moversMoyVel.mag(), 0, movers.length, 0, 1);
    moversMoyVel.normalize().mult(magVel);
    float magAcc = map(moversMoyAcc.mag(), 0, movers.length, 0, 1);
    moversMoyAcc.normalize().mult(magAcc);

    text("entropie : " + (1-moversMoyVel.mag()), cx-30, cy - 20);

    noFill();
    stroke(0);
    rect(cx, cy-ew/2, width-cx, ew);
    line(cx, cy, width, cy);

    fill(0, 255, 0);
    line(cx, cy, cx + moversMoyVel.x*ew/2, cy + moversMoyVel.y*ew/2);
    ellipse(cx + moversMoyVel.x*ew/2, cy + moversMoyVel.y*ew/2, 5, 5);
    fill(0, 0, 255);
    line(cx, cy, cx + moversMoyAcc.x*ew/2, cy + moversMoyAcc.y*ew/2);
    ellipse(cx + moversMoyAcc.x*ew/2, cy + moversMoyAcc.y*ew/2, 5, 5);


    //barycentre

    stroke(0);
    fill(255, 255, 0);
    //ellipse(moversMoyPos.x, moversMoyPos.y, 10, 10);
    fill(0, 255, 0);
    stroke(0);
    line(moversMoyPos.x, moversMoyPos.y, moversMoyPos.x + moversMoyVel.x*ew/2, moversMoyPos.y + moversMoyVel.y*ew/2);
    ellipse(moversMoyPos.x + moversMoyVel.x*ew/2, moversMoyPos.y + moversMoyVel.y*ew/2, 5, 5);
    fill(0, 0, 255);
    line(moversMoyPos.x, moversMoyPos.y, moversMoyPos.x + moversMoyAcc.x*ew/2, moversMoyPos.y + moversMoyAcc.y*ew/2);
    ellipse(moversMoyPos.x + moversMoyAcc.x*ew/2, moversMoyPos.y + moversMoyAcc.y*ew/2, 5, 5);

    // Trajectoires

    trajPos.updateTraj(a.absPosition());
    trajVel.updateTraj(new PVector(VEL_F*a.velocity.x + sphere.r, VEL_F*a.velocity.y + sphere.r));
    trajAcc.updateTraj(new PVector(ACC_F*a.acceleration.x + sphere.r, ACC_F*a.acceleration.y + sphere.r));

    //trajPos.updateTraj(m.absPosition());
    //trajVel.updateTraj(new PVector(VEL_F*m.velocity.x + sphere.r, VEL_F*m.velocity.y + sphere.r));
    //trajAcc.updateTraj(new PVector(ACC_F*m.acceleration.x + sphere.r, ACC_F*m.acceleration.y + sphere.r));

    trajHyp.drawXTraj(bottom, trajPos.traj, color(255, 10, 0), 2);
    trajHyp.drawXTraj(bottom, trajVel.traj, color(0, 255, 0), 2);
    //trajHyp.drawXTraj(bottom, trajAcc.traj, color(0, 0, 255), 2);

    //trajPos.drawYTraj(right, color(255, 0, 0), 2);
    //trajVel.drawYTraj(right, color(0, 255, 0), 2);
    //trajAcc.drawYTraj(right, color(0, 0, 255), 2);


    stroke(0);
    noFill();
    rect(sphere.position.x, sphere.position.y, sphere.position.x + sphere.r, sphere.position.y + sphere.r);
  }

  void mousePressed() {
    a.clicked(mouseX, mouseY);
    for (int i = 0; i < movers.length; i++) {
      movers[i].clicked(mouseX, mouseY);
    }
  }

  void mouseReleased() {
    a.stopDragging();
    for (int i = 0; i < movers.length; i++) {
      movers[i].stopDragging();
    }
  }
}
