import { PyObject, PyObjectImpl } from './py-object.model';

export interface GCGeneration {
  number: number;
  threshold: number;
  count: number;
  objects: string[]; // Object IDs
}

export interface GCState {
  objects: Record<string, PyObject>;
  roots: string[]; // Root object IDs
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

export class GCStateImpl implements GCState {
  objects: Record<string, PyObjectImpl> = {};
  roots: string[] = [];
  generations: GCGeneration[] = [
    { number: 0, threshold: 700, count: 0, objects: [] },
    { number: 1, threshold: 10, count: 0, objects: [] },
    { number: 2, threshold: 10, count: 0, objects: [] },
  ];
  totalCollections = 0;
  totalObjectsCollected = 0;
  currentStep = 0;
  steps: GCStep[] = [];
  isRunning = false;

  constructor() {}

  addObject(obj: PyObjectImpl) {
    this.objects[obj.id] = obj;
    this.generations[0].objects.push(obj.id);
    this.generations[0].count++;
  }

  removeObject(id: string) {
    const obj = this.objects[id];
    if (obj) {
      // Remove from generation
      const gen = this.generations[obj.generation];
      if (gen) {
        gen.objects = gen.objects.filter((objId) => objId !== id);
        gen.count--;
      }
      delete this.objects[id];
    }
  }

  addRoot(id: string) {
    if (!this.roots.includes(id)) {
      this.roots.push(id);
    }
  }

  removeRoot(id: string) {
    this.roots = this.roots.filter((rootId) => rootId !== id);
  }

  promoteObject(id: string) {
    const obj = this.objects[id];
    if (obj && obj.generation < 2) {
      // Remove from current generation
      const currentGen = this.generations[obj.generation];
      currentGen.objects = currentGen.objects.filter((objId) => objId !== id);
      currentGen.count--;

      // Add to next generation
      obj.generation++;
      const nextGen = this.generations[obj.generation];
      nextGen.objects.push(id);
      nextGen.count++;
    }
  }

  addStep(step: GCStep) {
    this.steps.push(step);
    this.currentStep = this.steps.length - 1;
  }

  reset() {
    this.objects = {};
    this.roots = [];
    this.generations = [
      { number: 0, threshold: 700, count: 0, objects: [] },
      { number: 1, threshold: 10, count: 0, objects: [] },
      { number: 2, threshold: 10, count: 0, objects: [] },
    ];
    this.totalCollections = 0;
    this.totalObjectsCollected = 0;
    this.currentStep = 0;
    this.steps = [];
    this.isRunning = false;
  }
}
