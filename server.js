const express = require('express');
const mqtt = require('mqtt');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Configuração MQTT
const mqttClient = mqtt.connect('mqtt://broker.hivemq.com'); // Broker público para demonstração

mqttClient.on('connect', () => {
    console.log('Conectado ao broker MQTT');
});

mqttClient.on('error', (error) => {
    console.log('Erro MQTT:', error);
});

// Produtos disponíveis
const produtos = {
    'caixa-vermelha': { id: 'caixa-vermelha', nome: 'Caixa Vermelha', cor: '#FF0000', preco: 25.00, posicao: 1 },
    'caixa-azul': { id: 'caixa-azul', nome: 'Caixa Azul', cor: '#0000FF', preco: 25.00, posicao: 2 },
    'caixa-verde': { id: 'caixa-verde', nome: 'Caixa Verde', cor: '#00FF00', preco: 25.00, posicao: 3 },
    'caixa-amarela': { id: 'caixa-amarela', nome: 'Caixa Amarela', cor: '#FFFF00', preco: 25.00, posicao: 4 }
};

// Rota para obter produtos
app.get('/api/produtos', (req, res) => {
    res.json(Object.values(produtos));
});

// Rota para processar pedido
app.post('/api/pedido', (req, res) => {
    const { produto, cliente } = req.body;
    
    if (!produto || !cliente || !cliente.nome || !cliente.telefone) {
        return res.status(400).json({ erro: 'Dados incompletos' });
    }
    
    const produtoInfo = produtos[produto];
    if (!produtoInfo) {
        return res.status(404).json({ erro: 'Produto não encontrado' });
    }
    
    const pedidoId = uuidv4().substring(0, 8);
    
    // Enviar comando MQTT para ESP32
    const mqttMessage = {
        pedidoId: pedidoId,
        produto: produtoInfo.nome,
        posicao: produtoInfo.posicao,
        cliente: cliente.nome,
        timestamp: new Date().toISOString()
    };
    
    mqttClient.publish('loja/pedido', JSON.stringify(mqttMessage));
    console.log('Comando MQTT enviado:', mqttMessage);
    
    // Gerar link do WhatsApp
    const mensagemWhatsApp = `Olá! Seu pedido foi confirmado!\n\n` +
        `🛍️ *Pedido:* ${pedidoId}\n` +
        `📦 *Produto:* ${produtoInfo.nome}\n` +
        `💰 *Valor:* R$ ${produtoInfo.preco.toFixed(2)}\n` +
        `👤 *Cliente:* ${cliente.nome}\n\n` +
        `Seu produto está sendo preparado pelo nosso sistema automatizado! 🤖`;
    
    const linkWhatsApp = `https://wa.me/55${cliente.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(mensagemWhatsApp)}`;
    
    res.json({
        sucesso: true,
        pedidoId: pedidoId,
        linkWhatsApp: linkWhatsApp,
        produto: produtoInfo
    });
});

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log('E-commerce MQTT + WhatsApp iniciado!');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Fechando conexões...');
    mqttClient.end();
    process.exit(0);
});