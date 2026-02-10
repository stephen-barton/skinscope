export type Tier = "free" | "pro";

export const TIER_LIMITS = {
  free: {
    maxAlerts: 3,
    dataDelaySeconds: 60,
    dealFeed: "limited" as const,
    apiAccess: false,
  },
  pro: {
    maxAlerts: Infinity,
    dataDelaySeconds: 0,
    dealFeed: "full" as const,
    apiAccess: true,
  },
} as const;

export type TierLimits = (typeof TIER_LIMITS)[Tier];

export function getTierLimits(tier: Tier): TierLimits {
  return TIER_LIMITS[tier];
}

export function canCreateAlert(tier: Tier, currentAlertCount: number): boolean {
  return currentAlertCount < TIER_LIMITS[tier].maxAlerts;
}

export function getDataDelay(tier: Tier): number {
  return TIER_LIMITS[tier].dataDelaySeconds;
}

export function hasFullDealFeed(tier: Tier): boolean {
  return TIER_LIMITS[tier].dealFeed === "full";
}

export function hasApiAccess(tier: Tier): boolean {
  return TIER_LIMITS[tier].apiAccess;
}
