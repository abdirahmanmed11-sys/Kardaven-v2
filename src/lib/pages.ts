import type { Lang } from "./i18n";

export type PageKey = "settings" | "contact" | "about" | "help" | "privacy" | "terms";
type Block = { h: string; p: string };
type Page = { title: string; intro: string; blocks: Block[] };

/** Menu pages content (en/fr). Contact details are placeholders until the owner provides real ones. */
export const PAGES: Record<Lang, Record<PageKey, Page>> = {
  en: {
    settings: { title: "Settings", intro: "Manage your app preferences.", blocks: [
      { h: "Language", p: "Switch between English and French with the EN / FR button at the top." },
      { h: "Account", p: "Sign in or sign out from your Profile page." },
      { h: "Notifications", p: "Notification settings are coming later." },
    ] },
    contact: { title: "Contact us", intro: "Questions, ideas or a problem? We read every message.", blocks: [
      { h: "Email", p: "contact@kardaven.app (sample address)" },
      { h: "Response time", p: "We usually answer within 48 hours." },
    ] },
    about: { title: "About KARDAVEN", intro: "One platform where people and AI turn problems into progress.", blocks: [
      { h: "Our mission", p: "Help anyone share a problem, get answers from the community and AI, and move to real results." },
    ] },
    help: { title: "Help & FAQ", intro: "Quick answers to common questions.", blocks: [
      { h: "How do I post a problem?", p: "Tap the + button at the bottom, describe it, and publish." },
      { h: "How do I create a community?", p: "Go to Community and tap Create. You'll get the verified founder badge." },
      { h: "Is the AI real?", p: "AI answers are simulated for now." },
    ] },
    privacy: { title: "Privacy", intro: "How we treat your information.", blocks: [
      { h: "Your data", p: "For now your posts and communities are saved only on your device." },
    ] },
    terms: { title: "Terms of use", intro: "Basic rules for using KARDAVEN.", blocks: [
      { h: "Be respectful", p: "No harassment, spam or illegal content." },
    ] },
  },
  fr: {
    settings: { title: "Paramètres", intro: "Gérez vos préférences.", blocks: [
      { h: "Langue", p: "Changez entre anglais et français avec le bouton EN / FR en haut." },
      { h: "Compte", p: "Connectez-vous ou déconnectez-vous depuis votre Profil." },
      { h: "Notifications", p: "Les réglages de notifications arrivent bientôt." },
    ] },
    contact: { title: "Nous contacter", intro: "Une question, une idée ou un souci ? Nous lisons chaque message.", blocks: [
      { h: "E-mail", p: "contact@kardaven.app (adresse d'exemple)" },
      { h: "Délai de réponse", p: "Nous répondons en général sous 48 heures." },
    ] },
    about: { title: "À propos de KARDAVEN", intro: "Une plateforme où les gens et l'IA transforment les problèmes en progrès.", blocks: [
      { h: "Notre mission", p: "Permettre à chacun de partager un problème, recevoir l'aide de la communauté et de l'IA, et obtenir de vrais résultats." },
    ] },
    help: { title: "Aide & FAQ", intro: "Réponses rapides aux questions fréquentes.", blocks: [
      { h: "Comment publier un problème ?", p: "Touchez le bouton + en bas, décrivez-le et publiez." },
      { h: "Comment créer une communauté ?", p: "Allez dans Communauté et touchez Créer. Vous recevez le badge fondateur vérifié." },
      { h: "L'IA est-elle réelle ?", p: "Les réponses de l'IA sont simulées pour l'instant." },
    ] },
    privacy: { title: "Confidentialité", intro: "Comment nous traitons vos informations.", blocks: [
      { h: "Vos données", p: "Pour l'instant, vos publications et communautés restent sur votre appareil." },
    ] },
    terms: { title: "Conditions d'utilisation", intro: "Règles de base de KARDAVEN.", blocks: [
      { h: "Respect", p: "Pas de harcèlement, de spam ni de contenu illégal." },
    ] },
  },
};
