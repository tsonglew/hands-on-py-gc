import React, { useState, useEffect } from 'react';
import { GCState } from './types/gc.types';
import { gcApi } from './services/gc.service';
import { GCVisualization } from './components/GCVisualization';
import { ControlPanel } from './components/ControlPanel';
import { StepTimeline } from './components/StepTimeline';
import { StatsPanel } from './components/StatsPanel';

const App: React.FC = () => {
  const [gcState, setGcState] = useState<GCState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      const state = await gcApi.getState();
      setGcState(state);
    } catch (error) {
      console.error('Failed to load GC state:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateObject = async (type: string, name: string) => {
    try {
      await gcApi.createObject(type, name);
      await loadState();
    } catch (error) {
      console.error('Failed to create object:', error);
    }
  };

  const handleCreateReference = async (sourceId: string, targetId: string) => {
    try {
      await gcApi.createReference(sourceId, targetId);
      await loadState();
    } catch (error) {
      console.error('Failed to create reference:', error);
    }
  };

  const handleSetRoot = async (objectId: string, isRoot: boolean) => {
    try {
      await gcApi.setRoot(objectId, isRoot);
      await loadState();
    } catch (error) {
      console.error('Failed to set root:', error);
    }
  };

  const handleTriggerGC = async (generation: number) => {
    try {
      await gcApi.triggerGC(generation);
      await loadState();
    } catch (error) {
      console.error('Failed to trigger GC:', error);
    }
  };

  const handleReset = async () => {
    try {
      await gcApi.reset();
      await loadState();
    } catch (error) {
      console.error('Failed to reset:', error);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
        }}
      >
        Loading...
      </div>
    );
  }

  if (!gcState) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
          color: '#ff6b6b',
        }}
      >
        Failed to load GC state
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f1f3f5',
        padding: '24px',
      }}
    >
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        <header style={{ marginBottom: '24px' }}>
          <h1
            style={{
              margin: '0 0 8px 0',
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#212529',
            }}
          >
            Python Garbage Collection Visualizer
          </h1>
          <p style={{ margin: 0, fontSize: '16px', color: '#868e96' }}>
            Interactive demonstration of Python's garbage collection mechanism with reference
            counting and generational GC
          </p>
        </header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 350px',
            gap: '24px',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <GCVisualization gcState={gcState} />
            <StatsPanel gcState={gcState} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <ControlPanel
              objects={gcState.objects}
              roots={gcState.roots}
              onCreateObject={handleCreateObject}
              onCreateReference={handleCreateReference}
              onSetRoot={handleSetRoot}
              onTriggerGC={handleTriggerGC}
              onReset={handleReset}
            />
          </div>
        </div>

        <StepTimeline steps={gcState.steps} currentStep={gcState.currentStep} />
      </div>
    </div>
  );
};

export default App;
