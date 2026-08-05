import { adflexContent } from "@/content/adflex";
import { RouteLoading } from "@/components/RouteLoading";

export default function NewsLoading() {
  return (
    <RouteLoading
      eyebrow={adflexContent.news.eyebrow}
      title={adflexContent.news.title}
    />
  );
}
