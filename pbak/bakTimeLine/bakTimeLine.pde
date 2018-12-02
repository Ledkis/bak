int FRAMERATE = 60; //TODO : attraction not working with > 60

int t;
color BACK_C = color(255, 255, 255);

HistoryMap historyMap;

void setup() {
  frameRate(FRAMERATE);
  size(1000, 882);
  background(BACK_C);

  t=0;
  historyMap = new HistoryMap(new Rect(0, 0, width, height));

}

void draw() {
  background(BACK_C);
  historyMap.display(t);

  t+=1;
}

void mousePressed() {
  historyMap.mousePressed();
}

void mouseReleased() {
  historyMap.mouseReleased();
}
