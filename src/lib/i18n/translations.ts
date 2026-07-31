/**
 * Internationalization Configuration
 * Supports: English, German, French, Spanish, Arabic (RTL)
 */

export const LOCALES = ['en', 'de', 'fr', 'es', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  ar: 'العربية',
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  en: '🇺🇸',
  de: '🇩🇪',
  fr: '🇫🇷',
  es: '🇪🇸',
  ar: '🇸🇦',
};

export const RTL_LOCALES = new Set<Locale>(['ar']);

export function isRTL(locale: Locale): boolean {
  return RTL_LOCALES.has(locale);
}

export function getDir(locale: Locale): 'ltr' | 'rtl' {
  return isRTL(locale) ? 'rtl' : 'ltr';
}

// Translation keys structure
export interface Messages {
  common: {
    loading: string;
    error: string;
    retry: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    close: string;
    back: string;
    next: string;
    submit: string;
    search: string;
    filter: string;
    clear: string;
    noResults: string;
    required: string;
    optional: string;
    copyToClipboard: string;
    copied: string;
  };
  nav: {
    home: string;
    plans: string;
    countries: string;
    about: string;
    contact: string;
    blog: string;
    faq: string;
    signIn: string;
    signOut: string;
    getStarted: string;
    dashboard: string;
  };
  auth: {
    login: {
      title: string;
      subtitle: string;
      emailLabel: string;
      passLabel: string;
      rememberMe: string;
      forgotPass: string;
      submitBtn: string;
      noAccount: string;
      createOne: string;
    };
    register: {
      title: string;
      subtitle: string;
      nameLabel: string;
      submitBtn: string;
      hasAccount: string;
      signIn: string;
    };
  };
  dashboard: {
    title: string;
    welcome: string;
    activeESIMs: string;
    totalOrders: string;
    notifications: string;
    dataUsed: string;
    buyPlan: string;
    viewAll: string;
  };
  plans: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    filterBy: string;
    sortBy: string;
    noPlansFound: string;
    clearFilters: string;
    getPlan: string;
    popular: string;
    bestValue: string;
    dataLabel: string;
    validityLabel: string;
    networkLabel: string;
    priceLabel: string;
  };
  esim: {
    status: {
      active: string;
      inactive: string;
      expired: string;
      pending: string;
    };
    dataRemaining: string;
    expiresOn: string;
    viewDetails: string;
    qrCode: string;
    activationCode: string;
    iccid: string;
  };
}

// English translations (primary)
export const en: Messages = {
  common: {
    loading: 'Loading…',
    error: 'An error occurred',
    retry: 'Try again',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    submit: 'Submit',
    search: 'Search',
    filter: 'Filter',
    clear: 'Clear',
    noResults: 'No results found',
    required: 'Required',
    optional: 'Optional',
    copyToClipboard: 'Copy to clipboard',
    copied: 'Copied!',
  },
  nav: {
    home: 'Home',
    plans: 'Plans',
    countries: 'Coverage',
    about: 'About',
    contact: 'Contact',
    blog: 'Blog',
    faq: 'FAQ',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    getStarted: 'Get Started',
    dashboard: 'Dashboard',
  },
  auth: {
    login: {
      title: 'Welcome back',
      subtitle: 'Sign in to manage your eSIMs',
      emailLabel: 'Email address',
      passLabel: 'Password',
      rememberMe: 'Remember me for 30 days',
      forgotPass: 'Forgot password?',
      submitBtn: 'Sign In',
      noAccount: "Don't have an account?",
      createOne: 'Create one free',
    },
    register: {
      title: 'Create your account',
      subtitle: 'Start connecting globally in minutes',
      nameLabel: 'Full Name',
      submitBtn: 'Create Account',
      hasAccount: 'Already have an account?',
      signIn: 'Sign in',
    },
  },
  dashboard: {
    title: 'Dashboard',
    welcome: 'Welcome back',
    activeESIMs: 'Active eSIMs',
    totalOrders: 'Total Orders',
    notifications: 'Notifications',
    dataUsed: 'Data Used',
    buyPlan: 'Buy Plan',
    viewAll: 'View all',
  },
  plans: {
    title: 'eSIM Plans',
    subtitle: 'Find the perfect data plan for your destination',
    searchPlaceholder: 'Search by country or region…',
    filterBy: 'Filter by',
    sortBy: 'Sort by',
    noPlansFound: 'No plans found',
    clearFilters: 'Clear Filters',
    getPlan: 'Get This Plan',
    popular: 'Popular',
    bestValue: 'Best Value',
    dataLabel: 'Data',
    validityLabel: 'Validity',
    networkLabel: 'Network',
    priceLabel: 'Price',
  },
  esim: {
    status: { active: 'Active', inactive: 'Inactive', expired: 'Expired', pending: 'Pending' },
    dataRemaining: 'Data remaining',
    expiresOn: 'Expires on',
    viewDetails: 'View Details',
    qrCode: 'QR Code',
    activationCode: 'Activation Code',
    iccid: 'ICCID',
  },
};

// German translations
export const de: Messages = {
  common: {
    loading: 'Lädt…',
    error: 'Ein Fehler ist aufgetreten',
    retry: 'Erneut versuchen',
    cancel: 'Abbrechen',
    save: 'Speichern',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    close: 'Schließen',
    back: 'Zurück',
    next: 'Weiter',
    submit: 'Absenden',
    search: 'Suchen',
    filter: 'Filtern',
    clear: 'Leeren',
    noResults: 'Keine Ergebnisse gefunden',
    required: 'Pflichtfeld',
    optional: 'Optional',
    copyToClipboard: 'In Zwischenablage kopieren',
    copied: 'Kopiert!',
  },
  nav: {
    home: 'Startseite',
    plans: 'Pläne',
    countries: 'Abdeckung',
    about: 'Über uns',
    contact: 'Kontakt',
    blog: 'Blog',
    faq: 'FAQ',
    signIn: 'Anmelden',
    signOut: 'Abmelden',
    getStarted: 'Loslegen',
    dashboard: 'Dashboard',
  },
  auth: {
    login: {
      title: 'Willkommen zurück',
      subtitle: 'Melden Sie sich an, um Ihre eSIMs zu verwalten',
      emailLabel: 'E-Mail-Adresse',
      passLabel: 'Passwort',
      rememberMe: '30 Tage angemeldet bleiben',
      forgotPass: 'Passwort vergessen?',
      submitBtn: 'Anmelden',
      noAccount: 'Noch kein Konto?',
      createOne: 'Kostenlos erstellen',
    },
    register: {
      title: 'Konto erstellen',
      subtitle: 'In Minuten weltweit verbunden sein',
      nameLabel: 'Vollständiger Name',
      submitBtn: 'Konto erstellen',
      hasAccount: 'Bereits ein Konto?',
      signIn: 'Anmelden',
    },
  },
  dashboard: {
    title: 'Dashboard',
    welcome: 'Willkommen zurück',
    activeESIMs: 'Aktive eSIMs',
    totalOrders: 'Bestellungen gesamt',
    notifications: 'Benachrichtigungen',
    dataUsed: 'Daten verbraucht',
    buyPlan: 'Plan kaufen',
    viewAll: 'Alle anzeigen',
  },
  plans: {
    title: 'eSIM-Pläne',
    subtitle: 'Finden Sie den perfekten Datenplan für Ihr Reiseziel',
    searchPlaceholder: 'Nach Land oder Region suchen…',
    filterBy: 'Filtern nach',
    sortBy: 'Sortieren nach',
    noPlansFound: 'Keine Pläne gefunden',
    clearFilters: 'Filter löschen',
    getPlan: 'Plan wählen',
    popular: 'Beliebt',
    bestValue: 'Bestes Angebot',
    dataLabel: 'Daten',
    validityLabel: 'Gültigkeit',
    networkLabel: 'Netzwerk',
    priceLabel: 'Preis',
  },
  esim: {
    status: { active: 'Aktiv', inactive: 'Inaktiv', expired: 'Abgelaufen', pending: 'Ausstehend' },
    dataRemaining: 'Verbleibende Daten',
    expiresOn: 'Läuft ab am',
    viewDetails: 'Details anzeigen',
    qrCode: 'QR-Code',
    activationCode: 'Aktivierungscode',
    iccid: 'ICCID',
  },
};

// French translations
export const fr: Messages = {
  common: {
    loading: 'Chargement…',
    error: 'Une erreur est survenue',
    retry: 'Réessayer',
    cancel: 'Annuler',
    save: 'Enregistrer',
    delete: 'Supprimer',
    edit: 'Modifier',
    close: 'Fermer',
    back: 'Retour',
    next: 'Suivant',
    submit: 'Envoyer',
    search: 'Rechercher',
    filter: 'Filtrer',
    clear: 'Effacer',
    noResults: 'Aucun résultat trouvé',
    required: 'Obligatoire',
    optional: 'Facultatif',
    copyToClipboard: 'Copier dans le presse-papier',
    copied: 'Copié !',
  },
  nav: {
    home: 'Accueil',
    plans: 'Forfaits',
    countries: 'Couverture',
    about: 'À propos',
    contact: 'Contact',
    blog: 'Blog',
    faq: 'FAQ',
    signIn: 'Se connecter',
    signOut: 'Se déconnecter',
    getStarted: 'Commencer',
    dashboard: 'Tableau de bord',
  },
  auth: {
    login: {
      title: 'Bon retour',
      subtitle: 'Connectez-vous pour gérer vos eSIM',
      emailLabel: 'Adresse e-mail',
      passLabel: 'Mot de passe',
      rememberMe: 'Se souvenir de moi pendant 30 jours',
      forgotPass: 'Mot de passe oublié ?',
      submitBtn: 'Se connecter',
      noAccount: 'Pas de compte ?',
      createOne: 'Créer un compte gratuit',
    },
    register: {
      title: 'Créer votre compte',
      subtitle: 'Connectez-vous au monde entier en quelques minutes',
      nameLabel: 'Nom complet',
      submitBtn: 'Créer un compte',
      hasAccount: 'Déjà un compte ?',
      signIn: 'Se connecter',
    },
  },
  dashboard: {
    title: 'Tableau de bord',
    welcome: 'Bon retour',
    activeESIMs: 'eSIM actives',
    totalOrders: 'Commandes totales',
    notifications: 'Notifications',
    dataUsed: 'Données utilisées',
    buyPlan: 'Acheter un forfait',
    viewAll: 'Voir tout',
  },
  plans: {
    title: 'Forfaits eSIM',
    subtitle: 'Trouvez le forfait de données idéal pour votre destination',
    searchPlaceholder: 'Rechercher par pays ou région…',
    filterBy: 'Filtrer par',
    sortBy: 'Trier par',
    noPlansFound: 'Aucun forfait trouvé',
    clearFilters: 'Effacer les filtres',
    getPlan: 'Choisir ce forfait',
    popular: 'Populaire',
    bestValue: 'Meilleur rapport qualité-prix',
    dataLabel: 'Données',
    validityLabel: 'Validité',
    networkLabel: 'Réseau',
    priceLabel: 'Prix',
  },
  esim: {
    status: { active: 'Actif', inactive: 'Inactif', expired: 'Expiré', pending: 'En attente' },
    dataRemaining: 'Données restantes',
    expiresOn: 'Expire le',
    viewDetails: 'Voir les détails',
    qrCode: 'Code QR',
    activationCode: "Code d'activation",
    iccid: 'ICCID',
  },
};

export const translations: Record<Locale, Messages> = { en, de, fr, es: en, ar: en };
