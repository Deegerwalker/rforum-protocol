import { describe, expect, it } from "vitest";
import { encodeEnvelope, decodeEnvelope, encodeHandshake, decodeHandshake } from "../wire/index.js";
import { generateKeypair } from "../identity/index.js";
import { signEnvelope } from "../envelope/index.js";
import { HandshakeHello } from "../handshake/index.js";

function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

describe("wire", () => {
  it("round-trips envelope", () => {
    const keys = generateKeypair();
    const unsigned = {
      version: 1,
      message_type: 16,
      sender_public_key: keys.publicKey,
      timestamp: 1700000000000,
      payload: { hello: "world", count: 2 }
    };
    const envelope = signEnvelope(unsigned, keys.secretKey);
    const encoded = encodeEnvelope(envelope);
    const decoded = decodeEnvelope(encoded);

    expect(decoded.version).toBe(envelope.version);
    expect(decoded.message_type).toBe(envelope.message_type);
    expect(decoded.timestamp).toBe(envelope.timestamp);
    expect(bytesEqual(decoded.sender_public_key, envelope.sender_public_key)).toBe(true);
    expect(bytesEqual(decoded.signature, envelope.signature)).toBe(true);
    expect(decoded.payload).toEqual(envelope.payload);
  });

  it("round-trips handshake", () => {
    const message: HandshakeHello = {
      type: "hello",
      timestamp: 1700000000000,
      capabilities: {
        supported_protocol_versions: [1],
        supported_content_types: ["text/plain"],
        supported_compression: ["none"],
        supported_replication_modes: ["gossip"],
        supported_extensions: ["rforum/core"]
      }
    };
    const encoded = encodeHandshake(message);
    const decoded = decodeHandshake(encoded);
    expect(decoded).toEqual(message);
  });
});
