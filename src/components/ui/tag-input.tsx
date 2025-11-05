
"use client"

import React from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"

interface TagInputProps extends Omit<React.ComponentPropsWithoutRef<"input">, "onChange"> {
  tags: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[]
}

const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(
  ({ className, tags, onChange, suggestions = [], ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [inputValue, setInputValue] = React.useState("")
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      // Only open popover if there's input
      if (value) {
        setIsPopoverOpen(true);
      } else {
        setIsPopoverOpen(false);
      }
    }

    const addTag = (newTag: string) => {
      const trimmedTag = newTag.trim()
      if (trimmedTag && !tags.includes(trimmedTag)) {
        onChange([...tags, trimmedTag])
      }
      setInputValue("")
      setIsPopoverOpen(false)
      inputRef.current?.focus()
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        // This is handled by onSelect in CommandItem if popover is open
        if (!isPopoverOpen) {
          e.preventDefault()
          addTag(inputValue)
        }
      } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
        removeTag(tags[tags.length - 1])
      } else if (e.key === "Escape") {
        setIsPopoverOpen(false)
      }
    }

    const removeTag = (tagToRemove: string) => {
      onChange(tags.filter((tag: string) => tag !== tagToRemove))
    }

    const filteredSuggestions = suggestions.filter(
      (suggestion) =>
        suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
        !tags.includes(suggestion)
    );
    
    // Determine if popover should be open
    const popoverShouldBeOpen = isPopoverOpen && filteredSuggestions.length > 0 && inputValue.length > 0;

    return (
      <div
        className="group flex flex-wrap gap-2 rounded-md border border-input p-2 items-center"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag: string, index: number) => (
          <Badge key={index} variant="secondary">
            {tag}
            <button
              type="button"
              className="ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
            >
              <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
            </button>
          </Badge>
        ))}
         <Command
            onKeyDown={(e) => {
                // Let Command component handle Enter, ArrowUp, ArrowDown
                if (e.key === 'Enter' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    if (popoverShouldBeOpen) {
                        e.preventDefault();
                    }
                }
            }}
            className="flex-1 bg-transparent"
        >
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (inputValue) setIsPopoverOpen(true)
                }}
                onBlur={() => {
                  // Delay closing to allow for click on suggestion
                  setTimeout(() => setIsPopoverOpen(false), 150)
                }}
                className={cn(
                  "bg-transparent text-sm outline-none placeholder:text-muted-foreground w-full min-w-[60px]",
                  className
                )}
                {...props}
              />
               {popoverShouldBeOpen && (
                 <div className="absolute top-[calc(100%+0.5rem)] left-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
                  <CommandList>
                    <CommandGroup>
                      {filteredSuggestions.slice(0, 10).map((suggestion) => (
                        <CommandItem
                          key={suggestion}
                          onMouseDown={(e) => {
                            // Prevent input blur
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onSelect={() => addTag(suggestion)}
                          className="cursor-pointer"
                        >
                          {suggestion}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                 </div>
               )}
            </div>
        </Command>
      </div>
    )
  }
)

TagInput.displayName = "TagInput"

export { TagInput }
