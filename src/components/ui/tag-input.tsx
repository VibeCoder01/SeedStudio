
"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { X, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
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
    const [open, setOpen] = useState(false)
    const [inputValue, setInputValue] = useState("")
    const [selectedTags, setSelectedTags] = useState<string[]>(tags)

    useEffect(() => {
        setSelectedTags(tags);
    }, [tags])

    const handleSave = () => {
        onChange(selectedTags)
        setOpen(false)
    }

    const handleCancel = () => {
        setSelectedTags(tags);
        setOpen(false)
    }

    const toggleTag = (tag: string) => {
        setSelectedTags(prev => 
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        )
    }
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value)
    }

    const handleAddTag = () => {
        const trimmedTag = inputValue.trim();
        if(trimmedTag && !selectedTags.includes(trimmedTag)) {
            setSelectedTags(prev => [...prev, trimmedTag])
        }
        setInputValue("");
    }

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddTag();
      }
    };
    
    const allAvailableTags = Array.from(new Set([...suggestions, ...tags])).sort();
    
    const filteredSuggestions = allAvailableTags.filter(suggestion =>
      suggestion.toLowerCase().includes(inputValue.toLowerCase())
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
        <Popover open={open} onOpenChange={setOpen}>
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
