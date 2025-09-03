import { createRpcClient } from '@nikolayemrikh/rpc-ts-client';
import { RpcMethods } from './rpc-types/rpc-ts-server';

// Экспортируем с типами
export const rpc = createRpcClient<RpcMethods>(import.meta.env.VITE_API_URL, { credentials: 'include' });
