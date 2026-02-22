import type { CharacterSkill } from "~~/shared/types/character";

type SuitSkills = { [suit in CharacterSuit]: CharacterSkill };

// === JACK ===

export const jackSuitSkills: SuitSkills = {
  hearts: {
    name: "Amabile",
    description:
      "Non puoi mai subire Danno o Affrontare il Destino in una Sfida di Cuori (♥).",
  },
  clubs: {
    name: "Imponente",
    description:
      "Una volta per missione, puoi intimidire un PNG che non sia un Bersaglio senza eseguire una Sfida.",
    uses: { usesLeft: 1, maxUses: 1 },
  },
  spades: {
    name: "Cambio di Strategia",
    description:
      "All'inizio di ogni sessione, prendi dal mazzo un Asso a tua scelta e Rubalo, poi rimescola il mazzo.",
  },
};

export const jackArchetypeSkills: CharacterSkill[] = [
  {
    name: "Dai Molti Talenti",
    description:
      "Quando esegui una Sfida, fallisci pescando la 5ª carta che non corrisponde al Seme, invece della 4ª.",
  },
  {
    name: "Riscuotere un Debito",
    description:
      "Una volta per missione, un altro giocatore può scartare la sua mano per evitare che tu subisca Danno. Perché ciò avvenga, è necessario scartare almeno una carta.",
    uses: { usesLeft: 1, maxUses: 1 },
  },
  {
    name: "Per un Pelo",
    description:
      "Una volta per campagna, trasforma un Fallimento ottenuto in una tua Sfida in un Successo. Perdi comunque tutte le carte pescate durante la Sfida, come in un Fallimento.",
    uses: { usesLeft: 1, maxUses: 1 },
  },
  {
    name: "Gioco di Squadra",
    description:
      "Tre volte per missione, Aiutare con successo un altro giocatore riduce il Livello di Difficoltà di 2 invece di 1.",
    uses: { usesLeft: 3, maxUses: 3 },
  },
  {
    name: "Pagare il Prezzo",
    description:
      "Aumenta permanentemente uno dei tuoi Modificatori Personali di 1, poi ottieni immediatamente 2 nuove Abilità che non riducono i tuoi Modificatori Personali.",
  },
  {
    name: "Abbastanza Stupido da Funzionare",
    description:
      "Una volta per missione, puoi posizionare la prima carta del mazzo nella Pila delle Opportunità Perdute per ottenere un Trionfo in una Sfida. I Personaggi possono comunque subire Danno. Questa Abilità non può essere usata contro i Bersagli.",
    uses: { usesLeft: 1, maxUses: 1 },
  },
  {
    name: "Per Precauzione",
    description:
      "Quando peschi la prima carta di una Sfida, pescane due, tienine una e Scarta l'altra. La carta scartata non ha effetto sulla Sfida.",
  },
];

// === QUEEN ===

export const queenSuitSkills: SuitSkills = {
  hearts: {
    name: "Aura di Comando",
    description:
      "Due volte per missione, puoi comandare a un PNG di fare qualcosa per te senza eseguire una Sfida. Non puoi usare questa Abilità contro un Bersaglio.",
    uses: { usesLeft: 2, maxUses: 2 },
  },
  clubs: {
    name: "Al Posto Tuo",
    description:
      "In qualsiasi momento, puoi scegliere di subire Danno al posto di un altro Personaggio.",
  },
  spades: {
    name: "Scorciatoia",
    description:
      "All'inizio di ogni missione, dopo che tutti gli altri hanno innescato le loro Abilità di inizio missione, cerca nel mazzo la tua Figura, mescola il mazzo e posiziona la tua Figura in cima.",
  },
};

export const queenArchetypeSkills: CharacterSkill[] = [
  {
    name: "Sacrificio",
    description:
      "Quando ottieni un Fallimento in una Sfida, puoi scartare una Figura usata nella Sfida e posizionare le altre carte nella Pila delle Opportunità Perdute o viceversa.",
  },
  {
    name: "Non oggi",
    description:
      "Quando ti Ritiri da una Sfida, considera tutte le carte per cui tiri come se il loro valore fosse più alto di 2.",
  },
  {
    name: "Affidabile",
    description:
      "Tre volte per missione, puoi Aiutare un altro giocatore senza eseguire una Sfida.",
    uses: { usesLeft: 3, maxUses: 3 },
  },
  {
    name: "Scudo",
    description:
      "Una volta per missione, puoi prendere le prime tre Carte Numerate della Pila degli Scarti e posizionarle nella Pila delle Opportunità Perdute per evitare di subire Danno.",
    uses: { usesLeft: 1, maxUses: 1 },
  },
  {
    name: "So Badare a Me",
    description:
      "Tre volte per missione, se nessuno ti offre il suo Aiuto, puoi ridurre di 1 il Livello di Difficoltà di una Sfida.",
    uses: { usesLeft: 3, maxUses: 3 },
  },
  {
    name: "In Serbo",
    description:
      "Tre volte per missione, puoi Rubare una Carta Numerata che andrebbe perduta durante una Sfida in cui un giocatore si è Ritirato. Puoi giocare queste carte solo durante le Sfide degli altri giocatori.",
    uses: { usesLeft: 3, maxUses: 3 },
  },
  {
    name: "Preveggente",
    description:
      "Tre volte per missione, puoi guardare la prima carta del mazzo durante la Sfida di un altro giocatore e comunicare di quale carta si tratta.",
    uses: { usesLeft: 3, maxUses: 3 },
  },
];

// === KING ===

export const kingSuitSkills: SuitSkills = {
  hearts: {
    name: "Infiltrati",
    description:
      "All'inizio di ogni missione, crea un PNG insieme al GM. Lo puoi incontrare durante la missione e ti deve un favore.",
  },
  clubs: {
    name: "Puntare Tutto",
    description:
      "Puoi giocare 5 carte dalla tua mano per ottenere un Successo Critico nella tua Sfida in corso. Non puoi usare questa Abilità contro un Bersaglio.",
  },
  spades: {
    name: "Posta in Gioco",
    description:
      "Dopo aver eseguito una Sfida, a prescindere dal risultato tira per qualsiasi carta che hai giocato dalla tua mano (come se ti fossi Ritirato). Invece di scartarle, riprendile in mano.",
  },
} as const;

export const kingArchetypeSkills: CharacterSkill[] = [
  {
    name: "Qualcosa in più",
    description:
      "Quando ottieni un Successo Critico in una Sfida, puoi Rubare fino a due Carte Numerate usate nella Sfida.",
  },
  {
    name: "Premio di Consolazione",
    description:
      "Quando ottieni un Fallimento in una Sfida, puoi Rubare una Carta Numerata usata nella Sfida.",
  },
  {
    name: "Piani ben Riusciti",
    description:
      "All'inizio di ogni missione, pesca dal mazzo fino a quando trovi due Carte Numerate quindi Rubale, poi rimescola il mazzo.",
  },
  {
    name: "Il Tocco Giusto",
    description:
      "Quando usi il tuo Strumento, il tuo peggior Modificatore Personale diventa 0. Se è già 0, diventa -1.",
  },
  {
    name: "Doppio Fondo",
    description:
      "Puoi occultare armi o strumenti che normalmente sarebbero troppo grandi per essere Occultati (se ha senso).",
  },
  {
    name: "Sempre sul Pezzo",
    description:
      "All'inizio di ogni missione, puoi scegliere un'arma o uno strumento aggiuntivo di qualsiasi dimensione che è stato nascosto nell'area in cui si trova il Bersaglio.",
  },
  {
    name: "Mi sei d'Intralcio",
    description:
      "Per il resto della campagna, non puoi Aiutare o essere Aiutato da nessun altro giocatore. Riduci permanentemente uno dei tuoi Modificatori Personali di 1, fino a un massimo di -2.",
  },
] as const;

export const modifiersSkills: CharacterSkill[] = [
  {
    name: "A Bit More Muscle",
    description:
      "Permanently reduce your Clubs personal modifier by 1, up to a maximum of -2.",
  },
  {
    name: "A Bit More Brain",
    description:
      "Permanently reduce your Hearts personal modifier by 1, up to a maximum of -2.",
  },
  {
    name: "A Bit More Balance",
    description:
      "Permanently reduce your Spades personal modifier by 1, up to a maximum of -2.",
  },
] as const;
