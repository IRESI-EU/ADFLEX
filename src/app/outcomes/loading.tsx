import { adflexContent } from "@/content/adflex";
import { RouteLoading } from "@/components/RouteLoading";

export default function OutcomesLoading() {
  return (
    <RouteLoading eyebrow="Findings and papers" title={adflexContent.outcomes.title} />
  );
}
