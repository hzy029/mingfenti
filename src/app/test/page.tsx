import { SiteHeader } from "@/components/site-header";
import { TestIntroView } from "@/components/test-intro-view";

export default function TestIntroPage() {
  return (
    <>
      <SiteHeader />
      <TestIntroView variant="lite" />
    </>
  );
}
