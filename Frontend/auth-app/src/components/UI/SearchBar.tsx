interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ value, onChange, placeholder = 'Search or start new chat' }: SearchBarProps) => (
  <div className="px-3 py-2 ">
    <div className="flex items-center gap-2 bg-[#202c33] rounded-lg px-3 py-2">
      <svg className="w-4 h-4 text-[#8696a0] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" strokeWidth="2" />
        <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-transparent flex-1  p-1  text-[#e9edef] placeholder-[#8696a0] outline-none"
      />
      {value && (
        <button onClick={() => onChange('')} className="text-[#8696a0] hover:text-[#e9edef]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  </div>
);
