import { GCState, PyObject, GCStep } from '../types/gc.types';

const API_BASE = '/api/gc';

export const gcApi = {
  async getState(): Promise<GCState> {
    const response = await fetch(`${API_BASE}/state`);
    return response.json();
  },

  async reset(): Promise<GCState> {
    const response = await fetch(`${API_BASE}/reset`, { method: 'POST' });
    return response.json();
  },

  async createObject(
    type: string,
    name: string,
    references?: string[],
  ): Promise<PyObject> {
    const response = await fetch(`${API_BASE}/objects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, name, references }),
    });
    return response.json();
  },

  async createReference(sourceId: string, targetId: string): Promise<void> {
    await fetch(`${API_BASE}/references`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceId, targetId }),
    });
  },

  async removeReference(sourceId: string, targetId: string): Promise<void> {
    await fetch(`${API_BASE}/references`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceId, targetId }),
    });
  },

  async setRoot(objectId: string, isRoot: boolean): Promise<void> {
    await fetch(`${API_BASE}/roots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ objectId, isRoot }),
    });
  },

  async triggerGC(generation?: number): Promise<{ steps: GCStep[]; state: GCState }> {
    const response = await fetch(`${API_BASE}/collect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ generation }),
    });
    return response.json();
  },

  async getSteps(): Promise<GCStep[]> {
    const response = await fetch(`${API_BASE}/steps`);
    return response.json();
  },

  async getStep(stepNumber: number): Promise<GCStep> {
    const response = await fetch(`${API_BASE}/steps/${stepNumber}`);
    return response.json();
  },
};
