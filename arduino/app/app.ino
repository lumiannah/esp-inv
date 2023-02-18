#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

bool networkInitComplete;

const char* setupSsid = "ESP-INV";
const char* setupPassword = "12345678";
String userEmail;
String userSsid;
String userPassword;

IPAddress local_ip(192,168,1,1);
IPAddress gateway(192,168,1,1);
IPAddress subnet(255,255,255,0);

ESP8266WebServer server(80);

void setup() {
  Serial.begin(9600);

  WiFi.softAP(setupSsid, setupPassword);
  WiFi.softAPConfig(local_ip, gateway, subnet);
  delay(500);

  server.on("/", handle_OnConnect);
  server.on("/setup/", handle_OnSetup);
  server.onNotFound(handle_NotFound);

  server.begin();
  Serial.println("HTTP server started");
}

void loop() {
    server.handleClient();
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
      <label for=\"UserID\">User ID:</label>\
      <input type=\"text\" name=\"User ID\" id=\"UserID\" required>\
      <label for=\"NetworkName\">Network Name:</label>\
      <input type=\"text\" name=\"Network Name\" id=\"NetworkName\" required>\
      <label for=\"NetworkPassword\">Network Password:</label>\
      <input type=\"password\" name=\"Network Password\" id=\"NetworkPassword\" required>\
      <input class=\"btn\" type=\"submit\" value=\"Submit\">\
    </form>\
  </body>\
</html>";

void handle_OnConnect() {
  server.send(200, "text/html", setupPage); 
}

void handle_OnSetup() {
  if (server.args() != 3) {
    server.send(400, "text/plain", "All 3 input fields are required to be filled.");
  } else {
    userEmail = server.arg(0);
    userSsid = server.arg(1);
    userPassword = server.arg(2);
    server.send(200, "text/plain", "Ok");
  }
}

void handle_NotFound(){
  server.send(404, "text/plain", "Not found");
}
