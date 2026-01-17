import { canonicalJson, bytesToUtf8, utf8ToBytes, Bytes, concatBytes } from "../utils.js";
import { Envelope, envelopeFromObject } from "../envelope/index.js";
import { HandshakeMessage } from "../handshake/index.js";

const MAGIC = new Uint8Array([0x52, 0x46, 0x4f, 0x52]);
const KIND_ENVELOPE = 1;
const KIND_HANDSHAKE = 2;

export function encodeEnvelope(envelope: Envelope): Bytes {
  const payloadJson = canonicalJson(envelope.payload);
  const payloadBytes = utf8ToBytes(payloadJson);
  const header = new ByteWriter();
  header.writeBytes(MAGIC);
  header.writeU8(KIND_ENVELOPE);
  header.writeU8(envelope.version);
  header.writeU16(envelope.message_type);
  header.writeU64(envelope.timestamp);
  header.writeU16(envelope.sender_public_key.length);
  header.writeBytes(envelope.sender_public_key);
  header.writeU32(payloadBytes.length);
  header.writeBytes(payloadBytes);
  header.writeU16(envelope.signature.length);
  header.writeBytes(envelope.signature);
  return header.toBytes();
}

export function decodeEnvelope(bytes: Bytes): Envelope {
  const reader = new ByteReader(bytes);
  reader.expectBytes(MAGIC);
  reader.expectU8(KIND_ENVELOPE);
  const version = reader.readU8();
  const messageType = reader.readU16();
  const timestamp = reader.readU64();
  const pubLen = reader.readU16();
  const publicKey = reader.readBytes(pubLen);
  const payloadLen = reader.readU32();
  const payloadJson = bytesToUtf8(reader.readBytes(payloadLen));
  const signatureLen = reader.readU16();
  const signature = reader.readBytes(signatureLen);

  const payload = JSON.parse(payloadJson) as unknown;
  return envelopeFromObject({
    version,
    message_type: messageType,
    sender_public_key: Array.from(publicKey),
    timestamp,
    payload,
    signature: Array.from(signature)
  });
}

export function encodeHandshake(message: HandshakeMessage): Bytes {
  const payloadJson = canonicalJson(message);
  const payloadBytes = utf8ToBytes(payloadJson);
  const header = new ByteWriter();
  header.writeBytes(MAGIC);
  header.writeU8(KIND_HANDSHAKE);
  header.writeU16(payloadBytes.length);
  header.writeBytes(payloadBytes);
  return header.toBytes();
}

export function decodeHandshake(bytes: Bytes): HandshakeMessage {
  const reader = new ByteReader(bytes);
  reader.expectBytes(MAGIC);
  reader.expectU8(KIND_HANDSHAKE);
  const len = reader.readU16();
  const payload = bytesToUtf8(reader.readBytes(len));
  return JSON.parse(payload) as HandshakeMessage;
}

class ByteWriter {
  private parts: Bytes[] = [];

  writeU8(value: number): void {
    this.parts.push(new Uint8Array([value & 0xff]));
  }

  writeU16(value: number): void {
    const buf = new Uint8Array(2);
    const view = new DataView(buf.buffer);
    view.setUint16(0, value, false);
    this.parts.push(buf);
  }

  writeU32(value: number): void {
    const buf = new Uint8Array(4);
    const view = new DataView(buf.buffer);
    view.setUint32(0, value, false);
    this.parts.push(buf);
  }

  writeU64(value: number): void {
    const buf = new Uint8Array(8);
    const view = new DataView(buf.buffer);
    view.setBigUint64(0, BigInt(value), false);
    this.parts.push(buf);
  }

  writeBytes(bytes: Bytes): void {
    this.parts.push(bytes);
  }

  toBytes(): Bytes {
    return concatBytes(this.parts);
  }
}

class ByteReader {
  private offset = 0;
  private view: DataView;
  private bytes: Bytes;

  constructor(bytes: Bytes) {
    this.bytes = bytes;
    this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  }

  readU8(): number {
    const value = this.view.getUint8(this.offset);
    this.offset += 1;
    return value;
  }

  readU16(): number {
    const value = this.view.getUint16(this.offset, false);
    this.offset += 2;
    return value;
  }

  readU32(): number {
    const value = this.view.getUint32(this.offset, false);
    this.offset += 4;
    return value;
  }

  readU64(): number {
    const value = Number(this.view.getBigUint64(this.offset, false));
    this.offset += 8;
    return value;
  }

  readBytes(length: number): Bytes {
    const out = this.bytes.slice(this.offset, this.offset + length);
    this.offset += length;
    return out;
  }

  expectBytes(expected: Bytes): void {
    const actual = this.readBytes(expected.length);
    for (let i = 0; i < expected.length; i += 1) {
      if (actual[i] !== expected[i]) {
        throw new Error("Invalid magic bytes");
      }
    }
  }

  expectU8(expected: number): void {
    const actual = this.readU8();
    if (actual !== expected) {
      throw new Error("Unexpected message kind");
    }
  }
}
