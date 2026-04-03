import { Inter, JetBrains_Mono, Plus_Jakarta_Sans, Space_Grotesk, Zalando_Sans_SemiExpanded } from 'next/font/google';

export const displayFont = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });
export const monoFont = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'] });
export const bodyFont = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600'] });
export const palette = {
  accent: 'rgb(88, 53, 204)',
  surface: '#180a44',
  base: '#000000',
};
