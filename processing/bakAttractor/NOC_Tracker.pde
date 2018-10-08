class TrackedMover {
  Mover m;

  PVector startPos;
  boolean isClosing;
  boolean isHunted;
  boolean isCaptured;
  boolean isClose;

  public TrackedMover(Mover m) {
    this.m = m;
  }
}


class Tracker {
  Attractor a;
  TrackedMover[] movers;

  TrackedMover currentHunt;

  Sphere sphere;

  PVector center;

  PVector moversBar;

  float closeR;
  float captureR;

  boolean isCloseMoversBar;
  boolean isHunting;
  PVector dir;
  PVector startDir;
  PVector closing;
  float maxVel = width/(10*FRAMERATE);

  public Tracker(Sphere sphere, Attractor a, Mover[] movers) {
    this.sphere = sphere;
    this.a = a;

    this.movers = new TrackedMover[movers.length]; 
    for (int i = 0; i < movers.length; i++) {
      this.movers[i] = new TrackedMover(movers[i]);
    }
    this.center = new PVector(sphere.position.x, sphere.position.y);
    this.moversBar = new PVector(0, 0);
    closeR = a.getRayon()*2;
    captureR = a.getRayon();
  }

  public TrackedMover getClosestNotCapturedMover() {
    float currentDist = new PVector(sphere.r, sphere.r).mag();
    TrackedMover closestMover = new TrackedMover(null); 

    for (int i = 0; i < movers.length; i++) {
      TrackedMover m = movers[i];
      if (!m.isCaptured) {
        float dist = PVector.sub(m.m.position, a.position).mag();

        if (dist < currentDist) {
          closestMover = m;
          currentDist = dist;
        }
      }
    }
    return closestMover;
  }


  public void updateMoversBar() {
    moversBar.mult(0);
    if (movers.length > 0) {
      for (int i = 0; i < movers.length; i++) {
        Mover m = movers[i].m;
        moversBar.add(m.position);
      }
      moversBar.mult(1/ ((float) movers.length));
    }
  }



  public void track() {
    
    if (movers.length < 1){
      isHunting = false;
      return;
    }

    //update movers tracking state
    for (int i = 0; i < movers.length; i++) {
      TrackedMover m = movers[i];

      dir = PVector.sub(m.m.position, a.position);
      closing = PVector.sub(m.m.position, a.position).normalize();

      m.isClosing = PVector.angleBetween(m.m.velocity, dir) > PI/2;
      m.isClose = dir.mag() < closeR;
      m.isCaptured = dir.mag() < captureR;

      m.m.col = m.isCaptured ? CAPTURED_COLOR : UNCAPTURED_COLOR;
    } 

    if (a.dragging) {
      isHunting = false;
      return;
    }

    PVector barDir = PVector.sub(moversBar, a.position);
    isCloseMoversBar = barDir.mag() < a.getMaxInfluence();

    if (!isCloseMoversBar) {
      // On se rapproche du barycentre
      barDir.normalize();
      barDir.mult(maxVel);
      a.setVelocity(barDir);
    } else {


      currentHunt = getClosestNotCapturedMover(); 

      if (null != currentHunt.m) {

        currentHunt.isHunted = true;
        currentHunt.m.col = HUNTED_COLOR;
        currentHunt.startPos = new PVector(currentHunt.m.position.x, currentHunt.m.position.y);

        isHunting = true;
      } else {
        isHunting = false;
      }

      if (isHunting) {

        Mover m = currentHunt.m;
        dir = PVector.sub(m.position, a.position);
        closing = PVector.sub(m.position, a.position).normalize();

        if (!currentHunt.isCaptured) {
          if (!currentHunt.isClose) {

            startDir = PVector.sub(currentHunt.startPos, a.position);
            //float vel = map(dir.mag(), startDir.mag(), closeR, maxVel, m.velocity.mag());
            float vel = width/(10*FRAMERATE);

            closing.mult(vel);
          } else {
            closing.mult(1.5*m.velocity.mag());
          }
          a.setVelocity(closing);
        } else {
          // capturer seulement en volonté
          //currentHunt.isCaptured = true;   
          currentHunt.isHunted = false;
          isHunting = false;
        }
      }

      if (!isHunting) {
        //Tous les movers sont capturés, on retourne au centre
        PVector centerDir = PVector.sub(center, a.absPosition());
        centerDir.normalize();
        centerDir.mult(maxVel);

        a.setVelocity(centerDir);
      }
    }
  }



  public void displayDebug() {


    text("isHunting : " + isHunting, a.absPosition().x + closeR, a.absPosition().y - closeR + 10);

    if (isHunting) {

      Mover m = currentHunt.m;

      if (currentHunt.isClose) stroke(255, 0, 0);
      else stroke(0, 0, 0);
      noFill();
      ellipse(a.absPosition().x, a.absPosition().y, closeR*2, closeR*2);
      line(a.absPosition().x, a.absPosition().y, a.absPosition().x + dir.x, a.absPosition().y + dir.y);

      fill(0, 0, 0);

      text("vitesse attractor : " + a.velocity, 10, 10);

      text("huntedId : " + m.id, a.absPosition().x + closeR, a.absPosition().y - closeR + 0);

      text("closeR : " + closeR, a.absPosition().x + closeR, a.absPosition().y - closeR + 20);      
      text("dir.mag : " + dir.mag(), a.absPosition().x + closeR, a.absPosition().y - closeR + 30);
      text("captureR : " + dir.mag(), a.absPosition().x + closeR, a.absPosition().y - closeR + 40);
      text("startDir : " + currentHunt.startPos, a.absPosition().x + closeR, a.absPosition().y - closeR + 50);
      text("closing : " + closing, a.absPosition().x + closeR, a.absPosition().y - closeR + 60);
      text("isClose : " + currentHunt.isClose, a.absPosition().x + closeR, a.absPosition().y - closeR + 70);
      text("isCaptured : " + currentHunt.isCaptured, a.absPosition().x + closeR, a.absPosition().y - closeR + 80);
    }
  }
}