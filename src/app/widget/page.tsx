import { redirect } from "next/navigation";
import { type Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SEO Meta Preview — Widget",
  robots: { index: false, follow: false },
};

interface WidgetPageProps {
  searchParams: Promise<Record<string, string>>;
}

/**
 * Widget route (F009) — redirects to /embed which is the canonical embed page.
 * Both /widget and /embed serve the embeddable widget.
 */
export default async function WidgetPage({ searchParams }: WidgetPageProps) {
  const params = await searchParams;
  const queryString = new URLSearchParams(params).toString();
  redirect(`/embed${queryString ? `?${queryString}` : ""}`);
}
