const translations = {
  en: {
    // Nav
    navToday: 'Today',
    navVote: 'Vote',
    navResults: 'Results',
    navFriends: 'Friends',

    // WordDisplay
    todaysWord: "today\u2019s word",

    // DescriptionInput
    placeholder: 'Type your five words...',
    wordCount: (n: number) => `${n}/5 words`,
    lockItIn: 'Lock it in',
    lockingIn: 'Locking in...',

    // Play page
    lockedIn: 'Locked in \u2713',
    voteOnOthers: 'Vote on Others',
    seeResults: 'See Results',
    noWordAvailable: 'No word available for today',
    checkBackLater: 'Check back later or contact support.',

    // StreakBadge
    dayStreak: (n: number) => `${n} day streak`,

    // Vote page
    playFirst: "Play today\u2019s word first before voting",
    playNow: 'Play Now',
    allDone: (n: number) => `All done! You voted on ${n} pairs \uD83C\uDF89`,
    notEnoughDescs: 'Not enough descriptions yet. Check back later!',
    voteNumber: (n: number) => `Vote ${n}`,
    yourPick: 'YOUR PICK \u2713',

    // Results page
    global: '\uD83C\uDF0D Global',
    friends: '\uD83D\uDC65 Friends',
    noResultsYet: 'No results yet. Check back later!',
    noFriendsResults: "No friends\u2019 results yet.",
    yourResult: 'Your result',
    outOf: (n: number) => `out of ${n} players`,
    shareResult: 'Share Result',

    // Friends page
    friendsTitle: 'Friends',
    addFriend: 'Add Friend',
    pendingRequests: 'Pending Requests',
    accept: 'Accept',
    decline: 'Decline',
    todaysWordLabel: (word: string) => `Today\u2019s Word: ${word}`,
    playToSee: "Play today\u2019s word to see your friends\u2019 descriptions!",
    yourFriends: 'Your Friends',
    noFriendsYet: 'No friends yet. Add some to compete!',
    addFriendTitle: 'Add Friend',
    enterUsername: 'Enter username',
    sendRequest: 'Send Request',
    sending: 'Sending...',
    cancel: 'Cancel',

    // ShareCard
    shareText: (word: string, desc: string, rank: number, total: number) =>
      `OneWord - ${word.toUpperCase()}\n\n\u201C${desc}\u201D\n\nI ranked #${rank} out of ${total} players!\n\nPlay at oneword.game`,

    // Landing page
    todaysResults: "Today\u2019s results",
    todaysWordColon: "Today\u2019s word:",
    descAndCounting: (n: number) => `${n} description${n !== 1 ? 's' : ''} and counting`,
    loadingWord: "Loading today\u2019s word...",
    votes: (n: number) => `${n} votes`,
    thinkBetter: 'Think you can do better?',
    playNowLink: 'Play now',
    beFirst: "Today\u2019s word is waiting for its first descriptions. Be the first!",

    // Signup
    createAccount: 'Create your account',
    joinPlayers: 'Join thousands of players worldwide',
    username: 'Username',
    email: 'Email',
    passwordPlaceholder: 'Password (6+ characters)',
    signUp: 'Sign up',
    creatingAccount: 'Creating account...',
    alreadyHaveAccount: 'Already have an account?',
    logIn: 'Log in',
    checkEmail: 'Check your email to confirm your account, then log in.',

    // Landing Nav
    howItWorks: 'How it works',
    download: 'Download',
  },
  es: {
    // Nav
    navToday: 'Hoy',
    navVote: 'Votar',
    navResults: 'Resultados',
    navFriends: 'Amigos',

    // WordDisplay
    todaysWord: 'palabra del d\u00EDa',

    // DescriptionInput
    placeholder: 'Escribe tus cinco palabras...',
    wordCount: (n: number) => `${n}/5 palabras`,
    lockItIn: 'Confirmar',
    lockingIn: 'Confirmando...',

    // Play page
    lockedIn: 'Confirmado \u2713',
    voteOnOthers: 'Votar por otros',
    seeResults: 'Ver resultados',
    noWordAvailable: 'No hay palabra disponible hoy',
    checkBackLater: 'Vuelve m\u00E1s tarde o contacta soporte.',

    // StreakBadge
    dayStreak: (n: number) => `${n} d\u00EDa${n !== 1 ? 's' : ''} de racha`,

    // Vote page
    playFirst: 'Juega la palabra del d\u00EDa antes de votar',
    playNow: 'Jugar ahora',
    allDone: (n: number) => `\u00A1Listo! Votaste en ${n} pares \uD83C\uDF89`,
    notEnoughDescs: '\u00A1A\u00FAn no hay suficientes descripciones. Vuelve m\u00E1s tarde!',
    voteNumber: (n: number) => `Voto ${n}`,
    yourPick: 'TU ELECCI\u00D3N \u2713',

    // Results page
    global: '\uD83C\uDF0D Global',
    friends: '\uD83D\uDC65 Amigos',
    noResultsYet: '\u00A1A\u00FAn no hay resultados. Vuelve m\u00E1s tarde!',
    noFriendsResults: 'A\u00FAn no hay resultados de amigos.',
    yourResult: 'Tu resultado',
    outOf: (n: number) => `de ${n} jugadores`,
    shareResult: 'Compartir resultado',

    // Friends page
    friendsTitle: 'Amigos',
    addFriend: 'A\u00F1adir amigo',
    pendingRequests: 'Solicitudes pendientes',
    accept: 'Aceptar',
    decline: 'Rechazar',
    todaysWordLabel: (word: string) => `Palabra del d\u00EDa: ${word}`,
    playToSee: '\u00A1Juega la palabra del d\u00EDa para ver las descripciones de tus amigos!',
    yourFriends: 'Tus amigos',
    noFriendsYet: '\u00A1A\u00FAn no tienes amigos. A\u00F1ade algunos para competir!',
    addFriendTitle: 'A\u00F1adir amigo',
    enterUsername: 'Nombre de usuario',
    sendRequest: 'Enviar solicitud',
    sending: 'Enviando...',
    cancel: 'Cancelar',

    // ShareCard
    shareText: (word: string, desc: string, rank: number, total: number) =>
      `OneWord - ${word.toUpperCase()}\n\n\u201C${desc}\u201D\n\n\u00A1Qued\u00E9 #${rank} de ${total} jugadores!\n\nJuega en oneword.game`,

    // Landing page
    todaysResults: 'Resultados de hoy',
    todaysWordColon: 'Palabra del d\u00EDa:',
    descAndCounting: (n: number) => `${n} descripci\u00F3n${n !== 1 ? 'es' : ''} y contando`,
    loadingWord: 'Cargando la palabra del d\u00EDa...',
    votes: (n: number) => `${n} votos`,
    thinkBetter: '\u00BFCrees que puedes hacerlo mejor?',
    playNowLink: 'Juega ahora',
    beFirst: '\u00A1La palabra del d\u00EDa espera sus primeras descripciones. S\u00E9 el primero!',

    // Signup
    createAccount: 'Crea tu cuenta',
    joinPlayers: '\u00DAnete a miles de jugadores en todo el mundo',
    username: 'Nombre de usuario',
    email: 'Correo electr\u00F3nico',
    passwordPlaceholder: 'Contrase\u00F1a (m\u00EDnimo 6 caracteres)',
    signUp: 'Registrarse',
    creatingAccount: 'Creando cuenta...',
    alreadyHaveAccount: '\u00BFYa tienes cuenta?',
    logIn: 'Iniciar sesi\u00F3n',
    checkEmail: 'Revisa tu correo para confirmar tu cuenta, luego inicia sesi\u00F3n.',

    // Landing Nav
    howItWorks: 'C\u00F3mo funciona',
    download: 'Descargar',
  },
} as const;

export type Language = 'en' | 'es';
export type Translations = typeof translations.en;

export function getTranslations(lang: string | undefined): Translations {
  if (lang === 'es') return translations.es;
  return translations.en;
}

export function useTranslations(lang: string | undefined): Translations {
  return getTranslations(lang);
}
