import React from 'react';
import { GCState } from '../types/gc.types';

interface Props {
  gcState: GCState;
}

export const StatsPanel: React.FC<Props> = ({ gcState }) => {
  const totalObjects = Object.keys(gcState.objects).length;
  const aliveObjects = Object.values(gcState.objects).filter((obj) => obj.isAlive).length;
  const deadObjects = totalObjects - aliveObjects;
  const rootObjects = gcState.roots.length;

  return (
    <div
      style={{
        border: '2px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        backgroundColor: '#fff',
      }}
    >
      <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>
        GC Statistics
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        <div
          style={{
            padding: '16px',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px',
            border: '1px solid #e9ecef',
          }}
        >
          <div style={{ fontSize: '12px', color: '#868e96', marginBottom: '4px' }}>
            Total Objects
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#495057' }}>
            {totalObjects}
          </div>
        </div>

        <div
          style={{
            padding: '16px',
            backgroundColor: '#e7f5ff',
            borderRadius: '6px',
            border: '1px solid #a5d8ff',
          }}
        >
          <div style={{ fontSize: '12px', color: '#1971c2', marginBottom: '4px' }}>
            Alive Objects
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1971c2' }}>
            {aliveObjects}
          </div>
        </div>

        <div
          style={{
            padding: '16px',
            backgroundColor: '#ffe3e3',
            borderRadius: '6px',
            border: '1px solid #ffa8a8',
          }}
        >
          <div style={{ fontSize: '12px', color: '#c92a2a', marginBottom: '4px' }}>
            Collected
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#c92a2a' }}>
            {deadObjects}
          </div>
        </div>

        <div
          style={{
            padding: '16px',
            backgroundColor: '#fff3bf',
            borderRadius: '6px',
            border: '1px solid #ffd43b',
          }}
        >
          <div style={{ fontSize: '12px', color: '#e67700', marginBottom: '4px' }}>
            Root Objects
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e67700' }}>
            {rootObjects}
          </div>
        </div>

        <div
          style={{
            padding: '16px',
            backgroundColor: '#f3f0ff',
            borderRadius: '6px',
            border: '1px solid #d0bfff',
          }}
        >
          <div style={{ fontSize: '12px', color: '#5f3dc4', marginBottom: '4px' }}>
            Total Collections
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#5f3dc4' }}>
            {gcState.totalCollections}
          </div>
        </div>

        <div
          style={{
            padding: '16px',
            backgroundColor: '#ebfbee',
            borderRadius: '6px',
            border: '1px solid #8ce99a',
          }}
        >
          <div style={{ fontSize: '12px', color: '#2b8a3e', marginBottom: '4px' }}>
            Total Collected
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2b8a3e' }}>
            {gcState.totalObjectsCollected}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold' }}>
          Generations
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {gcState.generations.map((gen) => (
            <div
              key={gen.number}
              style={{
                padding: '12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '6px',
                border: '1px solid #e9ecef',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
                    Generation {gen.number}
                  </span>
                  <span style={{ fontSize: '12px', color: '#868e96', marginLeft: '8px' }}>
                    ({gen.number === 0 ? 'Young' : gen.number === 1 ? 'Middle' : 'Old'})
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: '#868e96' }}>Objects: </span>
                    <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{gen.count}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#868e96' }}>Threshold: </span>
                    <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
                      {gen.threshold}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
