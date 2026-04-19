// Paměť naší hry (kde hráč je, co má u sebe a co už se stalo)
let stavHry = {
    lokace: 'chodba',
    inventar: [],
    znalosti: [], // Pro abstraktní stopy (např. alibi)
    promluveno: {
        hrabenka: false,
        baron: false,
        cisnik: false
    },
    zamceno: {
        zavazadla: true
    }
};

// Databáze všech místností a událostí
const lokace = {
    chodba: {
        nazev: 'Temná chodba expresu',
        popis: 'Stojíš v úzké chodbičce nočního vlaku. Za okny je absolutní tma, projíždíte tunelem. Vlak se rytmicky pohupuje. Cítíš lehký zápach drahého doutníku.',
        moznosti: () => {
            let tlacitka = [
                { text: 'Vstoupit do kupé hraběnky', akce: () => zmenLokaci('kupe') },
                { text: 'Zaklepat na kupé Barona Ostrého', akce: () => zmenLokaci('kupe_baron') },
                { text: 'Jít do jídelního vozu', akce: () => zmenLokaci('jidelna') },
            ];
            
            // Pokud máme obě hlavní stopy, můžeme jít obvinit
            if (stavHry.inventar.includes('Natržený lístek na jméno B.O.') && stavHry.inventar.includes('Vlhké perly')) {
                tlacitka.push({ text: 'Svolat všechny a vznést obvinění!', akce: () => zmenLokaci('rozuzleni') });
            }
            
            return tlacitka;
        }
    },
    kupe: {
        nazev: 'Kupé hraběnky',
        popis: 'Místo činu. Hraběnka hystericky pláče v rohu. Na zemi jsou rozsypané perly z falešného náhrdelníku a otevřený prázdný trezor.',
        moznosti: () => {
            let tlacitka = [
                { text: 'Vrátit se na chodbu', akce: () => zmenLokaci('chodba') }
            ];
            
            if (!stavHry.promluveno.hrabenka) {
                tlacitka.unshift({ 
                    text: 'Vyslechnout hraběnku', 
                    akce: () => {
                        alert('"Zhasla světla a někdo mě strčil! Ucítila jsem kouř z doutníku a pak už byl trezor prázdný!" vzlyká hraběnka.');
                        stavHry.promluveno.hrabenka = true;
                        stavHry.znalosti.push('Pachatel kouří doutníky');
                        vykresliObrazovku();
                    } 
                });
            }
            
            if (!stavHry.inventar.includes('Natržený lístek na jméno B.O.')) {
                tlacitka.unshift({ 
                    text: 'Prozkoumat podlahu pod sedadlem', 
                    akce: () => seberPredmet('Natržený lístek na jméno B.O.', 'Našel jsi pod sedadlem podezřelý útržek jízdenky!') 
                });
            }
            return tlacitka;
        }
    },
    kupe_baron: {
        nazev: 'Kupé Barona Ostrého',
        popis: 'Baron sedí v křesle, bafá z tlustého doutníku a tváří se arogantně. "Co otravujete, detektive?" zavrčí.',
        moznosti: () => {
            let tlacitka = [
                { text: 'Vrátit se na chodbu', akce: () => zmenLokaci('chodba') }
            ];

            if (!stavHry.promluveno.baron) {
                tlacitka.unshift({
                    text: 'Zeptat se na jeho alibi',
                    akce: () => {
                        alert('"Byl jsem celou dobu tady. Zeptejte se číšníka, před chvílí mi nesl brandy!"');
                        stavHry.promluveno.baron = true;
                        vykresliObrazovku();
                    }
                });
            }

            // Pokud hráč ví, že pachatel kouří doutníky a Baron je kouří taky
            if (stavHry.znalosti.includes('Pachatel kouří doutníky')) {
                tlacitka.unshift({
                    text: 'Konfrontovat ho ohledně doutníků',
                    akce: () => {
                        alert('Baron zbledne. "Nejsem jediný, kdo tu kouří! Ale... dobře, lístek B.O. je můj. Ztratil jsem ho cestou do jídelny, nepřibližoval jsem se k hraběnce!"');
                        if (!stavHry.znalosti.includes('Baronovo přiznání k lístku')) {
                            stavHry.znalosti.push('Baronovo přiznání k lístku');
                        }
                        vykresliObrazovku();
                    }
                });
            }

            return tlacitka;
        }
    },
    jidelna: {
        nazev: 'Jídelní vůz',
        popis: 'Vůz je prázdný. Na stolech cinkají skleničky. Vzadu jsou dveře do zavazadlového vozu.',
        moznosti: () => {
            let tlacitka = [
                { text: 'Zpět na chodbu', akce: () => zmenLokaci('chodba') }
            ];

            if (stavHry.zamceno.zavazadla) {
                if (stavHry.inventar.includes('Malý mosazný klíček')) {
                    tlacitka.unshift({
                        text: 'Odemknout zavazadlový vůz',
                        akce: () => {
                            alert('Klíček pasuje! Zámek cvakl.');
                            stavHry.zamceno.zavazadla = false;
                            vykresliObrazovku();
                        }
                    });
                } else {
                    tlacitka.unshift({
                        text: 'Zkusit otevřít zavazadlový vůz',
                        akce: () => alert('Zamčeno. Někde tu musí být klíč.')
                    });
                    
                    if (!stavHry.inventar.includes('Malý mosazný klíček')) {
                        tlacitka.unshift({
                            text: 'Prohledat pult obsluhy',
                            akce: () => seberPredmet('Malý mosazný klíček', 'Ve sklenici na dýška jsi našel ukrytý klíček!')
                        });
                    }
                }
            } else {
                tlacitka.unshift({ text: 'Vstoupit do zavazadlového vozu', akce: () => zmenLokaci('zavazadla') });
            }

            return tlacitka;
        }
    },
    zavazadla: {
        nazev: 'Zavazadlový vůz',
        popis: 'Je tu zima a průvan. Z pootevřeného okna prší dovnitř. Vedle okna leží pohozená uniforma obsluhy.',
        moznosti: () => {
            let tlacitka = [
                { text: 'Vrátit se do jídelny', akce: () => zmenLokaci('jidelna') }
            ];

            if (!stavHry.inventar.includes('Vlhké perly')) {
                tlacitka.unshift({
                    text: 'Prozkoumat uniformu',
                    akce: () => seberPredmet('Vlhké perly', 'V kapse uniformy jsi našel pravé perly! Pachatel musel utéct oknem a převléct se.')
                });
            }

            return tlacitka;
        }
    },
    rozuzleni: {
        nazev: 'Čas zúčtování',
        popis: 'Všichni se shromáždili v jídelním voze. Je čas ukázat prstem na pachatele.',
        moznosti: () => [
            { text: 'Obvinit Barona Ostrého (Chtěl klenot do sbírky)', akce: () => konecHry(false, 'Baron to nebyl. Lístek mu jen vypadl. Skutečný zloděj unikl oknem!') },
            { text: 'Obvinit chybějícího číšníka (Falešné stopy a uniforma)', akce: () => konecHry(true, 'Přesně tak! Číšník ukradl perly, podstrčil lístek Barona a unikl zavazadlovým vozem. Případ uzavřen!') },
            { text: 'Počkat, potřebuji víc času...', akce: () => zmenLokaci('chodba') }
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
    alert(zprava); 
    vykresliObrazovku();
}

function konecHry(vyhra, zprava) {
    const divObrazovka = document.getElementById('hlavni-obrazovka');
    divObrazovka.innerHTML = `<h2 style="color: ${vyhra ? '#4CAF50' : '#f44336'};">${vyhra ? 'VÍTĚZSTVÍ!' : 'PROHRA'}</h2><p>${zprava}</p>`;
    divObrazovka.innerHTML += `<button onclick="location.reload()">Hrát znovu</button>`;
}

// Vykreslování - nyní obsahuje i "Znalosti" v inventáři
function vykresliObrazovku() {
    const aktualni = lokace[stavHry.lokace];
    
    document.getElementById('nazev-lokace').innerText = aktualni.nazev;
    document.getElementById('popis-lokace').innerText = aktualni.popis;
    
    const divMoznosti = document.getElementById('moznosti');
    divMoznosti.innerHTML = ''; 
    
    aktualni.moznosti().forEach(moznost => {
        const btn = document.createElement('button');
        btn.innerText = moznost.text;
        btn.onclick = moznost.akce;
        divMoznosti.appendChild(btn);
    });
    
    const seznamInv = document.getElementById('seznam-inventare');
    seznamInv.innerHTML = '';
    
    // Vykreslení předmětů
    if (stavHry.inventar.length > 0) {
        seznamInv.innerHTML += '<h4 style="margin-bottom: 5px; color: #aaa;">Fyzické stopy:</h4>';
        stavHry.inventar.forEach(polozka => {
            seznamInv.innerHTML += `<li style="color: #fff;">${polozka}</li>`;
        });
    }

    // Vykreslení znalostí
    if (stavHry.znalosti.length > 0) {
        seznamInv.innerHTML += '<h4 style="margin-top: 15px; margin-bottom: 5px; color: #aaa;">Poznatky:</h4>';
        stavHry.znalosti.forEach(polozka => {
            seznamInv.innerHTML += `<li style="color: #88ccff;">${polozka}</li>`;
        });
    }

    if (stavHry.inventar.length === 0 && stavHry.znalosti.length === 0) {
        seznamInv.innerHTML = '<li>Zatím žádné stopy...</li>';
    }
}

vykresliObrazovku();
