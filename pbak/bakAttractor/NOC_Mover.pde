class Mover {
  Sphere sphere;

  int id;

  PVector position;
  PVector velocity;
  PVector acceleration;
  float mass;

  boolean dragging = false; // Is the object being dragged?
  boolean rollover = false; // Is the mouse over the ellipse?
  PVector dragOffset;  // holds the offset for when object is clicked on

  color col = UNCAPTURED_COLOR;

  Mover(Sphere sphere, int id, float m, float x, float y) {
    this.sphere = sphere;
    this.id = id;
    mass = m;
    position = new PVector(x, y);
    velocity = new PVector(random(-5, 5), random(-5, 5));
    //velocity = new PVector(10,10);
    acceleration = new PVector(0, 0);
    dragOffset = new PVector(0.0, 0.0);
  }

  void applyForce(PVector force) {
    PVector f = PVector.div(force, mass); //<>//
    acceleration.mult(0);
    acceleration.add(f);
  }

  void update() {
    velocity.add(acceleration);
    if (BUMP) {
      if (position.mag() > sphere.r) {
        position.normalize().mult(sphere.r);

        float angle = PVector.angleBetween(velocity, position);

        angle = -PI - 2*angle;

        velocity.rotate(angle);
      }
    } 
    position.add(velocity);
    if (CHECK_EDGE) {
      checkEdges();
    }
  }

  void checkEdges() {

    if (position.mag() > sphere.r) {
      position.normalize().mult(-sphere.r);
    }
  }
  
    void setPosition(PVector pos) {
    acceleration.mult(0);
    velocity.mult(0);
    position.mult(0);
    position.add(pos);
  }

  void setVelocity(PVector vel) {
    velocity.mult(0);
    velocity.add(vel);
  }

  float getRayon() {
    return mass*12;
  }

  PVector absPosition() {
    return PVector.add(sphere.position, position);
  }

  PVector toCartPosition(PVector pos) {
    return PVector.sub(pos, sphere.position);
  }

    void display() {
      stroke(0);
      strokeWeight(2);
      fill(col);

      ellipse(absPosition().x, absPosition().y, 2*getRayon(), 2*getRayon());
    }

  void displayDebug(color velCol, color accCol) {
    // velocity
    stroke(velCol);
    strokeWeight(1);
    line(absPosition().x, absPosition().y + getRayon(), absPosition().x + VEL_F*velocity.x, absPosition().y + VEL_F*velocity.y + getRayon());
    // acceleration
    stroke(accCol);
    line(absPosition().x, absPosition().y - getRayon(), absPosition().x + ACC_F*acceleration.x, absPosition().y + ACC_F*acceleration.y - getRayon());
    fill(0);
    text(id, absPosition().x + getRayon(), absPosition().y + getRayon());
  }





  void displayDebugBump() {


    if (position.mag() > (sphere.r - 200)) {
      strokeWeight(1);
      PVector h1 = new PVector(position.x, position.y);
      PVector h2 = new PVector(position.x, position.y);

      h1.normalize().mult(sphere.r);
      h2.normalize().mult(sphere.r).rotate(PI/2);

      PVector p1 = PVector.add(sphere.position, h1);
      line(sphere.position.x, sphere.position.y, p1.x, p1.y);

      PVector p2 = PVector.add(sphere.position, PVector.add(h2, h1));
      line(p1.x, p1.y, p2.x, p2.y);

      h2.rotate(PI);
      p2 = PVector.add(sphere.position, PVector.add(h2, h1));
      line(p1.x, p1.y, p2.x, p2.y);

      strokeWeight(1);

      line(absPosition().x - velocity.x*100, absPosition().y - velocity.y*100, 
        absPosition().x + velocity.x*100, absPosition().y + velocity.y*100);

      float angle = PVector.angleBetween(velocity, position);
      angle = -PI - 2*angle;

      PVector v = new PVector(velocity.x, velocity.y);
      v.rotate(angle);        

      strokeWeight(3);
      line(absPosition().x - v.x*100, absPosition().y - v.y*100, 
        absPosition().x + v.x*100, absPosition().y + v.y*100);
    }
  }






  // The methods below are for mouse interaction
  void clicked(int mx, int my) {
    float d = dist(mx, my, absPosition().x, absPosition().y);
    if (d < getRayon()) {
      dragging = true;
      dragOffset.x = absPosition().x-mx;
      dragOffset.y = absPosition().y-my;
    }
  }

  void hover(int mx, int my) {
    float d = dist(mx, my, absPosition().x, absPosition().y);

    if (d < getRayon()) {
      rollover = true;
    } else {
      rollover = false;
    }
  }

  void stopDragging() {
    dragging = false;
  } //<>//


  void drag() {
    if (dragging) {
      PVector pos = new PVector(mouseX + dragOffset.x, mouseY + dragOffset.y);
      position = toCartPosition(pos);
    }
  }
}