// Paměť naší hry
let stavHry = {
    lokace: 'chodba',
    inventar: [],
    znalosti: [],
    promluveno: {
        hrabenka: false,
        baron: false,
        pruvodci: false,
        baron_konfrontace: false
    },
    zamceno: {
        zavazadla: true,
        kuchyne: true
    }
};

// Databáze všech místností a událostí
const lokace = {
    chodba: {
        nazev: 'Temná chodba expresu',
        popis: 'Vlak se rytmicky pohupuje temnotou. Chodba je prázdná a spoře osvětlená. Na zemi leží popel z doutníku.',
        moznosti: () => {
            let tlacitka = [
                { text: 'Vstoupit do kupé hraběnky', akce: () => zmenLokaci('kupe') },
                { text: 'Zaklepat na kupé Barona Ostrého', akce: () => zmenLokaci('kupe_baron') },
                { text: 'Jít do jídelního vozu', akce: () => zmenLokaci('jidelna') },
                { text: 'Jít za průvodčím do lůžkového vozu', akce: () => zmenLokaci('luzkovy_vuz') }
            ];
            
            // Pokud hráč odhalil lékárničku a má obě zásadní stopy
            if (stavHry.znalosti.includes('Skutečný plán útěku') && stavHry.inventar.includes('Natržený lístek na jméno B.O.')) {
                tlacitka.push({ text: 'Svolat všechny! Zámada je vyřešena!', akce: () => zmenLokaci('rozuzleni') });
            }
            return tlacitka;
        }
    },
    luzkovy_vuz: {
        nazev: 'Lůžkový vůz',
        popis: 'Starý průvodčí tu sedí na rozkládací židličce a luští křížovku. Na opasku mu chrastí obrovský svazek klíčů.',
        moznosti: () => {
            let tlacitka = [
                { text: 'Vrátit se na chodbu', akce: () => zmenLokaci('chodba') }
            ];

            if (!stavHry.promluveno.pruvodci) {
                tlacitka.unshift({
                    text: 'Zeptat se na pohyb ve vlaku',
                    akce: () => {
                        alert('Průvodčí si povzdechne: "Nikdo tudy neprošel. Ale všiml jsem si, že číšník Jules byl dnes hrozně nervózní. A mimochodem, někdo mi sebral univerzální klíč od kuchyně!"');
                        stavHry.promluveno.pruvodci = true;
                        stavHry.znalosti.push('Číšník byl nervózní');
                        vykresliObrazovku();
                    }
                });
            }

            if (stavHry.promluveno.pruvodci && stavHry.zamceno.zavazadla && !stavHry.inventar.includes('Klíč od zavazadel')) {
                tlacitka.unshift({
                    text: 'Požádat o odemčení zavazadlového vozu',
                    akce: () => {
                        alert('"Zavazadlový vůz? Jistě, tady máte rezervní klíč, detektive. Ale buďte opatrný, je tam tma."');
                        seberPredmet('Klíč od zavazadel', 'Získal jsi klíč od zavazadlového vozu.');
                    }
                });
            }
            return tlacitka;
        }
    },
    kupe: {
        nazev: 'Kupé hraběnky',
        popis: 'Místo činu. Hraběnka sedí na pohovce a ovívá se vějířem. Otevřený trezor zeje prázdnotou.',
        moznosti: () => {
            let tlacitka = [
                { text: 'Vrátit se na chodbu', akce: () => zmenLokaci('chodba') }
            ];
            
            if (!stavHry.promluveno.hrabenka) {
                tlacitka.unshift({ 
                    text: 'Vyslechnout hraběnku', 
                    akce: () => {
                        alert('"Někdo zhasl, vrazil do mě a pak byl náhrdelník pryč! Cítila jsem těžký tabák... a slyšela jsem padat perly na zem!"');
                        stavHry.promluveno.hrabenka = true;
                        stavHry.znalosti.push('Pachatel voněl tabákem');
                        vykresliObrazovku();
                    } 
                });
            }
            
            if (!stavHry.inventar.includes('Natržený lístek na jméno B.O.')) {
                tlacitka.unshift({ 
                    text: 'Prozkoumat podlahu', 
                    akce: () => seberPredmet('Natržený lístek na jméno B.O.', 'Pod kobercem jsi našel lístek, jako by ho tam někdo naaranžoval schválně!') 
                });
            }
            return tlacitka;
        }
    },
    kupe_baron: {
        nazev: 'Kupé Barona Ostrého',
        popis: 'Baron sedí v křesle, bafá z doutníku a čte si noviny. "Co zase chcete?" odsekne.',
        moznosti: () => {
            let tlacitka = [
                { text: 'Vrátit se na chodbu', akce: () => zmenLokaci('chodba') }
            ];

            if (!stavHry.promluveno.baron_konfrontace && stavHry.znalosti.includes('Pachatel voněl tabákem') && stavHry.inventar.includes('Natržený lístek na jméno B.O.')) {
                tlacitka.unshift({
                    text: 'Konfrontovat ho s lístkem a tabákem',
                    akce: () => {
                        alert('"To je můj lístek!" zrudne Baron. "Ztratil jsem ho cestou do jídelny. Někdo mě chce zdiskreditovat! Číšník mi nesl kávu a musel ho sebrat!"');
                        stavHry.promluveno.baron_konfrontace = true;
                        stavHry.znalosti.push('Lístek mohl podstrčit číšník');
                        vykresliObrazovku();
                    }
                });
            }
            return tlacitka;
        }
    },
    jidelna: {
        nazev: 'Jídelní vůz',
        popis: 'Vůz je prázdný. Z jedné strany jsou dveře do zavazadel, z druhé do kuchyně.',
        moznosti: () => {
            let tlacitka = [
                { text: 'Zpět na chodbu', akce: () => zmenLokaci('chodba') }
            ];

            // Dveře do zavazadel
            if (stavHry.zamceno.zavazadla) {
                if (stavHry.inventar.includes('Klíč od zavazadel')) {
                    tlacitka.unshift({
                        text: 'Odemknout zavazadlový vůz',
                        akce: () => {
                            alert('Klíč od průvodčího pasuje.');
                            stavHry.zamceno.zavazadla = false;
                            vykresliObrazovku();
                        }
                    });
                } else {
                    tlacitka.unshift({ text: 'Zkusit dveře k zavazadlům (Zamčeno)', akce: () => alert('Musíš najít klíč.') });
                }
            } else {
                tlacitka.unshift({ text: 'Jít do zavazadlového vozu', akce: () => zmenLokaci('zavazadla') });
            }

            // Dveře do kuchyně (odemknou se sponkou)
            if (stavHry.zamceno.kuchyne) {
                if (stavHry.inventar.includes('Kovová sponka z perel')) {
                    tlacitka.unshift({
                        text: 'Vypáčit dveře do kuchyně pomocí sponky',
                        akce: () => {
                            alert('Trocha šikovnosti a starý zámek u kuchyně povolil!');
                            stavHry.zamceno.kuchyne = false;
                            vykresliObrazovku();
                        }
                    });
                } else {
                    tlacitka.unshift({ text: 'Zkusit dveře do kuchyně (Zamčeno zevnitř)', akce: () => alert('Zamčeno, ale je slyšet, jak uvnitř kape voda. Potřebuješ něco tenkého na vypáčení.') });
                }
            } else {
                tlacitka.unshift({ text: 'Vpadnout do kuchyně', akce: () => zmenLokaci('kuchyne') });
            }

            return tlacitka;
        }
    },
    zavazadla: {
        nazev: 'Zavazadlový vůz',
        popis: 'Průvan tady sviští naplno z rozbitého okna. Na bedně leží pohozená uniforma obsluhy a pár uvolněných perel.',
        moznosti: () => {
            let tlacitka = [
                { text: 'Vrátit se do jídelny', akce: () => zmenLokaci('jidelna') }
            ];

            if (!stavHry.inventar.includes('Kovová sponka z perel')) {
                tlacitka.unshift({
                    text: 'Prozkoumat perly a uniformu',
                    akce: () => {
                        seberPredmet('Kovová sponka z perel', 'Našel jsi pevnou kovovou sponku z náhrdelníku. Ty perly tady nenechal omylem – je to falešná stopa, že vyskočil z okna!');
                        stavHry.znalosti.push('Útěk oknem je falešná stopa');
                    }
                });
            }
            return tlacitka;
        }
    },
    kuchyne: {
        nazev: 'Lodní kuchyně',
        popis: 'Uvnitř je tma. V koutě za pytli s moukou se někdo krčí! Je to číšník Jules a v ruce svírá pravý náhrdelník!',
        moznosti: () => {
            let tlacitka = [
                { text: 'Zabavit náhrdelník a vyvést ho ven', akce: () => zmenLokaci('jidelna') }
            ];

            if (!stavHry.znalosti.includes('Skutečný plán útěku')) {
                tlacitka.unshift({
                    text: 'Vyslechnout Julese',
                    akce: () => {
                        alert('"Chtěl jsem počkat, až vlak zpomalí v průsmyku! Jak jste poznal, že jsem nevyskočil z okna v zavazadlovém?!" hroutí se Jules.');
                        stavHry.znalosti.push('Skutečný plán útěku');
                        vykresliObrazovku();
                    }
                });
            }
            return tlacitka;
        }
    },
    rozuzleni: {
        nazev: 'Finální obvinění',
        popis: 'Všichni cestující se shromáždili. Číšník Jules klečí na zemi, Baron ho hlídá.',
        moznosti: () => [
            { text: 'Uzavřít případ: Číšník chtěl rámovat Barona, nahrál útěk, ale schoval se v kuchyni.', akce: () => konecHry(true, 'Gratuluji, detektive! Odhalil jsi dokonalý plán falešného útěku. Perly jsou zpět u Hraběnky a Jules skončí v poutech na další stanici.') },
            { text: 'Obvinit z organizace Hraběnku (Pojistný podvod)', akce: () => konecHry(false, 'Hraběnka omdlela pobouřením. I když je podezřelá, chybí ti důkazy a Jules se přiznal ke krádeži na vlastní pěst. Obvinění se nepovedlo.') }
        ]
    }
};

function zmenLokaci(novaLokace) {
    stavHry.lokace = novaLokace;
    vykresliObrazovku();
}

function seberPredmet(predmet, zprava) {
    stavHry.inventar.push(predmet);
    alert(zprava); 
    vykresliObrazovku();
}

function konecHry(vyhra, zprava) {
    const divObrazovka = document.getElementById('hlavni-obrazovka');
    divObrazovka.innerHTML = `<h2 style="color: ${vyhra ? '#c9a75d' : '#f44336'};">${vyhra ? 'ZÁHADA VYŘEŠENA' : 'ŠPATNÁ ÚVAHA'}</h2><p style="font-size: 18px; line-height: 1.6;">${zprava}</p>`;
    divObrazovka.innerHTML += `<button style="margin-top: 20px; text-align: center;" onclick="location.reload()">Hrát znovu</button>`;
}

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
    
    if (stavHry.inventar.length > 0) {
        seznamInv.innerHTML += '<h4>V kapse:</h4>';
        stavHry.inventar.forEach(polozka => {
            seznamInv.innerHTML += `<li>${polozka}</li>`;
        });
    }

    if (stavHry.znalosti.length > 0) {
        seznamInv.innerHTML += '<h4 style="margin-top: 15px;">Zápisník:</h4>';
        stavHry.znalosti.forEach(polozka => {
            seznamInv.innerHTML += `<li style="border-left-color: #6a9ac4;">${polozka}</li>`;
        });
    }

    if (stavHry.inventar.length === 0 && stavHry.znalosti.length === 0) {
        seznamInv.innerHTML = '<li style="border: none; background: transparent; padding: 0;">Zatím žádné stopy...</li>';
    }
}

vykresliObrazovku();
