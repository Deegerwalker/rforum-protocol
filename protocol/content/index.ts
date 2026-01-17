import { sha256 } from "@noble/hashes/sha256";
import { Bytes, bytesToHex, canonicalJson } from "../utils.js";

export type ContentType = "text/plain" | "application/json";

export interface PostContent {
  kind: "post";
  thread_id: string;
  author_id: string;
  created_at: number;
  content_type: ContentType;
  body: string;
}

export interface EditContent {
  kind: "edit";
  target_id: string;
  author_id: string;
  created_at: number;
  patch: PatchOperation[];
}

export interface ThreadContent {
  kind: "thread";
  thread_id: string;
  root_post_id: string;
  created_at: number;
  title?: string;
}

export interface ForkContent {
  kind: "fork";
  source_thread_id: string;
  fork_thread_id: string;
  created_at: number;
}

export type ContentObject = PostContent | EditContent | ThreadContent | ForkContent;

export interface PatchOperation {
  op: "add" | "remove" | "replace";
  path: string;
  value?: unknown;
}

export function createPost(input: Omit<PostContent, "kind">): PostContent {
  return { kind: "post", ...input };
}

export function createEdit(input: Omit<EditContent, "kind">): EditContent {
  return { kind: "edit", ...input };
}

export function hashContent(content: ContentObject): string {
  const json = canonicalJson(content);
  return bytesToHex(sha256(new TextEncoder().encode(json)));
}

export function applyPatch<T extends Record<string, unknown>>(base: T, patch: PatchOperation[]): T {
  let output: Record<string, unknown> = { ...base };
  for (const op of patch) {
    output = applyOperation(output, op);
  }
  return output as T;
}

function applyOperation(target: Record<string, unknown>, op: PatchOperation): Record<string, unknown> {
  const pathParts = op.path.split("/").filter((part) => part.length > 0);
  if (pathParts.length === 0) {
    return target;
  }
  const root = { ...target };
  let cursor: Record<string, unknown> = root;
  for (let i = 0; i < pathParts.length - 1; i += 1) {
    const key = pathParts[i];
    const next = cursor[key];
    if (typeof next !== "object" || next === null) {
      cursor[key] = {};
    }
    cursor = cursor[key] as Record<string, unknown>;
  }
  const lastKey = pathParts[pathParts.length - 1];
  if (op.op === "remove") {
    delete cursor[lastKey];
  } else if (op.op === "add" || op.op === "replace") {
    cursor[lastKey] = op.value;
  }
  return root;
}
