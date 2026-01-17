# Wire Format

The wire format is a compact binary encoding for envelopes and handshake messages.

All frames begin with a 4-byte magic header: `0x52 0x46 0x4F 0x52` ("RFOR").

## Envelope Frame

```
[magic:4]
[kind:1]            0x01
[version:1]
[message_type:2]
[timestamp:8]
[public_key_len:2]
[public_key:public_key_len]
[payload_len:4]
[payload_json:payload_len]
[signature_len:2]
[signature:signature_len]
```

- `payload_json` is canonical JSON of the envelope payload.
- Multi-byte integers are big-endian.

## Handshake Frame

```
[magic:4]
[kind:1]            0x02
[payload_len:2]
[payload_json:payload_len]
```

The handshake payload JSON contains either a `hello` or `ack` message.

## Round-Trip

Encoders and decoders must preserve the exact envelope and handshake message content after decode/encode cycles.
