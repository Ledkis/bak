public class PVectorHyp {

  int w;
  int h;

  color col;

  public PVectorHyp (int w, int h, color col) {
    this.w = w;
    this.h = h;
    this.col = col;
  }

  public void drawPVector(Rect rect, PVector pos) {

    fill(col);
    noStroke();

    ellipse(absToRectX(rect, pos.x), absToRectY(rect, pos.y), this.w, this.h);
  }
}

public class PVectorTrajHyp {

  color col;
  float w;

  public PVectorTrajHyp (color col, float w) {
    this.col = col;
    this.w = w;
  }

  public void setColor(color col) {
    this.col = col;
  }

  public void setWidth(float w) {
    this.w = w;
  }


  public void drawTraj(Rect rect, PVector[] traj) {
    fill(this.col);
    noStroke();
    for (int i = 0; i < traj.length; i++) {
      PVector p = traj[i];
      ellipse(absToRectX(rect, p.x), absToRectY(rect, p.y), this.w, this.w);
    }
  }

  public void drawTraj(Rect rect, PVector[] traj, color col, float w) {
    setColor(col);
    setWidth(w);
    drawTraj(rect, traj);
  }

  public void drawXTraj(Rect rect, PVector[] traj) {
    fill(this.col);
    noStroke();
    for (int i = 0; i < traj.length; i++) {
      PVector p = traj[i];

      float x = absToRectX(rect, p.x);

      float y = map(i, 0, traj.length, rect.y, rect.y+rect.h);

      ellipse(x, y, this.w, this.w);

      if (i%int(traj.length/2) ==0) {
        //text("x : " + ((x-300)/VEL_F), x, y);
        text("x : " + x, x, y);
      }
    }
  }

  public void drawXTraj(Rect rect, PVector[] traj, color col, float w) {
    setColor(col);
    setWidth(w);
    drawXTraj(rect, traj);
  }


  public void drawYTraj(Rect rect, PVector[] traj) {
    fill(this.col);
    noStroke();
    for (int i = 0; i < traj.length; i++) {
      PVector p = traj[i];

      float x = map(i, 0, traj.length, rect.x, rect.x+rect.w);

      float y = absToRectY(rect, p.y);

      ellipse(x, y, this.w, this.w);
    }
  }

  public void drawYTraj(Rect rect, PVector[] traj, color col, float w) {
    setColor(col);
    setWidth(w);
    drawYTraj(rect, traj);
  }
}


void rectText(float x, float y, float textW, float scalar) {
  float textH = getTextHeight(scalar);
  float a = textAscent() * scalar;  // Calc ascent
  rect(x, y-a, textW, textH);
}

void textRotated(String text, float x, float y, float rad) {
  pushMatrix();
  translate(x, y);
  rotate(rad);
  text(text, 0, 0);
  popMatrix();
}



class SensorRect {

  Rect rect;
  color col = color(255, 255, 255);
  color strokeCol = color(0, 0, 0);
  color strokeDebugCol = color(255, 0, 0);

  boolean dragging = false; // Is the object being dragged?
  boolean rollover = false; // Is the mouse over the ellipse?

  float min = 0;
  float max = 1;

  PVector sensor;

  boolean debug = true;

  public SensorRect(Rect rect) {
    this.rect = rect;
    sensor = new PVector(1, 1);
  }

  void display() {
    stroke(strokeCol);
    fill(col);
    rect(rect.x, rect.y, rect.w, rect.h);

    if (debug) {
      strokeWeight(1);
      stroke(strokeDebugCol);
      //text(sensor.x + "," + sensor.y, rect.x, rect.y + 10);

      float x = map(sensor.x, 0, 1, rect.x + rect.w, rect.x);
      float y = map(sensor.y, 0, 1, rect.y + rect.h, rect.y);

      // xline
      line(rect.x, y, rect.x + rect.w, y);
      // yline
      line(x, rect.y, x, rect.y + rect.h);
    }
  }


  // The methods below are for mouse interaction
  void clicked(int mx, int my) {
    if (isIn(rect, new PVector(mx, my))) {
      dragging = true;
    }
  }

  void stopDragging() {
    dragging = false;
  }


  void drag() {
    if (dragging) {
      PVector pos = new PVector(mouseX, mouseY);
      sensor.x = constrain(map(pos.x, rect.x + rect.w, rect.x, min, max), min, max);
      sensor.y = constrain(map(pos.y, rect.y + rect.h, rect.y, min, max), min, max);
    }
  }
}


class ButtonRect {

  Rect rect;
  color pressedCol = color(0, 0, 0);
  color unPressedCol = color(255, 255, 255);
  color strokeCol = color(0, 0, 0);

  boolean isPressed = false;

  public ButtonRect(Rect rect) {
    this.rect = rect;
  }

  void display() {
    stroke(strokeCol);
    if (isPressed) fill(pressedCol);
    else fill(unPressedCol);
    rect(rect.x, rect.y, rect.w, rect.h);
  }

  // The methods below are for mouse interaction
  void clicked(int mx, int my) {
    if (isIn(rect, new PVector(mx, my))) {
      isPressed = !isPressed;
    }
  }
}


class ZoomRect {

  Rect refRect;
  Rect dragRect;

  float startVal;
  float endVal;

  float minVal = 0;
  float maxVal = 1;

  boolean isHorizontal;

  PVector dragStartP;
  PVector dragEndP;
  float sphereR = 12;

  float zoomRectSize = 10;
  
  String startText = "";
  String endText = "";
  String midText = "";

  boolean draggingStart = false;
  boolean draggingEnd = false;
  boolean draggingBoth = false;
  boolean rollover = false;
  PVector dragOffset;

  public ZoomRect(Rect refRect, boolean isHorizontal) {
    this.refRect = refRect;
    if (isHorizontal) this.dragRect = new Rect(refRect.x, refRect.y + refRect.h, refRect.w, zoomRectSize);
    else              this.dragRect = new Rect(refRect.x + refRect.w, refRect.y, zoomRectSize, refRect.h);

    this.isHorizontal = isHorizontal;

    if (isHorizontal) dragStartP = new PVector(refRect.x, refRect.y + refRect.h + sphereR/2);
    else              dragStartP = new PVector(refRect.x + refRect.w + sphereR/2, refRect.y);

    if (isHorizontal) dragEndP = new PVector(refRect.x + refRect.w, refRect.y + refRect.h + sphereR/2);
    else              dragEndP = new PVector(refRect.x + refRect.w + sphereR/2, refRect.y + refRect.h);

    dragOffset = new PVector(0, 0);

    startVal = minVal;
    endVal = maxVal;
  }

  void updateVal() {
    if (isHorizontal) {
      dragRect.x = dragStartP.x;
      dragRect.w = dragEndP.x - dragStartP.x;

      startVal = map(dragStartP.x, refRect.x, refRect.x + refRect.w, minVal, maxVal);
      endVal = map(dragEndP.x, refRect.x, refRect.x + refRect.w, minVal, maxVal);
    } else {
      dragRect.y = dragStartP.y;
      dragRect.h = dragEndP.y - dragStartP.y;

      startVal = map(dragStartP.y, refRect.y, refRect.y + refRect.h, minVal, maxVal);
      endVal = map(dragEndP.y, refRect.y, refRect.y + refRect.h, minVal, maxVal);
    }
  }

  void updateVal(float startV, float endV) {
    boolean dragging = draggingStart || draggingEnd || draggingBoth;

    if (!dragging) {
      startVal = startV;
      endVal = endV;

      //updatePos();
    }
  }

  void updatePos() {
    if (isHorizontal) {
      dragStartP.x  = map(startVal, minVal, maxVal, refRect.x, refRect.x + refRect.w);
      dragEndP.x  = map(endVal, minVal, maxVal, refRect.x, refRect.x + refRect.w);

      dragRect.x = dragStartP.x;
      dragRect.w = dragEndP.x - dragStartP.x;
    } else {
      dragStartP.y  = map(startVal, minVal, maxVal, refRect.y, refRect.y + refRect.h);
      dragEndP.y  = map(endVal, minVal, maxVal, refRect.y, refRect.y + refRect.h);

      dragRect.y = dragStartP.y;
      dragRect.h = dragEndP.y - dragStartP.y;
    }
  }
  
  PVector getSartPos(float start){
    PVector startP = new PVector(0,0);
    
    if (isHorizontal) startP.x = map(start, minVal, maxVal, refRect.x, refRect.x + refRect.w);
    else              startP.y = map(start, minVal, maxVal, refRect.y, refRect.y + refRect.h);
     
    return startP;
  }
  
  PVector getEndPos(float end){
    PVector endP = new PVector(0,0);
    
    if (isHorizontal) endP.x = map(end, minVal, maxVal, refRect.x, refRect.x + refRect.w);
    else              endP.y = map(end, minVal, maxVal, refRect.y, refRect.y + refRect.h);
     
    return endP;
  }




  void display(float start, float end) {
    
    PVector startPos = getSartPos(start);
    PVector endPos = getEndPos(end);
    
    println(startPos.x, startPos.y);

    fill(255, 0, 0, 100);
    rect(dragRect.x, dragRect.y, dragRect.w, dragRect.h);


    //left
    stroke(0, 40);
    fill(0, 200, 100, 255);

    if (isHorizontal) line(startPos.x, dragRect.y, startPos.x, dragRect.y + dragRect.h);
    else              line(dragRect.x, startPos.y, dragRect.x + dragRect.w, startPos.y);

    if (isHorizontal) ellipse(startPos.x, dragRect.y + dragRect.h + sphereR/2, sphereR, sphereR);
    else              ellipse(dragRect.x + dragRect.w + sphereR/2, startPos.y, sphereR, sphereR);

    fill(0);
    if (isHorizontal) text(startText, startPos.x, dragRect.y + dragRect.h + 2*sphereR);
    else              text(startText, dragRect.x + dragRect.w + 2*sphereR, startPos.y);

    ////right
    stroke(0, 40);
    fill(0, 200, 100, 255);

    if (isHorizontal) line(endPos.x, dragRect.y, endPos.x, dragRect.y + dragRect.h);
    else              line(dragRect.x, endPos.y, dragRect.x + dragRect.w, endPos.x);  

    if (isHorizontal) ellipse(endPos.x, dragRect.y + dragRect.h + sphereR/2, sphereR, sphereR);
    else              ellipse(dragRect.x + dragRect.w + sphereR/2, endPos.y, sphereR, sphereR);

    fill(0);
    if (isHorizontal) text(endText, endPos.x, dragRect.y + dragRect.h + 2*sphereR);
    else              text(endText, dragRect.x + dragRect.w + 2*sphereR, endPos.y);

    ////center
    
    if (isHorizontal) text(midText, (startPos.x + endPos.x)/2, dragRect.y + dragRect.h + 10);
    else              text(midText, dragRect.x + dragRect.w + 10, (startPos.y + endPos.y)/2);
  }

  // The methods below are for mouse interaction
  void clicked(int mx, int my) {
    float dStart = dist(mx, my, dragStartP.x, dragStartP.y);
    float dEnd = dist(mx, my, dragEndP.x, dragEndP.y);

    if (isIn(dragRect, new PVector(mx, my))) {
      draggingBoth = true;
      dragOffset.x = dragStartP.x - mx;
      dragOffset.y = dragStartP.y - my;
    }

    if (!draggingBoth && dStart < sphereR) {
      draggingStart = true;
      dragOffset.x = dragStartP.x - mx;
      dragOffset.y = dragStartP.y - my;
    }

    // priorité au draggingStart 
    if (!draggingStart && dEnd < sphereR) {
      draggingEnd = true;
      dragOffset.x = dragEndP.x - mx;
      dragOffset.y = dragEndP.y - my;
    }
  }

  void stopDragging() {
    draggingStart = false;
    draggingEnd = false;
    draggingBoth = false;
  }


  void drag() {

    if (draggingBoth) {
      PVector pos = new PVector(mouseX + dragOffset.x, mouseY + dragOffset.y);

      float startEndD;
      float start;
      float end;

      if (isHorizontal) {
        startEndD = dragStartP.x - dragEndP.x;
        start = pos.x;
        end = pos.x - startEndD;

        if (start > refRect.x && end < (refRect.x + refRect.w)) {
          dragStartP.x = start;
          dragEndP.x = end;
          updateVal();
        }
      } else {
        startEndD = dragStartP.y - dragEndP.y;
        start = pos.y;
        end = pos.y - startEndD;

        if (start > refRect.y && end < (refRect.y + refRect.h)) {
          dragStartP.y = start;
          dragEndP.y = end;
          updateVal();
        }
      }
    }

    if (draggingStart) {
      PVector pos = new PVector(mouseX + dragOffset.x, mouseY + dragOffset.y);
      if (isHorizontal) {
        dragStartP.x = pos.x;
        if (dragStartP.x < refRect.x) dragStartP.x = refRect.x;
        if (dragStartP.x > dragEndP.x) dragStartP.x = dragEndP.x - 1;
      } else {
        dragStartP.y = pos.y;
        if (dragStartP.y < refRect.y) dragStartP.y = refRect.y;
        if (dragStartP.y > dragEndP.y) dragStartP.y = dragEndP.y - 1;
      }
      updateVal();
    }

    if (draggingEnd) {
      PVector pos = new PVector(mouseX + dragOffset.x, mouseY + dragOffset.y);
      if (isHorizontal) {
        dragEndP.x = pos.x;
        if (dragEndP.x > refRect.x + refRect.w) dragEndP.x = refRect.x + refRect.w;
        if (dragEndP.x < dragStartP.x) dragEndP.x = dragStartP.x + 1;
      } else {
        dragEndP.y = pos.y;
        if (dragEndP.y > refRect.y + refRect.h) dragEndP.y = refRect.y + refRect.h;
        if (dragEndP.y < dragStartP.y) dragEndP.y = dragStartP.y + 1;
      }
      updateVal();
    }
  }
}