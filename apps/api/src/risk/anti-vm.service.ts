import { Injectable } from '@nestjs/common';

export interface VmFlags {
  vendorString?: string | null;
  macPrefix?: string | null;
  hypervisorPresent?: boolean | null;
}

export interface VmVerdict {
  vmLikely: boolean;
  reasons: string[];
  /** Soft action: VM => free credit NOT eligible + verify-to-continue. Never auto-block. */
  freeCreditEligible: boolean;
}

const VM_VENDOR = ['vmware', 'virtualbox', 'vbox', 'qemu', 'kvm', 'xen', 'hyper-v', 'parallels', 'bhyve'];
const VM_MAC = ['00:05:69', '00:0c:29', '00:50:56', '08:00:27', '52:54:00', '00:15:5d'];

/**
 * Anti-VM evaluation (server half of the device check).
 * Desktop reports vendor/MAC/hypervisor flags at launch; a VM verdict only
 * gates FREE credits + asks verification — office/college VMs are not blocked.
 */
@Injectable()
export class AntiVmService {
  evaluate(flags: VmFlags | null | undefined): VmVerdict {
    const reasons: string[] = [];
    if (!flags) return { vmLikely: false, reasons, freeCreditEligible: true };

    const vendor = (flags.vendorString ?? '').toLowerCase();
    if (vendor && VM_VENDOR.some((v) => vendor.includes(v))) reasons.push('vm_vendor_string');

    const mac = (flags.macPrefix ?? '').toLowerCase();
    if (mac && VM_MAC.some((p) => mac.startsWith(p))) reasons.push('vm_mac_prefix');

    if (flags.hypervisorPresent === true) reasons.push('hypervisor_flag');

    const vmLikely = reasons.length > 0;
    return { vmLikely, reasons, freeCreditEligible: !vmLikely };
  }
}
