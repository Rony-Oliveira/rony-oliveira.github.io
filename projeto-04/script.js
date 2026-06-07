let todosOsPaises = [];
let paisesExibidos = [];

async function buscarPaises() {
    try {
        const resposta = await fetch('https://restcountries.com/v3.1/all?fields=name,capital,population,flags,region,area,currencies,languages,subregion,borders');
        
        if (!resposta.ok) {
            throw new Error(`Erro na API: ${resposta.status}`);
        }

        const dados = await resposta.json();
        todosOsPaises = dados;
        paisesExibidos = dados;
        
        renderizarPaises(paisesExibidos);
        calcularEstatisticas(paisesExibidos);
        
    } catch (erro) {
        document.querySelector('#listaPaises').innerHTML = `<p>O link da API falhou. Motivo: ${erro.message}</p>`
    }
}

function renderizarPaises(paises) {
    const lista = document.querySelector('#listaPaises');
    lista.innerHTML = '';

    paises.forEach(pais => {
        const div = document.createElement('div');
        div.classList.add('pais');
        
        const nome = pais.name.common;
        const capital = pais.capital[0];
        const populacao = pais.population.toLocaleString('pt-BR');
        const bandeira = pais.flags.svg;
        
        div.innerHTML = `
            <img src="${bandeira}" alt="Bandeira de ${nome}">
            <h3>${nome}</h3>
            <p><strong>Capital:</strong> ${capital}</p>
            <p><strong>População:</strong> ${populacao}</p>
        `;
        
        div.addEventListener('click', () => mostrarDetalhes(nome));
        lista.appendChild(div);
    });
}

function aplicarFiltros() {
    const termo = document.querySelector('#campoBusca').value.toLowerCase().trim();
    const regiao = document.querySelector('#filtroRegiao').value.trim();

    paisesExibidos = todosOsPaises.filter(pais => {
        const nome = pais.name.common.toLowerCase();
        const atendeNome = nome.includes(termo);
        const atendeRegiao = regiao === '' || pais.region === regiao;
        return atendeNome && atendeRegiao;
    });

    renderizarPaises(paisesExibidos);
    calcularEstatisticas(paisesExibidos);
}

document.querySelector('#campoBusca').addEventListener('input', aplicarFiltros);
document.querySelector('#filtroRegiao').addEventListener('change', aplicarFiltros);

function ordenarPorNome() {
    paisesExibidos.sort((a, b) => {
        const nomeA = a.name.common;
        const nomeB = b.name.common;
        return nomeA.localeCompare(nomeB);
    });
    renderizarPaises(paisesExibidos);
}

function ordenarPorPopulacao() {
    paisesExibidos.sort((a, b) => (b.population ?? 0) - (a.population ?? 0));
    renderizarPaises(paisesExibidos);
}

function ordenarPorArea() {
    paisesExibidos.sort((a, b) => (b.area ?? 0) - (a.area ?? 0));
    renderizarPaises(paisesExibidos);
}

function calcularEstatisticas(paises) {
    const div = document.querySelector('#estatisticas');
    
    if (paises.length === 0) {
        div.innerHTML = '<p>Nenhum país encontrado.</p>';
        return;
    }

    const popTotal = paises.reduce((acc, p) => acc + (p.population), 0);
    const areaTotal = paises.reduce((acc, p) => acc + (p.area), 0);
    const popMedia = popTotal / paises.length;
    const areaMedia = areaTotal / paises.length;

    div.innerHTML = `
        <p>População Total: ${popTotal.toLocaleString('pt-BR')}</p>
        <p>Área Total: ${areaTotal.toLocaleString('pt-BR')} km²</p>
        <p>Média de População: ${Math.round(popMedia).toLocaleString('pt-BR')}</p>
        <p>Média de Área: ${Math.round(areaMedia).toLocaleString('pt-BR')} km²</p>
    `;
}

function mostrarDetalhes(nomePais) {
    const pais = todosOsPaises.find(p => p.name.common === nomePais);
    if (!pais) return;

    const moedas = pais.currencies ? Object.values(pais.currencies).map(m => m.name).join(', ') : 'N/A';
    const idiomas = pais.languages ? Object.values(pais.languages).join(', ') : 'N/A';
    const fronteiras = pais.borders ? pais.borders.join(', ') : 'Nenhuma';
    const subRegiao = pais.subregion;

    alert(`País: ${pais.name.common}\nSub-região: ${subRegiao}\nFronteiras: ${fronteiras}\nIdiomas: ${idiomas}\nMoedas: ${moedas}`);
}

buscarPaises();