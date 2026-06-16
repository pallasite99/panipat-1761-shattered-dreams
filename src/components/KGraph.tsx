import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { BookOpen, Sparkles, Move, ZoomIn, Info } from 'lucide-react';

interface NetworkNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: 'Figure' | 'Battle' | 'Event';
  faction?: 'Maratha' | 'Afghan' | 'Neutral';
  title: string;
  description: string;
  icon: string;
}

interface NetworkLink extends d3.SimulationLinkDatum<NetworkNode> {
  source: string | NetworkNode;
  target: string | NetworkNode;
  label: string;
}

const NODES_DATA: NetworkNode[] = [
  {
    id: 'Bhau',
    label: 'Sadashivrao Bhau',
    type: 'Figure',
    faction: 'Maratha',
    title: 'Maratha Grand Commander',
    icon: '👤',
    description: 'The civil chief administrator of Pune who took active command of the massive northern expedition. A highly competent tax auditor but struggled to coordinate with regional northern horse chieftains.'
  },
  {
    id: 'Abdali',
    label: 'Ahmad Shah Abdali',
    type: 'Figure',
    faction: 'Afghan',
    title: 'Sovereign Afghan King',
    icon: '👑',
    description: 'Founder of the Durrani Empire and military mastermind of the desert. He forged a powerful religious-political coalition with Najib and Shuja to cut off Deccan forces.'
  },
  {
    id: 'Gardi',
    label: 'Ibrahim Khan Gardi',
    type: 'Figure',
    faction: 'Maratha',
    title: 'Maratha General of Artillery',
    icon: '🛡️',
    description: 'A disciplined Muslim commander who trained under French officers, leading the highly modern Gardi infantry phalanxes and brass canon divisions for the Marathas.'
  },
  {
    id: 'Najib',
    label: 'Najib-ud-Daulah',
    type: 'Figure',
    faction: 'Afghan',
    title: 'Rohilla Chieftain & Diplomat',
    icon: '✍️',
    description: 'The premier geopolitical actor who united regional leaders against the Marathas, sworn to assist Abdali to halt Pune\'s advance.'
  },
  {
    id: 'Shuja',
    label: 'Shuja-ud-Daulah',
    type: 'Figure',
    faction: 'Afghan',
    title: 'Nawab of Awadh',
    icon: '💰',
    description: 'The exceptionally wealthy ruler of Awadh whose massive treasury and infantry battalions tilted the balance of food and power in favor of Abdali\'s coalition.'
  },
  {
    id: 'Panipat',
    label: 'Third Battle of Panipat',
    type: 'Battle',
    faction: 'Neutral',
    title: 'The Fateful Stand (Jan 1761)',
    icon: '⚔️',
    description: 'The climactic battle on January 14, 1761, involving up to 200,000 live troops. One of the single bloodiest days in eighteenth-century history.'
  },
  {
    id: 'Udgir',
    label: 'Battle of Udgir',
    type: 'Battle',
    faction: 'Maratha',
    title: 'Deccan Artillery Triumph',
    icon: '💥',
    description: 'The massive battle against the Nizam in early 1760 where Ibrahim Khan Gardi\'s batteries dominated, securing the initial capital to finance the grand march.'
  },
  {
    id: 'Kunjpura',
    label: 'Siege of Kunjpura',
    type: 'Battle',
    faction: 'Maratha',
    title: 'Grain Storage Capture',
    icon: '🌾',
    description: 'The successful Maratha capture of an Afghan storage depot, satisfying hunger temporarily, but isolating Bhau further up north.'
  },
  {
    id: 'Yamuna',
    label: 'Yamuna River Crossing',
    type: 'Event',
    faction: 'Afghan',
    title: 'Abdali\'s Daring Water Coup',
    icon: '🌊',
    description: 'Ahmad Shah Abdali swam his massive heavy cavalry divisions across the flooded Yamuna River in October 1760, cutting off Bhau\'s retreat route.'
  },
  {
    id: 'Famine',
    label: 'Famine of Panipat',
    type: 'Event',
    faction: 'Neutral',
    title: 'The Blockade Strangulation',
    icon: '❄️',
    description: 'The complete siege of Maratha camp followings by Afghan scouts, reducing horses to starving skins and troops to weak starvation.'
  },
  {
    id: 'Ledger',
    label: 'Imperial Debt Ledger',
    type: 'Event',
    faction: 'Maratha',
    title: 'The Financial Deficit of Pune',
    icon: '📜',
    description: 'The extreme capital debt of the Pune state treasury which forced Bhau to spend critical defense days negotiating loans instead of securing borders.'
  }
];

const LINKS_DATA: NetworkLink[] = [
  { source: 'Bhau', target: 'Panipat', label: 'Commanded Maratha Core' },
  { source: 'Abdali', target: 'Panipat', label: 'Commanded Afghan Coalition' },
  { source: 'Gardi', target: 'Bhau', label: 'Allied Under' },
  { source: 'Gardi', target: 'Udgir', label: 'Dominated Battle' },
  { source: 'Najib', target: 'Abdali', label: 'Allied Rohillas With' },
  { source: 'Shuja', target: 'Abdali', label: 'Funded Campaign' },
  { source: 'Udgir', target: 'Ledger', label: 'Funded Initial Army' },
  { source: 'Panipat', target: 'Famine', label: 'Strangled By' },
  { source: 'Kunjpura', target: 'Panipat', label: 'Preceded Stand' },
  { source: 'Yamuna', target: 'Panipat', label: 'Enabling Encirclement' },
  { source: 'Bhau', target: 'Ledger', label: 'Audited Accounts' },
  { source: 'Yamuna', target: 'Famine', label: 'Triggered Blockade' },
  { source: 'Shuja', target: 'Famine', label: 'Denied Supplies To' }
];

export const KGraph: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 700, height: 480 });
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);

  // Resize Listener using ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({
        width: Math.max(width, 400),
        height: Math.max(height, 400)
      });
    });
    observer.observe(containerRef.current);
    
    // Set initial node
    const defaultNode = NODES_DATA.find(n => n.id === 'Panipat') || NODES_DATA[0];
    setSelectedNode(defaultNode);

    return () => observer.disconnect();
  }, []);

  // Render D3 Force-Directed Graph when dimensions or state changes
  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous SVG content to avoid duplicating
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;

    const nodes: NetworkNode[] = JSON.parse(JSON.stringify(NODES_DATA));
    const links: NetworkLink[] = JSON.parse(JSON.stringify(LINKS_DATA));

    // Create container group for zoom/pan
    const g = svg.append('g').attr('class', 'graph-content-g');

    // Zoom setup
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Initial center transform
    svg.call(zoom.transform, d3.zoomIdentity.translate(0, 0).scale(0.95));

    // Forces setup
    const simulation = d3.forceSimulation<NetworkNode>(nodes)
      .force('link', d3.forceLink<NetworkNode, NetworkLink>(links)
        .id(d => d.id)
        .distance(110)
      )
      .force('charge', d3.forceManyBody().strength(-240))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(45));

    // Node classification styling helpers
    const getNodeBgColor = (node: NetworkNode) => {
      if (node.type === 'Figure') {
        if (node.faction === 'Maratha') return '#ea580c'; // Saffron
        if (node.faction === 'Afghan') return '#1e3a8a';  // Deep Afghan Blue
        return '#065f46'; // Teal
      }
      if (node.type === 'Battle') return '#991b1b'; // Deep blood red
      return '#854d0e'; // Golden sand
    };

    const getNodeBorderColor = (node: NetworkNode) => {
      if (node.faction === 'Maratha') return '#f97316';
      if (node.faction === 'Afghan') return '#3b82f6';
      return '#eab308';
    };

    // 1. Draw Links (Lines)
    const linkElement = g.append('g')
      .attr('class', 'links-group')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#6b5a4b')
      .attr('stroke-opacity', 0.55)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', (d: any) => d.label.includes('Allied') || d.label.includes('Funded') ? '4 4' : 'none');

    // Link labels (hover definitions)
    linkElement.append('title').text((d: any) => d.label);

    // 2. Draw Nodes (Constellation circles/groups)
    const nodeElement = g.append('g')
      .attr('class', 'nodes-group')
      .selectAll('.node-element')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node-element cursor-pointer')
      .on('click', (event, d) => {
        // Find original node object to fetch correct context data
        const original = NODES_DATA.find(n => n.id === d.id);
        if (original) setSelectedNode(original);
      })
      .on('mouseover', function(event, d) {
        // Fade other nodes & links for focus
        d3.select(this).select('circle')
          .transition().duration(150)
          .attr('r', 24)
          .attr('stroke-width', 4.5);

        const connectedSet = new Set<string>();
        connectedSet.add(d.id);
        links.forEach((l: any) => {
          if (l.source.id === d.id) connectedSet.add(l.target.id);
          if (l.target.id === d.id) connectedSet.add(l.source.id);
        });

        nodeElement.style('opacity', (n: any) => connectedSet.has(n.id) ? 1.0 : 0.25);
        linkElement.style('opacity', (l: any) => (l.source.id === d.id || l.target.id === d.id) ? 1.0 : 0.15);
      })
      .on('mouseout', function() {
        d3.select(this).select('circle')
          .transition().duration(150)
          .attr('r', 18)
          .attr('stroke-width', 2.5);

        nodeElement.style('opacity', 1.0);
        linkElement.style('opacity', 0.55);
      });

    // Node backgrounds
    nodeElement.append('circle')
      .attr('r', 18)
      .attr('fill', d => getNodeBgColor(d))
      .attr('stroke', d => getNodeBorderColor(d))
      .attr('stroke-width', 2.5)
      .attr('filter', 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.6))');

    // Node visual type icons
    nodeElement.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.3em')
      .attr('font-size', '13px')
      .text(d => d.icon);

    // Node string text labels
    nodeElement.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '2.4em')
      .attr('font-family', '"Inter", sans-serif')
      .attr('font-weight', 'medium')
      .attr('font-size', '10px')
      .attr('fill', '#e5e7eb')
      .text(d => d.label)
      .clone(true).lower()
      .attr('fill', '#000')
      .attr('stroke', '#000')
      .attr('stroke-width', 3)
      .attr('stroke-linejoin', 'round');

    // Drag implementation helper
    const drag = d3.drag<any, any>()
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
      });

    nodeElement.call(drag);

    // Tick update event handler
    simulation.on('tick', () => {
      linkElement
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      nodeElement
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [dimensions]);

  const handleZoomReset = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().duration(500).call(
      d3.zoom().transform as any, 
      d3.zoomIdentity.translate(0, 0).scale(0.95)
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* Visual Canvas Panel */}
      <div className="col-span-1 lg:col-span-8 flex flex-col bg-stone-950 border-2 border-stone-900 rounded-sm overflow-hidden relative min-h-[480px]">
        {/* Navigation Overlays */}
        <div className="absolute top-3 left-4 z-20 pointer-events-none">
          <span className="text-[10px] font-mono font-black text-[#A57850] uppercase tracking-widest block bg-stone-950/80 px-2.5 py-1 rounded-xs border border-[#8B5E3C]/20">
            ⛓️ Drag & Hover Force Constellation Maps
          </span>
        </div>

        <div className="absolute top-3 right-4 z-20 flex gap-2">
          <button
            type="button"
            onClick={handleZoomReset}
            className="px-2.5 py-1 bg-stone-900 hover:bg-stone-850 hover:border-saffron text-[9px] font-mono text-stone-300 rounded border border-stone-800 transition-all flex items-center gap-1 cursor-pointer"
          >
            <ZoomIn size={11} className="text-saffron" /> Center Camera
          </button>
        </div>

        {/* Core D3 SVG Graph Frame */}
        <div ref={containerRef} className="flex-1 w-full h-full relative bg-[#120b08]/80">
          <svg
            ref={svgRef}
            id="lms-d3-knowledge-graph"
            className="w-full h-full min-h-[440px]"
            style={{ touchAction: 'none' }}
          />

          {/* Interactive Legend overlay */}
          <div className="absolute bottom-3 left-3 bg-stone-950/90 border border-stone-850 p-2 rounded-xs flex flex-wrap gap-x-4 gap-y-1 text-[8.5px] font-mono text-stone-400 select-none z-10">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-600 border border-orange-500" /> Maratha</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-900 border border-blue-500" /> Afghan</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-800 border border-red-700" /> Battle</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-700 border border-yellow-600" /> Campaign Event</span>
          </div>
        </div>
      </div>

      {/* Explanatory Lore Sideboard Card */}
      <div className="col-span-1 lg:col-span-4 flex flex-col justify-between">
        {selectedNode ? (
          <div className="parchment border-4 border-[#8B5E3C] p-5 shadow-xl flex-1 flex flex-col justify-between text-left rounded-xs min-h-[380px]">
            <div className="space-y-4">
              <div className="border-b border-stone-950/20 pb-3">
                <div className="flex justify-between items-center text-[9px] font-mono uppercase text-[#8B5E3C] font-extrabold tracking-wider">
                  <span>{selectedNode.type} Information</span>
                  <span>{selectedNode.faction && `${selectedNode.faction} faction`}</span>
                </div>
                <h4 className="text-lg font-serif font-black text-stone-950 uppercase mt-1 leading-tight">
                  {selectedNode.label}
                </h4>
                <p className="text-[10px] font-mono text-[#9a3412] font-bold uppercase tracking-widest mt-0.5">
                  🛡️ {selectedNode.title}
                </p>
              </div>

              <div className="text-stone-900 text-xs font-serif leading-relaxed space-y-2 max-h-[220px] overflow-y-auto pr-1">
                <p>"{selectedNode.description}"</p>
                <p className="font-sans text-[11px] text-stone-800 leading-normal border-t border-stone-900/10 pt-2 italic">
                  *This entity participated directly inside the logistics grids, treasury networks, or battlefield flanking maneuvers of 1761.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-stone-950/10 flex items-center gap-2 text-[10px] font-mono text-stone-600 uppercase">
              <Info size={11} className="text-[#8B5E3C]" />
              <span>Click other nodes to navigate lore</span>
            </div>
          </div>
        ) : (
          <div className="bg-stone-950 border border-stone-850 p-6 rounded-xs text-center flex flex-col items-center justify-center flex-1">
            <BookOpen className="w-12 h-12 text-[#8B5E3C] mb-2 animate-bounce" />
            <h5 className="font-serif text-sm font-bold text-white uppercase tracking-tight">Select Node in Network Map</h5>
            <p className="text-[11px] text-stone-500 font-sans mt-1">
              Select or hover any node in the interactive force network map left to reveal deep campaign relationships.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
