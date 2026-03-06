'use client';
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

export type OrgType = 'rw' | 'rt';

export interface OrgContextType {
  orgType: OrgType;
  rtId: number | null;
  orgLabel: string;
  setOrg: (type: OrgType, rtId?: number) => void;
  getApiPrefix: () => string;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

const ORG_STORAGE_KEY = 'rw11_org_context';

export const OrgProvider = ({ children }: { children: ReactNode }) => {
  const [orgType, setOrgType] = useState<OrgType>('rw');
  const [rtId, setRtId] = useState<number | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(ORG_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setOrgType(parsed.orgType || 'rw');
          setRtId(parsed.rtId || null);
        } catch {
          // ignore parse error
        }
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ORG_STORAGE_KEY, JSON.stringify({ orgType, rtId }));
    }
  }, [orgType, rtId]);

  const setOrg = (type: OrgType, rt?: number) => {
    setOrgType(type);
    setRtId(type === 'rt' && rt ? rt : null);
  };

  const orgLabel = orgType === 'rw' ? 'RW 011' : `RT ${String(rtId).padStart(3, '0')}`;

  const getApiPrefix = () => {
    if (orgType === 'rw') return '';
    return `/rt/${rtId}`;
  };

  return (
    <OrgContext.Provider value={{ orgType, rtId, orgLabel, setOrg, getApiPrefix }}>
      {children}
    </OrgContext.Provider>
  );
};

export const useOrg = () => {
  const context = useContext(OrgContext);
  if (context === undefined) {
    throw new Error('useOrg must be used within an OrgProvider');
  }
  return context;
};

export default OrgContext;
