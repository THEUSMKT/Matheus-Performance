import type { Selection } from '@/lib/types';

export type StepProps = {
  selection: Selection;
  update: (patch: Partial<Selection>) => void;
};
