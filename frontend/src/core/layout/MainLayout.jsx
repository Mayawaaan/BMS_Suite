import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from '../../shared/components/Footer';

export const MainLayout = ({
  activeTab,
  onSelectTab,
  activeTitle,
  onOpenQuickAction,
  onGlobalSearch,
  children,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSelectTab = (tab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false); // Close mobile drawer on selection
  };

  return (
    <div className="flex h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden relative">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 lg:hidden animate-in fade-in"
        />
      )}

      {/* Sidebar Navigation (Overlay drawer on mobile, static on desktop) */}
      <div
        className={`fixed inset-y-0 left-0 z-50 lg:static lg:z-30 transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          onCloseMobile={() => setMobileMenuOpen(false)}
          onOpenSuperAdmin={() => handleSelectTab('admin_panel')}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden">
        <Header
          activeTitle={activeTitle}
          onSelectTab={handleSelectTab}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          onOpenQuickAction={onOpenQuickAction}
          onGlobalSearch={onGlobalSearch}
        />

        <main
          id="main-content"
          className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 relative focus:outline-none"
        >
          <div className="max-w-[1600px] mx-auto w-full space-y-4 sm:space-y-8">
            {children}
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
};
