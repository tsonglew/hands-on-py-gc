import React, { useState } from 'react';
import { PyObject } from '../types/gc.types';

interface Props {
  objects: Record<string, PyObject>;
  roots: string[];
  onCreateObject: (type: string, name: string) => void;
  onCreateReference: (sourceId: string, targetId: string) => void;
  onSetRoot: (objectId: string, isRoot: boolean) => void;
  onTriggerGC: (generation: number) => void;
  onReset: () => void;
}

export const ControlPanel: React.FC<Props> = ({
  objects,
  roots,
  onCreateObject,
  onCreateReference,
  onSetRoot,
  onTriggerGC,
  onReset,
}) => {
  const [objectName, setObjectName] = useState('');
  const [objectType, setObjectType] = useState('dict');
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [selectedGeneration, setSelectedGeneration] = useState(0);

  const objectIds = Object.keys(objects);

  const handleCreateObject = () => {
    if (objectName.trim()) {
      onCreateObject(objectType, objectName.trim());
      setObjectName('');
    }
  };

  const handleCreateReference = () => {
    if (sourceId && targetId && sourceId !== targetId) {
      onCreateReference(sourceId, targetId);
      setSourceId('');
      setTargetId('');
    }
  };

  return (
    <div
      style={{
        border: '2px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      <div>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 'bold' }}>
          Create Object
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '4px',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Object Name
            </label>
            <input
              type="text"
              value={objectName}
              onChange={(e) => setObjectName(e.target.value)}
              placeholder="e.g., my_list"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '4px',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Object Type
            </label>
            <select
              value={objectType}
              onChange={(e) => setObjectType(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            >
              <option value="dict">dict</option>
              <option value="list">list</option>
              <option value="tuple">tuple</option>
              <option value="set">set</option>
              <option value="object">object</option>
              <option value="function">function</option>
            </select>
          </div>
          <button
            onClick={handleCreateObject}
            style={{
              padding: '10px 16px',
              backgroundColor: '#4dabf7',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Create Object
          </button>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #e9ecef', paddingTop: '24px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 'bold' }}>
          Create Reference
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '4px',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              From Object
            </label>
            <select
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            >
              <option value="">Select source object</option>
              {objectIds.map((id) => (
                <option key={id} value={id}>
                  {objects[id].name} ({id})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '4px',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              To Object
            </label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            >
              <option value="">Select target object</option>
              {objectIds.map((id) => (
                <option key={id} value={id}>
                  {objects[id].name} ({id})
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleCreateReference}
            disabled={!sourceId || !targetId || sourceId === targetId}
            style={{
              padding: '10px 16px',
              backgroundColor: sourceId && targetId && sourceId !== targetId ? '#51cf66' : '#ced4da',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: sourceId && targetId && sourceId !== targetId ? 'pointer' : 'not-allowed',
            }}
          >
            Create Reference
          </button>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #e9ecef', paddingTop: '24px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 'bold' }}>
          Manage Roots
        </h3>
        <div
          style={{
            maxHeight: '150px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {objectIds.length === 0 ? (
            <p style={{ color: '#868e96', fontSize: '14px', fontStyle: 'italic' }}>
              No objects created yet
            </p>
          ) : (
            objectIds.map((id) => {
              const obj = objects[id];
              const isRoot = roots.includes(id);
              return (
                <div
                  key={id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px',
                    border: '1px solid #e9ecef',
                    borderRadius: '4px',
                  }}
                >
                  <span style={{ fontSize: '14px' }}>
                    {obj.name} ({id})
                  </span>
                  <button
                    onClick={() => onSetRoot(id, !isRoot)}
                    style={{
                      padding: '4px 12px',
                      backgroundColor: isRoot ? '#ff6b6b' : '#e9ecef',
                      color: isRoot ? '#fff' : '#495057',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    {isRoot ? 'Remove Root' : 'Set Root'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div style={{ borderTop: '1px solid #e9ecef', paddingTop: '24px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 'bold' }}>
          Garbage Collection
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '4px',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Generation
            </label>
            <select
              value={selectedGeneration}
              onChange={(e) => setSelectedGeneration(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            >
              <option value={0}>Generation 0 (Young)</option>
              <option value={1}>Generation 1 (Middle)</option>
              <option value={2}>Generation 2 (Old)</option>
            </select>
          </div>
          <button
            onClick={() => onTriggerGC(selectedGeneration)}
            style={{
              padding: '10px 16px',
              backgroundColor: '#ffd43b',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Trigger GC
          </button>
          <button
            onClick={onReset}
            style={{
              padding: '10px 16px',
              backgroundColor: '#ff6b6b',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Reset All
          </button>
        </div>
      </div>
    </div>
  );
};
