let estado = { cap: 38, pot: 120, efi: 0.87, curCusto: 0, curKwh: 0 };

function initTema() {
    const salvo = localStorage.getItem('dolphin_tema') || 'dark';
    aplicarTema(salvo);
}

function aplicarTema(tema) {
    document.documentElement.setAttribute('data-theme', tema);
    localStorage.setItem('dolphin_tema', tema);
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tema === tema);
    });
}

function validarNegativo(input) { if (input.value < 0) input.value = 0; }

document.addEventListener('DOMContentLoaded', () => {
    initTema();
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.onclick = () => aplicarTema(btn.dataset.tema);
    });
    initCards();
    initSliders();
    calcular();
});

function initCards() {
    document.querySelectorAll('#gridCarros .card').forEach(c => {
        c.onclick = () => {
            document.querySelectorAll('#gridCarros .card').forEach(x => x.classList.remove('active'));
            c.classList.add('active');
            estado.cap = parseFloat(c.dataset.cap);
            calcular();
        };
    });
    document.querySelectorAll('#gridCarregadores .card').forEach(c => {
        c.onclick = () => {
            document.querySelectorAll('#gridCarregadores .card').forEach(x => x.classList.remove('active'));
            c.classList.add('active');
            estado.pot = parseFloat(c.dataset.pot);
            estado.efi = parseFloat(c.dataset.efi) / 100;
            calcular();
        };
    });
}

function initSliders() {
    const upd = () => {
        let cur = parseInt(document.getElementById('slideAtual').value);
        let tgt = parseInt(document.getElementById('slideAlvo').value);
        document.getElementById('txtBatAtual').innerText = cur;
        document.getElementById('txtBatAlvo').innerText = tgt;
        document.getElementById('barAtual').style.width = cur + '%';
        document.getElementById('barAlvo').style.width = (cur > tgt ? 0 : tgt) + '%';
        calcular();
    };
    document.getElementById('slideAtual').oninput = upd;
    document.getElementById('slideAlvo').oninput = upd;
}

function calcular() {
    let cur = parseInt(document.getElementById('slideAtual').value);
    let tgt = parseInt(document.getElementById('slideAlvo').value);
    let tarifa = parseFloat(document.getElementById('tarifa').value) || 0;
    let taxa = parseFloat(document.getElementById('taxa').value) || 0;
    let promo = parseFloat(document.getElementById('valorCodigo').value) || 40;

    if (cur >= tgt) { updateUI(0, 0, 0, promo); return; }

    let kwhNeeded = estado.cap * ((tgt - cur) / 100);
    estado.curKwh = kwhNeeded / estado.efi;
    let tempo = (estado.curKwh / estado.pot) * 60;
    estado.curCusto = (estado.curKwh * tarifa) + taxa;

    updateUI(estado.curKwh, tempo, estado.curCusto, promo);
}

function updateUI(kwh, tempo, custo, promo) {
    document.getElementById('resCobrada').innerText = kwh.toFixed(2) + ' kWh';
    document.getElementById('resTempo').innerText = Math.round(tempo) + ' min';
    document.getElementById('resCusto').innerText = 'R$ ' + custo.toFixed(2).replace('.', ',');

    const alerta = document.getElementById('alertaPromo');
    if (custo <= 0) { alerta.style.display = 'none'; return; }
    alerta.style.display = 'block';

    if (custo > promo) {
        alerta.className = 'promo-alert vale';
        alerta.innerHTML = `🔥 Use o voucher de R$ ${promo.toFixed(2)}! Economia de R$ ${(custo - promo).toFixed(2)}`;
    } else {
        alerta.className = 'promo-alert nao-vale';
        alerta.innerHTML = `💡 Pague no cartão. Menor que R$ ${promo.toFixed(2)}`;
    }
}

if ('serviceWorker' in navigator) { navigator.serviceWorker.register('sw.js'); }