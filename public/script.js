class LojaEcommerce {
    constructor() {
        this.produtos = [];
        this.carrinho = null;
        this.init();
    }

    async init() {
        await this.carregarProdutos();
        this.setupEventListeners();
        this.mostrarSecao('produtos-section');
    }

    async carregarProdutos() {
        try {
            const response = await fetch('/api/produtos');
            this.produtos = await response.json();
            this.renderizarProdutos();
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            alert('Erro ao carregar produtos. Tente novamente.');
        }
    }

    renderizarProdutos() {
        const grid = document.getElementById('produtos-grid');
        grid.innerHTML = '';

        this.produtos.forEach(produto => {
            const produtoCard = document.createElement('div');
            produtoCard.className = 'produto-card';
            produtoCard.innerHTML = `
                <div class="produto-box" style="background-color: ${produto.cor}">
                    📦
                </div>
                <h3>${produto.nome}</h3>
                <div class="preco">R$ ${produto.preco.toFixed(2)}</div>
                <button class="btn btn-primary" onclick="loja.adicionarAoCarrinho('${produto.id}')">
                    Adicionar ao Carrinho
                </button>
            `;
            grid.appendChild(produtoCard);
        });
    }

    adicionarAoCarrinho(produtoId) {
        const produto = this.produtos.find(p => p.id === produtoId);
        if (!produto) return;

        this.carrinho = produto;
        this.renderizarCarrinho();
        this.mostrarSecao('carrinho-section');
    }

    renderizarCarrinho() {
        const carrinhoItem = document.getElementById('carrinho-item');
        if (!this.carrinho) {
            carrinhoItem.innerHTML = '<p>Carrinho vazio</p>';
            return;
        }

        carrinhoItem.innerHTML = `
            <div class="carrinho-box" style="background-color: ${this.carrinho.cor}">📦</div>
            <div class="carrinho-info">
                <h4>${this.carrinho.nome}</h4>
                <div class="carrinho-preco">R$ ${this.carrinho.preco.toFixed(2)}</div>
            </div>
            <button class="btn btn-secondary" onclick="loja.removerDoCarrinho()">Remover</button>
        `;
    }

    removerDoCarrinho() {
        this.carrinho = null;
        this.mostrarSecao('produtos-section');
    }

    mostrarCheckout() {
        this.mostrarSecao('checkout-section');
    }

    voltarParaCarrinho() {
        this.mostrarSecao('carrinho-section');
    }

    async finalizarPedido(dadosCliente) {
        if (!this.carrinho) {
            alert('Carrinho vazio!');
            return;
        }

        try {
            const response = await fetch('/api/pedido', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    produto: this.carrinho.id,
                    cliente: dadosCliente
                })
            });

            const resultado = await response.json();

            if (resultado.sucesso) {
                this.mostrarSucesso(resultado);
            } else {
                alert('Erro ao processar pedido: ' + resultado.erro);
            }
        } catch (error) {
            console.error('Erro ao finalizar pedido:', error);
            alert('Erro ao processar pedido. Tente novamente.');
        }
    }

    mostrarSucesso(resultado) {
        const pedidoInfo = document.getElementById('pedido-info');
        pedidoInfo.innerHTML = `
            <h4>📋 Pedido: ${resultado.pedidoId}</h4>
            <p><strong>Produto:</strong> ${resultado.produto.nome}</p>
            <p><strong>Valor:</strong> R$ ${resultado.produto.preco.toFixed(2)}</p>
            <p><strong>Status:</strong> Em preparação 🤖</p>
        `;

        const whatsappBtn = document.getElementById('whatsapp-btn');
        whatsappBtn.onclick = () => {
            window.open(resultado.linkWhatsApp, '_blank');
        };

        this.mostrarSecao('sucesso-section');
    }

    novodPedido() {
        this.carrinho = null;
        document.getElementById('checkout-form').reset();
        this.mostrarSecao('produtos-section');
    }

    mostrarSecao(secaoId) {
        // Esconder todas as seções
        const secoes = ['produtos-section', 'carrinho-section', 'checkout-section', 'sucesso-section'];
        secoes.forEach(id => {
            document.getElementById(id).classList.add('hidden');
        });

        // Mostrar seção específica
        document.getElementById(secaoId).classList.remove('hidden');
    }

    setupEventListeners() {
        // Botão finalizar compra
        document.getElementById('finalizar-btn').addEventListener('click', () => {
            this.mostrarCheckout();
        });

        // Botão voltar
        document.getElementById('voltar-btn').addEventListener('click', () => {
            this.voltarParaCarrinho();
        });

        // Formulário de checkout
        document.getElementById('checkout-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nome = document.getElementById('nome').value.trim();
            const telefone = document.getElementById('telefone').value.trim();

            if (!nome || !telefone) {
                alert('Por favor, preencha todos os campos.');
                return;
            }

            // Validar telefone (formato básico)
            const telefoneRegex = /^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/;
            if (!telefoneRegex.test(telefone)) {
                alert('Por favor, insira um telefone válido com DDD.');
                return;
            }

            this.finalizarPedido({ nome, telefone });
        });

        // Botão novo pedido
        document.getElementById('novo-pedido-btn').addEventListener('click', () => {
            this.novodPedido();
        });

        // Máscara para telefone
        document.getElementById('telefone').addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 11) {
                value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            } else if (value.length >= 7) {
                value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
            } else if (value.length >= 3) {
                value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
            }
            e.target.value = value;
        });
    }
}

// Inicializar a aplicação
const loja = new LojaEcommerce();

// Função global para compatibilidade com onclick
window.loja = loja;