int FRAMERATE = 60; //TODO : attraction not working with > 60

int t;
color BACK_C = color(255, 255, 255);

Attraction attraction;

void setup() {
  frameRate(FRAMERATE);
  size(1000, 882);
  background(BACK_C);

  t=0;
  attraction = new Attraction(new Rect(0, 0, width, height));
}

void draw() {
  background(BACK_C);

  attraction.display();


  t+=1;
}

void mousePressed() {
  attraction.mousePressed();
}

void mouseReleased() {
  attraction.mouseReleased();
}
