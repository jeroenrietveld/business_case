#include <TrueRandom.h>

#define DATAOUT 11	 //MOSI
#define DATAIN 12	 //MISO
#define SPICLOCK 13	 //sck
#define SLAVESELECT 10	 //ss

//opcodes
#define WREN 6
#define WRITE 2

//card id's
#define TEST '1'

char chars[] = {'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'};

byte clr;
char data[16];
int ss = 9;

void setup() {
  Serial.begin(9600);
  
  pinMode(DATAOUT,     OUTPUT);
  pinMode(DATAIN,      INPUT);
  pinMode(SPICLOCK,    OUTPUT);
  pinMode(SLAVESELECT, OUTPUT);
  digitalWrite(SLAVESELECT, HIGH);
  if(ss != 10) {
    pinMode(ss, OUTPUT);
    digitalWrite(ss, HIGH);
  }
  
  SPCR = (1 << SPE) | (1 << MSTR) | (1 << SPR0);
  clr = SPSR;
  clr = SPDR;
  delay(10);
  
  generate_data(TEST);
  
  Serial.write("generated data: ");Serial.print(data);Serial.write("\n");
  Serial.write("writing \n");
  
  digitalWrite(ss, LOW);
  spi_transfer(WREN);
  digitalWrite(ss, HIGH);
    
  digitalWrite(ss, LOW);
  spi_transfer(WRITE);
  spi_transfer(0);
  for(int i = 0; i < 16; i++) {
    spi_transfer(data[i]);
  }
  digitalWrite(ss, HIGH);
  
  Serial.write("done writing \n\n");
}

void loop() {
}

char spi_transfer(volatile char data) {
  SPDR = data;
  while(!(SPSR & (1 << SPIF)))
  {
  };
  return SPDR;
}

void generate_data(char id)
{
  data[0] = id;
  for(int i = 1; i < 16; i++) {
    data[i] = chars[TrueRandom.random(0, sizeof(chars))];
  }
}
