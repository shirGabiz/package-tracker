export type PackageSource = 'MANUAL' | 'EMAIL' | 'SMS' | 'WHATSAPP';

export type PackageStatus =
  | 'PENDING'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'LOST'
  | 'RETURNED';

export type InboxChannel = 'EMAIL' | 'SMS' | 'WHATSAPP' | 'MANUAL';

export interface PackageDto {
  id: string;
  title: string;
  trackingNumber?: string | null;
  carrier?: string | null;
  source: PackageSource;
  status: PackageStatus;
  expectedAt?: string | null;
  deliveredAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PackageEventDto {
  id: string;
  packageId: string;
  eventType: string;
  location?: string | null;
  occurredAt: string;
}
