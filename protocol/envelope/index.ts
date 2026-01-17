import nacl from "tweetnacl";
import { canonicalJson, utf8ToBytes, bytesToUtf8, Bytes } from "../utils.js";

export type MessageType = number;

export interface Envelope {
  version: number;
  message_type: MessageType;
  sender_public_key: Bytes;
  timestamp: number;
  payload: unknown;
  signature: Bytes;
}

export interface EnvelopeUnsigned {
  version: number;
  message_type: MessageType;
  sender_public_key: Bytes;
  timestamp: number;
  payload: unknown;
}

export function createEnvelope(unsigned: EnvelopeUnsigned, signature: Bytes): Envelope {
  return { ...unsigned, signature };
}

export function serializeEnvelope(envelope: Envelope): string {
  return canonicalJson({
    version: envelope.version,
    message_type: envelope.message_type,
    sender_public_key: Array.from(envelope.sender_public_key),
    timestamp: envelope.timestamp,
    payload: envelope.payload,
    signature: Array.from(envelope.signature)
  });
}

export function deserializeEnvelope(serialized: string): Envelope {
  const parsed = JSON.parse(serialized) as Record<string, unknown>;
  return envelopeFromObject(parsed);
}

export function envelopeFromObject(obj: Record<string, unknown>): Envelope {
  const version = Number(obj.version);
  const messageType = Number(obj.message_type);
  const sender = new Uint8Array(obj.sender_public_key as number[]);
  const signature = new Uint8Array(obj.signature as number[]);
  return {
    version,
    message_type: messageType,
    sender_public_key: sender,
    timestamp: Number(obj.timestamp),
    payload: obj.payload,
    signature
  };
}

export function unsignedEnvelopeBytes(unsigned: EnvelopeUnsigned): Bytes {
  const json = canonicalJson({
    version: unsigned.version,
    message_type: unsigned.message_type,
    sender_public_key: Array.from(unsigned.sender_public_key),
    timestamp: unsigned.timestamp,
    payload: unsigned.payload
  });
  return utf8ToBytes(json);
}

export function signEnvelope(unsigned: EnvelopeUnsigned, secretKey: Bytes): Envelope {
  const message = unsignedEnvelopeBytes(unsigned);
  const signature = nacl.sign.detached(message, secretKey);
  return createEnvelope(unsigned, signature);
}

export function verifyEnvelope(envelope: Envelope): boolean {
  const unsigned: EnvelopeUnsigned = {
    version: envelope.version,
    message_type: envelope.message_type,
    sender_public_key: envelope.sender_public_key,
    timestamp: envelope.timestamp,
    payload: envelope.payload
  };
  const message = unsignedEnvelopeBytes(unsigned);
  return nacl.sign.detached.verify(message, envelope.signature, envelope.sender_public_key);
}

export function envelopeToBytes(envelope: Envelope): Bytes {
  return utf8ToBytes(serializeEnvelope(envelope));
}

export function envelopeFromBytes(bytes: Bytes): Envelope {
  return deserializeEnvelope(bytesToUtf8(bytes));
}
