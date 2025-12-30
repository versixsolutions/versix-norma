// Utilitário de classes condicional (shadcn/ui)
export function cn(...args: any[]): string {
  return args
    .flat(Infinity)
    .filter(Boolean)
    .join(' ');
}
