import type { ComponentProps } from 'react';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';

export type IconName =
  | 'menu' | 'calendar' | 'clock' | 'list' | 'circle' | 'check' | 'plus'
  | 'play' | 'more' | 'star' | 'filter' | 'home' | 'folder' | 'bars'
  | 'search' | 'briefcase' | 'book' | 'heart' | 'grid' | 'bulb'
  | 'chevron-right' | 'chevron-left' | 'chevron-down' | 'sliders' | 'pause' | 'stop'
  | 'previous' | 'target' | 'archive' | 'inbox' | 'bell' | 'repeat' | 'note'
  | 'checklist' | 'copy' | 'tomorrow' | 'trash' | 'flame' | 'edit'
  | 'graduation-cap' | 'atom' | 'dumbbell' | 'bicycle' | 'code' | 'laptop'
  | 'coin' | 'wallet' | 'camera' | 'music-note' | 'palette' | 'airplane'
  | 'leaf' | 'mountain' | 'trophy' | 'users';

type IconWeight = 'regular' | 'fill';
type ProfessionalNavIconName = 'home' | 'calendar' | 'circle' | 'folder' | 'bars';
type ProfessionalControlIconName = 'plus' | 'sliders' | 'play' | 'pause' | 'stop' | 'more' | 'chevron-right' | 'chevron-left' | 'chevron-down' | 'search' | 'check';

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  weight?: 'regular' | 'fill';
} & Omit<ComponentProps<typeof Svg>, 'width' | 'height'>;

// Navigation/control paths are sourced from Phosphor Icons (MIT) and kept
// behind FocoIcon so the product stays decoupled from a third-party component API.
const PHOSPHOR_NAV_ICONS: Record<ProfessionalNavIconName, Record<IconWeight, string>> = {
  home: {
    regular: 'M219.31,108.68l-80-80a16,16,0,0,0-22.62,0l-80,80A15.87,15.87,0,0,0,32,120v96a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V160h32v56a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V120A15.87,15.87,0,0,0,219.31,108.68ZM208,208H160V152a8,8,0,0,0-8-8H104a8,8,0,0,0-8,8v56H48V120l80-80,80,80Z',
    fill: 'M224,120v96a8,8,0,0,1-8,8H160a8,8,0,0,1-8-8V164a4,4,0,0,0-4-4H108a4,4,0,0,0-4,4v52a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V120a16,16,0,0,1,4.69-11.31l80-80a16,16,0,0,1,22.62,0l80,80A16,16,0,0,1,224,120Z',
  },
  calendar: {
    regular: 'M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Z',
    fill: 'M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,48H48V48H72v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24Z',
  },
  circle: {
    regular: 'M232,120h-8.34A96.14,96.14,0,0,0,136,32.34V24a8,8,0,0,0-16,0v8.34A96.14,96.14,0,0,0,32.34,120H24a8,8,0,0,0,0,16h8.34A96.14,96.14,0,0,0,120,223.66V232a8,8,0,0,0,16,0v-8.34A96.14,96.14,0,0,0,223.66,136H232a8,8,0,0,0,0-16Zm-96,87.6V200a8,8,0,0,0-16,0v7.6A80.15,80.15,0,0,1,48.4,136H56a8,8,0,0,0,0-16H48.4A80.15,80.15,0,0,1,120,48.4V56a8,8,0,0,0,16,0V48.4A80.15,80.15,0,0,1,207.6,120H200a8,8,0,0,0,0,16h7.6A80.15,80.15,0,0,1,136,207.6ZM128,88a40,40,0,1,0,40,40A40,40,0,0,0,128,88Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,152Z',
    fill: 'M232,120h-8.34A96.14,96.14,0,0,0,136,32.34V24a8,8,0,0,0-16,0v8.34A96.14,96.14,0,0,0,32.34,120H24a8,8,0,0,0,0,16h8.34A96.14,96.14,0,0,0,120,223.66V232a8,8,0,0,0,16,0v-8.34A96.14,96.14,0,0,0,223.66,136H232a8,8,0,0,0,0-16Zm-32,16h7.6A80.15,80.15,0,0,1,136,207.6V200a8,8,0,0,0-16,0v7.6A80.15,80.15,0,0,1,48.4,136H56a8,8,0,0,0,0-16H48.4A80.15,80.15,0,0,1,120,48.4V56a8,8,0,0,0,16,0V48.4A80.15,80.15,0,0,1,207.6,120H200a8,8,0,0,0,0,16h7.6A80.15,80.15,0,0,1,136,207.6Zm-32-8a40,40,0,1,1-40-40A40,40,0,0,1,168,128Z',
  },
  folder: {
    regular: 'M216,72H131.31L104,44.69A15.86,15.86,0,0,0,92.69,40H40A16,16,0,0,0,24,56V200.62A15.4,15.4,0,0,0,39.38,216H216.89A15.13,15.13,0,0,0,232,200.89V88A16,16,0,0,0,216,72ZM40,56H92.69l16,16H40ZM216,200H40V88H216Z',
    fill: 'M216,72H131.31L104,44.69A15.88,15.88,0,0,0,92.69,40H40A16,16,0,0,0,24,56V200.62A15.41,15.41,0,0,0,39.39,216h177.5A15.13,15.13,0,0,0,232,200.89V88A16,16,0,0,0,216,72ZM40,56H92.69l16,16H40Z',
  },
  bars: {
    regular: 'M224,200h-8V40a8,8,0,0,0-8-8H152a8,8,0,0,0-8,8V80H96a8,8,0,0,0-8,8v40H48a8,8,0,0,0-8,8v64H32a8,8,0,0,0,0,16H224a8,8,0,0,0,0-16ZM160,48h40V200H160ZM104,96h40V200H104ZM56,144H88v56H56Z',
    fill: 'M232,208a8,8,0,0,1-8,8H32a8,8,0,0,1,0-16h8V136a8,8,0,0,1,8-8H72a8,8,0,0,1,8,8v64H96V88a8,8,0,0,1,8-8h32a8,8,0,0,1,8,8V200h16V40a8,8,0,0,1,8-8h40a8,8,0,0,1,8,8V200h8A8,8,0,0,1,232,208Z',
  },
};

const PHOSPHOR_CONTROL_ICONS: Record<ProfessionalControlIconName, Record<IconWeight, string>> = {
  plus: {
    regular: 'M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z',
    fill: 'M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z',
  },
  sliders: {
    regular: 'M40,88H73a32,32,0,0,0,62,0h81a8,8,0,0,0,0-16H135a32,32,0,0,0-62,0H40a8,8,0,0,0,0,16Zm64-24A16,16,0,1,1,88,80,16,16,0,0,1,104,64ZM216,168H199a32,32,0,0,0-62,0H40a8,8,0,0,0,0,16h97a32,32,0,0,0,62,0h17a8,8,0,0,0,0-16Zm-48,24a16,16,0,1,1,16-16A16,16,0,0,1,168,192Z',
    fill: 'M40,88H73a32,32,0,0,0,62,0h81a8,8,0,0,0,0-16H135a32,32,0,0,0-62,0H40a8,8,0,0,0,0,16Zm64-24A16,16,0,1,1,88,80,16,16,0,0,1,104,64ZM216,168H199a32,32,0,0,0-62,0H40a8,8,0,0,0,0,16h97a32,32,0,0,0,62,0h17a8,8,0,0,0,0-16Zm-48,24a16,16,0,1,1,16-16A16,16,0,0,1,168,192Z',
  },
  play: {
    regular: 'M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z',
    fill: 'M240,128a15.74,15.74,0,0,1-7.6,13.51L88.32,229.65a16,16,0,0,1-16.2.3A15.86,15.86,0,0,1,64,216.13V39.87a15.86,15.86,0,0,1,8.12-13.82,16,16,0,0,1,16.2.3L232.4,114.49A15.74,15.74,0,0,1,240,128Z',
  },
  pause: {
    regular: 'M200,32H160a16,16,0,0,0-16,16V208a16,16,0,0,0,16,16h40a16,16,0,0,0,16-16V48A16,16,0,0,0,200,32Zm0,176H160V48h40ZM96,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V48A16,16,0,0,0,96,32Zm0,176H56V48H96Z',
    fill: 'M216,48V208a16,16,0,0,1-16,16H160a16,16,0,0,1-16-16V48a16,16,0,0,1,16-16h40A16,16,0,0,1,216,48ZM96,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V48A16,16,0,0,0,96,32Z',
  },
  stop: {
    regular: 'M200,40H56A16,16,0,0,0,40,56V200a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm0,160H56V56H200V200Z',
    fill: 'M216,56V200a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V56A16,16,0,0,1,56,40H200A16,16,0,0,1,216,56Z',
  },
  more: {
    regular: 'M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128Zm56-12a12,12,0,1,0,12,12A12,12,0,0,0,196,116ZM60,116a12,12,0,1,0,12,12A12,12,0,0,0,60,116Z',
    fill: 'M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128Zm56-12a12,12,0,1,0,12,12A12,12,0,0,0,196,116ZM60,116a12,12,0,1,0,12,12A12,12,0,0,0,60,116Z',
  },
  'chevron-right': {
    regular: 'M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z',
    fill: 'M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z',
  },
  'chevron-left': {
    regular: 'M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z',
    fill: 'M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z',
  },
  'chevron-down': {
    regular: 'M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z',
    fill: 'M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z',
  },
  search: {
    regular: 'M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z',
    fill: 'M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z',
  },
  check: {
    regular: 'M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z',
    fill: 'M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z',
  },
};

function isProfessionalNavIcon(name: IconName): name is ProfessionalNavIconName {
  return name === 'home' || name === 'calendar' || name === 'circle' || name === 'folder' || name === 'bars';
}

function isProfessionalControlIcon(name: IconName): name is ProfessionalControlIconName {
  return name === 'plus' || name === 'sliders' || name === 'play' || name === 'pause' || name === 'stop' || name === 'more' || name === 'chevron-right' || name === 'chevron-left' || name === 'chevron-down' || name === 'search' || name === 'check';
}

export function FocoIcon({ name, size = 24, color = '#F7F7F8', strokeWidth = 1.8, weight = 'regular', ...props }: Props) {
  if (isProfessionalNavIcon(name)) {
    return (
      <Svg width={size} height={size} viewBox="0 0 256 256" accessibilityElementsHidden {...props}>
        <Path d={PHOSPHOR_NAV_ICONS[name][weight]} fill={color} />
      </Svg>
    );
  }

  if (isProfessionalControlIcon(name)) {
    return (
      <Svg width={size} height={size} viewBox="0 0 256 256" accessibilityElementsHidden {...props}>
        <Path d={PHOSPHOR_CONTROL_ICONS[name][weight]} fill={color} />
      </Svg>
    );
  }

  const common = { stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden {...props}>
      {name === 'menu' && <><Line x1="4" y1="6" x2="20" y2="6" {...common}/><Line x1="4" y1="12" x2="20" y2="12" {...common}/><Line x1="4" y1="18" x2="20" y2="18" {...common}/></>}
      {name === 'clock' && <><Circle cx="12" cy="12" r="8.5" {...common}/><Polyline points="12 7 12 12 16 14" {...common}/></>}
      {name === 'list' && <><Line x1="8" y1="7" x2="20" y2="7" {...common}/><Line x1="8" y1="12" x2="20" y2="12" {...common}/><Line x1="8" y1="17" x2="20" y2="17" {...common}/><Circle cx="4" cy="7" r=".7" fill={color}/><Circle cx="4" cy="12" r=".7" fill={color}/><Circle cx="4" cy="17" r=".7" fill={color}/></>}
      {name === 'star' && <Path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" {...common}/>} 
      {name === 'filter' && <><Line x1="5" y1="7" x2="19" y2="7" {...common}/><Line x1="8" y1="12" x2="16" y2="12" {...common}/><Line x1="10" y1="17" x2="14" y2="17" {...common}/></>}
      {name === 'briefcase' && <><Rect x="3" y="7" width="18" height="13" rx="2" {...common}/><Path d="M8 7V5h8v2M3 12h18" {...common}/></>}
      {name === 'book' && <><Rect x="5" y="3" width="14" height="18" rx="2" {...common}/><Line x1="9" y1="7" x2="15" y2="7" {...common}/></>}
      {name === 'heart' && <Path d="M20 8.5c0 5-8 10-8 10s-8-5-8-10a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 8.5Z" {...common}/>} 
      {name === 'grid' && <><Rect x="4" y="4" width="7" height="7" rx="2" {...common}/><Rect x="13" y="4" width="7" height="7" rx="2" {...common}/><Rect x="4" y="13" width="7" height="7" rx="2" {...common}/><Rect x="13" y="13" width="7" height="7" rx="2" {...common}/></>}
      {name === 'bulb' && <><Path d="M8 15c-1.5-1.2-2.5-3-2.5-5A6.5 6.5 0 0 1 12 3.5 6.5 6.5 0 0 1 18.5 10c0 2-1 3.8-2.5 5l-1 1.5H9z" {...common}/><Line x1="9" y1="20" x2="15" y2="20" {...common}/></>}
      {name === 'previous' && <><Line x1="7" y1="6" x2="7" y2="18" {...common}/><Path d="m18 6-8 6 8 6z" {...common}/></>}
      {name === 'target' && <><Circle cx="12" cy="12" r="8.5" {...common}/><Circle cx="12" cy="12" r="4.5" {...common}/><Circle cx="12" cy="12" r="1" fill={color}/><Line x1="15" y1="9" x2="21" y2="3" {...common}/></>}
      {name === 'archive' && <><Rect x="4" y="7" width="16" height="13" rx="2" {...common}/><Path d="M3 4h18v4H3zM9 12h6" {...common}/></>}
      {name === 'inbox' && <><Path d="M4 5h16l1 14H3z" {...common}/><Path d="M4 14h5l1.5 2h3L15 14h5" {...common}/></>}
      {name === 'bell' && <><Path d="M6 17h12l-1.5-2V10a4.5 4.5 0 0 0-9 0v5z" {...common}/><Path d="M10 20h4" {...common}/></>}
      {name === 'repeat' && <><Path d="M4 8h12l-3-3" {...common}/><Path d="m20 16H8l3 3" {...common}/><Path d="m16 8 2 2 2-2M8 16l-2-2-2 2" {...common}/></>}
      {name === 'note' && <><Path d="M6 3h9l3 3v15H6z" {...common}/><Path d="M14 3v4h4M9 11h6M9 15h6" {...common}/></>}
      {name === 'checklist' && <><Polyline points="3 7 5 9 8 5" {...common}/><Line x1="10" y1="7" x2="21" y2="7" {...common}/><Polyline points="3 15 5 17 8 13" {...common}/><Line x1="10" y1="15" x2="21" y2="15" {...common}/></>}
      {name === 'copy' && <><Rect x="8" y="8" width="12" height="12" rx="2" {...common}/><Path d="M16 8V4H4v12h4" {...common}/></>}
      {name === 'tomorrow' && <><Path d="M5 12h12" {...common}/><Polyline points="13 8 17 12 13 16" {...common}/><Line x1="5" y1="5" x2="5" y2="19" {...common}/></>}
      {name === 'trash' && <><Path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5" {...common}/></>}
      {name === 'flame' && <Path d="M12 3c2 3 5 5 5 9a5 5 0 0 1-10 0c0-2 1-4 3-6 0 3 1 4 2 5 1-2 1-5 0-8Z" {...common}/>} 
      {name === 'edit' && <><Path d="m5 19 3.5-.7L19 7.8 16.2 5 5.7 15.5z" {...common}/><Line x1="14.5" y1="6.7" x2="17.3" y2="9.5" {...common}/></>}
      {name === 'graduation-cap' && <><Path d="M3 9 12 4l9 5-9 5z" {...common}/><Path d="M7 12v4c2.8 2 7.2 2 10 0v-4M21 9v6" {...common}/></>}
      {name === 'atom' && <><Circle cx="12" cy="12" r="1.3" fill={color}/><Path d="M4.5 12c0-3.5 3.4-6.5 7.5-6.5s7.5 3 7.5 6.5-3.4 6.5-7.5 6.5S4.5 15.5 4.5 12Z" {...common}/><Path d="M8.2 5.8c3-1.7 7.4.2 9.5 3.8s1.1 8.3-1.9 10-7.4-.2-9.5-3.8-1.1-8.3 1.9-10ZM15.8 5.8c-3-1.7-7.4.2-9.5 3.8s-1.1 8.3 1.9 10 7.4-.2 9.5-3.8 1.1-8.3-1.9-10Z" {...common}/></>}
      {name === 'dumbbell' && <><Line x1="7" y1="12" x2="17" y2="12" {...common}/><Rect x="4" y="8" width="3" height="8" rx="1" {...common}/><Rect x="17" y="8" width="3" height="8" rx="1" {...common}/><Line x1="2" y1="10" x2="2" y2="14" {...common}/><Line x1="22" y1="10" x2="22" y2="14" {...common}/></>}
      {name === 'bicycle' && <><Circle cx="6" cy="16" r="4" {...common}/><Circle cx="18" cy="16" r="4" {...common}/><Path d="m6 16 4-7 3 7h5l-4-8h-4M10 9H7" {...common}/></>}
      {name === 'code' && <><Polyline points="8 7 3 12 8 17" {...common}/><Polyline points="16 7 21 12 16 17" {...common}/><Line x1="14" y1="5" x2="10" y2="19" {...common}/></>}
      {name === 'laptop' && <><Rect x="5" y="4" width="14" height="11" rx="1.5" {...common}/><Path d="M3 19h18l-2-4H5z" {...common}/></>}
      {name === 'coin' && <><Circle cx="12" cy="12" r="8" {...common}/><Path d="M14.5 9.2c-.6-.8-1.4-1.2-2.6-1.2-1.4 0-2.4.7-2.4 1.8 0 2.8 5.2 1.2 5.2 4 0 1.2-1.1 2.2-2.8 2.2-1.3 0-2.3-.5-3-1.4M12 6.5v11" {...common}/></>}
      {name === 'wallet' && <><Rect x="3" y="6" width="18" height="13" rx="2.5" {...common}/><Path d="M3 9h18M15 12h6v4h-6a2 2 0 0 1 0-4Z" {...common}/></>}
      {name === 'camera' && <><Rect x="3" y="6" width="18" height="14" rx="2" {...common}/><Path d="m8 6 1.5-2h5L16 6" {...common}/><Circle cx="12" cy="13" r="4" {...common}/></>}
      {name === 'music-note' && <><Path d="M9 18V6l9-2v12" {...common}/><Circle cx="6.5" cy="18" r="2.5" {...common}/><Circle cx="15.5" cy="16" r="2.5" {...common}/></>}
      {name === 'palette' && <><Path d="M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 0-4H12a1.5 1.5 0 0 1 0-3h3a6 6 0 0 0 6-6c0-3-3.8-5-9-5Z" {...common}/><Circle cx="7.5" cy="9" r="1" fill={color}/><Circle cx="11" cy="6.5" r="1" fill={color}/><Circle cx="15" cy="7" r="1" fill={color}/></>}
      {name === 'airplane' && <Path d="m21 16-8-3v6l2 2-3 1-3-1 2-2v-6l-8 3v-3l8-6V4a1 1 0 0 1 2 0v3l8 6z" {...common}/>} 
      {name === 'leaf' && <><Path d="M20 4C11 4 5 8 5 14c0 3 2 5 5 5 6 0 10-6 10-15Z" {...common}/><Path d="M5 20c3-5 7-8 12-11" {...common}/></>}
      {name === 'mountain' && <><Path d="m3 20 7-12 4 6 2-3 5 9z" {...common}/><Path d="m8.5 10.5 2 2 1.5-2" {...common}/></>}
      {name === 'trophy' && <><Path d="M8 4h8v4c0 4-1.8 7-4 7s-4-3-4-7zM12 15v4M8 20h8" {...common}/><Path d="M8 6H4v2c0 3 2 5 5 5M16 6h4v2c0 3-2 5-5 5" {...common}/></>}
      {name === 'users' && <><Circle cx="9" cy="9" r="3" {...common}/><Circle cx="17" cy="10" r="2.5" {...common}/><Path d="M3 20c0-4 2.5-6 6-6s6 2 6 6M14 15c3-.5 6 1 7 4" {...common}/></>}
    </Svg>
  );
}
