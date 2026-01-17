# Handshake Flow

The handshake negotiates capabilities between peers before exchanging content.

## Capabilities

Each peer advertises:

- `supported_protocol_versions` (array of numbers)
- `supported_content_types` (array of strings)
- `supported_compression` (array of strings)
- `supported_replication_modes` (array of strings)
- `supported_extensions` (array of strings)

## Flow

1. Initiator sends `hello` with capabilities.
2. Responder evaluates and returns `ack` with negotiated capabilities.
3. Initiator accepts `ack` and marks the session negotiated.
4. If no common protocol version exists, the handshake fails.

## State Machine

States:

- `idle`
- `sent`
- `received`
- `negotiated`
- `failed`

The responder transitions directly from `received` to `negotiated` or `failed` based on the negotiation result.
