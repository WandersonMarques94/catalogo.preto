// URL da sua planilha já inclusa.
const urlPlanilha = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTRm6lEWk_MP0PSDmMNOpHwmu7fiQM4TisoWz78fkEkG_nsG-aeOoU-yKq4IEM9TUFwcPVdE93dKum0/pub?output=csv';

// Elementos da página
const loadingIndicator = document.getElementById('loading-indicator');
const backToTopButton = document.getElementById('back-to-top');
const searchInput = document.getElementById('searchInput');
const brandFiltersContainer = document.getElementById('brand-filters');
const typeFiltersContainer = document.getElementById('type-filters');

// Variáveis para guardar o estado dos filtros
let filtroAtivoMarca = 'todas';
let filtroAtivoTipo = 'todas';

document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
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
        setupEventListeners();
    } catch (error) { 
        console.error("Erro ao carregar dados:", error);
        loadingIndicator.innerHTML = '<p>Ocorreu um erro ao carregar os dados. Verifique o console para mais detalhes.</p>';
    } 
}

function processarDados(csvData) {
    const linhas = csvData.trim().split(/\r?\n/).slice(1);
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
    }).filter(item => item && item.marca && item.modelo);
}


// ==================================================================
// FUNÇÃO CORRIGIDA ESTÁ AQUI
// ==================================================================
function renderizarPagina(itens) {
    const containerLista = document.getElementById('lista-container');
    containerLista.innerHTML = '';
    loadingIndicator.style.display = 'none'; // Esconde o loading aqui
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
            
            // ESTA LINHA ESTAVA INCOMPLETA. AGORA ESTÁ CORRETA.
            table.innerHTML = `<thead><tr><th colspan="3" class="tipo-titulo">${tipo}</th></tr><tr><th>Modelo</th><th>Detalhes / Qualidade</th><th>Preço (R$)</th></tr></thead><tbody>${porTipo[tipo].map(item => `<tr><td>${item.modelo}</td><td>${item.detalhes}</td><td>${item.preco}</td></tr>`).join('')}</tbody>`;

            marcaContainer.appendChild(table);
        });
        fragmentoLista.appendChild(marcaContainer);
    });
    containerLista.appendChild(fragmentoLista);
}


function popularFiltros(itens) {
    const marcasUnicas = [...new Set(itens.map(item => item.marca))];
    // Garante que 'TODAS' não seja adicionado se não houver marcas
    const marcas = marcasUnicas.length > 0 ? ['todas', ...marcasUnicas.sort()] : [];

    const tiposUnicos = [...new Set(itens.map(item => item.tipo))];
    const tipos = tiposUnicos.length > 0 ? ['todas', ...tiposUnicos.sort()] : [];


    brandFiltersContainer.innerHTML = marcas.map(marca => 
        `<button class="filter-pill ${marca === 'todas' ? 'active' : ''}" data-filter="${marca}">${marca === 'todas' ? 'Todas as Marcas' : marca}</button>`
    ).join('');

    typeFiltersContainer.innerHTML = tipos.map(tipo =>
        `<button class="filter-pill ${tipo === 'todas' ? 'active' : ''}" data-filter="${tipo}">${tipo === 'todas' ? 'Todos os Tipos' : tipo}</button>`
    ).join('');
}

function setupEventListeners() {
    brandFiltersContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-pill')) {
            filtroAtivoMarca = e.target.dataset.filter;
            brandFiltersContainer.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            aplicarTodosOsFiltros();
        }
    });

    typeFiltersContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-pill')) {
            filtroAtivoTipo = e.target.dataset.filter;
            typeFiltersContainer.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            aplicarTodosOsFiltros();
        }
    });

    searchInput.addEventListener('keyup', aplicarTodosOsFiltros);
}

function aplicarTodosOsFiltros() {
    const buscaTexto = searchInput.value.toUpperCase();
    const containersDeMarca = document.querySelectorAll('.marca-container');

    containersDeMarca.forEach(container => {
        const marcaDoContainer = container.dataset.marca;
        let marcaTemResultados = false;

        if (filtroAtivoMarca === 'todas' || marcaDoContainer === filtroAtivoMarca) {
            const tabelas = container.querySelectorAll('table');
            tabelas.forEach(tabela => {
                const tipoDaTabela = tabela.dataset.tipo;
                let tabelaTemResultados = false;
                if (filtroAtivoTipo === 'todas' || tipoDaTabela === filtroAtivoTipo) {
                    const trs = tabela.tBodies[0].getElementsByTagName('tr');
                    for (const tr of trs) {
                        const textoLinha = tr.textContent || tr.innerText;
                        if (textoLinha.toUpperCase().indexOf(buscaTexto) > -1) {
                            tr.style.display = "";
                            tabelaTemResultados = true;
                        } else {
                            tr.style.display = "none";
                        }
                    }
                }
                if (tabelaTemResultados) {
                    tabela.style.display = "";
                    marcaTemResultados = true;
                } else {
                    tabela.style.display = "none";
                }
            });
        }
        container.style.display = marcaTemResultados ? "" : "none";
    });
}

function handleScroll() {
    if (window.scrollY > 300) {
        backToTopButton.classList.add('visible');
    } else {
        backToTopButton.classList.remove('visible');
    }
}
