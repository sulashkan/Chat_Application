import { getInitials } from '../../utils/format';

const COLORS = [
  'bg-teal-600', 'bg-blue-600', 'bg-purple-600',
  'bg-rose-600', 'bg-amber-600', 'bg-cyan-600', 'bg-indigo-600',
];

const colorFor = (name: string) => COLORS[name.charCodeAt(0) % COLORS.length];

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  online?: boolean;
}

const sizes = { sm: 'w-9 h-9 text-xs', md: 'w-11 h-11 text-sm', lg: 'w-14 h-14 text-base' };

export const Avatar = ({ name, src, size = 'md', online }: AvatarProps) => (
  <div className="relative flex-shrink-0">
    {src ? (
      <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover`} />
    ) : (
      <div className={`${sizes[size]} ${colorFor(name)} rounded-full flex items-center justify-center font-semibold text-white`}>
        {getInitials(name)}
      </div>
    )}
    {online !== undefined && (
      <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#111b21] ${online ? 'bg-wa-teal' : 'bg-gray-500'}`} />
    )}
  </div>
);
