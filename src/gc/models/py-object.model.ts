export interface PyObject {
  id: string;
  type: string;
  name: string;
  refCount: number;
  generation: number;
  references: string[]; // IDs of objects this object references
  referencedBy: string[]; // IDs of objects that reference this object
  isMarked: boolean;
  isAlive: boolean;
  createdAt: number;
}

export class PyObjectImpl implements PyObject {
  id: string;
  type: string;
  name: string;
  refCount: number;
  generation: number;
  references: string[] = [];
  referencedBy: string[] = [];
  isMarked = false;
  isAlive = true;
  createdAt: number;

  constructor(id: string, type: string, name: string) {
    this.id = id;
    this.type = type;
    this.name = name;
    this.refCount = 0;
    this.generation = 0;
    this.createdAt = Date.now();
  }

  addReference(targetId: string) {
    if (!this.references.includes(targetId)) {
      this.references.push(targetId);
    }
  }

  removeReference(targetId: string) {
    this.references = this.references.filter((id) => id !== targetId);
  }

  addReferencedBy(sourceId: string) {
    if (!this.referencedBy.includes(sourceId)) {
      this.referencedBy.push(sourceId);
    }
  }

  removeReferencedBy(sourceId: string) {
    this.referencedBy = this.referencedBy.filter((id) => id !== sourceId);
  }

  incrementRefCount() {
    this.refCount++;
  }

  decrementRefCount() {
    if (this.refCount > 0) {
      this.refCount--;
    }
  }

  mark() {
    this.isMarked = true;
  }

  unmark() {
    this.isMarked = false;
  }

  collect() {
    this.isAlive = false;
  }
}
