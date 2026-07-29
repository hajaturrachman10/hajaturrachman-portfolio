import { useLanguage } from "@/components/providers/LanguageContext";
import {
  sharedConfig,
  indonesianSiteConfig,
  germanSiteConfig,
  indonesianJourneyCards,
  germanJourneyCards,
  indonesianCvAccess,
  germanCvAccess,
  indonesianValueCards,
  germanValueCards,
  indonesianPrivateVaultData,
  germanPrivateVaultData,
  indonesianFeatureHighlights,
  germanFeatureHighlights
} from "./siteConfigData";
import { indonesianProjects, germanProjects } from "./projectsData";
import { indonesianSkillGroups, germanSkillGroups } from "./skillsData";
import { indonesianTimeline, germanTimeline } from "./timelineData";
import { indonesianAchievements, germanAchievements } from "./achievementsData";
import { indonesianPublicGallery, germanPublicGallery } from "./galleryData";

const indonesianContent = {
  siteConfig: indonesianSiteConfig,
  journeyCards: indonesianJourneyCards,
  cvAccess: indonesianCvAccess,
  skillGroups: indonesianSkillGroups,
  timeline: indonesianTimeline,
  achievements: indonesianAchievements,
  projects: indonesianProjects,
  publicGallery: indonesianPublicGallery,
  valueCards: indonesianValueCards,
  privateVault: indonesianPrivateVaultData,
  featureHighlights: indonesianFeatureHighlights
};

const germanContent = {
  siteConfig: germanSiteConfig,
  journeyCards: germanJourneyCards,
  cvAccess: germanCvAccess,
  skillGroups: germanSkillGroups,
  timeline: germanTimeline,
  achievements: germanAchievements,
  projects: germanProjects,
  publicGallery: germanPublicGallery,
  valueCards: germanValueCards,
  privateVault: germanPrivateVaultData,
  featureHighlights: germanFeatureHighlights
};

const translations = {
  id: indonesianContent,
  de: germanContent
};

export function useSiteData() {
  const { language } = useLanguage();
  return translations[language];
}

export function useLanguageSelector() {
  const { language, setLanguage } = useLanguage();
  return { language, setLanguage };
}

// Static exports for Server Components and legacy direct imports
export const siteConfig = indonesianContent.siteConfig;
export const timeline = indonesianContent.timeline;
export const valueCards = indonesianContent.valueCards;
export const skillGroups = indonesianContent.skillGroups;
export const featureHighlights = indonesianContent.featureHighlights;
export const journeyCards = indonesianContent.journeyCards;
export const projects = indonesianContent.projects;
export const publicGallery = indonesianContent.publicGallery;
export const cvAccess = indonesianContent.cvAccess;
export const privateVault = indonesianContent.privateVault;
export const achievements = indonesianContent.achievements;
export { sharedConfig };
