"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const THEME_LABELS = {
  light: "Light",
  dark: "Dark",
  system: "System",
} as const;

/**
 * Visible theme control for the server-rendered app shell.
 *
 * next-themes reads persisted preference in the browser, so we render a stable
 * label until mount to avoid hydration drift while still keeping the header UI
 * discoverable for first-time users.
 */
export function ThemeSwitcher() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const selectedTheme = mounted && theme ? theme : "light";
  const label = THEME_LABELS[selectedTheme as keyof typeof THEME_LABELS] ?? THEME_LABELS.light;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-earthlight-hairline bg-background/75 text-earthlight-ink shadow-sm hover:bg-earthlight-paper-deep/60 dark:text-foreground"
          aria-label={`Change theme. Current theme: ${label}`}
        >
          {selectedTheme === "dark" ? (
            <Moon aria-hidden className="h-4 w-4" />
          ) : selectedTheme === "system" ? (
            <Monitor aria-hidden className="h-4 w-4" />
          ) : (
            <Sun aria-hidden className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Theme:</span>
          <span>{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>Color theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={selectedTheme} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
