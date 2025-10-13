 export interface SidebarRoute {
  path: string;
  label: string;
  icon: string;
  permissions: string[];
  children?: SidebarRoute[];
}