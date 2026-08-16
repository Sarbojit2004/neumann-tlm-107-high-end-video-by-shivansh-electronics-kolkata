/**
 * Every on-screen string in the reel.
 *
 * Rules this file enforces by construction:
 *   - Every technical figure is marked VERIFIED in the brief's Section 4
 *     master table. Nothing marked UNVERIFIED is stated as a claim.
 *   - No wooden presentation box is mentioned or implied. Section 4 marks the
 *     Studio Set enclosure UNVERIFIED; the Studio Set's confirmed contents are
 *     the microphone and the EA 4 shockmount.
 *   - No other microphone brand, and no other microphone in Neumann's own
 *     catalogue, is named or compared against.
 *   - Shivansh Electronics is "Neumann's Authorized Partner". The words
 *     distributor / dealer / reseller appear nowhere.
 *   - One price only: Rs. 1,44,900, inclusive of GST. No rounding, no
 *     "starting from", no second figure.
 *   - www.shivanshelectronics.in is the primary, most-repeated URL.
 */

export const PRICE = 'Rs. 1,44,900';
export const PRICE_NOTE = 'Inclusive of GST';
export const PRICE_LABEL = 'Market Operating Price';

export const SITE = 'www.shivanshelectronics.in';
export const PARTNER = "Neumann's Authorized Partner";
export const SELLER = 'Shivansh Electronics';

/** Secondary, supporting only — never asked of the viewer as the main URL. */
export const PRODUCT_PAGE = 'shivanshelectronics.in / TLM 107 Studio Set';
export const LINKTREE = 'shivanshelectronics.in/linktree-hub';

export const WHATSAPP = ['+91 98316 62458', '+91 91477 00677', '+91 89818 07755'];

export const SOCIAL = [
  {k: 'Instagram', v: 'shivanshelectronics.in/instagram-page'},
  {k: 'Facebook', v: 'shivanshelectronics.in/facebook-page'},
  {k: 'LinkedIn', v: 'shivanshelectronics.in/linkedin-page'},
  {k: 'YouTube', v: 'shivanshelectronics.in/youtube-channel'},
];

export const ADDRESS =
  'Raja Electric — Shivansh Electronics, 3, Ramanath Das Road,\nDhakuria, Tanu Pukur, Garfa, Kolkata, West Bengal, India 700031';

/** The five polar patterns, in the order the navigation toggle steps them. */
export const PATTERNS = [
  {id: 'omni', name: 'Omnidirectional', use: 'the whole room, captured'},
  {id: 'wide', name: 'Wide Angle Cardioid', use: 'a source with air around it'},
  {id: 'card', name: 'Cardioid', use: 'the everyday workhorse'},
  {id: 'hyper', name: 'Hypercardioid', use: 'maximum rejection off-axis'},
  {id: 'fig8', name: 'Figure-8', use: 'two sources, one microphone'},
] as const;

/** VERIFIED figures only — brief Section 4. */
export const SPECS = {
  splMax: {v: '141', u: 'dB', k: 'Maximum SPL'},
  splPad: {v: '153', u: 'dB', k: 'With −12 dB pad'},
  noise: {v: '10', u: 'dB-A', k: 'Self-noise'},
  patterns: {v: '5', u: '', k: 'Polar patterns'},
  freq: {v: '20 Hz – 20 kHz', u: '', k: 'Frequency range'},
  pad: {v: '0 / −6 / −12', u: 'dB', k: 'Pre-attenuation'},
  filter: {v: 'Linear / 40 / 100', u: 'Hz', k: 'Low-cut filter'},
  weight: {v: '445', u: 'g', k: 'Weight'},
  dim: {v: '64 × 145', u: 'mm', k: 'Diameter × length'},
  phantom: {v: '48', u: 'V', k: 'Phantom power'},
  sens: {v: '11', u: 'mV/Pa', k: 'Sensitivity'},
} as const;
