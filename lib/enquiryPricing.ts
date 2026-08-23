import type { Enquiry, EnquiryDevice } from './types'

type PriceDevice = Partial<EnquiryDevice> & {
  base?: number
  final?: number
  category?: string
  admin_final_price?: boolean
}

export function enquiryDeviceAmount(device: PriceDevice): number {
  if (device.category === 'android') return 0
  if (device.admin_final_price) return Number(device.final) || 0
  return Number(device.base) || 0
}

export function enquiryAmount(enquiry: Pick<Enquiry, 'devices' | 'total_amount'>): number {
  const devices = Array.isArray(enquiry.devices) ? (enquiry.devices as PriceDevice[]) : []
  if (!devices.length) return Number(enquiry.total_amount) || 0
  return devices.reduce((sum, device) => sum + enquiryDeviceAmount(device), 0)
}
