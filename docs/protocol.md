# RForum Protocol Specification

This document defines the core RForum protocol as an app-agnostic library. The protocol is designed for mesh-native distribution and is suitable for a variety of clients (desktop, web, embedded).

## Overview

RForum defines:

- A canonical envelope format for signed messages
- A capability negotiation handshake
- A compact binary wire encoding
- Immutable content objects (posts, edits, threads, forks)
- Replication primitives for gossip and pull/push
- Extensions for namespaced message types and capabilities

## Envelope

The canonical envelope includes:

- `version` (number)
- `message_type` (number)
- `sender_public_key` (bytes)
- `timestamp` (unix ms)
- `payload` (object)
- `signature` (bytes)

Signatures are computed over the canonical JSON of the envelope without the `signature` field.

## Content Model

Content objects are immutable. A content hash is derived from canonical JSON and can be used as a stable identifier.

- Post: message body with `thread_id`, `author_id`, `content_type`, and `body`
- Edit: patch applied to a target content object
- Thread: thread metadata
- Fork: record that one thread was forked from another

## Replication

Replication is based on gossip and pull/push. Nodes can advertise what they have (`have`) and what they want (`want`), or explicitly negotiate a pull/push session for a topic and time range.

## Extensions

Extensions are namespaced and registered in the extension registry. Extensions may add message types and capability strings.

## Versioning

Protocol versioning uses semantic versioning at the npm package level. Within the wire format, `version` refers to the protocol major version supported by the encoder/decoder.
