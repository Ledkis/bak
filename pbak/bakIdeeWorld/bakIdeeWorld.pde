int FRAMERATE = 60; //TODO : attraction not working with > 60

int t;
color BACK_C = color(255, 255, 255);

IdeeWorld ideeWorld;


void setup() {
  frameRate(FRAMERATE);
  size(1000, 882);
  background(BACK_C);

  t=0;
  ideeWorld = new IdeeWorld();
  
}

void draw() {
  background(BACK_C);

  ideeWorld.evolve(t);

  t+=1;
}
