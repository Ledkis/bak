import java.util.Collections;  //<>//
import java.util.Comparator;
import java.util.Map;

float IMAGE_RATIO = 0.7;
String NO_STRING = "XXX";
PVector NO_GEOPOS = new PVector(-7f, 45f); // dans la méditérannée
float NO_DATE = -10000;
float START_TIME = -500;
float END_TIME = 1500;
float TIME_BORDER = 100;
float TIME_FACTOR = 10;
boolean DATA_START_SELECTIONED = true;
float TEXT_SCALAR = 0.8;

class HistoryData {
  String classifieur;
  String name;
  String naissancePos;
  String mortPos;
  PVector naissanceGeoPos;
  PVector mortGeoPos;
  float naissance;
  float mort;

  // TODO : moche
  // display info
  HashMap<Integer, HistoryDataInfoRect> infoRectPosList;


  boolean isSelectioned = DATA_START_SELECTIONED;

  public HistoryData() {
    classifieur = NO_STRING;
    name = NO_STRING;
    naissancePos = NO_STRING;
    mortPos = NO_STRING;
    naissanceGeoPos = NO_GEOPOS;
    mortGeoPos = NO_GEOPOS;
    naissance = NO_DATE;
    mort = NO_DATE;


    infoRectPosList = new HashMap<Integer, HistoryDataInfoRect>();
  }

  void initInfoRect(int timeLineId) {
    HistoryDataInfoRect infoRect = new HistoryDataInfoRect(this);
    infoRectPosList.put(timeLineId, infoRect);
  }

  boolean isAlive(float time) {
    return time > naissance && time < mort;
  }

  float getLifeSpan() {
    return mort - naissance;
  }

  float getAge(float date) {
    return date - naissance;
  }



  String toString() {
    String n;
    if (naissance == NO_DATE) {
      n = "?";
    } else {
      n = naissance + "";
    }

    String m;
    if (mort == NO_DATE) {
      m = "?";
    } else {
      m = mort + "";
    }

    return name + " (" + n + "/" + m + ")";
  }
}


class HistoryMap {

  String EUROPE_MAP_PATH = "europe_small.png";
  String HISTORY_DATA_PATH = "data/history_data.md";

  String CLASSIFIEUR_BEGINNING = "###";
  String DATA_SEP = "\n\n";
  String DATA_INFO_SEP = "\n";
  String SEP = ";";
  String INFO_SEP = ",";
  String GEO_DEG_SEP = " ";


  Rect rect;
  Rect imageRect;
  Rect homoTimeLineRect;
  Rect eventTimeLineRect;
  PImage europeMapImage;
  MercatorMap mercatorMap;
  float whRatio;

  String rawData;
  ArrayList<HistoryData> historyDatas;

  TimeLine homoTimeLine;
  TimeLine eventTimeLine;

  float currentDate;
  float startDate;
  float endDate;
  float prgmTime;
  float timeF;
  float timeOffset = 0;

  SensorRect sensorRect;
  ButtonRect selectionButton;

  public HistoryMap(Rect rect) {

    this.rect = rect;
    // Loading exported image
    europeMapImage = loadImage(EUROPE_MAP_PATH);
    // Map with dimension and bounding box

    imageRect = new Rect((1-IMAGE_RATIO)*rect.w, (1-IMAGE_RATIO)*rect.h, IMAGE_RATIO*rect.w, IMAGE_RATIO*rect.h); 

    mercatorMap = new MercatorMap(imageRect.w, imageRect.h, -11.25, 37.793, 28.6135, 58.8137);
    whRatio = europeMapImage.width/europeMapImage.height;

    homoTimeLineRect = new Rect((1-IMAGE_RATIO)*rect.w, 0, IMAGE_RATIO*rect.w, height - IMAGE_RATIO*rect.h);
    eventTimeLineRect = new Rect(0, (1-IMAGE_RATIO)*rect.h + 50, width - IMAGE_RATIO*rect.w, IMAGE_RATIO*rect.h - 100);

    //eventTimeLineRect = new Rect((1-IMAGE_RATIO)*rect.w, (1-IMAGE_RATIO)*rect.h, 100, 200);
    //homoTimeLineRect = new Rect(eventTimeLineRect.x+eventTimeLineRect.w + 50, (1-IMAGE_RATIO)*rect.h, 200, 100);


    historyDatas = new ArrayList<HistoryData>();

    loadData();
    sortOnNaissance();

    startDate = getFirst().naissance - TIME_BORDER;
    endDate = getLast().naissance + TIME_BORDER;
    currentDate = startDate;
    timeF = TIME_FACTOR;

    homoTimeLine = new TimeLine(0, this, homoTimeLineRect, historyDatas, true);

    eventTimeLine = new TimeLine(1, this, eventTimeLineRect, historyDatas, false);

    sensorRect = new SensorRect(new Rect(homoTimeLineRect.x - 30, homoTimeLineRect.y, 30, homoTimeLineRect.h));
    selectionButton = new ButtonRect(new Rect(sensorRect.rect.x-30, homoTimeLineRect.y, 30, 30));
    selectionButton.isPressed = DATA_START_SELECTIONED;
  }

  HistoryData getFirst() {
    HistoryData firstD = null;
    float firstNaissance = 0;

    for (HistoryData h : historyDatas) {
      if (h.naissance < firstNaissance) {
        firstNaissance = h.naissance;
        firstD = h;
      }
    }
    return firstD;
  }

  HistoryData getLast() {
    HistoryData lastD = null;
    float lastNaissance = 0;

    for (HistoryData h : historyDatas) {
      if (h.naissance > lastNaissance) {
        lastNaissance = h.naissance;
        lastD = h;
      }
    }
    return lastD;
  }

  void sortOnNaissance() {

    Collections.sort(historyDatas, new Comparator<HistoryData>() {
      @Override
        public int compare(HistoryData h1, HistoryData h2)
      {

        return  int(h1.naissance - h2.naissance);
      }
    }
    );
  }

  void loadData() {

    String[] strings = loadStrings(HISTORY_DATA_PATH);

    rawData = "";

    for (String line : strings) {
      line = line.trim();
      if (line.startsWith("\n")) {
        line = line.substring(1, line.length());
      }
      rawData += line;
      rawData += DATA_INFO_SEP;
    }

    String[] datas = rawData.split(DATA_SEP);

    String currentClassifieur = NO_STRING;
    for (int i = 0; i < datas.length; i++) {

      String data = datas[i];

      if (data.startsWith(CLASSIFIEUR_BEGINNING)) {
        currentClassifieur = data.split(CLASSIFIEUR_BEGINNING)[1].trim();
      } else {


        if (data.length() > 0) {

          HistoryData h = new HistoryData();
          String[] historyDataS = data.split(DATA_INFO_SEP);



          h.classifieur = currentClassifieur; 

          // Name

          String name = historyDataS[0].trim();
          h.name = name;

          // GeoPosition

          try {

            String[] geoPosInfo = historyDataS[1].trim().split(SEP);

            if (geoPosInfo.length > 0) {
              PVector naissanceGeoPos = NO_GEOPOS;
              PVector mortGeoPos = NO_GEOPOS;
              if (geoPosInfo.length == 1) {
                if (contains(historyDataS[1], ";")) {
                  //"1 , 2;"
                  naissanceGeoPos = getGeoPosFromString(geoPosInfo[0]);
                } else {
                  //"1 , 2"
                  naissanceGeoPos = getGeoPosFromString(geoPosInfo[0]);
                  mortGeoPos = getGeoPosFromString(geoPosInfo[0]);
                }
              } else {
                if (geoPosInfo[0].length() == 0) {
                  //"; 1 , 2"

                  mortGeoPos = getGeoPosFromString(geoPosInfo[1]);
                } else {
                  //"1 , 2 ; 1 , 2"
                  naissanceGeoPos = getGeoPosFromString(geoPosInfo[0]);
                  mortGeoPos = getGeoPosFromString(geoPosInfo[1]);
                }
              }
              h.naissanceGeoPos = naissanceGeoPos;
              h.mortGeoPos = mortGeoPos;
            }
          } 
          catch (Exception ex) { 
            System.err.println("loadData : GeoPosition : " + ex); 
            System.err.println("data : \n" + data);
            System.exit(1);
          }


          // Position

          try {

            String[] posInfo = historyDataS[2].trim().split(SEP);

            if (posInfo.length > 0) {
              String naissancePos = NO_STRING;
              String mortPos = NO_STRING;
              if (posInfo.length == 1) {
                if (posInfo[0].trim().length() > 0) {
                  if (contains(historyDataS[2], ";")) {
                    //"nazareth;"
                    naissancePos = posInfo[0].trim();
                  } else {
                    //"nazareth"
                    naissancePos = posInfo[0].trim();
                    mortPos = posInfo[0].trim();
                  }
                }
              } else {
                if (posInfo[0].length() == 0) {
                  //"; nazareth"
                  if (posInfo[1].trim().length() > 0) {
                    mortPos = posInfo[1].trim();
                  }
                } else {
                  //"nazareth; jerusalem"
                  if (posInfo[0].trim().length() > 0) {
                    naissancePos = posInfo[0].trim();
                  }
                  if (posInfo[1].trim().length() > 0) {
                    mortPos = posInfo[1].trim();
                  }
                }
              }
              h.naissancePos = naissancePos;
              h.mortPos = mortPos;
            }
          } 
          catch (Exception ex) { 
            System.err.println("loadData : Position : " + ex); 
            System.err.println("data : \n" + data);
            System.exit(1);
          }

          // date

          try {

            String[] dateInfo = historyDataS[3].trim().split(SEP);

            if (dateInfo.length > 0) {
              float naissance = NO_DATE;
              float mort = NO_DATE;
              if (dateInfo.length == 1) {
                if (contains(historyDataS[3], ";")) {
                  //950;
                  naissance = float(dateInfo[0]);
                } else {
                  //950
                  naissance = float(dateInfo[0]);
                  mort = float(dateInfo[0]);
                }
              } else {
                if (dateInfo[0].length() == 0) {
                  //;950
                  naissance = float(dateInfo[1]);
                  mort = float(dateInfo[1]);
                } else {
                  //950;950
                  naissance = float(dateInfo[0]);
                  mort = float(dateInfo[1]);
                }
              }
              h.naissance = naissance;
              h.mort = mort;
            }
          } 
          catch (Exception ex) { 
            System.err.println("loadData : Date : " + ex); 
            System.err.println("data : \n" + data);
            System.exit(1);
          }

          // THE END

          historyDatas.add(h);
        }
      }
    }
  }

  PVector getGeoPosFromString(String geoPosS) {

    if (geoPosS.trim().length() == 0) {
      return NO_GEOPOS;
    }

    geoPosS = geoPosS.trim().replaceAll("[^-?.? ?,?0-9]", ""); 

    String[] data = geoPosS.trim().split(INFO_SEP);

    if (data.length < 2) {
      return NO_GEOPOS;
    } else {

      float degN = NO_GEOPOS.y; 
      float minN = 0;
      float secN = 0;
      float degE = NO_GEOPOS.x;
      float minE = 0;
      float secE = 0;

      try {

        String[] nord = data[0].trim().split(GEO_DEG_SEP);
        String[] est = data[1].trim().split(GEO_DEG_SEP);

        if (data[0].trim().length() != 0) {
          if (nord.length == 1) {
            degN =  float(nord[0]);
          } else if (nord.length == 2) {
            degN = float(nord[0]);
            minN = float(nord[1]);
            degN = getDeg(degN, minN, 0);
          } else {
            degN = float(nord[0]);
            minN = float(nord[1]);
            secN = float(nord[2]);

            degN = getDeg(degN, minN, secN);
          }
        }

        if (data[1].trim().length() != 0) {
          if (est.length == 1) {
            degE =  float(est[0]);
          } else if (est.length == 2) {
            degE = float(est[0]);
            minE = float(est[1]);
            degE = getDeg(degE, minE, 0);
          } else {
            degE = float(est[0]);
            minE = float(est[1]);
            secE = float(est[2]);

            degE = getDeg(degE, minE, secE);
          }
        }
      } 
      catch (Exception ex) { 
        System.err.println("getGeoPosFromString : Date : " + ex); 
        System.err.println("data : \n" + geoPosS);
        System.exit(1);
      }

      return new PVector(degE, degN);
    }
  }

  void mousePressed() {
    PVector MousePos = new PVector(mouseX, mouseY);

    homoTimeLine.clicked(mouseX, mouseY);
    homoTimeLine.zoomRect.clicked(mouseX, mouseY);

    eventTimeLine.clicked(mouseX, mouseY);
    eventTimeLine.zoomRect.clicked(mouseX, mouseY);

    sensorRect.clicked(mouseX, mouseY);

    // selectionButton
    boolean oldState = selectionButton.isPressed;
    selectionButton.clicked(mouseX, mouseY);
    boolean newState = selectionButton.isPressed;
    if (oldState != newState) { 
      for (HistoryData h : historyDatas) {
        h.isSelectioned = selectionButton.isPressed;
      }
    }

    if (isIn(homoTimeLine.rect, MousePos)) {
      for (HistoryData h : historyDatas) {
        HistoryDataInfoRect infoRect = h.infoRectPosList.get(homoTimeLine.id);
        infoRect.clicked(mouseX, mouseY);
      }
    } else if (isIn(eventTimeLine.rect, MousePos)) {
      for (HistoryData h : historyDatas) {
        HistoryDataInfoRect infoRect = h.infoRectPosList.get(eventTimeLine.id);
        infoRect.clicked(mouseX, mouseY);
      }
    }
  }

  void mouseReleased() {
    homoTimeLine.stopDragging();
    homoTimeLine.zoomRect.stopDragging();

    eventTimeLine.stopDragging();
    eventTimeLine.zoomRect.stopDragging();

    sensorRect.stopDragging();
  }

  float getCurrentStartDate() {
    // on prend homoTimeLine comme référénce (symétrie de homoTimeLine et eventTimeLine)
    ZoomRect zoomRect = homoTimeLine.zoomRect;
    return map(zoomRect.startVal, zoomRect.minVal, zoomRect.maxVal, startDate, endDate);
  }

  float getCurrentEndDate() {
    ZoomRect zoomRect = homoTimeLine.zoomRect;
    return map(zoomRect.endVal, zoomRect.minVal, zoomRect.maxVal, startDate, endDate);
  }

  void updateTimeOffset(float time) {
    timeOffset = (currentDate - getDate(time)) % (getCurrentEndDate() - getCurrentStartDate());
  }

  void setTimeFactor(float ratio) {
    timeF = ratio * TIME_FACTOR;
  }

  void update(float time) {
    boolean dragging = homoTimeLine.dragging || eventTimeLine.dragging;
    if (!dragging) {

      float XXX;

      currentDate = getDate(time);
      currentDate = currentDate + timeOffset;

      if (currentDate > getCurrentEndDate()) {
        // TODO : timeInverted ?
        currentDate = getCurrentStartDate();
        updateTimeOffset(time);
      } else if (currentDate < getCurrentStartDate()) {
        currentDate = getCurrentEndDate();
        updateTimeOffset(time);
      }
    }
    homoTimeLine.update(currentDate);
    eventTimeLine.update(currentDate);
  }


  float getDate(float time) {
    float maxValue = ((getCurrentEndDate() - getCurrentStartDate())/ timeF); 
    float newPrgmTime = time % maxValue;

    if (newPrgmTime < prgmTime) {
      timeOffset = (currentDate - getCurrentStartDate() + newPrgmTime*timeF) % (getCurrentEndDate()-getCurrentStartDate());
    }

    prgmTime = newPrgmTime; 

    float newTime = map(prgmTime, 0, maxValue, getCurrentStartDate(), getCurrentEndDate());


    // debug timeOffset
    //float timeXPos = map(newTime, getCurrentStartDate(), getCurrentEndDate(), rect.x, rect.x + rect.w);
    //line(timeXPos, rect.y, timeXPos, rect.y + rect.h+50);

    return newTime;
  }





  void display(float prgTime) {
    update(prgTime);

    image(europeMapImage, imageRect.x, imageRect.y, imageRect.w, imageRect.h);

    homoTimeLine.drag(prgTime);  
    homoTimeLine.zoomRect.drag();

    eventTimeLine.drag(prgTime);  
    eventTimeLine.zoomRect.drag();

    sensorRect.drag();

    homoTimeLine.display();

    eventTimeLine.display();

    sensorRect.display();
    selectionButton.display();

    if (sensorRect.dragging) {
      setTimeFactor(sensorRect.sensor.y);
    }

    for (int i = 0; i < historyDatas.size(); i++) {
      HistoryData h = historyDatas.get(i);

      if (null != h) {

        if (h.isSelectioned && h.isAlive(homoTimeLine.currentDate)) {
          PVector ph = absToRect(imageRect, mercatorMap.getScreenLocation(h.naissanceGeoPos));
          fill(0, 255, 100, 200);
          ellipse(ph.x, ph.y, 12, 12);
          stroke(100);
          for (Map.Entry me : h.infoRectPosList.entrySet()) {
            HistoryDataInfoRect infoRect  = (HistoryDataInfoRect) me.getValue(); 
            line(infoRect.rect.x, infoRect.rect.y, ph.x, ph.y);
          }
          text(h.toString(), ph.x + 10, ph.y+10);
        }
      }
    }

    PVector p = mercatorMap.getScreenGeoPosition(new PVector(mouseX-imageRect.x, mouseY-imageRect.y));
    fill(0);
    text("long : " + p.x + "\nlat : " + p.y, 10, 20);
  }
}



class TimeLine {

  int id;
  HistoryMap historyMap;
  Rect rect;


  float startDate;
  float endDate;
  float currentDate; 



  // TODO : méthode de renversement :
  // au lieu de renverser les objets un à un renverser l'objet entier
  boolean isHorizontal;
  boolean timeInverted = false;

  ZoomRect zoomRect;

  PVector timePos;

  ArrayList<HistoryData> historyDatas;

  float dateInterval = 200;
  float textH = 8;
  float spaceBetween = 5;

  boolean dragging = false; // Is the timeLine being dragged?
  PVector dragOffset;  // holds the offset for when timeLine is clicked on

  public TimeLine(int id, HistoryMap historyMap, Rect rect, ArrayList<HistoryData> historyDatas, boolean isHorizontal) {
    this.id = id;
    this.historyMap = historyMap;
    this.rect = rect;
    this.historyDatas = historyDatas;

    startDate = historyMap.startDate;
    endDate = historyMap.endDate;
    currentDate = historyMap.currentDate;

    initHistoryDataInfoRects();

    zoomRect = new ZoomRect(rect, isHorizontal);
    
    zoomRect.startVal = zoomRect.minVal;
    zoomRect.endVal = zoomRect.maxVal;


    this.isHorizontal = isHorizontal;
    dragOffset = new PVector(0.0, 0.0);
  }

  void initHistoryDataInfoRects() {
    for (HistoryData h : historyDatas) {
      h.initInfoRect(id);
    }
  }

  float getCurrentStartDate() {
    return historyMap.getCurrentStartDate();
  }

  float getCurrentEndDate() { 
    return historyMap.getCurrentEndDate();
  }

  void update(float date) {
    currentDate = date;
  }


  PVector timeToPx(float startT, float endT, float time) {

    float XXX;

    float x;
    float y;

    if (!timeInverted) x = map(time, startT, endT, rect.x, rect.x + rect.w);
    else x = map(time, endT, startT, rect.x, rect.x + rect.w);

    if (!timeInverted) y = map(time, startT, endT, rect.y, rect.y + rect.h);
    else y = map(time, endT, startT, rect.y, rect.y + rect.h);

    return new PVector(x, y);
  }

  void display() {
    text("Time : " + currentDate, 10, 10);

    // background
    noStroke();
    fill(230);
    rect(rect.x, rect.y, rect.w, rect.h);

    //zoomRect.updateVal(getCurrentStartDate(), getCurrentEndDate());
    zoomRect.startText = int(getCurrentStartDate()) + "";
    zoomRect.endText = int(getCurrentEndDate()) + "";
    zoomRect.midText = int(getCurrentEndDate() - getCurrentStartDate()) + "";
    zoomRect.display(getCurrentStartDate(), getCurrentEndDate());

    displayAgeBar();
    displayAgeInterBar();
    displayZoomedAgeBar();

    timePos = timeToPx(getCurrentStartDate(), getCurrentEndDate(), currentDate);

    displayCursor();

    displayData();


    // DEBUG

    fill(0);
    ellipse(timePos.x, timePos.y, 12, 12);
  }

  void displayCursor() {
    // cursor
    stroke(0, 40);
    fill(0, 255, 200, 100);
    if (isHorizontal) line(timePos.x, rect.y, timePos.x, rect.y + rect.h);
    else              line(rect.x, timePos.y, rect.x + rect.w, timePos.y);

    // TODO : 12
    if (isHorizontal) ellipse(timePos.x, rect.y + rect.h + 12/2, 12, 12);
    else              ellipse(rect.x + rect.w + 12/2, timePos.y, 12, 12);

    textSize(10);
    fill(0);


    if (isHorizontal) text(int(currentDate), timePos.x+12/2, rect.y + rect.h+10);
    else              text(int(currentDate), rect.x + rect.w+10, timePos.y+12/2);
  }

  void displayAgeInterBar() {
    fill(0);
    if (isHorizontal) line(rect.x, rect.y + rect.h, rect.x + rect.w, rect.y + rect.h);
    else              line(rect.x + rect.w, rect.y, rect.x + rect.w, rect.y + rect.h);
  }

  void displayAgeBar() {
    float historyInterval = endDate - getCurrentStartDate();

    int nbrInterval = int(historyInterval/dateInterval);  

    for (int i=0; i < nbrInterval; i++) {

      float date = startDate + i * dateInterval;

      stroke(0);
      fill(0);

      PVector datePos = timeToPx(startDate, endDate, date);

      // TODO 3
      if (isHorizontal) line(datePos.x, rect.y + rect.h, datePos.x, rect.y + rect.h + 3);
      else              line(rect.x + rect.w, datePos.y, rect.x + rect.w + 3, datePos.y);

      // TODO 10
      if (isHorizontal) text(int(date), datePos.x, rect.y + rect.h+10);
      else              text(int(date), rect.x + rect.w+10, datePos.y);
    }
  }

  void displayZoomedAgeBar() {
    float historyInterval = getCurrentEndDate() - getCurrentStartDate();

    int nbrInterval = 10;  
    float dateInter = historyInterval/nbrInterval;

    for (int i=0; i < nbrInterval; i++) {

      float date = getCurrentStartDate() + i * dateInter;

      stroke(0);
      fill(0);

      PVector datePos = timeToPx(getCurrentStartDate(), getCurrentEndDate(), date);

      // TODO 3
      if (isHorizontal) line(datePos.x, rect.y + rect.h, datePos.x, rect.y + rect.h - 3);
      else              line(rect.x + rect.w, datePos.y, rect.x + rect.w - 3, datePos.y);

      // TODO 10
      if (isHorizontal) text(int(date), datePos.x, rect.y + rect.h - 10);
      else {
        String dateS = int(date) + "";
        float dateSW = textWidth(dateS);
        text(dateS, rect.x + rect.w - 10 - dateSW, datePos.y);
      }
    }
  }

  void displayData() {
    for (int i = 0; i < historyDatas.size(); i++) {
      HistoryData h = historyDatas.get(i);

      if (null != h) {

        PVector hDataAbscissePos = timeToPx(getCurrentStartDate(), getCurrentEndDate(), h.naissance);

        boolean isInRectX = hDataAbscissePos.x > rect.x && hDataAbscissePos.x < (rect.x + rect.w);
        boolean isInRectY = hDataAbscissePos.y > rect.y && hDataAbscissePos.y < (rect.y + rect.h);

        if (isHorizontal && isInRectX || !isHorizontal && isInRectY) { 

          int nbrX = int(rect.w/(getTextHeight(TEXT_SCALAR) + spaceBetween));
          float ox = rect.x + (i % nbrX)*(rect.w/nbrX);

          int nbrY = int(rect.h/(getTextHeight(TEXT_SCALAR) + spaceBetween));
          float oy = rect.y + (i % nbrY)*(rect.h/nbrY)+textH; //+textH : parce que en horizontal le text y est en bas, on le veut en haut

          PVector hDataOrdonnePos = new PVector(oy, ox);

          PVector lifeWidth = timeToPx(getCurrentStartDate(), getCurrentEndDate(), h.mort).sub(timeToPx(getCurrentStartDate(), getCurrentEndDate(), h.naissance)); 

          if (lifeWidth.x == 0) lifeWidth.x = 1;
          if (lifeWidth.y == 0) lifeWidth.y = 1;

          float textH = getTextHeight(TEXT_SCALAR);


          HistoryDataInfoRect infoRect = h.infoRectPosList.get(id);

          if (isHorizontal) infoRect.rect = new Rect(hDataAbscissePos.x, hDataOrdonnePos.x-textH, lifeWidth.x, textH);
          else              infoRect.rect = new Rect(hDataOrdonnePos.y, hDataAbscissePos.y, textH, lifeWidth.y);

          infoRect.isHorizontal = isHorizontal;
          infoRect.display(currentDate, timePos);

          // DEBUG
          //fill(0);
          //if (isHorizontal) ellipse(hDataAbscissePos.x, hDataOrdonnePos.x, 10, 10);
          //else              ellipse(hDataOrdonnePos.y,hDataAbscissePos.y, 10, 10);
          //rect(h.infoRect.rect.x, h.infoRect.rect.y, h.infoRect.rect.w, h.infoRect.rect.h);
        }
      }
    }
  }

  // The methods below are for mouse interaction
  void clicked(int mx, int my) {

    if (isIn(rect, new PVector(mx, my))) {
      dragging = true;
      dragOffset.x = timePos.x - mx;
      dragOffset.y = timePos.y - my;
    }
  }

  void stopDragging() {
    dragging = false;
  }


  void drag(float time) {
    if (dragging) {
      PVector pos = new PVector(mouseX + dragOffset.x, mouseY + dragOffset.y);
      float currDate;
      if (isHorizontal) currDate = map(pos.x, rect.x, rect.x + rect.w, getCurrentStartDate(), getCurrentEndDate());
      else              currDate = map(pos.y, rect.y, rect.y + rect.h, getCurrentStartDate(), getCurrentEndDate());

      historyMap.currentDate = currDate;
      historyMap.updateTimeOffset(time);
    }
  }
}



class HistoryDataInfoRect {

  Rect rect;
  HistoryData historyData;

  boolean isHorizontal = true;

  color unSelectionedCol = color(255, 255, 255);
  color selectionedCol = color(255, 75, 231);

  public HistoryDataInfoRect(HistoryData h) {
    this.historyData = h;
  }

  void display(float date, PVector timePos) {

    String lifeSpan = int(historyData.getLifeSpan()) + "";
    float lifeSpanW = textWidth(lifeSpan);

    String age = int(historyData.getAge(date)) + "";
    float ageW = textWidth(age);

    if (isHorizontal) textSize(rect.h);
    else              textSize(rect.w); 

    if (historyData.isSelectioned) fill(selectionedCol);
    else                           fill(unSelectionedCol);

    noStroke();
    rect(rect.x, rect.y, rect.w, rect.h);

    fill(0);

    if (isHorizontal)  text(lifeSpan, rect.x + rect.w - lifeSpanW, rect.y + rect.h);
    else              textRotated(lifeSpan, rect.x, rect.y + rect.h - lifeSpanW, PI/2);

    if (isHorizontal) {
      if (timePos.x > rect.x && timePos.x < rect.x + rect.w - lifeSpanW - ageW) {
        text(age, timePos.x, rect.y + rect.h);
      }
    } else {
      if (timePos.y > rect.y && timePos.y < rect.y + rect.h - lifeSpanW - ageW) {
        textRotated(age, rect.x, timePos.y, PI/2);
      }
    }

    if (isHorizontal)  text(historyData.name, rect.x + rect.w, rect.y + rect.h);
    else               textRotated(historyData.name, rect.x, rect.y + rect.h, PI/2);
  }

  void clicked(int mx, int my) {
    if (isIn(rect, new PVector(mx, my))) {
      historyData.isSelectioned = !historyData.isSelectioned;
    }
  }
}
