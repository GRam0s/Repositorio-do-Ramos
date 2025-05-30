// Renomeado de 'pizzaria' para 'produtos'
let produtos = [];
// Renomeado de 'pizzaParaAlterar' para 'produtoParaAlterar'
let produtoParaAlterar = null;
let usuarios = []; // Mantido para login
let senhas = []; // Mantido para login
let relatorioVendas = [];

function mostrarMensagem(elementoSucessoId, elementoErroId, mensagem, tipo) {
    const elSucesso = document.getElementById(elementoSucessoId);
    const elErro = document.getElementById(elementoErroId);

    // Limpa mensagens anteriores
    if (elSucesso) elSucesso.classList.add('hidden');
    if (elErro) elErro.classList.add('hidden');

    if (tipo === 'sucesso' && elSucesso) {
        elSucesso.textContent = mensagem;
        elSucesso.classList.remove('hidden');
        // Opcional: esconder após alguns segundos
        // setTimeout(() => { elSucesso.classList.add('hidden'); }, 3000);
    } else if (tipo === 'erro' && elErro) {
        elErro.textContent = mensagem;
        elErro.classList.remove('hidden');
         // Opcional: esconder após alguns segundos
        // setTimeout(() => { elErro.classList.add('hidden'); }, 3000);
    }
}


function registrarNovoUsuario() {
    const usuario = document.getElementById('novo-usuario').value.trim();
    const senha = document.getElementById('nova-senha').value;
    const confirmar = document.getElementById('confirmar-senha').value;

    // IDs dos elementos de mensagem para esta seção
    const sucessoId = 'mensagem-sucesso-cadastro';
    const erroId = 'mensagem-erro-cadastro';

    // Limpa mensagens anteriores (usando a função auxiliar)
    mostrarMensagem(sucessoId, erroId, '', ''); // Limpa ambas

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
        // Mantém a mensagem de erro específica do login
        document.getElementById("mensagemerro").classList.remove("hidden");
        document.getElementById("usuario").value = "";
        document.getElementById("senha").value = "";
    }
}

// Nova função para popular o dropdown de pedidos
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
            // Limpar mensagens ao esconder seções (opcional, mas bom para UX)
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
                 setTimeout(() => activeTabButton.click(), 0); // Garante execução após renderização
            }
        }
        if (secaoId === 'pedidos') {
            popularDropdownPedidos();
            atualizarRelatorio(); // Atualiza o relatório ao mostrar a seção
        }
        if (secaoId === 'alterarProduto') {
             // Limpar busca e formulário ao mostrar seção
             document.getElementById('busca-alterar').value = '';
             document.getElementById('form-alterar').classList.add('hidden');
        }
    }
}

function mostrarCategoria(evt, nomeCategoria) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
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

    // IDs das mensagens para esta seção
    const sucessoId = "sucessoCadastroProduto";
    const erroId = "erroCadastroProduto";

    mostrarMensagem(sucessoId, erroId, '', ''); // Limpa mensagens

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
    carregarRelatorio(); // Carrega dados do relatório
}

window.onload = function () {
    carregarProdutos(); // Carrega produtos e relatório

    // Tenta mostrar a seção 'cardapio' por padrão
    const cardapioDiv = document.getElementById('cardapio');
    if (cardapioDiv) {
        mostrarSecao('cardapio'); // Mostra cardápio e clica na aba ativa
    } else {
        // Se 'cardapio' não existir, talvez mostrar outra seção?
        // Ou deixar como está se o HTML não tiver nenhuma seção visível por padrão.
    }
};

function buscarProdutosParaAlterar() {
    const busca = document.getElementById("busca-alterar").value.toLowerCase();
    produtoParaAlterar = produtos.find(produto => produto.nomeProduto.toLowerCase().includes(busca));

    const formAlterar = document.getElementById("form-alterar");
    // Limpa mensagens de alteração ao buscar
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

// *** MODIFICADA para usar mensagens visuais ***
function alterarProduto() {
    if (!produtoParaAlterar) return;

    // IDs das mensagens
    const sucessoId = 'mensagem-alterar-produto-sucesso';
    const erroId = 'mensagem-alterar-produto-erro';
    mostrarMensagem(sucessoId, erroId, '', ''); // Limpa mensagens

    // Validações básicas (opcional, mas recomendado)
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
    // alert("Produto alterado com sucesso!"); // Removido alert
    mostrarMensagem(sucessoId, erroId, "Produto alterado com sucesso!", 'sucesso');
}

// *** MODIFICADA para usar mensagens visuais ***
function fazerPedido() {
    const nomeProdutoSelecionado = document.getElementById("pedido-produto-select").value;
    const comprador = document.getElementById("pedido-comprador").value;

    // IDs das mensagens
    const sucessoId = 'mensagem-pedido-sucesso';
    const erroId = 'mensagem-pedido-erro';
    mostrarMensagem(sucessoId, erroId, '', ''); // Limpa mensagens

    if (!nomeProdutoSelecionado) {
        // alert("Por favor, selecione um produto."); // Removido alert
        mostrarMensagem(sucessoId, erroId, "Por favor, selecione um produto.", 'erro');
        return;
    }
    if (!comprador) {
        // alert("Por favor, informe o nome do comprador."); // Removido alert
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
        // alert("Pedido realizado com sucesso!"); // Removido alert
        mostrarMensagem(sucessoId, erroId, "Pedido realizado com sucesso!", 'sucesso');
        atualizarRelatorio();
        document.getElementById("pedido-produto-select").value = "";
        document.getElementById("pedido-comprador").value = "";
    } else {
        // alert("Erro: Produto selecionado não encontrado no sistema."); // Removido alert
        // Este erro não deveria acontecer se o select estiver correto
        mostrarMensagem(sucessoId, erroId, "Erro: Produto selecionado inválido.", 'erro');
    }
}

function atualizarRelatorio() {
    const tabela = document.getElementById("tabela-pedidos");
    if (!tabela) return; // Adiciona verificação caso o elemento não exista
    tabela.innerHTML = "";

    relatorioVendas.forEach(item => {
        const linha = document.createElement("tr");
        linha.innerHTML = `
            <td>${item.nomeProduto}</td>
            <td>R$ ${item.preco.toFixed(2)}</td>
            <td>${item.comprador}</td>
        `;
        tabela.appendChild(linha);
    });
}

function salvarRelatorio() {
    localStorage.setItem('relatorioVendas', JSON.stringify(relatorioVendas));
}

// *** MODIFICADA para atualizar a tabela após carregar ***
function carregarRelatorio() {
    const dados = localStorage.getItem('relatorioVendas');
    if (dados) {
        relatorioVendas = JSON.parse(dados);

        atualizarRelatorio();
    }
}
