import { z } from 'zod';

const MAX_TEXT_LENGTH = 50000;

export const analyzeRequestSchema = z.object({
  cvText: z
    .string({ required_error: 'CV et offre doivent être du texte.' })
    .min(1, 'CV et offre sont requis.')
    .max(MAX_TEXT_LENGTH, `Texte trop long. Maximum : ${MAX_TEXT_LENGTH} caractères.`)
    .transform((val) => val.trim()),
  offerText: z
    .string({ required_error: 'CV et offre doivent être du texte.' })
    .min(1, 'CV et offre sont requis.')
    .max(MAX_TEXT_LENGTH, `Texte trop long. Maximum : ${MAX_TEXT_LENGTH} caractères.`)
    .transform((val) => val.trim()),
});
