import { cn } from '../../lib/utils';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    onClear: () => void;
    placeholder?: string;
    isLoading?: boolean;
    className?: string;
}

export function SearchBar({
    value,
    onChange,
    onClear,
    placeholder = 'เล่นอะไรดี',
    isLoading = false,
    className,
}: SearchBarProps) {
    return (
        <div className={cn('flex flex-1 items-center justify-center gap-4', className)}>
            {/* Home button */}
            <button 
                aria-label="หน้าหลัก"
                className="group flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#242424] text-[var(--color-spotify-light-gray)] hover:bg-[#2a2a2a] hover:text-white active:scale-95 transition-all duration-200"
            >
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current group-hover:scale-110 transition-transform duration-200">
                    <path d="M13.5 1.515a3 3 0 0 0-3 0L3 5.845a2 2 0 0 0-1 1.732V21a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6h4v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7.577a2 2 0 0 0-1-1.732z" />
                </svg>
            </button>
            
            {/* Search form - Flexbox layout like Spotify */}
            <form 
                role="search" 
                className="flex-1 max-w-[480px] flex items-center bg-[#242424] rounded-full hover:bg-[#2a2a2a] transition-all duration-200 focus-within:ring-2 focus-within:ring-white focus-within:bg-[#2a2a2a] mx-[25px] my-[20px]"
                onSubmit={(e) => e.preventDefault()}
            >
                {/* Leading - Search icon button */}
                <button 
                    type="button"
                    tabIndex={-1}
                    aria-label="ค้นหา"
                    className="flex-shrink-0 flex items-center justify-center w-12 h-12 text-[var(--color-spotify-light-gray)] hover:text-white transition-colors duration-200"
                >
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                        <path d="M10.533 1.27893C5.35215 1.27893 1.12598 5.41887 1.12598 10.5579C1.12598 15.697 5.35215 19.8369 10.533 19.8369C12.767 19.8369 14.8235 19.0671 16.4402 17.7794L20.7929 22.132C21.1834 22.5226 21.8166 22.5226 22.2071 22.132C22.5976 21.7415 22.5976 21.1083 22.2071 20.7178L17.8634 16.3741C19.1616 14.7849 19.94 12.7634 19.94 10.5579C19.94 5.41887 15.7138 1.27893 10.533 1.27893ZM3.12598 10.5579C3.12598 6.55226 6.42768 3.27893 10.533 3.27893C14.6383 3.27893 17.94 6.55226 17.94 10.5579C17.94 14.5636 14.6383 17.8369 10.533 17.8369C6.42768 17.8369 3.12598 14.5636 3.12598 10.5579Z" />
                    </svg>
                </button>
                
                {/* Input container - flex-1 to take remaining space */}
                <div className="flex-1 relative flex items-center p-[5px]">
                    <input
                        type="search"
                        role="combobox"
                        aria-label={placeholder}
                        aria-expanded="false"
                        spellCheck="false"
                        tabIndex={0}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className={cn(
                            'w-full py-3 pr-4',
                            'bg-transparent',
                            'text-[var(--color-spotify-white)] text-sm font-normal',
                            'placeholder:text-transparent',
                            'outline-none',
                            'caret-[var(--color-spotify-green)]',
                            '[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden'
                        )}
                    />
                    
                    {/* Placeholder with keyboard shortcut overlay */}
                    {!value && (
                        <div className="absolute inset-0 flex items-center justify-between pointer-events-none pr-4">
                            <span className="text-sm text-[#a7a7a7] font-normal">{placeholder}</span>
                            <div className="flex items-center gap-0.5">
                                <kbd className="px-1.5 py-0.5 text-[11px] text-[#a7a7a7] bg-[#ffffff12] rounded font-medium">Ctrl</kbd>
                                <kbd className="px-1.5 py-0.5 text-[11px] text-[#a7a7a7] bg-[#ffffff12] rounded font-medium">K</kbd>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Trailing - Clear button and loading */}
                <div className="flex-shrink-0 flex items-center pr-4 gap-2">
                    {isLoading && (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#a7a7a7] border-t-[var(--color-spotify-green)]" />
                    )}
                    {value && !isLoading && (
                        <button 
                            type="button"
                            onClick={onClear}
                            aria-label="ล้างช่องค้นหา"
                            className="flex items-center justify-center w-8 h-8 rounded-full text-[#a7a7a7] hover:text-white hover:bg-[#ffffff1a] active:scale-95 transition-all duration-200"
                        >
                            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                                <path d="M3.293 3.293a1 1 0 0 1 1.414 0L12 10.586l7.293-7.293a1 1 0 1 1 1.414 1.414L13.414 12l7.293 7.293a1 1 0 0 1-1.414 1.414L12 13.414l-7.293 7.293a1 1 0 0 1-1.414-1.414L10.586 12 3.293 4.707a1 1 0 0 1 0-1.414" />
                            </svg>
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
