// src/types/nav.ts
export type MenuItem = {
  label: string;
  href?: string;
  badge?: string;
  children?: MenuItem[];
};
