import { Sentinel, SentinelDecision } from '@myeyesid/schemas';

export class MockSentinel extends Sentinel {
  override async reportActivity(activity: unknown) {
    return [SentinelDecision.Allowed, Date.now()] as const;
  }
}
