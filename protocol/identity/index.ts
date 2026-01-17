import nacl from "tweetnacl";
import { sha256 } from "@noble/hashes/sha256";
import { Bytes, bytesToHex, hexToBytes } from "../utils.js";

export interface Keypair {
  publicKey: Bytes;
  secretKey: Bytes;
}

export interface Persona {
  id: string;
  publicKey: Bytes;
  label?: string;
}

export function generateKeypair(): Keypair {
  const keys = nacl.sign.keyPair();
  return { publicKey: keys.publicKey, secretKey: keys.secretKey };
}

export function deriveIdentityId(publicKey: Bytes): string {
  return bytesToHex(sha256(publicKey));
}

export function createPersona(publicKey: Bytes, label?: string): Persona {
  return { id: deriveIdentityId(publicKey), publicKey, label };
}

export interface SerializedIdentity {
  public_key_hex: string;
  secret_key_hex: string;
  label?: string;
}

export function serializeIdentity(keypair: Keypair, label?: string): SerializedIdentity {
  return {
    public_key_hex: bytesToHex(keypair.publicKey),
    secret_key_hex: bytesToHex(keypair.secretKey),
    label
  };
}

export function deserializeIdentity(serialized: SerializedIdentity): Keypair {
  return {
    publicKey: hexToBytes(serialized.public_key_hex),
    secretKey: hexToBytes(serialized.secret_key_hex)
  };
}
