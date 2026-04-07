import { formatDateDivider } from '../../utils/format';

export const DateDivider = ({ date }: { date: string }) => (
  <div className="flex items-center justify-center my-3">
    <span className="bg-[#182229] text-[#8696a0] text-[11.5px] px-3 py-1 rounded-full shadow-sm font-medium tracking-wide">
      {formatDateDivider(date)}
    </span>
  </div>
);
