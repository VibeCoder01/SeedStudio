
"use client"

import React, { useState, useEffect, useRef } from "react"
import { ChevronDown, X } from "lucide-react"

import { useDebounce } from "@/hooks/use-debounce"
import { Badge } from "@/components/ui/badge"
import { Button } from "./button"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Input } from "./input"
import { Checkbox } from "./checkbox"
import { ScrollArea } from "./scroll-area"

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[]
}

const TagInput = React.forwardRef<HTMLButtonElement, TagInputProps>(
  ({ tags, onChange, suggestions = [] }, ref) => {
    const [popoverOpen, setPopoverOpen] = useState(false)
    const [inputValue, setInputValue] = useState("")
    const [selectedTags, setSelectedTags] = useState<string[]>(tags)
    const debouncedSearchTerm = useDebounce(inputValue, 100);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync internal state with external props when popover opens/closes
    useEffect(() => {
      setSelectedTags(tags);
    }, [tags, popoverOpen]);
    
    // Focus input when popover opens
    useEffect(() => {
        if(popoverOpen) {
            inputRef.current?.focus();
        }
    }, [popoverOpen])


    const handleSave = () => {
      onChange(selectedTags)
      setPopoverOpen(false)
    }

    const handleCancel = () => {
      setPopoverOpen(false)
    }
    
    const handleOpenChange = (isOpen: boolean) => {
        setPopoverOpen(isOpen);
        if (!isOpen) {
            handleCancel();
        }
    }

    const toggleTag = (tag: string) => {
      setSelectedTags(prev => 
        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
      )
    }
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value)
    }

    const handleAddCustomTag = () => {
      const trimmedTag = inputValue.trim();
      if(trimmedTag && !selectedTags.includes(trimmedTag)) {
        // We add it to suggestions so it appears in the list, and then we select it
        toggleTag(trimmedTag);
      }
      setInputValue("");
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const trimmedTag = inputValue.trim();
        let finalTags = selectedTags;
        if(trimmedTag && !selectedTags.includes(trimmedTag)) {
            finalTags = [...selectedTags, trimmedTag];
            setSelectedTags(finalTags);
        }
        onChange(finalTags);
        setPopoverOpen(false);
      }
    };
    
    const allAvailableTags = Array.from(new Set([...suggestions, ...tags, ...selectedTags])).sort();
    
    const filteredSuggestions = debouncedSearchTerm
      ? allAvailableTags.filter(suggestion =>
          suggestion.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        )
      : allAvailableTags;

    return (
      <div>
        <div className="flex flex-wrap gap-2 rounded-md border border-input p-2 items-center text-sm min-h-10">
          {tags.length === 0 && <span className="text-muted-foreground px-1">No tags selected</span>}
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {tag}
              <button
                type="button"
                className="rounded-full hover:bg-muted-foreground/20"
                onClick={() => onChange(tags.filter(t => t !== tag))}
                aria-label={`Remove ${tag}`}
              >
                  <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <Popover open={popoverOpen} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="mt-2 w-full" ref={ref}>
              Select Tags <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <div className="p-2 border-b">
              <Input 
                ref={inputRef}
                placeholder="Create or find a tag..."
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
              />
            </div>
            
            <ScrollArea className="h-60">
                 <div className="p-1">
                    {filteredSuggestions.map((suggestion) => (
                        <div
                            key={suggestion}
                            onClick={() => toggleTag(suggestion)}
                            className="w-full flex items-center rounded-sm px-2 py-1.5 text-sm text-left hover:bg-accent cursor-pointer"
                        >
                            <Checkbox className="mr-2" checked={selectedTags.includes(suggestion)} readOnly />
                            <span>{suggestion}</span>
                        </div>
                    ))}
                 </div>
            </ScrollArea>
           
            <div className="flex justify-end gap-2 p-2 border-t">
              <Button variant="ghost" size="sm" onClick={handleCancel}>Cancel</Button>
              <Button size="sm" onClick={handleSave}>Save Tags</Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    )
  }
)

TagInput.displayName = "TagInput";

export { TagInput };
