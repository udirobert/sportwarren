/**
 * notify-i18n.ts — locale-keyed notification copy.
 *
 * The last un-localized fan surface: milestone/moment copy was hardcoded
 * English. Locale comes from `PlatformIdentity.locale` (user-set via
 * Settings → Notifications; null → 'en'). Templates are per-locale
 * functions so pluralisation stays honest later — never string-splice.
 *
 * Scope note: only notification *copy* is localized. Numbers, names and
 * emoji are left verbatim; Telegram Markdown (*bold*) survives translation.
 */

import type { MilestoneHint } from './twin-types';

export const NOTIFY_LOCALES = ['en', 'es', 'fr', 'pt', 'de', 'sw', 'ha', 'yo', 'zu'] as const;
export type NotifyLocale = (typeof NOTIFY_LOCALES)[number];

/** Normalize any BCP-47-ish tag ('es-MX', 'es_mx') to a supported locale. */
export function resolveLocale(raw: string | null | undefined): NotifyLocale {
  const tag = (raw ?? '').toLowerCase().split(/[-_]/)[0];
  return (NOTIFY_LOCALES as readonly string[]).includes(tag)
    ? (tag as NotifyLocale)
    : 'en';
}

const SUBJECTS: Record<NotifyLocale, { player: string; squad: string }> = {
  en: { player: 'Your twin', squad: 'Your squad twin' },
  es: { player: 'Tu gemelo', squad: 'El gemelo de tu equipo' },
  fr: { player: 'Ton jumeau', squad: 'Le jumeau de ton équipe' },
  pt: { player: 'Seu gêmeo', squad: 'O gêmeo do seu time' },
  de: { player: 'Dein Zwilling', squad: 'Der Zwilling deines Teams' },
  sw: { player: 'Pacha yako', squad: 'Pacha ya kikosi chako' },
  ha: { player: 'Taguwar ka', squad: 'Taguwar ƙungiyar ka' },
  yo: { player: 'Ibeji rẹ', squad: 'Ibeji ẹgbẹ rẹ' },
  zu: { player: 'Iwele lakho', squad: 'Iwele leqembu lakho' },
};

function subject(locale: NotifyLocale, scope: 'player' | 'squad'): string {
  return SUBJECTS[locale][scope];
}

type Level = string | number | '?';
const levelOf = (m: MilestoneHint): Level => (m.payload as { to?: string | number })?.to ?? '?';

type MilestoneTemplate = (subject: string, level: Level) => string;

const TELEGRAM_TEMPLATES: Record<NotifyLocale, Record<string, MilestoneTemplate>> = {
  en: {
    twin_created: s => `🎮 *${s} just woke up*\nTime to train.`,
    level_up: (s, l) => `📈 *Level up!*\n${s} reached L${l}.`,
    sim_win: s => `🏆 *Sim champion*\n${s} won the tournament.`,
    sim_podium: s => `🥉 *Sim podium*\n${s} placed in the top 3.`,
    attestation_milestone: s => `✅ *Attestation milestone*\n${s} crossed a verification threshold.`,
    record_broken: s => `🔥 *Record broken*\n${s} set a new record.`,
    season_end: s => `🏁 *Season complete*\n${s} closed the season.`,
    coaching_expired: () => `⏰ *Coaching ended*\nA coaching boost has expired.`,
    default: s => `⭐ *Milestone*\n${s} hit a milestone.`,
  },
  es: {
    twin_created: s => `🎮 *${s} acaba de despertar*\nHora de entrenar.`,
    level_up: (s, l) => `📈 *¡Subiste de nivel!*\n${s} alcanzó el nivel ${l}.`,
    sim_win: s => `🏆 *Campeón del sim*\n${s} ganó el torneo.`,
    sim_podium: s => `🥉 *Podio del sim*\n${s} quedó entre los 3 primeros.`,
    attestation_milestone: s => `✅ *Hito de atestación*\n${s} superó un umbral de verificación.`,
    record_broken: s => `🔥 *Récord batido*\n${s} estableció un nuevo récord.`,
    season_end: s => `🏁 *Temporada completa*\n${s} cerró la temporada.`,
    coaching_expired: () => `⏰ *Entrenamiento terminado*\nUn impulso de entrenamiento ha expirado.`,
    default: s => `⭐ *Hito*\n${s} alcanzó un hito.`,
  },
  fr: {
    twin_created: s => `🎮 *${s} vient de se réveiller*\nÀ l'entraînement.`,
    level_up: (s, l) => `📈 *Niveau supérieur !*\n${s} a atteint le niveau ${l}.`,
    sim_win: s => `🏆 *Champion de la sim*\n${s} a remporté le tournoi.`,
    sim_podium: s => `🥉 *Podium de la sim*\n${s} a fini dans le top 3.`,
    attestation_milestone: s => `✅ *Jalon d'attestation*\n${s} a franchi un seuil de vérification.`,
    record_broken: s => `🔥 *Record battu*\n${s} a établi un nouveau record.`,
    season_end: s => `🏁 *Saison terminée*\n${s} a clôturé la saison.`,
    coaching_expired: () => `⏰ *Coaching terminé*\nUn boost de coaching a expiré.`,
    default: s => `⭐ *Jalon*\n${s} a atteint un jalon.`,
  },
  pt: {
    twin_created: s => `🎮 *${s} acabou de acordar*\nHora de treinar.`,
    level_up: (s, l) => `📈 *Subiu de nível!*\n${s} chegou ao nível ${l}.`,
    sim_win: s => `🏆 *Campeão da sim*\n${s} venceu o torneio.`,
    sim_podium: s => `🥉 *Pódio da sim*\n${s} ficou entre os 3 primeiros.`,
    attestation_milestone: s => `✅ *Marco de atestação*\n${s} ultrapassou um limiar de verificação.`,
    record_broken: s => `🔥 *Recorde quebrado*\n${s} estabeleceu um novo recorde.`,
    season_end: s => `🏁 *Temporada completa*\n${s} encerrou a temporada.`,
    coaching_expired: () => `⏰ *Treino encerrado*\nUm impulso de treino expirou.`,
    default: s => `⭐ *Marco*\n${s} atingiu um marco.`,
  },
  de: {
    twin_created: s => `🎮 *${s} ist gerade aufgewacht*\nZeit zu trainieren.`,
    level_up: (s, l) => `📈 *Level aufgestiegen!*\n${s} hat Level ${l} erreicht.`,
    sim_win: s => `🏆 *Sim-Champion*\n${s} hat das Turnier gewonnen.`,
    sim_podium: s => `🥉 *Sim-Podium*\n${s} landete in den Top 3.`,
    attestation_milestone: s => `✅ *Attestierungs-Meilenstein*\n${s} hat eine Verifikationsschwelle überschritten.`,
    record_broken: s => `🔥 *Rekord gebrochen*\n${s} hat einen neuen Rekord aufgestellt.`,
    season_end: s => `🏁 *Saison komplett*\n${s} hat die Saison abgeschlossen.`,
    coaching_expired: () => `⏰ *Coaching beendet*\nEin Coaching-Boost ist abgelaufen.`,
    default: s => `⭐ *Meilenstein*\n${s} hat einen Meilenstein erreicht.`,
  },
  sw: {
    twin_created: s => `🎮 *${s} imeamka*\nWakati wa mazoezi.`,
    level_up: (s, l) => `📈 *Umeongezeka kiwango!*\n${s} imefika kiwango ${l}.`,
    sim_win: s => `🏆 *Bingwa wa sim*\n${s} imeshinda mashindano.`,
    sim_podium: s => `🥉 *Podium ya sim*\n${s} imefika nafasi 3 bora.`,
    attestation_milestone: s => `✅ *Hatua ya uthibitisho*\n${s} imevuka kizingiti cha uthibitishaji.`,
    record_broken: s => `🔥 *Rekodi imevunjwa*\n${s} imeweka rekodi mpya.`,
    season_end: s => `🏁 *Msimu umekamilika*\n${s} imefunga msimu.`,
    coaching_expired: () => `⏰ *Ukocha umekwisha*\nOngezeko la ukocha limekwisha muda.`,
    default: s => `⭐ *Hatua*\n${s} imefikia hatua.`,
  },
  ha: {
    twin_created: s => `🎮 *${s} ta farka*\nLokacin horo ne.`,
    level_up: (s, l) => `📈 *An hau mataki!*\n${s} ta isa mataki ${l}.`,
    sim_win: s => `🏆 *Zakara na sim*\n${s} ta ci gasar.`,
    sim_podium: s => `🥉 *Podium na sim*\n${s} ta shiga cikin 3 na farko.`,
    attestation_milestone: s => `✅ *Matakin tabbaci*\n${s} ta wuce iyakar tabbatarwa.`,
    record_broken: s => `🔥 *An karya rikodi*\n${s} ta kafa sabon rikodi.`,
    season_end: s => `🏁 *Kakar ta kare*\n${s} ta kammala kakar.`,
    coaching_expired: () => `⏰ *Horo ya kare*\nWani ƙarin horo ya ƙare.`,
    default: s => `⭐ *Mataki*\n${s} ta isa wani mataki.`,
  },
  yo: {
    twin_created: s => `🎮 *${s} jí*\nÀkókò ikẹkọ ni.`,
    level_up: (s, l) => `📈 *Ipele tuntun!*\n${s} ti dé ipele ${l}.`,
    sim_win: s => `🏆 *Aṣíwájú sim*\n${s} borí ìdíje náà.`,
    sim_podium: s => `🥉 *Podium sim*\n${s} wá lára àwọn mẹ́ta àkókọ́.`,
    attestation_milestone: s => `✅ *Ìfìdájọ́ ńlá*\n${s} ti kọjá ààlà ìfìdájọ́.`,
    record_broken: s => `🔥 *Ìgbasilẹ̀ tuntun*\n${s} ṣe ìgbasilẹ̀ tuntun.`,
    season_end: s => `🏁 *Ìgbà parí*\n${s} ti parí ìgbà náà.`,
    coaching_expired: () => `⏰ *Ikẹkọ parí*\nÌfikún ikẹkọ kan ti parí.`,
    default: s => `⭐ *Iṣẹ́lẹ̀*\n${s} dé iṣẹ́lẹ̀ pàtàkì kan.`,
  },
  zu: {
    twin_created: s => `🎮 *${s} selivuke*\nIsikhathi sokuqeqesha.`,
    level_up: (s, l) => `📈 *Izinga eliphakeme!*\n${s} lifiké kwizinga ${l}.`,
    sim_win: s => `🏆 *Unqoba sim*\n${s} liwine umqhudelwano.`,
    sim_podium: s => `🥉 *Ipodium ye-sim*\n${s} lafinyelela ema-3 aphezulu.`,
    attestation_milestone: s => `✅ *Imilestone yokuqinisekisa*\n${s} lidlulele emngcelweni wokuqinisekisa.`,
    record_broken: s => `🔥 *Irekhodi lephuliwe*\n${s} lishaye irekhodi elisha.`,
    season_end: s => `🏁 *Isizini isiphelile*\n${s} livale isizini.`,
    coaching_expired: () => `⏰ *Ukuqeqeshwa kuphelile*\nInhlalakahle yokuqeqeshwa iphelile.`,
    default: s => `⭐ *Imilestone*\n${s} lifinyelele emilestone.`,
  },
};

const WHATSAPP_TEMPLATES: Record<NotifyLocale, Record<string, MilestoneTemplate>> = {
  en: {
    twin_created: s => `${s} just woke up. Time to train.`,
    level_up: (s, l) => `${s} leveled up — L${l}. Keep stacking.`,
    sim_win: s => `${s} won the sim. Receipt on chain, trophy in app.`,
    attestation_milestone: s => `${s} crossed a milestone. Reputation growing.`,
    record_broken: s => `${s} broke a record. The timeline is watching.`,
    season_end: s => `${s} closed the season. Receipts are live.`,
    default: s => `${s} hit a milestone.`,
  },
  es: {
    twin_created: s => `${s} acaba de despertar. Hora de entrenar.`,
    level_up: (s, l) => `${s} subió de nivel — nivel ${l}. Sigue sumando.`,
    sim_win: s => `${s} ganó la sim. Recibo en cadena, trofeo en la app.`,
    attestation_milestone: s => `${s} superó un hito. La reputación crece.`,
    record_broken: s => `${s} batió un récord. La cronología lo está viendo.`,
    season_end: s => `${s} cerró la temporada. Los recibos están en vivo.`,
    default: s => `${s} alcanzó un hito.`,
  },
  fr: {
    twin_created: s => `${s} vient de se réveiller. À l'entraînement.`,
    level_up: (s, l) => `${s} a gagné un niveau — niveau ${l}. Continue.`,
    sim_win: s => `${s} a remporté la sim. Reçu on-chain, trophée dans l'app.`,
    attestation_milestone: s => `${s} a franchi un jalon. La réputation grandit.`,
    record_broken: s => `${s} a battu un record. La timeline regarde.`,
    season_end: s => `${s} a clôturé la saison. Les reçus sont en ligne.`,
    default: s => `${s} a atteint un jalon.`,
  },
  pt: {
    twin_created: s => `${s} acabou de acordar. Hora de treinar.`,
    level_up: (s, l) => `${s} subiu de nível — nível ${l}. Continue assim.`,
    sim_win: s => `${s} venceu a sim. Recibo on-chain, troféu no app.`,
    attestation_milestone: s => `${s} ultrapassou um marco. A reputação cresce.`,
    record_broken: s => `${s} quebrou um recorde. A timeline está de olho.`,
    season_end: s => `${s} encerrou a temporada. Os recibos estão no ar.`,
    default: s => `${s} atingiu um marco.`,
  },
  de: {
    twin_created: s => `${s} ist gerade aufgewacht. Zeit zu trainieren.`,
    level_up: (s, l) => `${s} ist ein Level aufgestiegen — Level ${l}. Weiter so.`,
    sim_win: s => `${s} hat die Sim gewonnen. Beleg on-chain, Pokal in der App.`,
    attestation_milestone: s => `${s} hat einen Meilenstein überschritten. Reputation wächst.`,
    record_broken: s => `${s} hat einen Rekord gebrochen. Die Timeline schaut zu.`,
    season_end: s => `${s} hat die Saison abgeschlossen. Die Belege sind live.`,
    default: s => `${s} hat einen Meilenstein erreicht.`,
  },
  sw: {
    twin_created: s => `${s} imeamka. Wakati wa mazoezi.`,
    level_up: (s, l) => `${s} imepanda kiwango — kiwango ${l}. Endelea hivyo.`,
    sim_win: s => `${s} imeshinda sim. Risiti kwenye mnyororo, trofei kwenye app.`,
    attestation_milestone: s => `${s} imevuka hatua. Sifa inakua.`,
    record_broken: s => `${s} imevunja rekodi. Ratiba inaangalia.`,
    season_end: s => `${s} imefunga msimu. Risiti ziko tayari.`,
    default: s => `${s} imefikia hatua.`,
  },
  ha: {
    twin_created: s => `${s} ta farka. Lokacin horo ne.`,
    level_up: (s, l) => `${s} ta hau mataki — mataki ${l}. Ci gaba haka.`,
    sim_win: s => `${s} ta ci sim. Rasit a kan sarkar, kofi a app.`,
    attestation_milestone: s => `${s} ta wuce mataki. Suna yana ƙaruwa.`,
    record_broken: s => `${s} ta karya rikodi. Jadawalin yana kallo.`,
    season_end: s => `${s} ta kammala kakar. Rasitoci suna nan.`,
    default: s => `${s} ta isa wani mataki.`,
  },
  yo: {
    twin_created: s => `${s} jí. Àkókò ikẹkọ ni.`,
    level_up: (s, l) => `${s} ti gòkè ipele — ipele ${l}. Ṣi máa ṣe bẹ́ẹ̀.`,
    sim_win: s => `${s} borí sim náà. Ìgbasilẹ̀ lórí ìdíjà, àṣẹ̀yìn nínú app.`,
    attestation_milestone: s => `${s} ti kọjá ìpolówó kan. Òlá àsí rìn.`,
    record_broken: s => `${s} ṣe ìgbasilẹ̀ tuntun. Ìtàn ń wo ọ.`,
    season_end: s => `${s} ti parí ìgbà. Àwọn ìgbasilẹ̀ wà lórí ayélujára.`,
    default: s => `${s} dé iṣẹ́lẹ̀ pàtàkì kan.`,
  },
  zu: {
    twin_created: s => `${s} selivuke. Isikhathi sokuqeqesha.`,
    level_up: (s, l) => `${s} likhuphuke izinga — izinga ${l}. Qhubeka kanjalo.`,
    sim_win: s => `${s} liwine i-sim. Irisidi ku-chain, indondo ku-app.`,
    attestation_milestone: s => `${s} lidlulele emilestone. Idumeko liyakhula.`,
    record_broken: s => `${s} liphule irekhodi. Ithayimlayini iyabuka.`,
    season_end: s => `${s} livale isizini. Amarisidi akhona.`,
    default: s => `${s} lifinyelele emilestone.`,
  },
};

const MOMENT_FRAMES: Record<NotifyLocale, (subject: string, label: string) => string> = {
  en: (s, l) => `✨ *${l}*\n${s} unlocked a new moment.`,
  es: (s, l) => `✨ *${l}*\n${s} desbloqueó un nuevo momento.`,
  fr: (s, l) => `✨ *${l}*\n${s} a débloqué un nouveau moment.`,
  pt: (s, l) => `✨ *${l}*\n${s} desbloqueou um novo momento.`,
  de: (s, l) => `✨ *${l}*\n${s} hat einen neuen Moment freigeschaltet.`,
  sw: (s, l) => `✨ *${l}*\n${s} imefungua tukio jipya.`,
  ha: (s, l) => `✨ *${l}*\n${s} ta buɗe sabon loki.`,
  yo: (s, l) => `✨ *${l}*\n${s} ṣí iṣẹ́lẹ̀ tuntun kan.`,
  zu: (s, l) => `✨ *${l}*\n${s} livule okusha okukhangayo.`,
};

export function momentTelegramCopy(
  locale: NotifyLocale,
  scope: 'player' | 'squad',
  label: string,
): string {
  return MOMENT_FRAMES[locale](subject(locale, scope), label);
}

export function milestoneTelegramCopy(
  locale: NotifyLocale,
  scope: 'player' | 'squad',
  m: MilestoneHint,
): string {
  const table = TELEGRAM_TEMPLATES[locale];
  return (table[m.kind] ?? table.default)(subject(locale, scope), levelOf(m));
}

export function milestoneWhatsAppCopy(
  locale: NotifyLocale,
  scope: 'player' | 'squad',
  m: MilestoneHint,
): string {
  const table = WHATSAPP_TEMPLATES[locale];
  return (table[m.kind] ?? table.default)(subject(locale, scope), levelOf(m));
}
