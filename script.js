let dataAtual = new Date();
let dataAnterior = new Date(dataAtual.getTime());
dataAnterior.setDate(dataAnterior.getDate() - 1);

function chaveData(data) {
    let dia = ('0' + data.getDate()).slice(-2);
    let mes = ('0' + (data.getMonth() + 1)).slice(-2);
    let ano = data.getFullYear();
    return `${ano}-${mes}-${dia}`;
}

function atualizarInterface() {
    document.getElementById('data-atual').textContent = formatarData(dataAtual);
    document.getElementById('data-anterior').textContent = formatarData(dataAnterior);
    recuperarTarefas();
}

function formatarData(data) {
    const opcoes = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return data.toLocaleDateString('pt-BR', opcoes).replace(',', ' -');
}

function adicionarTarefa(dia) {
    const entradaId = `entrada-${dia}`;
    const tarefasId = `tarefas-${dia}`;
    const inputValue = document.getElementById(entradaId).value.trim();
    const dataChave = dia === 'atual' ? chaveData(dataAtual) : chaveData(dataAnterior);

    if (inputValue) {
        const ul = document.getElementById(tarefasId);
        const li = criarElementoTarefa(inputValue, dataChave);
        ul.appendChild(li);
        document.getElementById(entradaId).value = '';
        salvarTarefas(dia);
    }
}

function criarElementoTarefa(texto, data) {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = texto;
    li.appendChild(span);

    const btnExcluir = document.createElement('button');
    btnExcluir.textContent = 'Excluir';
    btnExcluir.className = 'btn-excluir';
    btnExcluir.onclick = function () {
        li.remove();
        salvarTarefas(data === chaveData(dataAtual) ? 'atual' : 'anterior');
        document.getElementById(`entrada-${data === chaveData(dataAtual) ? 'atual' : 'anterior'}`).focus();
    };
    li.appendChild(btnExcluir);

    return li;
}

function navegar(direcao) {
    if (direcao === 'anterior') {
        dataAtual.setDate(dataAtual.getDate() - 1);
        dataAnterior.setDate(dataAnterior.getDate() - 1);
    } else {
        dataAtual.setDate(dataAtual.getDate() + 1);
        dataAnterior.setDate(dataAnterior.getDate() + 1);
    }
    atualizarInterface();
}

function salvarTarefas(dia) {
    const dataChave = dia === 'atual' ? chaveData(dataAtual) : chaveData(dataAnterior);
    const tarefas = Array.from(document.getElementById(`tarefas-${dia}`).children).map(li => ({
        texto: li.firstChild.textContent,
        data: dataChave
    }));

    localStorage.setItem('tarefas_' + dataChave, JSON.stringify(tarefas));
}

function recuperarTarefas() {
    const tarefasAnterior = JSON.parse(localStorage.getItem('tarefas_' + chaveData(dataAnterior))) || [];
    const tarefasAtual = JSON.parse(localStorage.getItem('tarefas_' + chaveData(dataAtual))) || [];

    const ulAnterior = document.getElementById('tarefas-anterior');
    ulAnterior.innerHTML = '';
    tarefasAnterior.forEach(tarefa => {
        ulAnterior.appendChild(criarElementoTarefa(tarefa.texto, tarefa.data));
    });

    const ulAtual = document.getElementById('tarefas-atual');
    ulAtual.innerHTML = '';
    tarefasAtual.forEach(tarefa => {
        ulAtual.appendChild(criarElementoTarefa(tarefa.texto, tarefa.data));
    });
}

document.addEventListener('DOMContentLoaded', () => {
    atualizarInterface();
    document.getElementById('entrada-anterior').focus();
});

document.addEventListener('keydown', function (event) {
    const activeElement = document.activeElement;

    if (event.key === 'Enter') {
        if (activeElement.tagName === 'BUTTON') {
            activeElement.click();
        } else if (activeElement.tagName === 'TEXTAREA') {
            const dia = activeElement.id.includes('anterior') ? 'anterior' : 'atual';
            adicionarTarefa(dia);
        }
        event.preventDefault();
    } else if (event.key === 'ArrowRight') {
        navegar('proximo');
    } else if (event.key === 'ArrowLeft') {
        navegar('anterior');
    } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        focusNextElement(false);
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        focusNextElement(true);
    }
});

function focusNextElement(isShiftTab) {
    const focusableElements = Array.from(document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'));
    const currentIndex = focusableElements.indexOf(document.activeElement);
    let nextIndex = isShiftTab ? currentIndex - 1 : currentIndex + 1;

    if (nextIndex >= focusableElements.length) {
        nextIndex = 0;
    } else if (nextIndex < 0) {
        nextIndex = focusableElements.length - 1;
    }

    focusableElements[nextIndex].focus();
}