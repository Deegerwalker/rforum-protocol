import { nowUnixMillis } from "../utils.js";

export interface Capabilities {
  supported_protocol_versions: number[];
  supported_content_types: string[];
  supported_compression: string[];
  supported_replication_modes: string[];
  supported_extensions: string[];
}

export interface NegotiatedCapabilities {
  protocol_version: number | null;
  content_types: string[];
  compression: string[];
  replication_modes: string[];
  extensions: string[];
}

export interface HandshakeHello {
  type: "hello";
  timestamp: number;
  capabilities: Capabilities;
}

export interface HandshakeAck {
  type: "ack";
  timestamp: number;
  negotiated: NegotiatedCapabilities;
}

export type HandshakeMessage = HandshakeHello | HandshakeAck;

export function negotiateCapabilities(local: Capabilities, remote: Capabilities): NegotiatedCapabilities {
  const protocol_version = intersectNumbers(local.supported_protocol_versions, remote.supported_protocol_versions)[0] ?? null;
  return {
    protocol_version,
    content_types: intersectStrings(local.supported_content_types, remote.supported_content_types),
    compression: intersectStrings(local.supported_compression, remote.supported_compression),
    replication_modes: intersectStrings(local.supported_replication_modes, remote.supported_replication_modes),
    extensions: intersectStrings(local.supported_extensions, remote.supported_extensions)
  };
}

export type HandshakeState = "idle" | "sent" | "received" | "negotiated" | "failed";

export class HandshakeMachine {
  private state: HandshakeState = "idle";
  private local: Capabilities;
  private remote: Capabilities | null = null;
  private negotiated: NegotiatedCapabilities | null = null;

  constructor(local: Capabilities) {
    this.local = local;
  }

  getState(): HandshakeState {
    return this.state;
  }

  getNegotiated(): NegotiatedCapabilities | null {
    return this.negotiated;
  }

  createHello(): HandshakeHello {
    this.state = "sent";
    return { type: "hello", timestamp: nowUnixMillis(), capabilities: this.local };
  }

  receiveHello(message: HandshakeHello): HandshakeAck {
    this.remote = message.capabilities;
    this.state = "received";
    this.negotiated = negotiateCapabilities(this.local, message.capabilities);
    this.state = this.negotiated.protocol_version ? "negotiated" : "failed";
    return { type: "ack", timestamp: nowUnixMillis(), negotiated: this.negotiated };
  }

  receiveAck(message: HandshakeAck): void {
    this.negotiated = message.negotiated;
    this.state = this.negotiated.protocol_version ? "negotiated" : "failed";
  }
}

function intersectStrings(a: string[], b: string[]): string[] {
  const set = new Set(b);
  return a.filter((item) => set.has(item));
}

function intersectNumbers(a: number[], b: number[]): number[] {
  const set = new Set(b);
  return a.filter((item) => set.has(item)).sort((x, y) => y - x);
}
