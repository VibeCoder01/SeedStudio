
"use client"

import React, { useState, useEffect } from "react"
import { ChevronDown } from "lucide-react"

import { useDebounce } from "@/hooks/use-debounce"
import { Badge } from "@/components/ui/badge"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Button } from "./button"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Input } from "./input"
import { Checkbox } from "./checkbox"

interface TagSelectorProps {
  tags: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[]
}

const TagSelector = React.forwardRef<HTMLButtonElement, TagSelectorProps>(
  ({ tags, onChange, suggestions = [], ...props }, ref) => {
    const [popoverOpen, setPopoverOpen] = useState(false)
    const [inputValue, setInputValue] = useState("")
    const [selectedTags, setSelectedTags] = useState<string[]>(tags)
    const debouncedSearchTerm = useDebounce(inputValue, 300);

    useEffect(() => {
      setSelectedTags(tags);
    }, [tags]);

    const handleSave = () => {
      onChange(selectedTags)
      setPopoverOpen(false)
    }

    const handleCancel = () => {
      setSelectedTags(tags);
      setPopoverOpen(false)
    }
    
    const handleOpenChange = (isOpen: boolean) => {
        setPopoverOpen(isOpen);
        if (!isOpen) {
            handleCancel();
        } else {
            setSelectedTags(tags);
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
        setSelectedTags(prev => [...prev, trimmedTag])
      }
      setInputValue("");
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddCustomTag();
      }
    };
    
    const allAvailableTags = Array.from(new Set([...suggestions, ...selectedTags])).sort();
    
    const filteredSuggestions = allAvailableTags.filter(suggestion =>
      suggestion.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );

    return (
      <div>
        <div className="flex flex-wrap gap-2 rounded-md border border-input p-2 items-center text-sm min-h-10">
          {tags.length === 0 && <span className="text-muted-foreground px-1">No tags selected</span>}
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
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
            <div className="p-2">
              <Input 
                placeholder="Create or find a tag..."
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
              />
            </div>
            <Command>
              <CommandList className="max-h-60">
                <CommandGroup>
                  {filteredSuggestions.map((suggestion) => (
                    <CommandItem
                      key={suggestion}
                      value={suggestion}
                      onSelect={() => toggleTag(suggestion)}
                      className="flex items-center gap-2"
                    >
                      <Checkbox checked={selectedTags.includes(suggestion)} />
                      {suggestion}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
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

TagSelector.displayName = "TagSelector"

export { TagSelector as TagInput };
