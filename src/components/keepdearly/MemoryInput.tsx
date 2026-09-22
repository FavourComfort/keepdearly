import { Icon } from "./Icon";

export function MemoryInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative rounded-xl bg-surface-container-lowest p-6 shadow-sm transition-all focus-within:shadow-md sm:p-9">
      <div className="pointer-events-none absolute bottom-4 right-4 text-primary opacity-[0.06]">
        <svg fill="currentColor" height="88" width="88" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
        </svg>
      </div>
      <label className="sr-only" htmlFor="memory-input">
        Memory content
      </label>
      <textarea
        id="memory-input"
        rows={5}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          placeholder ??
          "Sarah mentioned she loves vanilla perfume and can never find a miniature rollerball to carry in her bag…"
        }
        className="w-full resize-none bg-transparent text-quote-body leading-relaxed text-on-surface outline-none placeholder:text-outline-variant/80"
      />
      <div className="mt-2 flex items-center justify-between pt-4 text-on-surface-variant">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full bg-surface-container-low px-3 py-1.5 text-label-md transition-all hover:bg-surface-container hover:text-on-surface"
          >
            <Icon name="add_photo_alternate" className="text-[16px]" />
            <span>photo</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full bg-surface-container-low px-3 py-1.5 text-label-md transition-all hover:bg-surface-container hover:text-on-surface"
          >
            <Icon name="mic" className="text-[16px]" />
            <span>whisper</span>
          </button>
        </div>
        <span className="text-label-sm text-outline">
          {value.trim() ? `${value.trim().length} characters` : "just as it is"}
        </span>
      </div>
    </div>
  );
}
