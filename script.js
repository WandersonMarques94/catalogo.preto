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
        document.getElementById('lista-container').innerHTML = '<p>Erro ao carregar a lista de preços. Verifique o link da planilha e se a estrutura de 5 colunas está correta.</p>';
        console.error(error);
    }
}

function processarDados(csvData) {
    const linhas = csvData.trim().split('\n').slice(1); // Pula o cabeçalho
    return linhas.map(linha => {
        // Usa uma expressão regular para tratar células vazias ou com espaços
        const colunas = linha.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (colunas.length < 5) return null;
        return {
            marca: colunas[0]?.trim() || 'Sem Marca',
            tipo: colunas[1]?.trim() || 'Outros',
            modelo: colunas[2]?.trim() || '',
            detalhes: colunas[3]?.trim() || '', // Detalhes / Qualidade
            preco: colunas[4]?.trim() || '0'
        };
    }).filter(item => item && item.modelo); // Filtra linhas inválidas ou sem modelo
}

function renderizarPagina(itens) {
    const containerLista = document.getElementById('lista-container');
    const containerBotoes = document.getElementById('botoes-marcas');
    containerLista.innerHTML = '';
    containerBotoes.innerHTML = '';

    // Agrupa primeiro por marca
    const porMarca = itens.reduce((acc, item) => {
        (acc[item.marca] = acc[item.marca] || []).push(item);
        return acc;
    }, {});

    const marcas = Object.keys(porMarca).sort();

    marcas.forEach(marca => {
        const idMarca = `marca-${marca.replace(/\s+/g, '-').toLowerCase()}`;
        
        // Cria botão da marca
        const botao = document.createElement('a');
        botao.href = `#${idMarca}`;
        botao.className = 'botao-marca';
        botao.textContent = marca;
        containerBotoes.appendChild(botao);
        
        // Cria título principal da marca
        const tituloMarca = document.createElement('h2');
        tituloMarca.className = 'marca-titulo';
        tituloMarca.id = idMarca;
        tituloMarca.textContent = marca;
        containerLista.appendChild(tituloMarca);
        
        // Agora, agrupa os itens dessa marca por tipo de peça
        const porTipo = porMarca[marca].reduce((acc, item) => {
            (acc[item.tipo] = acc[item.tipo] || []).push(item);
            return acc;
        }, {});
        
        const tipos = Object.keys(porTipo).sort();
        
        tipos.forEach(tipo => {
            // Cria a tabela para este tipo de peça
            const table = document.createElement('table');
            table.innerHTML = `
                <thead>
                    <tr>
                        <th colspan="3">${tipo}</th>
                    </tr>
                    <tr>
                        <th>Modelo</th>
                        <th>Detalhes / Qualidade</th>
                        <th>Preço (R$)</th>
                    </tr>
                </thead>
                <tbody>
                ${porTipo[tipo].map(item => `
                    <tr>
                        <td>${item.modelo}</td>
                        <td>${item.detalhes}</td>
                        <td>${item.preco}</td>
                    </tr>
                `).join('')}
                </tbody>
            `;
            containerLista.appendChild(table);
        });
    });
}

function filtrarTabela() {
    const input = document.getElementById('searchInput');
    const filtro = input.value.toUpperCase();
    const tabelas = document.querySelectorAll('table');

    tabelas.forEach(table => {
        const trs = table.getElementsByTagName('tr');
        let algumaLinhaVisivelNaTabela = false;
        for (let i = 2; i < trs.length; i++) { // Começa em 2 para pular os dois cabeçalhos
            const textoLinha = trs[i].textContent || trs[i].innerText;
            if (textoLinha.toUpperCase().indexOf(filtro) > -1) {
                trs[i].style.display = "";
                algumaLinhaVisivelNaTabela = true;
            } else {
                trs[i].style.display = "none";
            }
        }
        // Esconde a tabela inteira se nenhum item corresponder à busca
        if (algumaLinhaVisivelNaTabela) {
            table.style.display = "";
        } else {
            table.style.display = "none";
        }
    });
}
