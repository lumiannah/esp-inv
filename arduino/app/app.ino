#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <Preferences.h>
#include <ESP8266HTTPClient.h>

Preferences preferences;
bool isNetworkSetupComplete;
bool isDeviceSetupComplete;

const char* setupSsid = "ESP-INV";
const char* setupPassword = "12345678";
String userEmail;
String userSsid;
String userPassword;
String deviceId;

IPAddress local_ip(192,168,1,1);
IPAddress gateway(192,168,1,1);
IPAddress subnet(255,255,255,0);

ESP8266WebServer server(80);

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
  delay(1000);
  if (isNetworkSetupComplete && isDeviceSetupComplete) {
    // @todo
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
