import { type Client } from '@modelcontextprotocol/sdk/client/index.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { connectClient } from '../helpers/connect.js';

describe('echo tool', () => {
  let client: Client;
  let close: () => Promise<void>;

  beforeEach(async () => {
    ({ client, close } = await connectClient());
  });

  afterEach(async () => {
    await close();
  });

  it('is advertised by the server', async () => {
    const { tools } = await client.listTools();
    expect(tools.map((tool) => tool.name)).toContain('echo');
  });

  it('echoes the message back with structured content', async () => {
    const result = await client.callTool({ name: 'echo', arguments: { message: 'hello' } });
    expect(result.structuredContent).toEqual({ echoed: 'hello', length: 5 });
  });

  it('upper-cases when requested', async () => {
    const result = await client.callTool({
      name: 'echo',
      arguments: { message: 'hello', uppercase: true },
    });
    expect(result.structuredContent).toEqual({ echoed: 'HELLO', length: 5 });
  });
});
