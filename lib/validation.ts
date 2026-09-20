
// lib/validation.ts - Weka hii file mpya
export const NETWORK_PREFIXES: Record<string, string[]> = {
  "M-Pesa": ["74", "75", "76"],
  "Mixx by Yas": ["65", "67", "71"],
  "Airtel Money": ["68", "69", "78"],
  "HaloPesa": ["62"]
}

export function normalizeTZPhone(phone: string): string {
  let p = phone.replace(/[^0-9+]/g, "")
  if (p.startsWith("+255")) p = "0" + p.slice(4)
  if (p.startsWith("255")) p = "0" + p.slice(3)
  return p
}

export function isValidTZPhone(phone: string): boolean {
  const p = normalizeTZPhone(phone)
  // 07xxxxxxxx au 06xxxxxxxx - digits 10
  return /^0[67]\d{8}$/.test(p)
}

export function getNetworkFromPhone(phone: string): string | null {
  const p = normalizeTZPhone(phone)
  if (!isValidTZPhone(p)) return null
  const prefix = p.slice(1, 3) // 74, 65 n.k
  for (const [network, prefixes] of Object.entries(NETWORK_PREFIXES)) {
    if (prefixes.includes(prefix)) return network
  }
  return null
}

export function validatePaymentForm(phone: string, whatsapp: string, method: string): { valid: boolean; error?: string } {
  const normPhone = normalizeTZPhone(phone)
  const normWa = normalizeTZPhone(whatsapp)

  if (!isValidTZPhone(normPhone)) {
    return { valid: false, error: "Namba ya malipo si sahihi. Tumia format 07XXXXXXXX" }
  }
  if (!isValidTZPhone(normWa)) {
    return { valid: false, error: "Namba ya WhatsApp si sahihi. Tumia format 07XXXXXXXX" }
  }
  if (normPhone.length !== 10 || normWa.length !== 10) {
    return { valid: false, error: "Namba lazima iwe na tarakimu 10" }
  }

  const detectedNetwork = getNetworkFromPhone(normPhone)
  if (!detectedNetwork) {
    return { valid: false, error: "Mtandao wa namba hii haujulikani" }
  }
  if (detectedNetwork !== method) {
    return { valid: false, error: `Umechagua ${method} lakini namba ${normPhone} ni ya ${detectedNetwork}. Badilisha mtandao au namba.` }
  }

  return { valid: true }
}
