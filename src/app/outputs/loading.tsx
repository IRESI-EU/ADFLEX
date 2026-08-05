import { adflexContent } from "@/content/adflex";
import { RouteLoading } from "@/components/RouteLoading";

export default function OutputsLoading() {
  return (
    <RouteLoading eyebrow="Findings and papers" title={adflexContent.results.title} />
  );
}
