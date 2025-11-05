
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
      setInputValue(e.target.value)
      setIsPopoverOpen(e.target.value.length > 0)
    }

    const addTag = (newTag: string) => {
      if (newTag && !tags.includes(newTag)) {
        onChange([...tags, newTag])
      }
      setInputValue("")
      setIsPopoverOpen(false)
      inputRef.current?.focus()
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if ((e.key === "Enter" || e.key === ",")) {
        e.preventDefault()
        const newTag = inputValue.trim()
        if (newTag) {
          addTag(newTag)
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
                if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    e.preventDefault();
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
                onFocus={() => setIsPopoverOpen(inputValue.length > 0)}
                onBlur={() => setIsPopoverOpen(false)}
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
                          onMouseDown={(e) => e.preventDefault()}
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
