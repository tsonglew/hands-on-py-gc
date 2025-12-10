export interface PyObject {
  id: string;
  type: string;
  name: string;
  refCount: number;
  generation: number;
  references: string[];
  referencedBy: string[];
  isMarked: boolean;
  isAlive: boolean;
  createdAt: number;
}

export interface GCGeneration {
  number: number;
  threshold: number;
  count: number;
  objects: string[];
}

export interface GCState {
  objects: Record<string, PyObject>;
  roots: string[];
  generations: GCGeneration[];
  totalCollections: number;
  totalObjectsCollected: number;
  currentStep: number;
  steps: GCStep[];
  isRunning: boolean;
}

export interface GCStep {
  stepNumber: number;
  type: 'mark' | 'sweep' | 'reference_count' | 'generation_promotion';
  description: string;
  objectsAffected: string[];
  generation?: number;
  timestamp: number;
}
