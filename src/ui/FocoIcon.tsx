import type { ComponentProps } from 'react';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';

export type IconName =
  | 'menu' | 'calendar' | 'clock' | 'list' | 'circle' | 'check' | 'plus'
  | 'play' | 'more' | 'star' | 'filter' | 'home' | 'folder' | 'bars'
  | 'search' | 'briefcase' | 'book' | 'heart' | 'grid' | 'bulb'
  | 'chevron-right' | 'chevron-left' | 'chevron-down' | 'sliders' | 'pause' | 'stop'
  | 'previous' | 'target' | 'archive' | 'bell' | 'repeat' | 'note'
  | 'checklist' | 'copy' | 'tomorrow' | 'trash' | 'flame' | 'edit';

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
} & Omit<ComponentProps<typeof Svg>, 'width' | 'height'>;

export function FocoIcon({ name, size = 24, color = '#F7F7F8', strokeWidth = 1.8, ...props }: Props) {
  const common = { stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden {...props}>
      {name === 'menu' && <><Line x1="4" y1="6" x2="20" y2="6" {...common}/><Line x1="4" y1="12" x2="20" y2="12" {...common}/><Line x1="4" y1="18" x2="20" y2="18" {...common}/></>}
      {name === 'calendar' && <><Rect x="4" y="5" width="16" height="15" rx="2" {...common}/><Line x1="8" y1="3" x2="8" y2="7" {...common}/><Line x1="16" y1="3" x2="16" y2="7" {...common}/><Line x1="4" y1="9" x2="20" y2="9" {...common}/></>}
      {name === 'clock' && <><Circle cx="12" cy="12" r="8.5" {...common}/><Polyline points="12 7 12 12 16 14" {...common}/></>}
      {name === 'list' && <><Line x1="8" y1="7" x2="20" y2="7" {...common}/><Line x1="8" y1="12" x2="20" y2="12" {...common}/><Line x1="8" y1="17" x2="20" y2="17" {...common}/><Circle cx="4" cy="7" r=".7" fill={color}/><Circle cx="4" cy="12" r=".7" fill={color}/><Circle cx="4" cy="17" r=".7" fill={color}/></>}
      {name === 'circle' && <Circle cx="12" cy="12" r="8" {...common}/>} 
      {name === 'check' && <Polyline points="5 12.5 9.5 17 19 7" {...common}/>} 
      {name === 'plus' && <><Line x1="12" y1="4" x2="12" y2="20" {...common}/><Line x1="4" y1="12" x2="20" y2="12" {...common}/></>}
      {name === 'play' && <Path d="M9 7.5v9l7-4.5z" fill={color} stroke="none"/>}
      {name === 'more' && <><Circle cx="5" cy="12" r="1" fill={color}/><Circle cx="12" cy="12" r="1" fill={color}/><Circle cx="19" cy="12" r="1" fill={color}/></>}
      {name === 'star' && <Path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" {...common}/>} 
      {name === 'filter' && <><Line x1="5" y1="7" x2="19" y2="7" {...common}/><Line x1="8" y1="12" x2="16" y2="12" {...common}/><Line x1="10" y1="17" x2="14" y2="17" {...common}/></>}
      {name === 'home' && <><Path d="m4 11 8-7 8 7v9H4z" {...common}/><Rect x="9" y="14" width="6" height="6" rx="1" {...common}/></>}
      {name === 'folder' && <Path d="M3.5 7.5h6l2-2h9v13h-17z" {...common}/>} 
      {name === 'bars' && <><Line x1="5" y1="19" x2="5" y2="14" {...common}/><Line x1="10" y1="19" x2="10" y2="9" {...common}/><Line x1="15" y1="19" x2="15" y2="5" {...common}/><Line x1="20" y1="19" x2="20" y2="11" {...common}/></>}
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
