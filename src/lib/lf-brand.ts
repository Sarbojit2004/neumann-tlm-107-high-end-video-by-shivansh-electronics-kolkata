import {staticFile} from 'remotion';
import {CH} from './lf-theme';

/**
 * THE BRANDING CADENCE.
 *
 * The long-form video uses BOTH logos deliberately and repeatedly — the exact
 * reverse of the companion reel, which uses neither. The spec sets three hard
 * requirements this table exists to satisfy and to make auditable:
 *
 *   1. No stretch longer than ~30-40 s may pass without some visible Shivansh
 *      Electronics presence.
 *   2. Every one of the seven chapters must contain at least one Shivansh
 *      Electronics beat.
 *   3. Neumann must recur across the runtime — including mid-video, not only
 *      at the open and close — but noticeably less often than Shivansh.
 *
 * Declaring every appearance as data (rather than scattering logos through
 * scene code) is what lets scripts/branding_cadence.mjs verify all three
 * numerically and fail the build on a gap.
 *
 * FORM matters as much as frequency: the spec asks for variety, so each entry
 * declares its kind — a full branding beat between chapters, a corner mark
 * during a hero shot, or a lower-third contact detail under a technical
 * explanation.
 */

export const logo = (which: 'neumann' | 'shivansh'): string =>
  staticFile(`logo/${which}.png`);

export type BrandKind = 'beat' | 'corner' | 'lower-third';

export type BrandSlot = {
  /** absolute start frame */
  at: number;
  dur: number;
  brand: 'shivansh' | 'neumann';
  kind: BrandKind;
  /** contact detail to show, for lower-thirds and beats */
  detail?: string;
  label?: string;
};

const f = (chapter: string, sec: number) => CH[chapter].start + Math.round(sec * 30);

/**
 * Every branded appearance in the video, in order.
 *
 * Shivansh lands roughly every 20-28 s across all 298 s; Neumann appears five
 * times — opening, the capsule segment, mid-video during heritage, and the
 * outro — which is present throughout without matching Shivansh's cadence.
 */
export const BRAND_SLOTS: BrandSlot[] = [
  // ---- C1  0-25 s ----------------------------------------------------
  {at: f('C1', 1.5), dur: 105, brand: 'neumann', kind: 'corner'},
  {at: f('C1', 9.0), dur: 150, brand: 'shivansh', kind: 'corner'},
  {at: f('C1', 18.5), dur: 165, brand: 'shivansh', kind: 'lower-third',
   detail: 'www.shivanshelectronics.in', label: "Neumann's Authorized Partner"},

  // ---- C2  25-75 s ---------------------------------------------------
  {at: f('C2', 3.0), dur: 150, brand: 'shivansh', kind: 'corner'},
  {at: f('C2', 14.0), dur: 130, brand: 'neumann', kind: 'corner'},
  {at: f('C2', 22.0), dur: 175, brand: 'shivansh', kind: 'lower-third',
   detail: 'www.shivanshelectronics.in', label: 'Available now at'},
  {at: f('C2', 38.0), dur: 190, brand: 'shivansh', kind: 'beat',
   detail: 'www.shivanshelectronics.in', label: "Neumann's Authorized Partner"},

  // ---- C3  75-120 s --------------------------------------------------
  {at: f('C3', 4.0), dur: 150, brand: 'shivansh', kind: 'corner'},
  {at: f('C3', 16.0), dur: 175, brand: 'shivansh', kind: 'lower-third',
   detail: 'shivanshelectronics.in/linktree-hub', label: 'Your gateway to Shivansh Electronics'},
  {at: f('C3', 31.0), dur: 165, brand: 'shivansh', kind: 'corner'},

  // ---- C4  120-160 s -------------------------------------------------
  {at: f('C4', 3.0), dur: 150, brand: 'shivansh', kind: 'corner'},
  {at: f('C4', 15.0), dur: 180, brand: 'shivansh', kind: 'lower-third',
   detail: 'www.shivanshelectronics.in', label: 'Enquiries · +91 98316 62458'},
  {at: f('C4', 30.0), dur: 165, brand: 'shivansh', kind: 'corner'},

  // ---- C5  160-210 s -------------------------------------------------
  {at: f('C5', 2.0), dur: 140, brand: 'neumann', kind: 'corner'},
  {at: f('C5', 9.0), dur: 200, brand: 'shivansh', kind: 'beat',
   detail: 'www.shivanshelectronics.in', label: "Neumann's Authorized Partner"},
  {at: f('C5', 24.0), dur: 165, brand: 'shivansh', kind: 'corner'},
  {at: f('C5', 37.0), dur: 180, brand: 'shivansh', kind: 'lower-third',
   detail: 'www.shivanshelectronics.in', label: 'Instagram · Facebook · LinkedIn · YouTube'},

  // ---- C6  210-260 s -------------------------------------------------
  {at: f('C6', 3.0), dur: 150, brand: 'shivansh', kind: 'corner'},
  {at: f('C6', 15.0), dur: 180, brand: 'shivansh', kind: 'lower-third',
   detail: 'www.shivanshelectronics.in', label: 'Kolkata · Since 1985'},
  {at: f('C6', 28.0), dur: 145, brand: 'neumann', kind: 'corner'},
  {at: f('C6', 38.0), dur: 200, brand: 'shivansh', kind: 'beat',
   detail: 'www.shivanshelectronics.in', label: "Neumann's Authorized Partner"},

  // ---- C7  260-298 s -- the outro carries both, sustained -------------
  {at: f('C7', 1.0), dur: 240, brand: 'shivansh', kind: 'corner'},
  {at: f('C7', 12.0), dur: 300, brand: 'neumann', kind: 'corner'},
];
