import { z } from 'zod';
export const submittedBallotValidator = z.record(z.string(), z.array(z.string()));
