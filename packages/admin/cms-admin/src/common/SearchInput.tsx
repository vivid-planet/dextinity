import { ChevronDown, ChevronUp, Clear, Search } from "@dextinity/admin-icons";
import { IconButton, InputAdornment, InputBase, Typography } from "@mui/material";
import { type ChangeEvent, type KeyboardEvent, useEffect, useRef, useState } from "react";
import { useHotkeys, useIsHotkeyPressed } from "react-hotkeys-hook";
import { useDebouncedCallback } from "use-debounce";

interface SearchInputProps {
    query: string;
    onQueryChange: (query: string) => void;
    currentMatch?: number;
    totalMatches?: number;
    jumpToNextMatch?: () => void;
    jumpToPreviousMatch?: () => void;
    autoFocus?: boolean;
}

export const SearchInput = ({
    query,
    onQueryChange,
    currentMatch,
    totalMatches,
    jumpToNextMatch,
    jumpToPreviousMatch,
    autoFocus = false,
}: SearchInputProps) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [internalQuery, setInternalQuery] = useState(query);
    const isPressed = useIsHotkeyPressed();

    const debouncedOnQueryChange = useDebouncedCallback(onQueryChange, 250);

    useEffect(() => {
        setInternalQuery(query);
    }, [query]);

    const updateQuery = (newQuery: string) => {
        setInternalQuery(newQuery);

        debouncedOnQueryChange(newQuery);

        if (newQuery === "") {
            debouncedOnQueryChange.flush();
        }
    };

    useHotkeys("ctrl+f, command+f", (event) => {
        event.preventDefault();
        inputRef.current?.focus();
    });

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        updateQuery(event.target.value);
    };

    const handleClearClick = () => {
        updateQuery("");
        inputRef.current?.focus();
    };

    const handleKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
        switch (event.key) {
            case "Enter":
                if (isPressed("shift")) {
                    jumpToPreviousMatch?.();
                } else {
                    jumpToNextMatch?.();
                }

                break;

            case "Escape":
                updateQuery("");
                inputRef.current?.blur();

                break;
        }
    };

    return (
        <InputBase
            autoFocus={autoFocus}
            inputRef={inputRef}
            value={internalQuery || ""}
            onChange={handleInputChange}
            onKeyUp={handleKeyUp}
            placeholder="Search"
            fullWidth
            startAdornment={
                <InputAdornment position="start">
                    <Search />
                </InputAdornment>
            }
            endAdornment={
                internalQuery ? (
                    <InputAdornment position="end">
                        <Typography variant="body2" sx={{ marginRight: 2 }}>
                            {currentMatch !== undefined && totalMatches !== undefined ? `${currentMatch + 1}/${totalMatches}` : "..."}
                        </Typography>
                        <IconButton onClick={jumpToPreviousMatch} disabled={!jumpToPreviousMatch} size="medium" color="secondary">
                            <ChevronUp />
                        </IconButton>
                        <IconButton onClick={jumpToNextMatch} disabled={!jumpToNextMatch} size="medium" color="secondary">
                            <ChevronDown />
                        </IconButton>
                        <IconButton onClick={handleClearClick} size="medium">
                            <Clear />
                        </IconButton>
                    </InputAdornment>
                ) : null
            }
        />
    );
};
