import React, { createContext, useContext, useState, useEffect } from 'react';
import { BUSINESS_PROFILES, BUSINESS_PROFILE_LIST } from '../config/businessProfiles';

const BusinessProfileContext = createContext(null);

export const useBusinessProfile = () => {
  const context = useContext(BusinessProfileContext);
  if (!context) {
    throw new Error('useBusinessProfile must be used within a BusinessProfileProvider');
  }
  return context;
};

export const BusinessProfileProvider = ({ children }) => {
  const [profileId, setProfileId] = useState(() => {
    return localStorage.getItem('omnipulse_business_vertical') || 'all';
  });

  const activeProfile = BUSINESS_PROFILES[profileId] || BUSINESS_PROFILES.all;

  useEffect(() => {
    localStorage.setItem('omnipulse_business_vertical', profileId);
  }, [profileId]);

  const switchProfile = (id) => {
    if (BUSINESS_PROFILES[id]) {
      setProfileId(id);
      localStorage.setItem('omnipulse_business_vertical', id);

      try {
        const authUserStr = localStorage.getItem('omnipulse_auth_user');
        const authUser = authUserStr ? JSON.parse(authUserStr) : null;
        if (authUser?.role === 'superadmin' || authUser?.tenantId === 'tenant-universal' || !authUser?.tenantId) {
          const VERTICAL_MAP = {
            all: 'tenant-universal',
            shop: 'tenant-retail',
            factory: 'tenant-factory',
            industry: 'tenant-industry',
            software: 'tenant-software',
            ecommerce: 'tenant-ecommerce',
          };
          const targetTenant = VERTICAL_MAP[id] || 'tenant-universal';
          localStorage.setItem('omnipulse_tenant_id', targetTenant);
        }
      } catch {}
    }
  };

  /**
   * Filter an array of items based on the active profile.
   * If profile is 'all', all items are returned.
   * If an item has no businessType, it defaults to 'software' or matches if profileId matches.
   */
  const filterByProfile = (items = []) => {
    if (profileId === 'all') return items;
    return items.filter((item) => {
      const bType = item.businessType || 'software';
      return bType === profileId || bType === 'all';
    });
  };

  return (
    <BusinessProfileContext.Provider
      value={{
        profileId,
        activeProfile,
        profiles: BUSINESS_PROFILE_LIST,
        switchProfile,
        filterByProfile,
        terminology: activeProfile.terminology,
      }}
    >
      {children}
    </BusinessProfileContext.Provider>
  );
};
