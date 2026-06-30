import { describe, expect, it } from 'vitest';

import { connectClient } from '../helpers/connect.js';

describe('summarize prompt', () => {
  it('renders a user message containing the text and style', async () => {
    const { client, close } = await connectClient();
    try {
      const result = await client.getPrompt({
        name: 'summarize',
        arguments: { text: 'hello world', style: 'bullets' },
      });
      const first = result.messages[0];
      expect(first?.role).toBe('user');
      const content = first?.content;
      const text = content && content.type === 'text' ? content.text : '';
      expect(text).toContain('bullets');
      expect(text).toContain('hello world');
    } finally {
      await close();
    }
  });
});
