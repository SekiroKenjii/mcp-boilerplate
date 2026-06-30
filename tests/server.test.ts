import { describe, expect, it } from 'vitest';

import { connectClient } from './helpers/connect.js';

describe('server', () => {
  it('advertises tools, resources and prompts', async () => {
    const { client, close } = await connectClient();
    try {
      const [{ tools }, { resources }, { prompts }] = await Promise.all([
        client.listTools(),
        client.listResources(),
        client.listPrompts(),
      ]);

      expect(tools.length).toBeGreaterThan(0);
      expect(resources.length).toBeGreaterThan(0);
      expect(prompts.length).toBeGreaterThan(0);
    } finally {
      await close();
    }
  });

  it('reads the server-info resource', async () => {
    const { client, close } = await connectClient();
    try {
      const result = await client.readResource({ uri: 'info://server' });
      const first = result.contents[0];
      expect(first?.mimeType).toBe('application/json');
      const text = first && 'text' in first ? first.text : '';
      const payload = JSON.parse(String(text)) as { name: string; version: string };
      expect(payload.name).toBe('mcp-boilerplate');
    } finally {
      await close();
    }
  });
});
