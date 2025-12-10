import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { GCState } from '../types/gc.types';

interface Props {
  gcState: GCState;
  onObjectClick?: (objectId: string) => void;
}

interface GraphNode {
  id: string;
  name: string;
  type: string;
  refCount: number;
  generation: number;
  isMarked: boolean;
  isRoot: boolean;
  isAlive: boolean;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
}

export const GCVisualization: React.FC<Props> = ({ gcState, onObjectClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);

  useEffect(() => {
    if (!svgRef.current || !gcState) return;

    const width = 1000;
    const height = 700;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Create nodes
    const nodes: GraphNode[] = Object.values(gcState.objects).map((obj) => ({
      id: obj.id,
      name: obj.name,
      type: obj.type,
      refCount: obj.refCount,
      generation: obj.generation,
      isMarked: obj.isMarked,
      isRoot: gcState.roots.includes(obj.id),
      isAlive: obj.isAlive,
    }));

    // Create links
    const links: GraphLink[] = [];
    Object.values(gcState.objects).forEach((obj) => {
      obj.references.forEach((refId) => {
        if (gcState.objects[refId]) {
          links.push({
            source: obj.id,
            target: refId,
          });
        }
      });
    });

    // Create simulation
    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphLink>(links)
          .id((d) => d.id)
          .distance(150),
      )
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));

    simulationRef.current = simulation;

    // Create arrow markers
    svg
      .append('defs')
      .selectAll('marker')
      .data(['arrow'])
      .join('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 35)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#999');

    // Create links
    const link = svg
      .append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrow)');

    // Create node groups
    const node = svg
      .append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }),
      );

    // Add circles
    node
      .append('circle')
      .attr('r', 30)
      .attr('fill', (d) => {
        if (!d.isAlive) return '#d3d3d3';
        if (d.isRoot) return '#ff6b6b';
        if (d.isMarked) return '#51cf66';
        return '#4dabf7';
      })
      .attr('stroke', (d) => (d.isRoot ? '#c92a2a' : '#228be6'))
      .attr('stroke-width', (d) => (d.isRoot ? 4 : 2))
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        if (onObjectClick) {
          onObjectClick(d.id);
        }
      });

    // Add labels
    node
      .append('text')
      .text((d) => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', -35)
      .attr('font-size', 12)
      .attr('font-weight', 'bold')
      .attr('fill', '#333');

    // Add ref count
    node
      .append('text')
      .text((d) => `refs: ${d.refCount}`)
      .attr('text-anchor', 'middle')
      .attr('dy', 5)
      .attr('font-size', 10)
      .attr('fill', '#fff');

    // Add generation
    node
      .append('text')
      .text((d) => `gen: ${d.generation}`)
      .attr('text-anchor', 'middle')
      .attr('dy', 45)
      .attr('font-size', 10)
      .attr('fill', '#666');

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as GraphNode).x!)
        .attr('y1', (d) => (d.source as GraphNode).y!)
        .attr('x2', (d) => (d.target as GraphNode).x!)
        .attr('y2', (d) => (d.target as GraphNode).y!);

      node.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [gcState, onObjectClick]);

  return (
    <div style={{ border: '2px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
      <svg ref={svgRef} style={{ display: 'block' }} />
      <div
        style={{
          padding: '16px',
          backgroundColor: '#f8f9fa',
          borderTop: '2px solid #ddd',
        }}
      >
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: '#4dabf7',
                border: '2px solid #228be6',
              }}
            />
            <span>Normal Object</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: '#ff6b6b',
                border: '2px solid #c92a2a',
              }}
            />
            <span>Root Object</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: '#51cf66',
              }}
            />
            <span>Marked (Reachable)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: '#d3d3d3',
              }}
            />
            <span>Collected</span>
          </div>
        </div>
      </div>
    </div>
  );
};
