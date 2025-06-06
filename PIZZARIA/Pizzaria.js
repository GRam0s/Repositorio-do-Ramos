let produtos = [];
let produtoParaAlterar = null;
let usuarios = [];
let senhas = [];
let relatorioVendas = [];

function mostrarMensagem(elementoSucessoId, elementoErroId, mensagem, tipo) {
    const elSucesso = document.getElementById(elementoSucessoId);
    const elErro = document.getElementById(elementoErroId);

    if (elSucesso) elSucesso.classList.add('hidden');
    if (elErro) elErro.classList.add('hidden');

    if (tipo === 'sucesso' && elSucesso) {
        elSucesso.textContent = mensagem;
        elSucesso.classList.remove('hidden');
    } else if (tipo === 'erro' && elErro) {
        elErro.textContent = mensagem;
        elErro.classList.remove('hidden');
    }
}

function registrarNovoUsuario() {
    const usuario = document.getElementById('novo-usuario').value.trim();
    const senha = document.getElementById('nova-senha').value;
    const confirmar = document.getElementById('confirmar-senha').value;

    const sucessoId = 'mensagem-sucesso-cadastro';
    const erroId = 'mensagem-erro-cadastro';

    mostrarMensagem(sucessoId, erroId, '', '');

    if (senha !== confirmar) {
        mostrarMensagem(sucessoId, erroId, "Senhas não conferem!", 'erro');
        return;
    }

    let usuariosSalvos = JSON.parse(localStorage.getItem('usuarios')) || {};

    if (usuariosSalvos[usuario]) {
        mostrarMensagem(sucessoId, erroId, "Usuário já existe!", 'erro');
        return;
    }

    usuariosSalvos[usuario] = senha;
    localStorage.setItem('usuarios', JSON.stringify(usuariosSalvos));

    mostrarMensagem(sucessoId, erroId, "Cadastro realizado com sucesso!", 'sucesso');

    document.getElementById('novo-usuario').value = "";
    document.getElementById('nova-senha').value = "";
    document.getElementById('confirmar-senha').value = "";
}

function validarLogin() {
    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;

    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || {};
    const senhaSalva = usuarios[usuario];

    const adminValido = usuario === "admin" && senha === "1234";
    const usuarioValido = senhaSalva && senhaSalva === senha;

    if (adminValido || usuarioValido) {
        window.location.href = "PizzariaMenu.html";
    } else {
        document.getElementById("mensagemerro").classList.remove("hidden");
        document.getElementById("usuario").value = "";
        document.getElementById("senha").value = "";
    }
}

function popularDropdownPedidos() {
    const select = document.getElementById("pedido-produto-select");
    select.innerHTML = '<option value="" disabled selected>-- Selecione um Produto --</option>';

    produtos.forEach(produto => {
        const option = document.createElement("option");
        option.value = produto.nomeProduto;
        option.textContent = `${produto.nomeProduto} (R$ ${parseFloat(produto.preco).toFixed(2)})`;
        select.appendChild(option);
    });
}

function mostrarSecao(secaoId) {
    const secoes = ["cardapio", "registro", "sobre", "pedidos", "cadastrarProduto", "alterarProduto"];
    secoes.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.classList.add("hidden");
            const msgSucesso = elemento.querySelector('.mensagem-sucesso');
            const msgErro = elemento.querySelector('.mensagem-erro');
            if (msgSucesso) msgSucesso.classList.add('hidden');
            if (msgErro) msgErro.classList.add('hidden');
        }
    });

    const alvo = document.getElementById(secaoId);
    if (alvo) {
        alvo.classList.remove("hidden");
        if (secaoId === 'cardapio') {
            const activeTabButton = document.querySelector('.tablinks.active');
            if (activeTabButton) {
                setTimeout(() => activeTabButton.click(), 0);
            }
        }
        if (secaoId === 'pedidos') {
            popularDropdownPedidos();
            atualizarRelatorio();
        }
        if (secaoId === 'alterarProduto') {
            document.getElementById('busca-alterar').value = '';
            document.getElementById('form-alterar').classList.add('hidden');
        }
    }
}

function mostrarCategoria(evt, nomeCategoria) {
    const tabcontent = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    const tablinks = document.getElementsByClassName("tablinks");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(nomeCategoria).style.display = "block";
    evt.currentTarget.className += " active";
}

function cadastrarProduto() {
    const categoria = document.getElementById("categoriaProduto").value;
    const nomeProduto = document.getElementById("nomeProduto").value;
    const ingredientes = document.getElementById("ingredientes").value;
    const preco = document.getElementById("preco").value;

    const sucessoId = "sucessoCadastroProduto";
    const erroId = "erroCadastroProduto";

    mostrarMensagem(sucessoId, erroId, '', '');

    if (nomeProduto && ingredientes && preco && categoria) {
        produtos.push({ categoria, nomeProduto, ingredientes, preco });
        salvarProdutos();
        atualizarCardapio();

        mostrarMensagem(sucessoId, erroId, "Produto cadastrado com sucesso!", 'sucesso');

        document.getElementById("categoriaProduto").value = "comum";
        document.getElementById("nomeProduto").value = "";
        document.getElementById("ingredientes").value = "";
        document.getElementById("preco").value = "";
    } else {
        mostrarMensagem(sucessoId, erroId, "Por favor, preencha todos os campos, incluindo a categoria.", 'erro');
    }
}

function atualizarCardapio() {
    const tabelaComuns = document.getElementById("tabela-pizzas-comuns");
    const tabelaDoces = document.getElementById("tabela-pizzas-doces");
    const tabelaBebidas = document.getElementById("tabela-bebidas");

    tabelaComuns.innerHTML = "";
    tabelaDoces.innerHTML = "";
    tabelaBebidas.innerHTML = "";

    produtos.forEach(produto => {
        const linha = document.createElement("tr");
        linha.innerHTML = `
            <td>${produto.nomeProduto}</td>
            <td>${produto.ingredientes}</td>
            <td>R$ ${parseFloat(produto.preco).toFixed(2)}</td>
        `;

        if (produto.categoria === 'comum') {
            tabelaComuns.appendChild(linha);
        } else if (produto.categoria === 'doce') {
            tabelaDoces.appendChild(linha);
        } else if (produto.categoria === 'bebida') {
            tabelaBebidas.appendChild(linha);
        }
    });
}

function salvarProdutos() {
    localStorage.setItem('produtos', JSON.stringify(produtos));
}

function carregarProdutos() {
    const dados = localStorage.getItem('produtos');
    if (dados) {
        produtos = JSON.parse(dados);
        atualizarCardapio();
    }
    carregarRelatorio();
}

window.onload = function () {
    carregarProdutos();
    const cardapioDiv = document.getElementById('cardapio');
    if (cardapioDiv) {
        mostrarSecao('cardapio');
    }
};

function buscarProdutosParaAlterar() {
    const busca = document.getElementById("busca-alterar").value.toLowerCase();
    produtoParaAlterar = produtos.find(produto => produto.nomeProduto.toLowerCase().includes(busca));

    const formAlterar = document.getElementById("form-alterar");
    mostrarMensagem('mensagem-alterar-produto-sucesso', 'mensagem-alterar-produto-erro', '', '');

    if (produtoParaAlterar) {
        formAlterar.classList.remove("hidden");
        document.getElementById("categoria-alterar").value = produtoParaAlterar.categoria;
        document.getElementById("nome-alterar").value = produtoParaAlterar.nomeProduto;
        document.getElementById("ingredientes-alterar").value = produtoParaAlterar.ingredientes;
        document.getElementById("preco-alterar").value = produtoParaAlterar.preco;
    } else {
        formAlterar.classList.add("hidden");
    }
}

function alterarProduto() {
    if (!produtoParaAlterar) return;

    const sucessoId = 'mensagem-alterar-produto-sucesso';
    const erroId = 'mensagem-alterar-produto-erro';
    mostrarMensagem(sucessoId, erroId, '', '');

    const nome = document.getElementById("nome-alterar").value;
    const ingredientes = document.getElementById("ingredientes-alterar").value;
    const preco = document.getElementById("preco-alterar").value;
    if (!nome || !ingredientes || !preco) {
        mostrarMensagem(sucessoId, erroId, "Todos os campos devem ser preenchidos.", 'erro');
        return;
    }

    produtoParaAlterar.categoria = document.getElementById("categoria-alterar").value;
    produtoParaAlterar.nomeProduto = nome;
    produtoParaAlterar.ingredientes = ingredientes;
    produtoParaAlterar.preco = preco;

    salvarProdutos();
    atualizarCardapio();
    document.getElementById("form-alterar").classList.add("hidden");
    document.getElementById("busca-alterar").value = "";

    mostrarMensagem(sucessoId, erroId, "Produto alterado com sucesso!", 'sucesso');
}

function fazerPedido() {
    const nomeProdutoSelecionado = document.getElementById("pedido-produto-select").value;
    const comprador = document.getElementById("pedido-comprador").value;

    const sucessoId = 'mensagem-pedido-sucesso';
    const erroId = 'mensagem-pedido-erro';
    mostrarMensagem(sucessoId, erroId, '', '');

    if (!nomeProdutoSelecionado) {
        mostrarMensagem(sucessoId, erroId, "Por favor, selecione um produto.", 'erro');
        return;
    }
    if (!comprador) {
        mostrarMensagem(sucessoId, erroId, "Por favor, informe o nome do comprador.", 'erro');
        return;
    }

    const produto = produtos.find(p => p.nomeProduto === nomeProdutoSelecionado);

    if (produto) {
        relatorioVendas.push({
            nomeProduto: produto.nomeProduto,
            preco: parseFloat(produto.preco),
            comprador: comprador
        });
        salvarRelatorio();
        mostrarMensagem(sucessoId, erroId, "Pedido realizado com sucesso!", 'sucesso');
        atualizarRelatorio();
        document.getElementById("pedido-produto-select").value = "";
        document.getElementById("pedido-comprador").value = "";
    } else {
        mostrarMensagem(sucessoId, erroId, "Erro: Produto selecionado inválido.", 'erro');
    }
}

function atualizarRelatorio() {
    const tabela = document.getElementById("tabela-pedidos");
    const totalVendasEl = document.getElementById("valor-total-vendas");

    if (!tabela) return;
    tabela.innerHTML = "";

    let total = 0;

    relatorioVendas.forEach(item => {
        const linha = document.createElement("tr");
        linha.innerHTML = `
            <td>${item.nomeProduto}</td>
            <td>R$ ${item.preco.toFixed(2)}</td>
            <td>${item.comprador}</td>
        `;
        tabela.appendChild(linha);
        total += item.preco;
    });

    if (totalVendasEl) {
        totalVendasEl.textContent = `R$ ${total.toFixed(2)}`;
    }
}

function salvarRelatorio() {
    localStorage.setItem('relatorioVendas', JSON.stringify(relatorioVendas));
}

function carregarRelatorio() {
    const dados = localStorage.getItem('relatorioVendas');
    if (dados) {
        relatorioVendas = JSON.parse(dados);
        atualizarRelatorio();
    }
}
