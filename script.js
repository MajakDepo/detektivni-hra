// Paměť naší hry (kde hráč je a co má u sebe)
let stavHry = {
    lokace: 'chodba',
    inventar: []
};

// Databáze všech místností a událostí
const lokace = {
    chodba: {
        nazev: 'Temná chodba expresu',
        popis: 'Stojíš v úzké chodbičce nočního vlaku. Za okny je absolutní tma, projíždíte tunelem. Vlak se rytmicky pohupuje.',
        moznosti: () => [
            { text: 'Vstoupit do kupé hraběnky', akce: () => zmenLokaci('kupe') },
            { text: 'Jít do jídelního vozu', akce: () => zmenLokaci('jidelna') }
        ]
    },
    kupe: {
        nazev: 'Kupé hraběnky',
        popis: 'Místo činu. Hraběnka pláče v rohu. Na zemi jsou rozsypané perly z falešného náhrdelníku a otevřený prázdný trezor.',
        moznosti: () => {
            let tlacitka = [
                { text: 'Vrátit se na chodbu', akce: () => zmenLokaci('chodba') }
            ];
            
            // Pokud ještě nemáme lístek, nabídneme možnost ho sebrat
            if (!stavHry.inventar.includes('Natržený lístek na jméno B.O.')) {
                tlacitka.unshift({ 
                    text: 'Prozkoumat podlahu pod sedadlem', 
                    akce: () => seberPredmet('Natržený lístek na jméno B.O.', 'Našel jsi pod sedadlem podezřelý útržek jízdenky!') 
                });
            }
            return tlacitka;
        }
    },
    jidelna: {
        nazev: 'Jídelní vůz',
        popis: 'Vůz je prázdný, obsluha někam zmizela. Na stolech cinkají skleničky.',
        moznosti: () => [
            { text: 'Zpět na chodbu', akce: () => zmenLokaci('chodba') }
        ]
    }
};

// Funkce pro přesun mezi místnostmi
function zmenLokaci(novaLokace) {
    stavHry.lokace = novaLokace;
    vykresliObrazovku();
}

// Funkce pro sbírání stop
function seberPredmet(predmet, zprava) {
    stavHry.inventar.push(predmet);
    alert(zprava); // Vyskakovací okno s informací
    vykresliObrazovku();
}

// Funkce, která všechno zobrazí na monitoru
function vykresliObrazovku() {
    const aktualni = lokace[stavHry.lokace];
    
    // Změna textů
    document.getElementById('nazev-lokace').innerText = aktualni.nazev;
    document.getElementById('popis-lokace').innerText = aktualni.popis;
    
    // Vykreslení tlačítek
    const divMoznosti = document.getElementById('moznosti');
    divMoznosti.innerHTML = ''; // Vyčistíme stará tlačítka
    
    aktualni.moznosti().forEach(moznost => {
        const btn = document.createElement('button');
        btn.innerText = moznost.text;
        btn.onclick = moznost.akce;
        divMoznosti.appendChild(btn);
    });
    
    // Vykreslení inventáře
    const seznamInv = document.getElementById('seznam-inventare');
    seznamInv.innerHTML = '';
    
    if (stavHry.inventar.length === 0) {
        seznamInv.innerHTML = '<li>Zatím žádné stopy...</li>';
    } else {
        stavHry.inventar.forEach(polozka => {
            const li = document.createElement('li');
            li.innerText = polozka;
            seznamInv.appendChild(li);
        });
    }
}

// Prvotní spuštění hry po načtení stránky
vykresliObrazovku();
