import { useState } from 'react';
import { Mermaid } from '../components/Mermaid';

const testDiagrams = [
  {
    name: 'Simple Flow',
    chart: `graph LR
    A[Start] --> B[Process]
    B --> C[End]`
  },
  {
    name: 'Docker/K8s (from questions)',
    chart: `graph LR
    Docker[Docker] --> C1[Container]
    Docker --> C2[Container]
    K8s[Kubernetes] --> N1[Node]
    K8s --> N2[Node]
    N1 --> C3
    N2 --> C4`
  },
  {
    name: 'Load Balancer',
    chart: `graph LR
    User --> LB[Load Balancer]
    LB -->|Layer 4| S1[Server 1]
    LB -->|Layer 7| S2[Server 2]`
  },
  {
    name: 'Sequence Diagram',
    chart: `sequenceDiagram
    participant A as Client
    participant B as Server
    A->>B: Request
    B-->>A: Response`
  }
];

export default function MermaidTest() {
  const [customChart, setCustomChart] = useState('');

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <h1 className="text-2xl font-bold mb-8 text-primary">Mermaid Test Page</h1>
      
      <div className="space-y-8">
        {testDiagrams.map((diagram, index) => (
          <div key={index} className="border border-white/20 p-4 rounded">
            <h2 className="text-lg font-bold mb-4 text-white/70">{diagram.name}</h2>
            <div className="bg-white/5 p-4 rounded mb-4">
              <pre className="text-xs text-white/50 overflow-x-auto">{diagram.chart}</pre>
            </div>
            <div className="bg-black/50 border border-white/10 p-4 rounded">
              <Mermaid chart={diagram.chart} />
            </div>
          </div>
        ))}

        <div className="border border-white/20 p-4 rounded">
          <h2 className="text-lg font-bold mb-4 text-white/70">Custom Diagram</h2>
          <textarea
            className="w-full h-32 bg-white/5 border border-white/20 p-4 rounded text-xs font-mono text-white mb-4"
            placeholder="Enter mermaid diagram code..."
            value={customChart}
            onChange={(e) => setCustomChart(e.target.value)}
          />
          {customChart && (
            <div className="bg-black/50 border border-white/10 p-4 rounded">
              <Mermaid chart={customChart} />
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <a href="/" className="text-primary hover:underline">← Back to Home</a>
      </div>
    </div>
  );
}