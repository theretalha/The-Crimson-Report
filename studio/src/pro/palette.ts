import type {Mood} from '../theme';
// One colour logic for every upgraded scene, so cards, icons and labels always read on their background.
export const pal = (mood: Mood) => ({
  fg: mood === 'facts' ? '#0E0E0E' : '#F4F1EA',
  muted: mood === 'facts' ? 'rgba(14,14,14,0.62)' : 'rgba(244,241,234,0.64)',
  accent: '#C8141E',
  hot: mood === 'danger' ? '#0E0E0E' : '#E5232B', // crimson that stays visible on this background
  line: mood === 'danger' ? '#F4F1EA' : '#E5232B',
  glass: mood === 'facts' ? 'rgba(255,255,255,0.72)' : mood === 'danger' ? 'rgba(0,0,0,0.40)' : 'rgba(255,255,255,0.075)',
  border: mood === 'facts' ? 'rgba(14,14,14,0.24)' : 'rgba(255,255,255,0.22)',
  iconMain: mood === 'facts' ? '#0E0E0E' : '#F4F1EA',
  iconAccent: mood === 'danger' ? '#0E0E0E' : '#C8141E',
  light: mood === 'facts',
});
