/*
 * ESP32 - Loja MQTT Automatizada
 * 
 * Este código recebe comandos MQTT e executa automação para retirada de produtos
 * Desenvolvido para feira técnica - Integração Dev. Sistemas + Mecatrônica
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <Servo.h>

// Configurações WiFi
const char* ssid = "SEU_WIFI";           // Substitua pelo seu WiFi
const char* password = "SUA_SENHA";       // Substitua pela sua senha

// Configurações MQTT
const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;
const char* mqtt_topic = "loja/pedido";

// Pinos dos componentes
const int LED_PINS[] = {2, 4, 5, 18};     // LEDs para cada posição
const int SERVO_PIN = 19;                 // Servo motor
const int BUZZER_PIN = 21;                // Buzzer para feedback
const int BUTTON_PIN = 22;                // Botão para reset manual

// Objetos
WiFiClient espClient;
PubSubClient client(espClient);
Servo servoMotor;

// Variáveis de controle
bool sistemaOcupado = false;
String ultimoPedido = "";

void setup() {
  Serial.begin(115200);
  
  // Configurar pinos
  for(int i = 0; i < 4; i++) {
    pinMode(LED_PINS[i], OUTPUT);
    digitalWrite(LED_PINS[i], LOW);
  }
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  
  // Configurar servo
  servoMotor.attach(SERVO_PIN);
  servoMotor.write(90); // Posição inicial
  
  // Conectar WiFi
  conectarWiFi();
  
  // Configurar MQTT
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callbackMQTT);
  
  // Sinal de inicialização
  sequenciaInicializacao();
  
  Serial.println("Sistema pronto para receber pedidos!");
}

void loop() {
  // Manter conexão MQTT
  if (!client.connected()) {
    reconectarMQTT();
  }
  client.loop();
  
  // Verificar botão de reset
  if (digitalRead(BUTTON_PIN) == LOW) {
    delay(50); // Debounce
    if (digitalRead(BUTTON_PIN) == LOW) {
      resetarSistema();
      while(digitalRead(BUTTON_PIN) == LOW); // Aguardar soltar
    }
  }
  
  delay(100);
}

void conectarWiFi() {
  WiFi.begin(ssid, password);
  Serial.print("Conectando ao WiFi");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println();
  Serial.println("WiFi conectado!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

void reconectarMQTT() {
  while (!client.connected()) {
    Serial.print("Conectando ao MQTT...");
    
    String clientId = "ESP32Client-";
    clientId += String(random(0xffff), HEX);
    
    if (client.connect(clientId.c_str())) {
      Serial.println(" conectado!");
      client.subscribe(mqtt_topic);
      Serial.println("Inscrito no tópico: " + String(mqtt_topic));
    } else {
      Serial.print(" falhou, rc=");
      Serial.print(client.state());
      Serial.println(" tentando novamente em 5 segundos");
      delay(5000);
    }
  }
}

void callbackMQTT(char* topic, byte* payload, unsigned int length) {
  // Converter payload para string
  String mensagem = "";
  for (int i = 0; i < length; i++) {
    mensagem += (char)payload[i];
  }
  
  Serial.println("Mensagem recebida: " + mensagem);
  
  // Parse JSON
  DynamicJsonDocument doc(1024);
  deserializeJson(doc, mensagem);
  
  String pedidoId = doc["pedidoId"];
  String produto = doc["produto"];
  int posicao = doc["posicao"];
  String cliente = doc["cliente"];
  
  // Verificar se é um novo pedido
  if (pedidoId != ultimoPedido && !sistemaOcupado) {
    ultimoPedido = pedidoId;
    processarPedido(posicao, produto, cliente, pedidoId);
  }
}

void processarPedido(int posicao, String produto, String cliente, String pedidoId) {
  sistemaOcupado = true;
  
  Serial.println("=== NOVO PEDIDO ===");
  Serial.println("ID: " + pedidoId);
  Serial.println("Produto: " + produto);
  Serial.println("Posição: " + String(posicao));
  Serial.println("Cliente: " + cliente);
  Serial.println("===================");
  
  // Sinalizar início do processo
  tocarBuzzer(2, 200);
  
  // Acender LED da posição
  if (posicao >= 1 && posicao <= 4) {
    digitalWrite(LED_PINS[posicao-1], HIGH);
  }
  
  // Simular movimento do servo para a posição
  moverServoParaPosicao(posicao);
  
  // Simular processo de retirada
  delay(2000);
  
  // Simular entrega
  entregarProduto();
  
  // Finalizar processo
  finalizarPedido(posicao);
  
  sistemaOcupado = false;
}

void moverServoParaPosicao(int posicao) {
  Serial.println("Movendo para posição " + String(posicao));
  
  // Calcular ângulo baseado na posição (0°, 60°, 120°, 180°)
  int angulo = (posicao - 1) * 60;
  
  // Movimento suave
  int anguloAtual = servoMotor.read();
  int passo = (angulo > anguloAtual) ? 2 : -2;
  
  while (abs(anguloAtual - angulo) > 2) {
    anguloAtual += passo;
    servoMotor.write(anguloAtual);
    delay(20);
  }
  
  servoMotor.write(angulo);
  delay(500);
}

void entregarProduto() {
  Serial.println("Entregando produto...");
  
  // Simular garra pegando o produto
  for(int i = 0; i < 3; i++) {
    servoMotor.write(servoMotor.read() + 10);
    delay(200);
    servoMotor.write(servoMotor.read() - 10);
    delay(200);
  }
  
  // Mover para posição de entrega (centro)
  servoMotor.write(90);
  delay(1000);
  
  // Sinalizar entrega
  tocarBuzzer(3, 150);
}

void finalizarPedido(int posicao) {
  Serial.println("Pedido finalizado!");
  
  // Apagar LED
  if (posicao >= 1 && posicao <= 4) {
    digitalWrite(LED_PINS[posicao-1], LOW);
  }
  
  // Retornar servo para posição inicial
  servoMotor.write(90);
  
  // Sinal de conclusão
  sequenciaFinalizacao();
}

void resetarSistema() {
  Serial.println("Resetando sistema...");
  
  sistemaOcupado = false;
  ultimoPedido = "";
  
  // Apagar todos os LEDs
  for(int i = 0; i < 4; i++) {
    digitalWrite(LED_PINS[i], LOW);
  }
  
  // Retornar servo
  servoMotor.write(90);
  
  // Sinal de reset
  tocarBuzzer(1, 500);
  
  Serial.println("Sistema resetado!");
}

void sequenciaInicializacao() {
  Serial.println("Inicializando sistema...");
  
  // Acender LEDs em sequência
  for(int i = 0; i < 4; i++) {
    digitalWrite(LED_PINS[i], HIGH);
    delay(200);
  }
  
  delay(500);
  
  // Apagar LEDs
  for(int i = 0; i < 4; i++) {
    digitalWrite(LED_PINS[i], LOW);
    delay(200);
  }
  
  // Testar servo
  servoMotor.write(0);
  delay(500);
  servoMotor.write(180);
  delay(500);
  servoMotor.write(90);
  
  // Som de inicialização
  tocarBuzzer(3, 100);
}

void sequenciaFinalizacao() {
  // Piscar todos os LEDs
  for(int j = 0; j < 3; j++) {
    for(int i = 0; i < 4; i++) {
      digitalWrite(LED_PINS[i], HIGH);
    }
    delay(200);
    for(int i = 0; i < 4; i++) {
      digitalWrite(LED_PINS[i], LOW);
    }
    delay(200);
  }
}

void tocarBuzzer(int vezes, int duracao) {
  for(int i = 0; i < vezes; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(duracao);
    digitalWrite(BUZZER_PIN, LOW);
    if(i < vezes - 1) delay(duracao);
  }
}

/*
 * INSTRUÇÕES DE MONTAGEM:
 * 
 * 1. Conecte 4 LEDs nos pinos 2, 4, 5, 18 (com resistores de 220Ω)
 * 2. Conecte servo motor no pino 19
 * 3. Conecte buzzer no pino 21
 * 4. Conecte botão no pino 22 (com pull-up interno)
 * 5. Configure seu WiFi nas variáveis ssid e password
 * 6. Carregue o código no ESP32
 * 
 * FUNCIONAMENTO:
 * - LEDs indicam qual produto está sendo processado
 * - Servo simula movimento de retirada
 * - Buzzer dá feedback sonoro
 * - Botão permite reset manual do sistema
 */