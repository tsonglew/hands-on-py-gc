import { Injectable } from '@nestjs/common';
import { PyObject, PyObjectImpl } from './models/py-object.model';
import { GCState, GCStateImpl, GCStep } from './models/gc-state.model';
import {
  CreateObjectDto,
  CreateReferenceDto,
  RemoveReferenceDto,
  SetRootDto,
} from './dto/gc.dto';

@Injectable()
export class GcService {
  private gcState: GCStateImpl;
  private nextObjectId = 1;

  constructor() {
    this.gcState = new GCStateImpl();
  }

  /**
   * Get current GC state
   */
  getState(): GCState {
    return this.gcState;
  }

  /**
   * Reset the GC state
   */
  reset(): GCState {
    this.gcState.reset();
    this.nextObjectId = 1;
    return this.gcState;
  }

  /**
   * Create a new Python object
   */
  createObject(dto: CreateObjectDto): PyObject {
    const id = `obj_${this.nextObjectId++}`;
    const obj = new PyObjectImpl(id, dto.type, dto.name);

    this.gcState.addObject(obj);

    // Create references if provided
    if (dto.references && dto.references.length > 0) {
      dto.references.forEach((targetId) => {
        this.createReference({ sourceId: id, targetId });
      });
    }

    this.gcState.addStep({
      stepNumber: this.gcState.steps.length,
      type: 'reference_count',
      description: `Created object ${obj.name} (${obj.id}) with type ${obj.type}`,
      objectsAffected: [id],
      timestamp: Date.now(),
    });

    return obj;
  }

  /**
   * Create a reference from one object to another
   */
  createReference(dto: CreateReferenceDto): void {
    const source = this.gcState.objects[dto.sourceId];
    const target = this.gcState.objects[dto.targetId];

    if (!source || !target) {
      throw new Error('Source or target object not found');
    }

    // Add reference
    source.addReference(dto.targetId);
    target.addReferencedBy(dto.sourceId);

    // Increment reference count
    target.incrementRefCount();

    this.gcState.addStep({
      stepNumber: this.gcState.steps.length,
      type: 'reference_count',
      description: `Added reference from ${source.name} to ${target.name}. ${target.name}'s refcount: ${target.refCount}`,
      objectsAffected: [dto.sourceId, dto.targetId],
      timestamp: Date.now(),
    });
  }

  /**
   * Remove a reference from one object to another
   */
  removeReference(dto: RemoveReferenceDto): void {
    const source = this.gcState.objects[dto.sourceId];
    const target = this.gcState.objects[dto.targetId];

    if (!source || !target) {
      throw new Error('Source or target object not found');
    }

    // Remove reference
    source.removeReference(dto.targetId);
    target.removeReferencedBy(dto.sourceId);

    // Decrement reference count
    target.decrementRefCount();

    this.gcState.addStep({
      stepNumber: this.gcState.steps.length,
      type: 'reference_count',
      description: `Removed reference from ${source.name} to ${target.name}. ${target.name}'s refcount: ${target.refCount}`,
      objectsAffected: [dto.sourceId, dto.targetId],
      timestamp: Date.now(),
    });

    // If refcount reaches 0, immediately collect (reference counting GC)
    if (target.refCount === 0 && !this.gcState.roots.includes(dto.targetId)) {
      this.collectObject(dto.targetId);
    }
  }

  /**
   * Set or unset an object as a root
   */
  setRoot(dto: SetRootDto): void {
    const obj = this.gcState.objects[dto.objectId];
    if (!obj) {
      throw new Error('Object not found');
    }

    if (dto.isRoot) {
      this.gcState.addRoot(dto.objectId);
      this.gcState.addStep({
        stepNumber: this.gcState.steps.length,
        type: 'reference_count',
        description: `Set ${obj.name} as a root object (protected from collection)`,
        objectsAffected: [dto.objectId],
        timestamp: Date.now(),
      });
    } else {
      this.gcState.removeRoot(dto.objectId);
      this.gcState.addStep({
        stepNumber: this.gcState.steps.length,
        type: 'reference_count',
        description: `Removed ${obj.name} from root objects`,
        objectsAffected: [dto.objectId],
        timestamp: Date.now(),
      });

      // Check if object should be collected
      if (obj.refCount === 0) {
        this.collectObject(dto.objectId);
      }
    }
  }

  /**
   * Trigger garbage collection for a specific generation
   */
  triggerGC(generation: number = 0): GCStep[] {
    const steps: GCStep[] = [];

    this.gcState.addStep({
      stepNumber: this.gcState.steps.length,
      type: 'mark',
      description: `Starting garbage collection for generation ${generation}`,
      objectsAffected: [],
      generation,
      timestamp: Date.now(),
    });

    // Phase 1: Mark all objects as unmarked
    this.unmarkAllObjects();
    steps.push({
      stepNumber: this.gcState.steps.length,
      type: 'mark',
      description: 'Phase 1: Unmarked all objects',
      objectsAffected: Object.keys(this.gcState.objects),
      generation,
      timestamp: Date.now(),
    });
    this.gcState.addStep(steps[steps.length - 1]);

    // Phase 2: Mark phase - mark all reachable objects from roots
    const reachable = this.markReachableObjects();
    steps.push({
      stepNumber: this.gcState.steps.length,
      type: 'mark',
      description: `Phase 2: Marked ${reachable.length} reachable objects from roots`,
      objectsAffected: reachable,
      generation,
      timestamp: Date.now(),
    });
    this.gcState.addStep(steps[steps.length - 1]);

    // Phase 3: Sweep phase - collect unmarked objects in the generation
    const collected = this.sweepUnmarkedObjects(generation);
    steps.push({
      stepNumber: this.gcState.steps.length,
      type: 'sweep',
      description: `Phase 3: Collected ${collected.length} unreachable objects`,
      objectsAffected: collected,
      generation,
      timestamp: Date.now(),
    });
    this.gcState.addStep(steps[steps.length - 1]);

    // Phase 4: Promote surviving objects to next generation
    const promoted = this.promoteSurvivingObjects(generation);
    if (promoted.length > 0) {
      steps.push({
        stepNumber: this.gcState.steps.length,
        type: 'generation_promotion',
        description: `Phase 4: Promoted ${promoted.length} objects to generation ${generation + 1}`,
        objectsAffected: promoted,
        generation: generation + 1,
        timestamp: Date.now(),
      });
      this.gcState.addStep(steps[steps.length - 1]);
    }

    this.gcState.totalCollections++;
    this.gcState.totalObjectsCollected += collected.length;

    this.gcState.addStep({
      stepNumber: this.gcState.steps.length,
      type: 'sweep',
      description: `Garbage collection completed. Total objects collected: ${collected.length}`,
      objectsAffected: [],
      generation,
      timestamp: Date.now(),
    });

    return steps;
  }

  /**
   * Unmark all objects
   */
  private unmarkAllObjects(): void {
    Object.values(this.gcState.objects).forEach((obj) => {
      obj.isMarked = false;
    });
  }

  /**
   * Mark all reachable objects from roots using DFS
   */
  private markReachableObjects(): string[] {
    const marked: string[] = [];
    const visited = new Set<string>();

    const dfs = (objId: string) => {
      if (visited.has(objId)) return;
      visited.add(objId);

      const obj = this.gcState.objects[objId];
      if (!obj || !obj.isAlive) return;

      obj.mark();
      marked.push(objId);

      // Mark all referenced objects
      obj.references.forEach((refId) => {
        dfs(refId);
      });
    };

    // Start DFS from all roots
    this.gcState.roots.forEach((rootId) => {
      dfs(rootId);
    });

    return marked;
  }

  /**
   * Sweep (collect) all unmarked objects in a generation
   */
  private sweepUnmarkedObjects(generation: number): string[] {
    const collected: string[] = [];
    const gen = this.gcState.generations[generation];

    if (!gen) return collected;

    // Get all objects in this generation that are unmarked
    const objectsToCheck = [...gen.objects];

    objectsToCheck.forEach((objId) => {
      const obj = this.gcState.objects[objId];
      if (obj && !obj.isMarked && obj.isAlive) {
        this.collectObject(objId);
        collected.push(objId);
      }
    });

    return collected;
  }

  /**
   * Promote surviving objects to the next generation
   */
  private promoteSurvivingObjects(generation: number): string[] {
    const promoted: string[] = [];
    const gen = this.gcState.generations[generation];

    if (!gen || generation >= 2) return promoted;

    // Get all objects in this generation that are marked (survived)
    const survivors = [...gen.objects];

    survivors.forEach((objId) => {
      const obj = this.gcState.objects[objId];
      if (obj && obj.isMarked && obj.isAlive) {
        this.gcState.promoteObject(objId);
        promoted.push(objId);
      }
    });

    return promoted;
  }

  /**
   * Collect (delete) a specific object
   */
  private collectObject(objId: string): void {
    const obj = this.gcState.objects[objId];
    if (!obj) return;

    // Mark as not alive
    obj.collect();

    // Remove all references to this object
    obj.referencedBy.forEach((sourceId) => {
      const source = this.gcState.objects[sourceId];
      if (source) {
        source.removeReference(objId);
      }
    });

    // Decrement reference counts of objects this object references
    obj.references.forEach((targetId) => {
      const target = this.gcState.objects[targetId];
      if (target) {
        target.decrementRefCount();
        target.removeReferencedBy(objId);
      }
    });

    // Remove from state
    this.gcState.removeObject(objId);

    this.gcState.addStep({
      stepNumber: this.gcState.steps.length,
      type: 'sweep',
      description: `Collected object ${obj.name} (${obj.id})`,
      objectsAffected: [objId],
      timestamp: Date.now(),
    });
  }

  /**
   * Get all steps
   */
  getSteps(): GCStep[] {
    return this.gcState.steps;
  }

  /**
   * Get a specific step
   */
  getStep(stepNumber: number): GCStep | undefined {
    return this.gcState.steps[stepNumber];
  }
}
