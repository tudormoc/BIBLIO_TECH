export type BookPart = 
  | 'cover' 
  | 'spine' 
  | 'textblock' 
  | 'headband' 
  | 'tailband' 
  | 'endpapers' 
  | 'dustjacket'
  | 'bookmark'
  | 'sewing';

export interface BookConfiguration {
  color: string;
  hasDustJacket: boolean;
  hasHeadbands: boolean;
  hasBookmark: boolean;
  showEndpapers: boolean; // Acts as an "open cover" visualization or transparent mode
  explodeView: boolean;
}

export interface AnatomyInfo {
  title: string;
  description: string;
  historicalNote?: string;
  loading: boolean;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
      boxGeometry: any;
      canvasTexture: any;
      color: any;
      cylinderGeometry: any;
      group: any;
      mesh: any;
      meshBasicMaterial: any;
      meshStandardMaterial: any;
      planeGeometry: any;
      pointLight: any;
      spotLight: any;
      torusGeometry: any;
    }
  }
}