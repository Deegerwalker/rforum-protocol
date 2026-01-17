import { nowUnixMillis } from "../utils.js";

export interface GossipHave {
  type: "have";
  topic_id: string;
  post_ids: string[];
  timestamp: number;
}

export interface GossipWant {
  type: "want";
  topic_id: string;
  post_ids: string[];
  timestamp: number;
}

export type GossipMessage = GossipHave | GossipWant;

export interface PullRequest {
  type: "pull";
  topic_id: string;
  since_ts: number;
  until_ts: number;
  max_items: number;
}

export interface PushOffer {
  type: "push";
  topic_id: string;
  post_ids: string[];
}

export interface PullPushNegotiation {
  request: PullRequest;
  offers: PushOffer[];
}

export class NeighborhoodCache {
  private peers: Map<string, PeerEntry> = new Map();
  private maxPeers: number;

  constructor(maxPeers = 128) {
    this.maxPeers = maxPeers;
  }

  recordPeer(peerId: string, topics: string[]): void {
    if (!this.peers.has(peerId) && this.peers.size >= this.maxPeers) {
      const oldest = Array.from(this.peers.values()).sort((a, b) => a.last_seen - b.last_seen)[0];
      if (oldest) {
        this.peers.delete(oldest.peer_id);
      }
    }
    this.peers.set(peerId, {
      peer_id: peerId,
      topics,
      last_seen: nowUnixMillis()
    });
  }

  getPeersForTopic(topicId: string): string[] {
    return Array.from(this.peers.values())
      .filter((peer) => peer.topics.includes(topicId))
      .map((peer) => peer.peer_id);
  }

  listPeers(): PeerEntry[] {
    return Array.from(this.peers.values());
  }
}

interface PeerEntry {
  peer_id: string;
  topics: string[];
  last_seen: number;
}
