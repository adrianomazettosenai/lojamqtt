# 🤖 Loja MQTT - E-commerce com Automação ESP32

E-commerce simples que integra com ESP32 via MQTT e envia confirmações por WhatsApp. Projeto desenvolvido para feira técnica integrando os cursos de Desenvolvimento de Sistemas e Mecatrônica.

## 🎯 Funcionalidades

- ✅ Catálogo de 4 produtos (caixas coloridas)
- 🛒 Carrinho de compras simples (1 item por vez)
- 📱 Integração com WhatsApp para confirmação
- 📡 Comunicação MQTT com ESP32
- 🤖 Automação para retirada de produtos

## 🚀 Como Executar

### 1. Instalar Dependências
```bash
npm install
```

### 2. Iniciar o Servidor
```bash
npm start
```

### 3. Acessar a Aplicação
Abra o navegador em: `http://localhost:3000`

## 📡 Configuração MQTT

O sistema usa o broker público `broker.hivemq.com` para demonstração. Para produção, configure seu próprio broker.

### Tópico MQTT
- **Tópico:** `loja/pedido`
- **Formato:** JSON

### Exemplo de Mensagem MQTT
```json
{
  "pedidoId": "abc12345",
  "produto": "Caixa Vermelha",
  "posicao": 1,
  "cliente": "João Silva",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🔧 Código ESP32

Veja o arquivo `esp32_exemplo.ino` para um exemplo de código que recebe os comandos MQTT.

## 🎨 Produtos Disponíveis

1. **Caixa Vermelha** - Posição 1 - R$ 25,00
2. **Caixa Azul** - Posição 2 - R$ 25,00
3. **Caixa Verde** - Posição 3 - R$ 25,00
4. **Caixa Amarela** - Posição 4 - R$ 25,00

## 📱 Fluxo de Compra

1. Cliente escolhe um produto
2. Adiciona ao carrinho
3. Preenche nome e WhatsApp
4. Confirma o pedido
5. Sistema envia comando MQTT para ESP32
6. Cliente recebe confirmação no WhatsApp
7. ESP32 executa a automação

## 🛠️ Tecnologias Utilizadas

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend:** Node.js, Express
- **Comunicação:** MQTT
- **Integração:** WhatsApp Web API
- **Hardware:** ESP32

## 📋 Estrutura do Projeto

```
lojamqtt/
├── public/
│   ├── index.html      # Interface principal
│   ├── style.css       # Estilos
│   └── script.js       # Lógica frontend
├── server.js           # Servidor Node.js
├── package.json        # Dependências
├── esp32_exemplo.ino   # Código ESP32
└── README.md           # Documentação
```

## 🎓 Feira Técnica

Este projeto demonstra a integração entre:
- **Desenvolvimento de Sistemas:** Interface web, backend, APIs
- **Mecatrônica:** Automação com ESP32, sensores, atuadores

---

**Desenvolvido para Feira Técnica 2024**  
*Integração: Desenvolvimento de Sistemas + Mecatrônica*