// Delt UI-konstanter brukt på tvers av komponenter

/** Humørscore-emojier, index 0 er tom (ingen score), 1–5 er gyldige verdier */
export const MOOD_EMOJI = ['', '😟', '😐', '😊', '😁', '🤩'] as const;

/** Humørscore-emojier uten tom første plass — brukes i inspeksjonswizard (1–5) */
export const MOOD_EMOJIS = ['😟', '😐', '😊', '😁', '🤩'] as const;
