#define DATAOUT     11
#define DATAIN      12
#define SPICLK      13
#define SLAVESELECT 10

//opcodes
#define READ  3

char ss_pins[] = {9, 8};
byte clr;

void setup()
{
  Serial.begin(9600);
  
  pinMode(DATAOUT, OUTPUT);
  pinMode(DATAIN,  INPUT);
  pinMode(SPICLK,  OUTPUT);
  pinMode(SLAVESELECT, OUTPUT);
  digitalWrite(SLAVESELECT, HIGH);
  
  for(int i = 0; i < sizeof(ss_pins); i++) {
    if(ss_pins[i] != 10) {
      pinMode(ss_pins[i], OUTPUT);
      digitalWrite(ss_pins[i], HIGH);
    }
  }
  
  //01010001
  SPCR = (1 << SPE)|(1 << MSTR)|(1 << SPR0);
  clr=SPSR;
  clr=SPDR;
  delay(10);
  Serial.write("reading \n");
  for(int i = 0; i < 2; i++) {
    read_pin(ss_pins[i]);
  }
}

void read_pin(int ss)
{
  char data[16];
  for(int i = 0; i < 16; i++) {
    data[i] = read_eeprom(i, ss);
  }
  Serial.write("pin: ");Serial.print(ss);Serial.write("contains: ");Serial.write(data);Serial.write("\n");
}

void loop()
{
}

/* READ AND TRANSFER FUNCTIONS */
char spi_transfer(volatile char data) {
  SPDR = data;
  while(!(SPSR & (1 << SPIF)))
  {
  };
  return SPDR;
}

byte read_eeprom(int address, int ss) {
  int data;
  digitalWrite(ss, LOW);
  spi_transfer(READ);
  spi_transfer((char)(address));
  data = spi_transfer(0xFF);
  digitalWrite(ss, HIGH);
  return data;
}
