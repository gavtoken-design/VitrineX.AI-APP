// src/services/businessLogic.ts

export interface BrandData {
    name: string;
    industry: string;
    targetAudience: string;
    visualStyle: string;
}

export const DEFAULT_BRAND_DATA: BrandData = {
    name: "",
    industry: "",
    targetAudience: "",
    visualStyle: ""
};

export function validateBrandName(name: string): boolean {
    return name.trim().length > 2;
}

// Logic to transform data if needed, or helper functions
export function formatIndustry(industry: string): string {
    return industry.charAt(0).toUpperCase() + industry.slice(1).toLowerCase();
}
