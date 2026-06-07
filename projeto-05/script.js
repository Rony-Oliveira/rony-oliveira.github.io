let todosOsFilmes = [];
let filmesExibidos = [];

const formBusca = document.getElementById('formBusca');
const campoApiKey = document.getElementById('campoApiKey');
const campoBusca = document.getElementById('campoBusca');
const filtroTipo = document.getElementById('filtroTipo');
const btnOrdenarTitulo = document.getElementById('btnOrdenarTitulo');
const btnOrdenarAno = document.getElementById('btnOrdenarAno');
const containerLista = document.getElementById('listaFilmes');
const containerEstatisticas = document.getElementById('estatisticas');

async function buscarFilmes(evento) {
    evento.preventDefault(); 

    const apiKey = campoApiKey.value.trim();
    const termo = campoBusca.value.trim();

    if (!apiKey) {
        exibirMensagemErro("Por favor, insira sua API Key da OMDb para realizar a busca.");
        return;
    }

    if (!termo) return;

    try {
        const resposta = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(termo)}`);
        
        if (!resposta.ok) {
            throw new Error(`Erro na requisição: ${resposta.status}`);
        }

        const dados = await resposta.json();

        if (dados.Response === "False") {
            const mensagemErro = dados.Error ?? "Nenhum filme encontrado.";
            throw new Error(mensagemErro);
        }

        todosOsFilmes = dados.Search;
        filmesExibidos = [...dados.Search];

        filtroTipo.value = ""; 
        renderizarFilmes(filmesExibidos);
        calcularEstatisticas(filmesExibidos);

    } catch (erro) {
        exibirMensagemErro(erro.message);
    }
}

function exibirMensagemErro(mensagem) {
    containerLista.style.display = 'grid'; 
    containerLista.innerHTML = `
        <div class="mensagem-erro">
            <h2>Aviso</h2>
            <p>${mensagem}</p>
        </div>
    `;
    
    containerEstatisticas.style.display = 'none'; 
    containerEstatisticas.innerHTML = '';
}

function renderizarFilmes(filmes) {
    containerLista.innerHTML = '';

    if (filmes.length === 0) {
        containerLista.style.display = 'none'; 
        return;
    }

    containerLista.style.display = 'grid'; 

    filmes.forEach(filme => {
        const div = document.createElement('div');
        div.classList.add('card-filme');

        const poster = filme.Poster;
        const titulo = filme.Title;
        const tipo = filme.Type;
        const ano = filme.Year;

        div.innerHTML = `
            <img src="${poster}" alt="Poster de ${titulo}">
            <h3>${titulo}</h3>
            <p><strong>Tipo:</strong> ${tipo}</p>
            <p><strong>Ano:</strong> ${ano}</p>
        `;

        div.addEventListener('click', () => mostrarDetalhes(filme.imdbID));
        containerLista.appendChild(div);
    });
}

function aplicarFiltroTipo() {
    const tipoSelecionado = filtroTipo.value;

    filmesExibidos = todosOsFilmes.filter(filme => {
        return tipoSelecionado === '' || filme.Type === tipoSelecionado;
    });

    renderizarFilmes(filmesExibidos);
    calcularEstatisticas(filmesExibidos);
}

function ordenarPorTitulo() {
    filmesExibidos.sort((a, b) => a.Title.localeCompare(b.Title));
    renderizarFilmes(filmesExibidos);
}

function ordenarPorAno() {
    filmesExibidos.sort((a, b) => {
        const anoA = Number(a.Year);
        const anoB = Number(b.Year);
        return anoB - anoA;
    });
    renderizarFilmes(filmesExibidos);
}

function calcularEstatisticas(filmes) {
    if (filmes.length === 0) {
        containerEstatisticas.style.display = 'none'; 
        containerEstatisticas.innerHTML = '';
        return;
    }

    containerEstatisticas.style.display = 'block'; 

    const totalExibidos = filmes.length;

    const somaAnos = filmes.reduce((acc, filme) => {
        const anoLimpo = parseInt(filme.Year);
        return acc + anoLimpo;
    }, 0);
    const mediaAno = Math.round(somaAnos / totalExibidos);

    const contagemTipos = filmes.reduce((acc, filme) => {
        const tipo = filme.Type;
        acc[tipo] = (acc[tipo] ?? 0) + 1;
        return acc;
    }, { movie: 0, series: 0, game: 0 });

    containerEstatisticas.innerHTML = `
        <h2>Análise de Dados</h2>
        <p><strong>Quantidade de itens exibidos:</strong> ${totalExibidos}</p>
        <p><strong>Média do ano de lançamento:</strong> ${mediaAno}</p>
        <p><strong>Distribuição por Tipo:</strong></p>
        <ul>
            <li>Filmes: ${contagemTipos.movie ?? 0}</li>
            <li>Séries: ${contagemTipos.series ?? 0}</li>
            <li>Games: ${contagemTipos.game ?? 0}</li>
        </ul>
    `;
}

async function mostrarDetalhes(idFilme) {
    const apiKey = campoApiKey.value.trim();
    
    if (!apiKey) {
        alert("A API Key é necessária para carregar os detalhes.");
        return;
    }

    try {
        const resposta = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${idFilme}`);
        if (!resposta.ok) throw new Error("Erro ao buscar detalhes.");

        const filme = await resposta.json();

        const elenco = filme.Actors;
        const genero = filme.Genre;
        const nota = filme.imdbRating;
        const direcao = filme.Director;
        const sinopse = filme.Plot;
        const duracao = filme.Runtime;

        alert(`Título: ${filme.Title}\n\nDireção: ${direcao}\nElenco: ${elenco}\nGênero: ${genero}\nNota IMDb: ${nota}\nDuração: ${duracao}\n\nSinopse: ${sinopse}`);

    } catch (erro) {
        alert(`Não foi possível carregar os detalhes: ${erro.message}`);
    }
}

formBusca.addEventListener('submit', buscarFilmes);
filtroTipo.addEventListener('change', aplicarFiltroTipo);
btnOrdenarTitulo.addEventListener('click', ordenarPorTitulo);
btnOrdenarAno.addEventListener('click', ordenarPorAno);