// VERSÃO DE DEPURAÇÃO - Inclui console.log para diagnóstico

// URL da sua planilha já inclusa.
const urlPlanilha = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTRm6lEWk_MP0PSDmMNOpHwmu7fiQM4TisoWz78fkEkG_nsG-aeOoU-yKq4IEM9TUFwcPVdE93dKum0/pub?output=csv';

// Elementos da página
const loadingIndicator = document.getElementById('loading-indicator');
const backToTopButton = document.getElementById('back-to-top');
const searchInput = document.getElementById('searchInput');
// Elementos do Modal (adicionado para evitar erros caso o HTML ainda os tenha)
const filterModal = document.getElementById('filter-modal');
const openModalBtn = document.getElementById('open-filters-modal-btn');
const closeModalBtn = filterModal ? filterModal.querySelector('.close-modal-btn') : null;
const applyFiltersBtn = document.getElementById('apply-filters-btn');
const clearFiltersBtn = document.getElementById('clear-filters-btn');
const brandFiltersContainer = document.getElementById('modal-brand-filters');
const typeFiltersContainer = document.getElementById('modal-type-filters');

// Variáveis de estado do filtro
let filtroAtivoMarca = 'todas';
let filtroAtivoTipo = 'todas';

document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
});

async function carregarDados() {
    loadingIndicator.style.display = 'flex';
    try {
        const response = await fetch(urlPlanilha);
        console.log("--- PASSO 1: Resposta da Rede ---");
        console.log("Status da resposta:", response.status, response.statusText);
        if (!response.ok) throw new Error('Erro na rede ao buscar dados');
        
        const data = await response.text();
        console.log("--- PASSO 2: Dados Brutos Recebidos (início) ---");
        console.log(data.substring(0, 500)); // Mostra os primeiros 500 caracteres dos dados

        const itens = processarDados(data);
        console.log("--- PASSO 4: Resultado Final ---");
        console.log("Total de itens processados com sucesso:", itens.length);

        if (itens.length > 0) {
            renderizarPagina(itens);
            popularFiltros(itens);
            setupModalListeners();
            window.addEventListener('scroll', handleScroll);
        } else {
            throw new Error("Nenhum item foi processado. Verifique o Passo 3.");
        }
        
    } catch (error) {
        console.error("ERRO CRÍTICO:", error);
        loadingIndicator.innerHTML = `<p style="text-align: center; padding: 20px;">Ocorreu um erro grave.<br>Por favor, abra o console (F12) e envie um print da aba 'Console' para o suporte.</p>`;
    }
}

function processarDados(csvData) {
    console.log("--- PASSO 3: Processando os Dados ---");
    if (!csvData || typeof csvData !== 'string' || csvData.length < 10) {
        console.error("Os dados recebidos são inválidos ou vazios.");
        return [];
    }
    const linhas = csvData.trim().split(/\r?\n/).slice(1);
    console.log("Número de linhas encontradas (sem o cabeçalho):", linhas.length);

    const itensProcessados = linhas.map((linha, index) => {
        if (!linha.trim()) return null;

        // Simplificando o split para o teste
        const colunas = linha.split(','); 
        
        // Log detalhado das primeiras 5 linhas para análise
        if (index < 5) {
            console.log(`Analisando Linha ${index + 1}: "${linha}" -> Resultou em ${colunas.length} colunas:`, colunas);
        }

        if (colunas.length < 5) {
             if (index < 5) console.warn(`AVISO: Linha ${index + 1} ignorada por ter menos de 5 colunas.`);
             return null;
        }
        
        return {
            marca: colunas[0]?.trim(),
            tipo: colunas[1]?.trim(),
            modelo: colunas[2]?.trim(),
            detalhes: colunas[3]?.trim(),
            preco: colunas[4]?.trim()
        };
    }).filter(item => item && item.marca && item.modelo);

    return itensProcessados;
}

// O restante do código permanece o mesmo para renderizar e filtrar
// mas só será executado se o processamento for bem-sucedido.
function renderizarPagina(itens) {
    loadingIndicator.style.display = 'none';
    // ... (código de renderização)
}
function popularFiltros(itens) {
    // ... (código de popular filtros)
}
function setupModalListeners() {
    // ... (código dos listeners)
}
function aplicarTodosOsFiltros() {
    // ... (código de aplicar filtros)
}
function handleScroll() {
    // ... (código do scroll)
}

// --- CÓDIGO COMPLETO DAS FUNÇÕES AUXILIARES (para garantir) ---
function renderizarPagina(itens) {
    const containerLista = document.getElementById('lista-container');
    containerLista.innerHTML = '';
    loadingIndicator.style.display = 'none';
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
    const marcasUnicas = [...new Set(itens.map(item => item.marca))];
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

function setupModalListeners() {
    if (!openModalBtn || !closeModalBtn || !filterModal) return;
    openModalBtn.addEventListener('click', () => filterModal.style.display = 'flex');
    closeModalBtn.addEventListener('click', () => filterModal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target == filterModal) {
            filterModal.style.display = 'none';
        }
    });

    brandFiltersContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-pill')) {
            brandFiltersContainer.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
        }
    });
    typeFiltersContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-pill')) {
            typeFiltersContainer.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
        }
    });
    
    applyFiltersBtn.addEventListener('click', () => {
        filtroAtivoMarca = brandFiltersContainer.querySelector('.active').dataset.filter;
        filtroAtivoTipo = typeFiltersContainer.querySelector('.active').dataset.filter;
        aplicarTodosOsFiltros();
        filterModal.style.display = 'none';
    });
    clearFiltersBtn.addEventListener('click', () => {
        brandFiltersContainer.querySelector('.active').classList.remove('active');
        brandFiltersContainer.querySelector('[data-filter="todas"]').classList.add('active');
        typeFiltersContainer.querySelector('.active').classList.remove('active');
        typeFiltersContainer.querySelector('[data-filter="todas"]').classList.add('active');
        filtroAtivoMarca = 'todas';
        filtroAtivoTipo = 'todas';
        aplicarTodosOsFiltros();
        filterModal.style.display = 'none';
    });
    searchInput.addEventListener('keyup', aplicarTodosOsFiltros);
}

function aplicarTodosOsFiltros() {
    const buscaTexto = searchInput.value.toUpperCase();
    document.querySelectorAll('.marca-container').forEach(containerMarca => {
        const marcaAtual = containerMarca.dataset.marca;
        let marcaTemItensVisiveis = false;

        const marcaPassaFiltro = (filtroAtivoMarca === 'todas' || marcaAtual === filtroAtivoMarca);

        if (marcaPassaFiltro) {
            containerMarca.querySelectorAll('table').forEach(tabelaTipo => {
                const tipoAtual = tabelaTipo.dataset.tipo;
                let tipoTemItensVisiveis = false;
                
                const tipoPassaFiltro = (filtroAtivoTipo === 'todas' || tipoAtual === filtroAtivoTipo);

                if (tipoPassaFiltro) {
                    tabelaTipo.querySelectorAll('tbody tr').forEach(linha => {
                        const textoLinha = linha.textContent.toUpperCase();
                        if (textoLinha.includes(buscaTexto)) {
                            linha.style.display = "";
                            tipoTemItensVisiveis = true;
                        } else {
                            linha.style.display = "none";
                        }
                    });
                }

                if (tipoTemItensVisiveis) {
                    tabelaTipo.style.display = "";
                    marcaTemItensVisiveis = true;
                } else {
                    tabelaTipo.style.display = "none";
                }
            });
        }
        containerMarca.style.display = marcaTemItensVisiveis ? "" : "none";
    });
}

function handleScroll() {
    if (!backToTopButton) return;
    if (window.scrollY > 300) {
        backToTopButton.classList.add('visible');
    } else {
        backToTopButton.classList.remove('visible');
    }
}
