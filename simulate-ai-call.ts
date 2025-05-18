import { db } from './server/db';
import { clients, users, liveCallSessions, callEmotionAnalysis, companies } from './shared/schema';
import { eq, and } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

/**
 * Skript pro simulaci hovorů s využitím AI mezi klientem a obchodníkem
 * Simuluje různé prodejní situace včetně canvas anti-sale close techniky
 */

// Simulační scénáře
const CALL_SCENARIOS = [
  {
    name: "Canvas Anti-Sale Close",
    description: "Obchodník nejprve zdůrazní nevýhody produktu a pak získá klientovu důvěru",
    client_persona: "Skeptický zákazník, který má pochybnosti o stavebních službách",
    sales_goal: "Získat zakázku na rekonstrukci kuchyně",
    outcome: "Úspěšný"
  },
  {
    name: "Námitka na cenu",
    description: "Klient má námitky k ceně a obchodník používá techniku přerámování hodnoty",
    client_persona: "Cenově orientovaný zákazník, který srovnává s konkurencí",
    sales_goal: "Prodat prémiovou stavební službu bez snížení ceny",
    outcome: "Úspěšný"
  },
  {
    name: "Nerozhodný klient",
    description: "Klient nemůže učinit rozhodnutí a obchodník používá techniku omezené dostupnosti",
    client_persona: "Nerozhodný klient, který stále odkládá finální rozhodnutí",
    sales_goal: "Uzavřít smlouvu na stavební projekt",
    outcome: "Částečně úspěšný"
  }
];

// Připravené dialogy
const getSimulatedDialogs = (scenario: typeof CALL_SCENARIOS[0]) => {
  if (scenario.name === "Canvas Anti-Sale Close") {
    return [
      { speaker: "obchodník", text: "Dobrý den, tady Novák z BigBuild. Mluvím s panem Horákem?" },
      { speaker: "klient", text: "Ano, u telefonu." },
      { speaker: "obchodník", text: "Pane Horáku, voláme vám ohledně té rekonstrukce kuchyně, o kterou jste projevil zájem. Ale musím být upřímný - naše služby patří k těm dražším na trhu." },
      { speaker: "klient", text: "Hmm, to není ideální. Snažím se držet rozpočet." },
      { speaker: "obchodník", text: "Rozumím tomu. Navíc musím upozornit, že kompletní rekonstrukce znamená obvykle 2-3 týdny, kdy kuchyň nebude plně funkční. Mnoho klientů to vnímá jako komplikaci." },
      { speaker: "klient", text: "To je pravda, to by byl problém..." },
      { speaker: "obchodník", text: "A ještě jedna věc - některé materiály, které doporučujeme, vyžadují speciální údržbu. Není to pro každého." },
      { speaker: "klient", text: "Teď jste mě překvapil. Většinou se mi snaží firmy prodat své služby a vy mi říkáte důvody, proč bych si vás neměl najmout." },
      { speaker: "obchodník", text: "Víte, pane Horáku, věřím v transparentnost. Nechci, abyste měl nerealistická očekávání. Ale také vám chci říct, proč nás klienti i přes tyto 'nevýhody' vyhledávají." },
      { speaker: "klient", text: "Takže jaké jsou výhody?" },
      { speaker: "obchodník", text: "Každý projekt dokončujeme přesně v termínu. Během práce maximálně respektujeme váš domov - denně uklízíme a minimalizujeme prach. A to nejdůležitější - naše kuchyně vydrží v perfektním stavu nejméně 15 let, což vám dlouhodobě ušetří peníze." },
      { speaker: "klient", text: "To zní zajímavě... Můžete mi říct něco víc o tom, jak minimalizujete nepohodlí během rekonstrukce?" },
      { speaker: "obchodník", text: "Samozřejmě. Instalujeme provizorní kuchyňský kout s mikrovlnkou, varnou deskou a lednicí. Navíc práce plánujeme tak, aby voda a elektřina byly odpojeny jen na nezbytně nutnou dobu." },
      { speaker: "klient", text: "To je promyšlené. Začínám chápat, proč si účtujete vyšší ceny." },
      { speaker: "obchodník", text: "Přesně tak. Neplatíte jen za materiál a práci, ale za komplexní službu a klidný průběh rekonstrukce. Kdy by vám vyhovovala osobní schůzka, abychom probrali detaily?" },
      { speaker: "klient", text: "Řekněme příští středu odpoledne? A mohl byste mi do té doby poslat nějaké portfolio vašich dokončených kuchyní?" },
      { speaker: "obchodník", text: "Středa je perfektní. Portfolio vám pošlu ještě dnes emailem. Děkuji za váš čas, pane Horáku, a těším se na setkání." },
      { speaker: "klient", text: "Já také, na shledanou." }
    ];
  } else if (scenario.name === "Námitka na cenu") {
    return [
      { speaker: "obchodník", text: "Dobrý den, tady Novotný z BigBuild. Mohu mluvit s paní Dvořákovou?" },
      { speaker: "klient", text: "Ano, u telefonu." },
      { speaker: "obchodník", text: "Paní Dvořáková, volám ohledně vašeho zájmu o renovaci koupelny. Jak se vám líbil náš návrh, který jsme vám zaslali?" },
      { speaker: "klient", text: "Návrh vypadá skvěle, ale ta cena... Je výrazně vyšší než nabídky, které mám od jiných firem." },
      { speaker: "obchodník", text: "Rozumím vašim obavám ohledně ceny. Mohu se zeptat, s jakými konkrétními nabídkami naši cenu srovnáváte?" },
      { speaker: "klient", text: "Mám nabídku od Stavby XY, která je o 20% levnější, a také od Rekonstrukce ABC, ta je levnější asi o 15%." },
      { speaker: "obchodník", text: "Děkuji za upřímnost. Mohu se zeptat, zahrnují ty nabídky také hydroizolaci pod dlažbou v celé ploše koupelny?" },
      { speaker: "klient", text: "To vlastně nevím, to by museli upřesnit..." },
      { speaker: "obchodník", text: "A zmiňují se o použití prvotřídních materiálů s 10letou zárukou? Nebo o instalaci odvětrávacího systému proti plísním?" },
      { speaker: "klient", text: "Ne, tyto detaily tam nebyly uvedeny." },
      { speaker: "obchodník", text: "Vidíte, paní Dvořáková, to je přesně ten rozdíl. My nenabízíme jen koupelnu, ale komplexní řešení, které vám ušetří starosti na mnoho let dopředu. Když započítáte náklady na opravy a údržbu, které u levnějších variant pravděpodobně budete muset řešit, naše nabídka je ve skutečnosti ekonomičtější volbou." },
      { speaker: "klient", text: "To dává smysl, ale přesto je to velká investice..." },
      { speaker: "obchodník", text: "Naprosto chápu. Proto nabízíme také možnost splátkového kalendáře bez navýšení. A co je důležité - garantujeme dokončení v termínu, nebo vám za každý den zpoždění odečteme 2% z celkové ceny." },
      { speaker: "klient", text: "To zní jako férová nabídka." },
      { speaker: "obchodník", text: "Navíc, naše koupelny zvyšují hodnotu nemovitosti v průměru o 1,5násobek investice. Je to tedy také investice do hodnoty vašeho domova." },
      { speaker: "klient", text: "To jsem nevěděla. Můžete mi poslat nějaké reference od vašich klientů?" },
      { speaker: "obchodník", text: "Samozřejmě. Mám zde kontakt na paní Novákovou, která měla podobné obavy jako vy, a nyní nám doporučuje své přátele. S vaším svolením jí řeknu, že se možná ozvete?" },
      { speaker: "klient", text: "Ano, to by bylo užitečné. Děkuji vám za vysvětlení." },
      { speaker: "obchodník", text: "Není zač. Ještě dnes vám pošlu upravený návrh a kontakt na referenci. Kdy vám můžu zavolat příští týden, abychom probrali případné další otázky?" },
      { speaker: "klient", text: "Čtvrtek odpoledne by mi vyhovoval." },
      { speaker: "obchodník", text: "Perfektní, děkuji za váš čas a ve čtvrtek se ozvu. Na shledanou." },
      { speaker: "klient", text: "Na shledanou." }
    ];
  } else {
    return [
      { speaker: "obchodník", text: "Dobrý den, tady Svoboda z BigBuild. Mluvím s panem Němcem?" },
      { speaker: "klient", text: "Ano, to jsem já." },
      { speaker: "obchodník", text: "Pane Němče, volám ohledně vašeho zájmu o přístavbu garáže, o kterou jste u nás žádal před dvěma týdny." },
      { speaker: "klient", text: "Ano, vzpomínám si. Ještě jsem se ale nerozhodl, stále zvažuji různé možnosti." },
      { speaker: "obchodník", text: "Rozumím. V jakém bodě rozhodovacího procesu se právě nacházíte? Co vám nejvíce brání učinit rozhodnutí?" },
      { speaker: "klient", text: "Upřímně, nemám jasno v tom, jestli investovat do přístavby, nebo raději postavit samostatnou garáž. A trochu mě děsí představa stavby - hluk, nepořádek, a tak dále." },
      { speaker: "obchodník", text: "To jsou naprosto legitimní obavy. Co se týče typu garáže, oba přístupy mají své výhody. Ale chci vás upozornit, že máme aktuálně poslední volný termín pro realizaci na podzim. Od října budeme plně vytíženi až do jara." },
      { speaker: "klient", text: "Opravdu? To mě překvapuje." },
      { speaker: "obchodník", text: "Ano, před 20 minutami jsme obsadili předposlední volný termín. Abych vám pomohl s rozhodnutím - co by pro vás bylo horší: začít stavět v nevhodnou dobu, nebo udělat menší kompromisy v designu?" },
      { speaker: "klient", text: "Určitě to první. Nechci, aby se stavba protáhla přes zimu." },
      { speaker: "obchodník", text: "V tom případě doporučuji rezervovat termín nyní. Návrh můžeme ještě upravovat, ale termín už zajistit nedokážeme, pokud nám ho někdo obsadí." },
      { speaker: "klient", text: "No... ještě bych si to potřeboval promyslet." },
      { speaker: "obchodník", text: "Samozřejmě. Co kdybychom termín nezávazně rezervovali na 48 hodin? Pokud se nerozhodnete, jednoduše rezervaci zrušíme. Ale budete mít jistotu, že o termín nepřijdete." },
      { speaker: "klient", text: "To zní rozumně. A mohl bych do zítřka dostat ještě nějaké informace ohledně těch obav z průběhu stavby?" },
      { speaker: "obchodník", text: "Určitě ano. Připravím vám detailní harmonogram a také způsob, jakým minimalizujeme dopad na váš každodenní život. Většina našich klientů je překvapena, jak hladce celý proces probíhá." },
      { speaker: "klient", text: "Dobře, souhlasím s tou dočasnou rezervací." },
      { speaker: "obchodník", text: "Výborně. Rezervaci jsem zadal do systému a do zítřejšího večera vám pošlu slíbené materiály. Mohu vám pak zavolat v pátek dopoledne?" },
      { speaker: "klient", text: "Ano, to by šlo." },
      { speaker: "obchodník", text: "Skvělé. Děkuji za váš čas a těším se na náš páteční hovor." },
      { speaker: "klient", text: "Děkuji, na shledanou." }
    ];
  }
};

async function simulateAiCall() {
  console.log('Zahajuji AI simulaci hovoru...');
  
  try {
    // 1. Najdeme BigBuild společnost
    const bigBuildCompany = await db.query.companies.findFirst({
      where: eq(companies.name, 'BigBuild')
    });
    
    if (!bigBuildCompany) {
      throw new Error('BigBuild společnost nebyla nalezena! Použijte skript create-bigbuild-company.ts k vytvoření.');
    }
    
    console.log(`Nalezena společnost BigBuild s ID: ${bigBuildCompany.id}`);
    
    // 2. Získání operátorů (obchodníků) pro BigBuild
    const operators = await db.select().from(users).where(eq(users.companyId, bigBuildCompany.id));
    if (operators.length === 0) {
      throw new Error('Nebyli nalezeni žádní operátoři pro BigBuild!');
    }
    
    // 3. Získání klientů pro simulaci
    const allClients = await db.select().from(clients).where(eq(clients.companyId, bigBuildCompany.id));
    if (allClients.length === 0) {
      throw new Error('Nebyli nalezeni žádní klienti pro BigBuild!');
    }
    
    // 4. Vybrat náhodný scénář
    const scenario = CALL_SCENARIOS[Math.floor(Math.random() * CALL_SCENARIOS.length)];
    console.log(`Vybrán scénář: ${scenario.name}`);
    
    // 5. Vybrat operátora a klienta pro hovor
    const operator = operators[Math.floor(Math.random() * operators.length)];
    const client = allClients[Math.floor(Math.random() * allClients.length)];
    
    console.log(`Operátor: ${operator.firstName} ${operator.lastName}`);
    console.log(`Klient: ${client.firstName} ${client.lastName}`);
    
    // 6. Vytvoření aktivního hovoru
    console.log(`Vytváření hovoru: operátor ${operator.firstName} ${operator.lastName} volá klientovi ${client.firstName} ${client.lastName}`);
    
    const sessionId = `ai-sim-${Date.now()}`;
    const startTime = new Date();
    
    // Vložení záznamu o hovoru
    const liveCallResult = await db.insert(liveCallSessions).values({
      sessionId,
      companyId: bigBuildCompany.id,
      userId: operator.id,
      clientId: client.id,
      status: 'active',
      startTime,
      recordingStatus: 'recording',
      metadata: {
        scenario: scenario.name,
        description: scenario.description,
        clientPersona: scenario.client_persona,
        salesGoal: scenario.sales_goal
      }
    }).returning({ id: liveCallSessions.id });
    
    const callSessionId = liveCallResult[0].id;
    console.log(`Hovor vytvořen s ID: ${callSessionId}, sessionId: ${sessionId}`);
    
    // 7. Simulace dialogu a analýzy emocí
    console.log('Simulace průběhu hovoru a analýzy emocí klienta...');
    
    const dialogs = getSimulatedDialogs(scenario);
    const emotionStates = [
      'neutral', 'interest', 'confusion', 'positive', 'negative', 'surprise'
    ];
    
    // Vytvoření adresáře pro transkript, pokud neexistuje
    const transcriptsDir = path.join(__dirname, 'data', 'transcripts');
    if (!fs.existsSync(transcriptsDir)) {
      fs.mkdirSync(transcriptsDir, { recursive: true });
    }
    
    // Vytvoření souboru s transkripcí
    const transcriptPath = path.join(transcriptsDir, `call-${sessionId}.txt`);
    const transcriptStream = fs.createWriteStream(transcriptPath);
    
    transcriptStream.write(`Transkript hovoru: ${scenario.name}\n`);
    transcriptStream.write(`Datum: ${startTime.toLocaleString()}\n`);
    transcriptStream.write(`Operátor: ${operator.firstName} ${operator.lastName}\n`);
    transcriptStream.write(`Klient: ${client.firstName} ${client.lastName}\n\n`);
    transcriptStream.write(`Popis scénáře: ${scenario.description}\n`);
    transcriptStream.write(`Persona klienta: ${scenario.client_persona}\n`);
    transcriptStream.write(`Prodejní cíl: ${scenario.sales_goal}\n\n`);
    transcriptStream.write("=== ZAČÁTEK HOVORU ===\n\n");
    
    let timeOffset = 0;
    
    // Zpracování každé repliky v dialogu
    for (let i = 0; i < dialogs.length; i++) {
      const dialog = dialogs[i];
      const speakerPrefix = dialog.speaker === 'obchodník' ? `${operator.firstName}:` : `${client.firstName}:`;
      
      // Zápis do transkriptu
      transcriptStream.write(`[${new Date(startTime.getTime() + timeOffset * 1000).toISOString().substr(11, 8)}] ${speakerPrefix} ${dialog.text}\n`);
      
      // Vložení analýzy emocí pokud je mluvčí klient
      if (dialog.speaker === 'klient') {
        // Určení emoce na základě textu a kontextu
        let emotion = 'neutral';
        let confidence = 0.7 + Math.random() * 0.25; // Náhodná jistota mezi 0.7 a 0.95
        
        // Jednoduchá detekce emoce na základě klíčových slov
        const text = dialog.text.toLowerCase();
        if (text.includes('skvělé') || text.includes('perfektní') || text.includes('děkuji') || text.includes('výborně')) {
          emotion = 'positive';
          confidence = 0.85 + Math.random() * 0.1;
        } else if (text.includes('problém') || text.includes('drahé') || text.includes('vysoká cena') || text.includes('obavám')) {
          emotion = 'negative';
          confidence = 0.8 + Math.random() * 0.15;
        } else if (text.includes('překvapuje') || text.includes('opravdu') || text.includes('nevěděla')) {
          emotion = 'surprise';
          confidence = 0.75 + Math.random() * 0.2;
        } else if (text.includes('rozumně') || text.includes('smysl') || text.includes('chápu')) {
          emotion = 'interest';
          confidence = 0.8 + Math.random() * 0.15;
        } else if (text.includes('nevím') || text.includes('nejasno') || text.includes('nebyly uvedeny')) {
          emotion = 'confusion';
          confidence = 0.75 + Math.random() * 0.2;
        }
        
        // Vložit analýzu emoce do databáze
        await db.insert(callEmotionAnalysis).values({
          sessionId: callSessionId,
          timestamp: new Date(startTime.getTime() + timeOffset * 1000),
          emotion,
          confidence,
          notes: `Detekovaná emoce: ${emotion} (${Math.round(confidence * 100)}%)`,
          processed: true
        });
        
        // Zápis analýzy emoce do transkriptu
        transcriptStream.write(`   [Analýza emoce: ${emotion}, jistota: ${Math.round(confidence * 100)}%]\n`);
      }
      
      // Posun času
      timeOffset += Math.floor(5 + Math.random() * 10); // 5-15 sekund mezi replikami
    }
    
    transcriptStream.write("\n=== KONEC HOVORU ===\n\n");
    transcriptStream.write(`Výsledek: ${scenario.outcome}\n`);
    transcriptStream.end();
    
    // 8. Ukončení hovoru
    const callDuration = timeOffset;
    const endTime = new Date(startTime.getTime() + callDuration * 1000);
    
    await db.update(liveCallSessions)
      .set({
        status: 'completed',
        endTime,
        duration: callDuration,
        recordingStatus: 'completed',
        recordingUrl: `https://example.com/recordings/simulated-${sessionId}.mp3`,
        notes: `Simulovaný AI hovor: ${scenario.name}. Výsledek: ${scenario.outcome}. Transkript uložen.`,
        metadata: {
          scenario: scenario.name,
          description: scenario.description,
          clientPersona: scenario.client_persona,
          salesGoal: scenario.sales_goal,
          outcome: scenario.outcome,
          transcriptPath: transcriptPath
        }
      })
      .where(eq(liveCallSessions.id, callSessionId));
    
    console.log(`Hovor byl úspěšně ukončen po ${callDuration} sekundách.`);
    console.log(`Transkript uložen do: ${transcriptPath}`);
    console.log('Simulace hovoru dokončena!');
    
  } catch (error) {
    console.error('Chyba při simulaci hovoru:', error);
  }
}

simulateAiCall();