export type GraphNodeType = "repo" | "tech" | "concept";

export interface GraphNode {
  id: string;
  type: GraphNodeType;
  subtype?: "language" | "framework";
  label: string;
  description?: string;
  url?: string;
  homepage?: string;
  stars?: number;
  forks?: number;
  updatedAt?: string;
  primaryLanguage?: string | null;
  flagship?: boolean;
  color: string;
  degree: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight: number;
  kind: "language" | "tech" | "concept";
}

export interface EnrichedRepo {
  id: number | string;
  nodeId: string;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  languages: string[];
  techs: string[];
  concepts: string[];
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  flagship: boolean;
  updated_at: string;
}

export interface GraphUser {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  location: string | null;
  blog: string | null;
  html_url: string;
  public_repos: number;
  followers: number;
  following: number;
}

export interface GraphIndexData {
  generatedAt: string;
  user: GraphUser;
  stats: {
    totalNodes: number;
    repoNodes: number;
    techNodes: number;
    conceptNodes: number;
    totalEdges: number;
  };
  nodes: GraphNode[];
  edges: GraphEdge[];
  repos: EnrichedRepo[];
}
