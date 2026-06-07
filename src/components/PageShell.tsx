export function PageShell({
  title,
  subtitle,
  actions,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`px-4 py-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-7xl mx-auto w-full min-w-0 ${className}`.trim()}
    >
      <header className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-glow-green truncate">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">{subtitle}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div> : null}
      </header>
      {children}
    </div>
  );
}
