import React from 'react';
import { 
  ChevronRight, 
  BarChart3, 
  CheckSquare, 
  Users, 
  Calculator, 
  ShoppingCart, 
  Palette,
  Building2,
  Receipt,
  PieChart,
  Package,
  Settings,
  FileText,
  TrendingUp,
  Database
} from 'lucide-react';
import '../styles/sidebar.css';

const Sidebar = () => {
  const sidebarItems = [
    { name: 'Dashboard', icon: BarChart3, active: false },
    { name: 'Tasks', icon: CheckSquare, active: false },
    { name: 'Buyer Meeting', icon: Users, active: true },
    { name: 'Quick Costing', icon: Calculator, active: false },
    { name: 'Pre Order Costing', icon: ShoppingCart, active: false },
    { name: 'Style Library', icon: Palette, active: false },
    { name: 'Requisitions', icon: FileText, active: false, hasSubmenu: true },
    { name: 'Buyer Purchase', icon: ShoppingCart, active: false, hasSubmenu: true },
    { name: 'Inventory', icon: Package, active: false, hasSubmenu: true },
    { name: 'Sample Development', icon: Palette, active: false, hasSubmenu: true },
    { name: 'Production', icon: Settings, active: false, hasSubmenu: true },
    { name: 'Master Admin', icon: Users, active: false, hasSubmenu: true },
    { name: 'Users', icon: Users, active: false, hasSubmenu: true },
    { name: 'Suppliers', icon: Building2, active: false },
    { name: 'Showroom', icon: Building2, active: false, hasSubmenu: true },
    { name: 'Shipment', icon: Package, active: false, hasSubmenu: true },
    { name: "KPI's", icon: TrendingUp, active: false, hasSubmenu: true },
    { name: 'E-Invoice / E-Way Bill', icon: Receipt, active: false },
    { name: 'Reports', icon: PieChart, active: false },
    { name: 'Master Data', icon: Database, active: false, hasSubmenu: true },
    { name: 'Settings', icon: Settings, active: false, hasSubmenu: true }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-content">
        {sidebarItems.map((item, index) => (
          <div
            key={index}
            className={`sidebar-item ${item.active ? 'active' : ''}`}
          >
            <div className="sidebar-item-content">
              <div className="sidebar-item-left">
                {item.icon && <item.icon className="sidebar-icon" />}
                <span className="sidebar-text">{item.name}</span>
              </div>
              {item.hasSubmenu && <ChevronRight className="chevron-icon" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;