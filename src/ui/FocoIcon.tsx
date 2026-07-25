import type { ComponentProps } from 'react';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';

export type IconName =
  | 'menu' | 'calendar' | 'clock' | 'list' | 'circle' | 'check' | 'plus'
  | 'play' | 'more' | 'star' | 'filter' | 'home' | 'folder' | 'bars'
  | 'search' | 'briefcase' | 'book' | 'heart' | 'grid' | 'bulb'
  | 'chevron-right' | 'chevron-left' | 'chevron-down' | 'sliders' | 'pause' | 'stop'
  | 'previous' | 'target' | 'archive' | 'inbox' | 'bell' | 'repeat' | 'note'
  | 'checklist' | 'copy' | 'tomorrow' | 'trash' | 'flame' | 'edit';

type IconWeight = 'regular' | 'fill';
type ProfessionalNavIconName = 'home' | 'calendar' | 'circle' | 'folder' | 'bars';

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  weight?: 'regular' | 'fill';
} & Omit<ComponentProps<typeof Svg>, 'width' | 'height'>;

// Navigation paths are sourced from Phosphor Icons (MIT) and kept behind the
// FocoIcon wrapper so product code is not coupled to a third-party component API.
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
    fill: 'M232,120h-8.34A96.14,96.14,0,0,0,136,32.34V24a8,8,0,0,0-16,0v8.34A96.14,96.14,0,0,0,32.34,120H24a8,8,0,0,0,0,16h8.34A96.14,96.14,0,0,0,120,223.66V232a8,8,0,0,0,16,0v-8.34A96.14,96.14,0,0,0,223.66,136H232a8,8,0,0,0,0-16Zm-32,16h7.6A80.15,80.15,0,0,1,136,207.6V200a8,8,0,0,0-16,0v7.6A80.15,80.15,0,0,1,48.4,136H56a8,8,0,0,0,0-16H48.4A80.15,80.15,0,0,1,120,48.4V56a8,8,0,0,0,16,0V48.4A80.15,80.15,0,0,1,207.6,120H200a8,8,0,0,0,0,16Zm-32-8a40,40,0,1,1-40-40A40,40,0,0,1,168,128Z',
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

function isProfessionalNavIcon(name: IconName): name is ProfessionalNavIconName {
  return name === 'home' || name === 'calendar' || name === 'circle' || name === 'folder' || name === 'bars';
}

export function FocoIcon({ name, size = 24, color = '#F7F7F8', strokeWidth = 1.8, weight = 'regular', ...props }: Props) {
  if (isProfessionalNavIcon(name)) {
    return (
      <Svg width={size} height={size} viewBox="0 0 256 256" accessibilityElementsHidden {...props}>
        <Path d={PHOSPHOR_NAV_ICONS[name][weight]} fill={color} />
      </Svg>
    );
  }

  const common = { stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden {...props}>
      {name === 'menu' && <><Line x1="4" y1="6" x2="20" y2="6" {...common}/><Line x1="4" y1="12" x2="20" y2="12" {...common}/><Line x1="4" y1="18" x2="20" y2="18" {...common}/></>}
      {name === 'clock' && <><Circle cx="12" cy="12" r="8.5" {...common}/><Polyline points="12 7 12 12 16 14" {...common}/></>}
      {name === 'list' && <><Line x1="8" y1="7" x2="20" y2="7" {...common}/><Line x1="8" y1="12" x2="20" y2="12" {...common}/><Line x1="8" y1="17" x2="20" y2="17" {...common}/><Circle cx="4" cy="7" r=".7" fill={color}/><Circle cx="4" cy="12" r=".7" fill={color}/><Circle cx="4" cy="17" r=".7" fill={color}/></>}
      {name === 'check' && <Polyline points="5 12.5 9.5 17 19 7" {...common}/>} 
      {name === 'plus' && <><Line x1="12" y1="4" x2="12" y2="20" {...common}/><Line x1="4" y1="12" x2="20" y2="12" {...common}/></>}
      {name === 'play' && <Path d="M9 7.5v9l7-4.5z" fill={color} stroke="none"/>}
      {name === 'more' && <><Circle cx="5" cy="12" r="1" fill={color}/><Circle cx="12" cy="12" r="1" fill={color}/><Circle cx="19" cy="12" r="1" fill={color}/></>}
      {name === 'star' && <Path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" {...common}/>} 
      {name === 'filter' && <><Line x1="5" y1="7" x2="19" y2="7" {...common}/><Line x1="8" y1="12" x2="16" y2="12" {...common}/><Line x1="10" y1="17" x2="14" y2="17" {...common}/></>}
      {name === 'search' && <><Circle cx="10.5" cy="10.5" r="6" {...common}/><Line x1="15" y1="15" x2="20" y2="20" {...common}/></>}
      {name === 'briefcase' && <><Rect x="3" y="7" width="18" height="13" rx="2" {...common}/><Path d="M8 7V5h8v2M3 12h18" {...common}/></>}
      {name === 'book' && <><Rect x="5" y="3" width="14" height="18" rx="2" {...common}/><Line x1="9" y1="7" x2="15" y2="7" {...common}/></>}
      {name === 'heart' && <Path d="M20 8.5c0 5-8 10-8 10s-8-5-8-10a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 8.5Z" {...common}/>} 
      {name === 'grid' && <><Rect x="4" y="4" width="7" height="7" rx="2" {...common}/><Rect x="13" y="4" width="7" height="7" rx="2" {...common}/><Rect x="4" y="13" width="7" height="7" rx="2" {...common}/><Rect x="13" y="13" width="7" height="7" rx="2" {...common}/></>}
      {name === 'bulb' && <><Path d="M8 15c-1.5-1.2-2.5-3-2.5-5A6.5 6.5 0 0 1 12 3.5 6.5 6.5 0 0 1 18.5 10c0 2-1 3.8-2.5 5l-1 1.5H9z" {...common}/><Line x1="9" y1="20" x2="15" y2="20" {...common}/></>}
      {name === 'chevron-right' && <Polyline points="9 5 16 12 9 19" {...common}/>} 
      {name === 'chevron-left' && <Polyline points="15 5 8 12 15 19" {...common}/>} 
      {name === 'chevron-down' && <Polyline points="5 9 12 16 19 9" {...common}/>} 
      {name === 'sliders' && <><Line x1="4" y1="7" x2="20" y2="7" {...common}/><Circle cx="9" cy="7" r="2" {...common}/><Line x1="4" y1="12" x2="20" y2="12" {...common}/><Circle cx="15" cy="12" r="2" {...common}/><Line x1="4" y1="17" x2="20" y2="17" {...common}/><Circle cx="11" cy="17" r="2" {...common}/></>}
      {name === 'pause' && <><Rect x="7" y="5" width="3.5" height="14" rx="1" fill={color}/><Rect x="13.5" y="5" width="3.5" height="14" rx="1" fill={color}/></>}
      {name === 'stop' && <Rect x="7" y="7" width="10" height="10" rx="1.5" fill={color}/>} 
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
    </Svg>
  );
}
