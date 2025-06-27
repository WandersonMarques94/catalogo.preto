// !!! IMPORTANTE !!!
// Cole aqui o link da sua planilha publicada como .csv
const urlPlanilha = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTRm6lEWk_MP0PSDmMNOpHwmu7fiQM4TisoWz78fkEkG_nsG-aeOoU-yKq4IEM9TUFwcPVdE93dKum0/pub?output=csv';

document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    document.getElementById('searchInput').addEventListener('keyup', filtrarTabela);
});

async function carregarDados() {
    try {
        const response = await fetch(urlPlanilha);
        if (!response.ok) throw new Error('Erro ao buscar dados');
        const data = await response.text();
        const itens = processarDados(data);
        renderizarPagina(itens);
    } catch (error) {
        document.getElementById('lista-container').innerHTML = '<p>Erro ao carregar a lista de preços. Verifique o link da planilha.</p>';
        console.error(error);
    }
}

function processarDados(csvData) {
    // Remove linhas em branco antes de processar
    const linhas = csvData.trim().split('\n').slice(1);
    return linhas.map(linha => {
        const colunas = linha.split(',');
        // Garante que temos todas as colunas para evitar erros
        if (colunas.length < 4) return null;
        return {
            marca: colunas[0]?.trim() || 'Sem Marca',
            modelo: colunas[1]?.trim() || '',
            qualidade: colunas[2]?.trim() || '',
            preco: colunas[3]?.trim() || '0'
        };
    }).filter(item => item && item.modelo); // Filtra itens nulos ou sem modelo
}

function renderizarPagina(itens) {
    const containerLista = document.getElementById('lista-container');
    const containerBotoes = document.getElementById('botoes-marcas');
    containerLista.innerHTML = '';
    containerBotoes.innerHTML = '';

    const itensPorMarca = itens.reduce((acc, item) => {
        (acc[item.marca] = acc[item.marca] || []).push(item);
        return acc;
    }, {});

    const marcas = Object.keys(itensPorMarca).sort();

    marcas.forEach(marca => {
        // Cria botão
        const botao = document.createElement('a');
        const idMarca = `marca-${marca.replace(/\s+/g, '-').toLowerCase()}`;
        botao.href = `#${idMarca}`;
        botao.className = 'botao-marca';
        botao.textContent = marca;
        containerBotoes.appendChild(botao);

        // Cria título da seção
        const titulo = document.createElement('h2');
        titulo.className = 'marca-titulo';
        titulo.id = idMarca;
        titulo.textContent = marca;
        containerLista.appendChild(titulo);

        // Cria tabela
        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Modelo</th>
                    <th>Qualidade</th>
                    <th>Preço (R$)</th>
                </tr>
            </thead>
            <tbody>
            ${itensPorMarca[marca].map(item => `
                <tr>
                    <td>${item.modelo}</td>
                    <td>${item.qualidade}</td>
                    <td>${item.preco}</td>
                </tr>
            `).join('')}
            </tbody>
        `;
        containerLista.appendChild(table);
    });
}

function filtrarTabela() {
    const input = document.getElementById('searchInput');
    const filtro = input.value.toUpperCase();
    const tabelas = document.querySelectorAll('table');

    tabelas.forEach(table => {
        const trs = table.getElementsByTagName('tr');
        for (let i = 1; i < trs.length; i++) { // Começa em 1 para pular o cabeçalho
            const tdModelo = trs[i].getElementsByTagName('td')[0];
            const tdQualidade = trs[i].getElementsByTagName('td')[1];
            if (tdModelo || tdQualidade) {
                const textoLinha = (tdModelo.textContent || tdModelo.innerText) + (tdQualidade.textContent || tdQualidade.innerText);
                if (textoLinha.toUpperCase().indexOf(filtro) > -1) {
                    trs[i].style.display = "";
                } else {
                    trs[i].style.display = "none";
                }
            }
        }
    });
}
