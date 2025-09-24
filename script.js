// URL da sua planilha já inclusa.
const urlPlanilha = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTRm6lEWk_MP0PSDmMNOpHwmu7fiQM4TisoWz78fkEkG_nsG-aeOoU-yKq4IEM9TUFwcPVdE93dKum0/pub?output=csv';

// Elementos da página
const loadingIndicator = document.getElementById('loading-indicator');
const backToTopButton = document.getElementById('back-to-top');
const filtroMarca = document.getElementById('filtro-marca');
const filtroTipo = document.getElementById('filtro-tipo');

document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    document.getElementById('searchInput').addEventListener('keyup', filtrarTabela);
    window.addEventListener('scroll', handleScroll);
});

async function carregarDados() {
    loadingIndicator.style.display = 'flex';
    try {
        const response = await fetch(urlPlanilha);
        if (!response.ok) throw new Error('Erro ao buscar dados');
        const data = await response.text();
        const itens = processarDados(data);
        renderizarPagina(itens);
        popularFiltros(itens); 
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
        const containerLista = document.getElementById('lista-container');
        if (containerLista) {
            containerLista.innerHTML = '<p>Erro ao carregar a lista de preços. Verifique o link da planilha e se a estrutura de 5 colunas está correta.</p>';
        }
    } finally {
        loadingIndicator.style.display = 'none';
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
    }).filter(item => item && item.marca && item.modelo); // Filtro um pouco mais robusto
}

function renderizarPagina(itens) {
    const containerLista = document.getElementById('lista-container');
    containerLista.innerHTML = '';
    const fragmentoLista = document.createDocumentFragment();

    const porMarca = itens.reduce((acc, item) => { (acc[item.marca] = acc[item.marca] || []).push(item); return acc; }, {});
    const marcas = Object.keys(porMarca).sort();

    marcas.forEach(marca => {
        const marcaContainer = document.createElement('div');
        marcaContainer.className = 'marca-container';
        marcaContainer.dataset.marca = marca;
        
        const tituloMarca = document.createElement('h2');
        tituloMarca.className = 'marca-titulo';
        tituloMarca.textContent = marca;
        marcaContainer.appendChild(tituloMarca);
        
        const porTipo = porMarca[marca].reduce((acc, item) => { (acc[item.tipo] = acc[item.tipo] || []).push(item); return acc; }, {});
        const tipos = Object.keys(porTipo).sort((a, b) => {
            if (a.toLowerCase().includes('tela')) return -1;
            if (b.toLowerCase().includes('tela')) return 1;
            return a.localeCompare(b);
        });
        
        tipos.forEach(tipo => {
            const table = document.createElement('table');
            table.dataset.tipo = tipo;
            table.innerHTML = `<thead><tr><th colspan="3" class="tipo-titulo">${tipo}</th></tr><tr><th>Modelo</th><th>Detalhes / Qualidade</th><th>Preço (R$)</th></tr></thead><tbody>${porTipo[tipo].map(item => `<tr><td>${item.modelo}</td><td>${item.detalhes}</td><td>${item.preco}</td></tr>`).join('')}</tbody>`;
            marcaContainer.appendChild(table);
        });
        fragmentoLista.appendChild(marcaContainer);
    });

    containerLista.appendChild(fragmentoLista);
}

function popularFiltros(itens) {
    const marcas = [...new Set(itens.map(item => item.marca))].sort();
    const tipos = [...new Set(itens.map(item => item.tipo))].sort();

    filtroMarca.innerHTML = '<option value="todas">Todas as Marcas</option>';
    marcas.forEach(marca => {
        filtroMarca.innerHTML += `<option value="${marca}">${marca}</option>`;
    });

    filtroTipo.innerHTML = '<option value="todas">Todos os Tipos</option>';
    tipos.forEach(tipo => {
        filtroTipo.innerHTML += `<option value="${tipo}">${tipo}</option>`;
    });

    filtroMarca.addEventListener('change', aplicarFiltros);
    filtroTipo.addEventListener('change', aplicarFiltros);
}

function aplicarFiltros() {
    const marcaSelecionada = filtroMarca.value;
    const tipoSelecionado = filtroTipo.value;

    const containersDeMarca = document.querySelectorAll('.marca-container');

    containersDeMarca.forEach(container => {
        const marcaDo
