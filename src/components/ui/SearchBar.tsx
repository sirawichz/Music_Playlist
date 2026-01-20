import { Search, X } from 'lucide-react';
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
    placeholder = 'What do you want to listen to?',
    isLoading = false,
    className,
}: SearchBarProps) {
    return (
        <div className={cn('relative w-full max-w-md', className)}>
            <div className="relative flex items-center">
                <Search
                    className="absolute left-3 h-5 w-5 text-[var(--color-spotify-light-gray)]"
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={cn(
                        'w-full rounded-full bg-[var(--color-spotify-gray)] py-3 pl-10 pr-10',
                        'text-sm text-[var(--color-spotify-white)] placeholder-[var(--color-spotify-light-gray)]',
                        'outline-none transition-all duration-200',
                        'hover:bg-[var(--color-spotify-light-gray)]/20',
                        'focus:ring-2 focus:ring-[var(--color-spotify-white)]'
                    )}
                />
                {value && (
                    <button
                        onClick={onClear}
                        className={cn(
                            'absolute right-3 rounded-full p-1',
                            'text-[var(--color-spotify-light-gray)] hover:text-[var(--color-spotify-white)]',
                            'transition-colors duration-200'
                        )}
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
            {isLoading && (
                <div className="absolute right-12 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-spotify-light-gray)] border-t-[var(--color-spotify-green)]" />
                </div>
            )}
        </div>
    );
}
