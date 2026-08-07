import { TemplateWrapper } from "@/components/layout/TemplateWrapper";

export default function Template({ children }: { children: React.ReactNode }) {
  return <TemplateWrapper>{children}</TemplateWrapper>;
}
