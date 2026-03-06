import type router from '@myeyesid/cloud/routes';
import { type GuardedPayload, type RouterRoutes } from '@withtyped/client';

type PutRoutes = RouterRoutes<typeof router>['put'];

export type CustomJwtDeployRequestBody = GuardedPayload<
  PutRoutes['/api/services/custom-jwt/worker']
>['body'];
