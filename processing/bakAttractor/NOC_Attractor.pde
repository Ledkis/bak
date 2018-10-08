// A class for a draggable attractive body in our world

class Attractor extends Mover {

  Attractor(Sphere sphere, int id, float m, float x, float y) {
    super(sphere, id, m, x, y);
  }

  PVector attract(Mover m) {
    PVector force = PVector.sub(position, m.position);        // Calculate direction of force
    float d = force.mag();                                    // Distance between objects
    d = constrain(d, getMinInfluence(), getMaxInfluence());   // Limiting the distance to eliminate "extreme" results for very close or very far objects
    force.normalize();                                        // Normalize vector (distance doesn't matter here, we just want this vector for direction)
    float strength = (GRAVITY * mass * m.mass) / (d*d);       // Calculate gravitional force magnitude
    force.mult(strength);                                     // Get force vector --> magnitude * direction

    return force; //<>//
  }

  float getRayon() {
    return mass/10;
  }

  float getMaxInfluence() {
    return 4*getRayon();
  }

  float getMinInfluence() {
    return getRayon();
  }


  boolean isIn(Mover m) {
    PVector dist = PVector.sub(position, m.position);
    if (dist.mag() < getRayon()) return true;
    else return false;
  }

  // Method to display
  void display() {
    ellipseMode(CENTER);
    strokeWeight(4);
    stroke(0);
    if (dragging) fill (50, col);
    else if (rollover) fill(100, col);
    else fill(175, col);
    ellipse(absPosition().x, absPosition().y, 2*getRayon(), 2*getRayon());
  }


  void displayDebug() {
    strokeWeight(1);
    fill(10, 10);
    ellipse(absPosition().x, absPosition().y, 8*getRayon(), 8*getRayon());
  }
}