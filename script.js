// !!! IMPORTANTE !!!
// Cole aqui o link da sua planilha publicada como .csv
const urlPlanilha = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTRm6lEWk_MP0PSDmMNOpHwmu7fiQM4TisoWz78fkEkG_nsG-aeOoU-yKq4IEM9TUFwcPVdE93dKum0/pub?output=csv';


// Elementos da página
const loadingIndicator = document.getElementById('loading-indicator');
const backToTopButton = document.getElementById('back-to-top');

document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    document.getElementById('searchInput').addEventListener('keyup', filtrarTabela);
    window.addEventListener('scroll', handleScroll);
});

async function carregarDados() {
    loadingIndicator.style.display = 'flex'; // Mostra o carregamento
    try {
        const response = await fetch(urlPlanilha);
        if (!response.ok) throw new Error('Erro ao buscar dados');
        const data = await response.text();
        const itens = processarDados(data);
        renderizarPagina(itens);
    } catch (error) {
        document.getElementById('lista-container').innerHTML = '<p>Erro ao carregar a lista de preços. Verifique o link da planilha e se a estrutura de 5 colunas está correta.</p>';
        console.error(error);
    } finally {
        loadingIndicator.style.display = 'none'; // Esconde o carregamento
    }
}

function processarDados(csvData) {
    const linhas = csvData.trim().split('\n').slice(1);
    return linhas.map(linha => {
        const colunas = linha.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (colunas.length < 5) return null;
        return {
            marca: colunas[0]?.trim() || 'Sem Marca',
            tipo: colunas[1]?.trim() || 'Outros',
            modelo: colunas[2]?.trim() || '',
            detalhes: colunas[3]?.trim() || '',
            preco: colunas[4]?.trim() || '0'
        };
    }).filter(item => item && item.modelo);
}

function renderizarPagina(itens) {
    // ... (toda a lógica de renderizar a página continua exatamente a mesma de antes)
    const containerLista = document.getElementById('lista-container');
    const containerBotoes = document.getElementById('botoes-marcas');
    containerLista.innerHTML = '';
    containerBotoes.innerHTML = '';
    const porMarca = itens.reduce((acc, item) => { (acc[item.marca] = acc[item.marca] || []).push(item); return acc; }, {});
    const marcas = Object.keys(porMarca).sort();
    marcas.forEach(marca => {
        const idMarca = `marca-${marca.replace(/\s+/g, '-').toLowerCase()}`;
        const botao = document.createElement('a');
        botao.href = `#${idMarca}`;
        botao.className = 'botao-marca';
        botao.textContent = marca;
        containerBotoes.appendChild(botao);
        const marcaContainer = document.createElement('div');
        marcaContainer.className = 'marca-container';
        marcaContainer.id = `container-${idMarca}`;
        const tituloMarca = document.createElement('h2');
        tituloMarca.className = 'marca-titulo';
        tituloMarca.id = idMarca;
        tituloMarca.textContent = marca;
        marcaContainer.appendChild(tituloMarca);
        const porTipo = porMarca[marca].reduce((acc, item) => { (acc[item.tipo] = acc[item.tipo] || []).push(item); return acc; }, {});
        const tipos = Object.keys(porTipo).sort((a, b) => {
            if (a.toLowerCase() === 'telas' || a.toLowerCase() === 'tela') return -1;
            if (b.toLowerCase() === 'telas' || b.toLowerCase() === 'tela') return 1;
            return a.localeCompare(b);
        });
        tipos.forEach(tipo => {
            const table = document.createElement('table');
            table.innerHTML = `<thead><tr><th colspan="3" class="tipo-titulo">${tipo}</th></tr><tr><th>Modelo</th><th>Detalhes / Qualidade</th><th>Preço (R$)</th></tr></thead><tbody>${porTipo[tipo].map(item => `<tr><td>${item.modelo}</td><td>${item.detalhes}</td><td>${item.preco}</td></tr>`).join('')}</tbody>`;
            marcaContainer.appendChild(table);
        });
        containerLista.appendChild(marcaContainer);
    });
}

function filtrarTabela() {
    // ... (a lógica de filtrar a tabela continua exatamente a mesma de antes)
    const input = document.getElementById('searchInput');
    const filtro = input.value.toUpperCase();
    const containersDeMarca = document.querySelectorAll('.marca-container');
    containersDeMarca.forEach(container => {
        let algumResultadoNaMarca = false;
        const tabelas = container.querySelectorAll('table');
        tabelas.forEach(table => {
            const trs = table.getElementsByTagName('tr');
            let algumaLinhaVisivelNaTabela = false;
            for (let i = 2; i < trs.length; i++) {
                const textoLinha = trs[i].textContent || trs[i].innerText;
                if (textoLinha.toUpperCase().indexOf(filtro) > -1) {
                    trs[i].style.display = "";
                    algumaLinhaVisivelNaTabela = true;
                    algumResultadoNaMarca = true;
                } else {
                    trs[i].style.display = "none";
                }
            }
            table.style.display = algumaLinhaVisivelNaTabela ? "" : "none";
        });
        container.style.display = algumResultadoNaMarca ? "" : "none";
    });
}

// NOVA FUNÇÃO para o botão "Voltar ao Topo"
function handleScroll() {
    if (window.scrollY > 300) {
        backToTopButton.classList.add('visible');
    } else {
        backToTopButton.classList.remove('visible');
    }
}
