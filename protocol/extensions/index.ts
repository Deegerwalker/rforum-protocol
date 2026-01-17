export interface ExtensionDefinition {
  namespace: string;
  message_types: string[];
  capabilities: string[];
}

export class ExtensionRegistry {
  private extensions: Map<string, ExtensionDefinition> = new Map();

  register(extension: ExtensionDefinition): void {
    const key = extension.namespace;
    if (this.extensions.has(key)) {
      throw new Error("Extension already registered");
    }
    this.extensions.set(key, extension);
  }

  list(): ExtensionDefinition[] {
    return Array.from(this.extensions.values());
  }

  registerMessageType(namespace: string, messageType: string): void {
    const extension = this.getOrCreate(namespace);
    if (!extension.message_types.includes(messageType)) {
      extension.message_types.push(messageType);
    }
  }

  registerCapability(namespace: string, capability: string): void {
    const extension = this.getOrCreate(namespace);
    if (!extension.capabilities.includes(capability)) {
      extension.capabilities.push(capability);
    }
  }

  private getOrCreate(namespace: string): ExtensionDefinition {
    const existing = this.extensions.get(namespace);
    if (existing) {
      return existing;
    }
    const created: ExtensionDefinition = {
      namespace,
      message_types: [],
      capabilities: []
    };
    this.extensions.set(namespace, created);
    return created;
  }
}
