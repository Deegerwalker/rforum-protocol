# Extensions

Extensions allow additional message types and capability declarations without changing the core protocol.

## Namespacing

Extensions must use a stable namespace (for example: `rforum/extensions/reactions`).

## Registration

Use the `ExtensionRegistry` to register:

- message types
- capabilities

Example:

```
import { ExtensionRegistry } from "@rforum/protocol";

const registry = new ExtensionRegistry();
registry.register({
  namespace: "rforum/extensions/reactions",
  message_types: ["reaction:add"],
  capabilities: ["reactions/v1"]
});
```

## Validation

Extensions should validate payloads before signing and broadcasting. Core protocol layers should treat extensions as opaque payloads and only enforce envelope validation.
