import { useState, createContext, useContext } from "react";
import { cn } from "~/lib/utils";

const TabsContext = createContext();

export function Tabs({ defaultValue, children, className, variant = "default" }) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, variant }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children }) {
  const { variant } = useContext(TabsContext);
  const isMuseum = variant === "museum";

  return (
    <div
      role="tablist"
      className={cn(
        "h-10 w-full grid grid-cols-4 gap-1 mb-8 items-center justify-center rounded-md p-1",
        isMuseum
          ? "border border-museum-gold/15 bg-museum-ivory/7 text-museum-muted"
          : "bg-[color:var(--muted)] text-[color:var(--muted-foreground)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, className, children, disabled }) {
  const { activeTab, setActiveTab, variant } = useContext(TabsContext);
  const isActive = activeTab === value;
  const isMuseum = variant === "museum";

  return (
    <button
      role="tab"
      aria-selected={isActive}
      id={`tab-${value}`}
      onClick={() => setActiveTab(value)}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isMuseum
          ? "focus-visible:outline-museum-gold-light"
          : "focus-visible:outline-ring",
        isMuseum && isActive && "bg-museum-gold text-museum-black shadow-museum-gold",
        isMuseum && !isActive && "hover:bg-museum-ivory/8 hover:text-museum-gold-light",
        !isMuseum && isActive && "bg-[color:var(--heritage-light)] text-[color:var(--heritage-dark)] shadow-sm",
        !isMuseum && !isActive && "hover:text-[color:var(--foreground)]",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className, children }) {
  const { activeTab } = useContext(TabsContext);
  if (activeTab !== value) return null;

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`}
      className={cn("animate-fade-in", className)}
    >
      {children}
    </div>
  );
}
