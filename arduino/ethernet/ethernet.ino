#include <SPI.h>
#include <Ethernet.h>

byte mac[] = {  
  0x90, 0xA2, 0xDA, 0x0D, 0x54, 0x50 };

byte ip[] = { 
 145,24,190,69 };

byte server[] = {
  145,24,235,13 };

EthernetClient client;

void setup() {
  Ethernet.begin(mac, ip);
  Serial.begin(9600);
  delay(1000);
  Serial.println("connecting...");

  if (client.connect(server, 1337)) {
    Serial.println("connected");
  } 
  else {
    Serial.println("connection failed");
  }
}

void loop()
{
  if (client.available()) {
    char c = client.read();
    Serial.print(c); 
  }
}
