import { useState } from "react";
import {
  Users,
  Filter,
  Search,
  Maximize,
  Download,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NetworkNode {
  id: string;
  name: string;
  type: "contact" | "group" | "skill";
  size: number;
  color: string;
  connections: number;
  x?: number;
  y?: number;
}

interface NetworkEdge {
  from: string;
  to: string;
  strength: number;
  type: "conversation" | "expertise" | "introduction";
}

export default function NetworkVisualization() {
  const [filterBy, setFilterBy] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("force");

  // Mock network data
  const nodes: NetworkNode[] = [
    {
      id: "1",
      name: "You",
      type: "contact",
      size: 100,
      color: "#3b82f6",
      connections: 15,
    },
    {
      id: "2",
      name: "Sarah Chen",
      type: "contact",
      size: 80,
      color: "#10b981",
      connections: 12,
    },
    {
      id: "3",
      name: "Marcus Rodriguez",
      type: "contact",
      size: 75,
      color: "#8b5cf6",
      connections: 10,
    },
    {
      id: "4",
      name: "Dr. Priya Sharma",
      type: "contact",
      size: 70,
      color: "#f59e0b",
      connections: 8,
    },
    {
      id: "5",
      name: "Tech Founders",
      type: "group",
      size: 90,
      color: "#ef4444",
      connections: 25,
    },
    {
      id: "6",
      name: "AI/ML",
      type: "skill",
      size: 60,
      color: "#06b6d4",
      connections: 6,
    },
    {
      id: "7",
      name: "Startup Advice",
      type: "skill",
      size: 55,
      color: "#84cc16",
      connections: 5,
    },
  ];

  const edges: NetworkEdge[] = [
    { from: "1", to: "2", strength: 0.9, type: "conversation" },
    { from: "1", to: "3", strength: 0.7, type: "conversation" },
    { from: "1", to: "4", strength: 0.8, type: "conversation" },
    { from: "2", to: "6", strength: 0.95, type: "expertise" },
    { from: "3", to: "7", strength: 0.85, type: "expertise" },
    { from: "4", to: "7", strength: 0.8, type: "expertise" },
    { from: "1", to: "5", strength: 0.6, type: "conversation" },
    { from: "2", to: "5", strength: 0.7, type: "conversation" },
    { from: "3", to: "5", strength: 0.5, type: "conversation" },
  ];

  const networkStats = {
    totalContacts: 247,
    totalGroups: 12,
    totalExpertiseAreas: 89,
    averageConnections: 8.4,
    networkDensity: 0.68,
    strongConnections: 45,
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Professional Network Visualization
              </CardTitle>
              <CardDescription>
                Interactive map of your WhatsApp professional network
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Maximize className="h-4 w-4 mr-2" />
                Fullscreen
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts, groups, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Connections</SelectItem>
                <SelectItem value="contacts">Contacts Only</SelectItem>
                <SelectItem value="groups">Groups Only</SelectItem>
                <SelectItem value="skills">Skills Only</SelectItem>
                <SelectItem value="strong">Strong Connections</SelectItem>
              </SelectContent>
            </Select>

            <Select value={viewMode} onValueChange={setViewMode}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="force">Force Layout</SelectItem>
                <SelectItem value="circular">Circular Layout</SelectItem>
                <SelectItem value="hierarchical">Hierarchical</SelectItem>
                <SelectItem value="grid">Grid View</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Legend */}
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-blue-500"></div>
              <span>Contacts</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <span>Groups</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-cyan-500"></div>
              <span>Skills</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-0.5 w-6 bg-gray-400"></div>
              <span>Weak Connection</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-1 w-6 bg-gray-800"></div>
              <span>Strong Connection</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Visualization */}
        <Card className="lg:col-span-3">
          <CardContent className="p-6">
            <div className="h-96 bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center relative overflow-hidden">
              {/* Simulated Network Nodes */}
              <svg className="w-full h-full absolute inset-0">
                {/* Edges */}
                {edges.map((edge, index) => {
                  const fromNode = nodes.find((n) => n.id === edge.from);
                  const toNode = nodes.find((n) => n.id === edge.to);
                  if (!fromNode || !toNode) return null;

                  const x1 = 150 + Math.cos(parseInt(edge.from) * 0.5) * 100;
                  const y1 = 150 + Math.sin(parseInt(edge.from) * 0.5) * 100;
                  const x2 = 150 + Math.cos(parseInt(edge.to) * 0.8) * 120;
                  const y2 = 150 + Math.sin(parseInt(edge.to) * 0.8) * 120;

                  return (
                    <line
                      key={index}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#94a3b8"
                      strokeWidth={edge.strength * 3}
                      opacity={0.6}
                    />
                  );
                })}

                {/* Nodes */}
                {nodes.map((node, index) => {
                  const x = 150 + Math.cos(index * 0.8) * (80 + index * 10);
                  const y = 150 + Math.sin(index * 0.8) * (80 + index * 10);
                  const radius = node.size / 8;

                  return (
                    <g key={node.id}>
                      <circle
                        cx={x}
                        cy={y}
                        r={radius}
                        fill={node.color}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                      />
                      <text
                        x={x}
                        y={y + radius + 12}
                        textAnchor="middle"
                        className="text-xs fill-foreground"
                        style={{ fontSize: "10px" }}
                      >
                        {node.name}
                      </text>
                    </g>
                  );
                })}
              </svg>

              <div className="absolute bottom-4 right-4 text-xs text-muted-foreground bg-background/80 p-2 rounded">
                Interactive network visualization
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Network Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Network Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Contacts</span>
                <span className="font-semibold">
                  {networkStats.totalContacts}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Groups</span>
                <span className="font-semibold">
                  {networkStats.totalGroups}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Expertise Areas</span>
                <span className="font-semibold">
                  {networkStats.totalExpertiseAreas}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Avg Connections</span>
                <span className="font-semibold">
                  {networkStats.averageConnections}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Network Density</span>
                <span className="font-semibold">
                  {networkStats.networkDensity}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Strong Connections</span>
                <span className="font-semibold">
                  {networkStats.strongConnections}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Network Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Network Insights</CardTitle>
          <CardDescription>
            AI-powered analysis of your professional network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2 text-success">Strength</h4>
              <p className="text-sm text-muted-foreground">
                Strong connections in tech and AI sectors. High expertise
                diversity.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2 text-warning">Opportunity</h4>
              <p className="text-sm text-muted-foreground">
                Consider expanding connections in finance and healthcare
                domains.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2 text-primary">Recommendation</h4>
              <p className="text-sm text-muted-foreground">
                Leverage Sarah Chen and Marcus Rodriguez as network bridges.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
