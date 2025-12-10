import React from 'react';
import { GCStep } from '../types/gc.types';

interface Props {
  steps: GCStep[];
  currentStep: number;
  onStepClick?: (stepNumber: number) => void;
}

export const StepTimeline: React.FC<Props> = ({ steps, currentStep, onStepClick }) => {
  const getStepColor = (type: GCStep['type']) => {
    switch (type) {
      case 'mark':
        return '#51cf66';
      case 'sweep':
        return '#ff6b6b';
      case 'reference_count':
        return '#4dabf7';
      case 'generation_promotion':
        return '#ffd43b';
      default:
        return '#868e96';
    }
  };

  const getStepIcon = (type: GCStep['type']) => {
    switch (type) {
      case 'mark':
        return '🔍';
      case 'sweep':
        return '🧹';
      case 'reference_count':
        return '🔢';
      case 'generation_promotion':
        return '⬆️';
      default:
        return '•';
    }
  };

  return (
    <div
      style={{
        border: '2px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: '#fff',
      }}
    >
      <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>
        GC Steps Timeline
      </h3>
      <div
        style={{
          maxHeight: '400px',
          overflowY: 'auto',
          paddingRight: '8px',
        }}
      >
        {steps.length === 0 ? (
          <p style={{ color: '#868e96', fontStyle: 'italic' }}>
            No steps yet. Create objects and trigger GC to see the process.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {steps.map((step, index) => (
              <div
                key={step.stepNumber}
                onClick={() => onStepClick && onStepClick(step.stepNumber)}
                style={{
                  padding: '12px',
                  border: `2px solid ${index === currentStep ? getStepColor(step.type) : '#e9ecef'}`,
                  borderRadius: '6px',
                  backgroundColor: index === currentStep ? '#f8f9fa' : '#fff',
                  cursor: onStepClick ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    fontSize: '24px',
                    lineHeight: 1,
                  }}
                >
                  {getStepIcon(step.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: getStepColor(step.type),
                        textTransform: 'uppercase',
                      }}
                    >
                      {step.type.replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: '11px', color: '#868e96' }}>
                      Step {step.stepNumber + 1}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '14px',
                      color: '#495057',
                      lineHeight: 1.5,
                    }}
                  >
                    {step.description}
                  </p>
                  {step.objectsAffected.length > 0 && (
                    <div
                      style={{
                        marginTop: '8px',
                        fontSize: '12px',
                        color: '#868e96',
                      }}
                    >
                      Objects: {step.objectsAffected.join(', ')}
                    </div>
                  )}
                  {step.generation !== undefined && (
                    <div
                      style={{
                        marginTop: '4px',
                        fontSize: '12px',
                        color: '#868e96',
                      }}
                    >
                      Generation: {step.generation}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
