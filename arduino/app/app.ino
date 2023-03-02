#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <Preferences.h>
#include <ESP8266HTTPClient.h>
#include <LinearRegression.h>
#include <Wire.h>
#include <VL53L0X.h>
using namespace std;

// persistent flash memory
Preferences preferences;
bool isNetworkSetupComplete;
bool isDeviceSetupComplete;
String userEmail;
String userSsid;
String userPassword;
String deviceId;

// initial network conf
const char* setupSsid = "ESP-INV";
const char* setupPassword = "12345678";
IPAddress local_ip(192,168,1,1);
IPAddress gateway(192,168,1,1);
IPAddress subnet(255,255,255,0);
ESP8266WebServer server(80);

// distance sensor conf
bool isSensorSetupComplete = false;
VL53L0X sensor;
const int dataPointsToMeasure = 31;
const int dataLoggingInterval = 100;
const int dataFilterRadius = 5;
int values[dataPointsToMeasure];
int loopCount = 0;
int previousDistanceValue = 0;
int distanceTolerance = 5;

// distance calibrations with regression
LinearRegression lr1 = LinearRegression();
LinearRegression lr2 = LinearRegression();
LinearRegression lr3 = LinearRegression();
LinearRegression lr4 = LinearRegression();
LinearRegression lr5 = LinearRegression();
LinearRegression lr6 = LinearRegression();
LinearRegression lr7 = LinearRegression();
double LRvalues[2];

void setup() {
  Serial.begin(9600);
  delay(5000);

  // Open preferences memory and read init state 
  preferences.begin("creds", false);
  isNetworkSetupComplete = preferences.getBool("networkInit", false);
  isDeviceSetupComplete = preferences.getBool("deviceInit", false);
  
  // If setup is already completed then connect to the user's network
  // Else start first-time-setup
  if (isNetworkSetupComplete) {
    userEmail = preferences.getString("email");
    userSsid = preferences.getString("ssid");
    userPassword = preferences.getString("pw");

    connectToUserNetwork();

    if (isDeviceSetupComplete) {
      deviceId = preferences.getString("id");
      initSensor();
      isSensorSetupComplete = true;
    } else {
      initDevice();
    }
  } else {
    startSetupServer();
  }
}

void startSetupServer() {
  // Start setup wifi
  WiFi.softAP(setupSsid, setupPassword);
  WiFi.softAPConfig(local_ip, gateway, subnet);
  delay(500);

  // Attach routes and start the server
  server.on("/", handle_OnConnect);
  server.on("/setup/", handle_OnSetup);
  server.onNotFound(handle_NotFound);
  server.begin();
}

void connectToUserNetwork() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(userSsid, userPassword);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
  }
  
}

void initDevice() {
  WiFiClient client;
  HTTPClient http;
  String mac = WiFi.macAddress();

  // setup a new device, send mac and email to api and receive deviceId
  http.begin(client, "http://192.168.101.100:3333/api/v1/device/add");
  http.addHeader("Content-Type", "application/json");
  int httpCode = http.POST("{\"mac\":\""+ mac +"\", \"email\":\""+ userEmail + "\"}");

  // if success write deviceId into memory
  if(httpCode == 201) {
    deviceId = http.getString();
    http.end();
    preferences.putBool("deviceInit", true);
    preferences.putString("id", deviceId);
    preferences.end();
    ESP.restart();
  } 
}

void loop() {
  if (isNetworkSetupComplete && isDeviceSetupComplete && isSensorSetupComplete) {
    measureLoop();
  } else {
    server.handleClient();
  }
}

const String setupPage = "<html>\
  <head>\
    <head><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, user-scalable=no\">\
    <title>Setup</title>\
    <style>\
      body { background-color: #64635b; font-family: Arial, Helvetica, Sans-Serif; color: #fff; text-align: center; font-size: 150%; margin: 0; padding: 1em; }\
      form { display: grid; }\
      input { font-size: 100%; padding: 0.75em; margin-block: 0.5em 1em; outline: 0; border: 0; border-radius: .25em; width: 100%; }\
      input:focus { box-shadow: 0 0 0 .25em #000; }\
      .btn { margin-top: 1em; background-color: #e3cd53; color: #333; font-weight: bold; }\
    </style>\
  </head>\
  <body>\
    <h1>Setup</h1>\
    <form method=\"post\" enctype=\"application/x-www-form-urlencoded\" action=\"/setup/\">\
      <label for=\"Email\">Email:</label>\
      <input type=\"email\" name=\"Email\" id=\"Email\" required>\
      <label for=\"NetworkName\">Network Name:</label>\
      <input type=\"text\" name=\"Network Name\" id=\"NetworkName\" required>\
      <label for=\"NetworkPassword\">Network Password:</label>\
      <input type=\"password\" name=\"Network Password\" id=\"NetworkPassword\" required>\
      <input class=\"btn\" type=\"submit\" value=\"Submit\">\
    </form>\
  </body>\
</html>";

const String setupCompletePage = "<html>\
  <head>\
    <head><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, user-scalable=no\">\
    <title>Setup Complete</title>\
    <style>\
      body { background-color: #64635b; font-family: Arial, Helvetica, Sans-Serif; color: #fff; text-align: center; font-size: 150%; margin: 0; padding: 1em; }\
    </style>\
  </head>\
  <body>\
    <h1>Setup Complete!</h1>\
    <h3>You now can disconnect from the device network.</h3>\
    <h3>This device will be soon available from your user panel.</h3>\
  </body>\
</html>";

void handle_OnConnect() {
  server.send(200, "text/html", setupPage); 
}

void handle_OnSetup() {
  // If somehow form data doesn't have all 3 required fields
  if (server.args() != 3) {
    server.send(400, "text/plain", "All 3 input fields are required to be filled.");
  } else {
    // Get params from the posted form data
    userEmail = server.arg(0);
    userSsid = server.arg(1);
    userPassword = server.arg(2);

    // Save data permanently into device's flash
    preferences.putBool("networkInit", true);
    preferences.putString("email", userEmail);
    preferences.putString("ssid", userSsid);
    preferences.putString("pw", userPassword);
    preferences.end();

    // Send Setup Complete Page to the user and restart the device
    server.send(200, "text/html", setupCompletePage);
    delay(5000);
    ESP.restart();
  }
}

void handle_NotFound(){
  server.send(404, "text/plain", "Not found");
}

void initSensor() {
  Wire.begin();
  sensor.init();
  sensor.setTimeout(500);
  sensor.startContinuous(dataLoggingInterval);

  lr1.learn(56,50);
  lr1.learn(67,60);
  lr1.learn(79,70);
  lr1.learn(84,80);
  lr1.learn(97,90);
  lr1.learn(108,100);

  lr2.learn(108,100);
  lr2.learn(129,120);
  lr2.learn(150,140);
  lr2.learn(171,160);
  lr2.learn(193,180);
  lr2.learn(211,200);
 
  lr3.learn(211,200);
  lr3.learn(231,220);
  lr3.learn(254,240);
  lr3.learn(273,260);
  lr3.learn(294,280);
  lr3.learn(310,300);

  lr4.learn(310,300);
  lr4.learn(335,320);
  lr4.learn(351,340);
  lr4.learn(371,360);
  lr4.learn(389,380);
  lr4.learn(407,400);

  lr5.learn(407,400);
  lr5.learn(454,450);
  lr5.learn(499,500);

  lr6.learn(499,500);
  lr6.learn(543,550);
  lr6.learn(587,600);

  lr7.learn(587,600);
  lr7.learn(633,650);
  lr7.learn(676,700);
}

void measureLoop() {
  // if enough data is saved proceed to find median avarage value
  if(loopCount == dataPointsToMeasure-1) {
    bubbleSort(values, dataPointsToMeasure);
    loopCount = 0;
    int sum = 0;
    for (int i = (dataPointsToMeasure-1)/2 - dataFilterRadius; i <= (dataPointsToMeasure-1)/2 + dataFilterRadius; i++ ) {
      sum += values[i];
    }
    const int medianAverage = sum / (dataFilterRadius*2+1);
    
    if (medianAverage < 109) {
      lr1.parameters(LRvalues);
    }
    if (medianAverage >= 109) {
      lr2.parameters(LRvalues);
    }
    if (medianAverage >= 211) {
      lr3.parameters(LRvalues);
    }
    if (medianAverage >= 310) {
      lr4.parameters(LRvalues);
    }
    if (medianAverage >= 407) {
      lr5.parameters(LRvalues);
    }
    if (medianAverage >= 499) {
      lr6.parameters(LRvalues);
    }
    if (medianAverage >= 587) {
      lr7.parameters(LRvalues);
    }
    
    const int calibratedValue = (medianAverage * LRvalues[0] + LRvalues[1]);
    processDistanceData(calibratedValue);
  }

  int distance = sensor.readRangeContinuousMillimeters();
  values[loopCount] = distance;
  loopCount++;
  
  if (sensor.timeoutOccurred()) { Serial.print(" TIMEOUT"); }

  delay(dataLoggingInterval);
}

void processDistanceData(int currentValue) {
  const int topLimit = previousDistanceValue + distanceTolerance;
  const int bottomLimit = previousDistanceValue - distanceTolerance;
  
  if (currentValue > topLimit || currentValue < bottomLimit) {
    previousDistanceValue = currentValue;
    Serial.println("value has changed");
    Serial.println(currentValue);
  }
}

void bubbleSort(int arr[], int n) {
  int i, j;
  for (i = 0; i < n - 1; i++)
  
  for (j = 0; j < n - i - 1; j++)
    if (arr[j] > arr[j + 1])
      swap(arr[j], arr[j + 1]);
}
