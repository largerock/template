'use client';

import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { Interest } from '@template/core-types';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Loader2, Search, CheckIcon, X } from 'lucide-react';
import { useInterestsState } from '../../states/useInterestsState';

type InterestsSearchProps = {
  // For single select mode
  value?: string;
  onChange?: (interest: Interest) => void;
  // For multi select mode
  selectedInterests?: Interest[];
  onChangeMulti?: (interests: Interest[]) => void;
  // Common props
  id?: string;
  placeholder?: string;
  required?: boolean;
  isMulti?: boolean;
};

export function InterestsSearch({
  id,
  value = '',
  onChange,
  selectedInterests = [],
  onChangeMulti,
  placeholder,
  required = false,
  isMulti = true, // Default to multi-select for backward compatibility
}: InterestsSearchProps) {
  // Determine default placeholder based on mode
  const defaultPlaceholder = isMulti
    ? 'Search interests (press Enter to select all results)'
    : 'Search interests...';

  if (!placeholder) {
    placeholder = defaultPlaceholder;
  }

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedInterest, setSelectedInterest] = useState<Interest | null>(null);
  const [showCategorized, setShowCategorized] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredInterests, setFilteredInterests] = useState<Interest[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get interests from the state store
  const { allInterests, getInterest } = useInterestsState();

  // Debounce search query
  const debouncedQuery = useDebounce(searchQuery, { delay: 300 });

  // Filter interests based on search query
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      setIsLoading(true);
      const query = debouncedQuery.toLowerCase();
      const filtered = allInterests.filter(interest =>
        interest.name.toLowerCase().includes(query) ||
        (interest.category && interest.category.toLowerCase().includes(query))
      );
      console.log('filtered', filtered);
      setFilteredInterests(filtered);
      setShowCategorized(false);
      setIsLoading(false);
    } else {
      setFilteredInterests(allInterests);
      setShowCategorized(true);
    }
  }, [debouncedQuery, allInterests]);

  // For single select mode: Find and set the selected interest when value changes
  useEffect(() => {
    if (!isMulti && value) {
      const interest = getInterest(value);
      if (interest) {
        setSelectedInterest(interest);
        setSearchQuery(interest.name);
      }
    } else if (!isMulti && !value) {
      setSelectedInterest(null);
      setSearchQuery('');
    }
  }, [value, getInterest, isMulti]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowDropdown(true);
  };

  // For multi-select: Select all interests on Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isMulti && e.key === 'Enter' && filteredInterests.length > 0 && !showCategorized) {
      e.preventDefault();
      // Add all current results to selection if not already selected
      const newInterests = [...selectedInterests];
      let added = false;

      filteredInterests.forEach(interest => {
        if (!selectedInterests.some(selected => selected.id === interest.id)) {
          newInterests.push(interest);
          added = true;
        }
      });

      if (added && onChangeMulti) {
        onChangeMulti(newInterests);
        setSearchQuery('');
      }
    }
  };

  // Handle interest selection
  const handleInterestSelect = (interest: Interest) => {
    if (isMulti) {
      // Multi-select mode
      if (!selectedInterests.some(selected => selected.id === interest.id) && onChangeMulti) {
        onChangeMulti([...selectedInterests, interest]);
      }
    } else {
      // Single-select mode
      setSelectedInterest(interest);
      if (onChange) onChange(interest);
      setSearchQuery(interest.name);
    }
    setSearchQuery('');
    setShowDropdown(false);
  };

  // Handle removing a selection
  const handleRemoveInterest = (interestId: string) => {
    if (isMulti && onChangeMulti) {
      // Remove from multi-select
      onChangeMulti(selectedInterests.filter(interest => interest.id !== interestId));
    } else if (!isMulti && onChange) {
      // Clear single selection
      setSelectedInterest(null);
      setSearchQuery('');
      onChange({ id: '', name: '' } as Interest);
    }
  };

  // Group interests by category for categorized view
  const groupedInterests = allInterests.reduce((acc, interest) => {
    const category = interest.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(interest);
    return acc;
  }, {} as Record<string, Interest[]>);

  return (
    <div>
      <div className="relative" ref={inputRef}>
        <div className="relative">
          <Input
            id={id || 'interests-search'}
            name={id || 'interests-search'}
            value={searchQuery}
            onChange={handleSearchInput}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={isMulti ? handleKeyDown : undefined}
            className="w-full pr-8"
            placeholder={placeholder}
            required={required && (isMulti ? selectedInterests.length === 0 : !value)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <Search className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Interests Dropdown */}
        {showDropdown && (
          <div className="absolute mt-1 w-full z-10 bg-background border border-border rounded-md shadow-md overflow-auto max-h-72">
            {isLoading ? (
              <div className="px-3 py-2 text-muted-foreground text-sm">
                Searching...
              </div>
            ) : showCategorized ? (
              // Categorized view
              <div className="p-2">
                {Object.entries(groupedInterests).map(([category, categoryInterests]) => (
                  <div key={category} className="mb-3 last:mb-0">
                    <h3 className="text-sm font-medium px-2 py-1 bg-muted rounded-sm">
                      {category}
                    </h3>
                    <ul className="mt-1">
                      {categoryInterests.map((interest) => (
                        <li
                          key={interest.id}
                          onClick={() => handleInterestSelect(interest)}
                          className="flex items-center px-2 py-1 hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm rounded-sm"
                        >
                          <span className="flex-grow">{interest.name}</span>
                          {!isMulti && selectedInterest?.id === interest.id && (
                            <CheckIcon className="h-4 w-4 text-primary" />
                          )}
                          {isMulti && selectedInterests.some(item => item.id === interest.id) && (
                            <CheckIcon className="h-4 w-4 text-primary" />
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : filteredInterests.length > 0 ? (
              // Search results view
              <ul>
                {filteredInterests.map(interest => (
                  <li
                    key={interest.id}
                    onClick={() => handleInterestSelect(interest)}
                    className="px-3 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm flex items-center justify-between"
                  >
                    <div>
                      <span>{interest.name}</span>
                      {interest.category && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {interest.category}
                        </span>
                      )}
                    </div>
                    {!isMulti && selectedInterest?.id === interest.id && (
                      <CheckIcon className="h-4 w-4 text-primary" />
                    )}
                    {isMulti && selectedInterests.some(item => item.id === interest.id) && (
                      <CheckIcon className="h-4 w-4 text-primary" />
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-3 py-2 text-muted-foreground text-sm">
                No results found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Interests */}
      {isMulti ? (
        // Multi-select display
        selectedInterests.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedInterests.map(interest => (
              <span
                key={interest.id}
                className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20"
              >
                {interest.name}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1 text-primary hover:text-primary hover:bg-transparent"
                  onClick={() => handleRemoveInterest(interest.id)}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove</span>
                </Button>
              </span>
            ))}
          </div>
        )
      ) : (
        // Single-select display
        selectedInterest && (
          <div className="mt-2 flex items-center">
            <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
              {selectedInterest.name}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1 text-primary hover:text-primary hover:bg-transparent"
                onClick={() => handleRemoveInterest(selectedInterest.id)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove</span>
              </Button>
            </span>
          </div>
        )
      )}
    </div>
  );
}
