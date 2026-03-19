import { type Metadata } from "next";
import { WidgetWrapper } from "@/components/embed/WidgetWrapper";
import { parseWidgetOptions } from "@/lib/embed";

export const metadata: Metadata = {
  title: "SEO Meta Preview — Embed Widget",
  robots: { index: false, follow: false },
};

interface EmbedPageProps {
  searchParams: Promise<Record<string, string>>;
}

/**
 * Embeddable widget page — served inside an iframe.
 * X-Frame-Options is set to ALLOWALL for this route in next.config.ts.
 */
export default async function EmbedPage({ searchParams }: EmbedPageProps) {
  const params = await searchParams;
  const urlSearchParams = new URLSearchParams(params);
  const options = parseWidgetOptions(urlSearchParams);

  return (
    <div className="h-full w-full overflow-auto">
      <WidgetWrapper options={options} />
    </div>
  );
}
