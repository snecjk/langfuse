/**
 * Unauthenticated layout variant
 * Used for sign-in, sign-up, and other auth pages
 * Minimal layout with no sidebar or navigation
 */

import type { PropsWithChildren } from "react";
import { SidebarProvider } from "@/src/components/ui/sidebar";
import { LanguageSelect } from "@/src/features/i18n/LanguageSelect";

export function UnauthenticatedLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider className="bg-primary-foreground">
      <main className="min-h-dvh w-full overflow-y-auto p-3 px-4 py-4 sm:px-6 lg:px-8">
        <div className="ml-auto w-36">
          <LanguageSelect />
        </div>
        {children}
      </main>
    </SidebarProvider>
  );
}
