let todosOsPaises = [];
let paisesExibidos = [];

async function buscarPaises() {
    try {
        const resposta = await fetch('https://restcountries.com/v3.1/all');
        const dados = await resposta.json();
        todosOsPaises = dados;
        paisesExibidos = dados;
        renderizarPaises(paisesExibidos);
        calcularEstatisticas(paisesExibidos);
    } catch (erro) {
        console.error(erro);
    }
}

function renderizarPaises(paises) {
    const lista = document.getElementById('listaPaises');
    lista.innerHTML = '';

    paises.forEach(pais => {
        const div = document.createElement('div');
        div.className = 'pais';
        
        const capital = pais.capital ? pais.capital[0] : 'N/A';
        
        div.innerHTML = `
            <img src="${pais.flags.svg}" alt="Bandeira">
            <h3>${pais.name.common}</h3>
            <p>Capital: ${capital}</p>
            <p>População: ${pais.population.toLocaleString('pt-BR')}</p>
        `;
        
        div.addEventListener('click', () => mostrarDetalhes(pais.name.common));
        lista.appendChild(div);
    });
}

function aplicarFiltros() {
    const termo = document.getElementById('campoBusca').value.toLowerCase();
    const regiao = document.getElementById('filtroRegiao').value;

    paisesExibidos = todosOsPaises.filter(pais => {
        const atendeNome = pais.name.common.toLowerCase().includes(termo);
        const atendeRegiao = regiao === '' || pais.region === regiao;
        return atendeNome && atendeRegiao;
    });

    renderizarPaises(paisesExibidos);
    calcularEstatisticas(paisesExibidos);
}

document.getElementById('campoBusca').addEventListener('input', aplicarFiltros);
document.getElementById('filtroRegiao').addEventListener('change', aplicarFiltros);

function ordenarPorNome() {
    paisesExibidos.sort((a, b) => a.name.common.localeCompare(b.name.common));
    renderizarPaises(paisesExibidos);
}

function ordenarPorPopulacao() {
    paisesExibidos.sort((a, b) => b.population - a.population);
    renderizarPaises(paisesExibidos);
}

function ordenarPorArea() {
    paisesExibidos.sort((a, b) => (b.area || 0) - (a.area || 0));
    renderizarPaises(paisesExibidos);
}

function calcularEstatisticas(paises) {
    const div = document.getElementById('estatisticas');
    
    if (paises.length === 0) {
        div.innerHTML = '<p>Nenhum país encontrado.</p>';
        return;
    }

    const popTotal = paises.reduce((acc, p) => acc + p.population, 0);
    const areaTotal = paises.reduce((acc, p) => acc + (p.area || 0), 0);
    const popMedia = popTotal / paises.length;
    const areaMedia = areaTotal / paises.length;

    div.innerHTML = `
        <p><strong>População Total:</strong> ${popTotal.toLocaleString('pt-BR')}</p>
        <p><strong>Área Total:</strong> ${areaTotal.toLocaleString('pt-BR')} km²</p>
        <p><strong>Média de População:</strong> ${Math.round(popMedia).toLocaleString('pt-BR')}</p>
        <p><strong>Média de Área:</strong> ${Math.round(areaMedia).toLocaleString('pt-BR')} km²</p>
    `;
}

function mostrarDetalhes(nomePais) {
    const pais = todosOsPaises.find(p => p.name.common === nomePais);
    if (!pais) return;

    const moedas = pais.currencies ? Object.values(pais.currencies).map(m => m.name).join(', ') : 'N/A';
    const idiomas = pais.languages ? Object.values(pais.languages).join(', ') : 'N/A';
    const fronteiras = pais.borders ? pais.borders.join(', ') : 'Nenhuma';
    const subRegiao = pais.subregion || 'N/A';

    alert(`País: ${pais.name.common}\nSub-região: ${subRegiao}\nFronteiras: ${fronteiras}\nIdiomas: ${idiomas}\nMoedas: ${moedas}`);
}

buscarPaises();