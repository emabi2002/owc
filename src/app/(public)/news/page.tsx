import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { NewsList } from "@/components/news/news-list";

export const metadata: Metadata = {
  title: "News & Public Notices",
  description:
    "Announcements, awareness notices, labour and employment updates, and public consultation notices from the Office of Workers Compensation.",
};

export default function NewsPage() {
  return (
    <>
      <PageHero
        eyebrow="Newsroom"
        title="News & public notices"
        subtitle="Announcements, awareness campaigns, labour updates and public consultation notices from the Office of Workers Compensation."
        breadcrumb={[{ label: "News" }]}
      />
      <section className="py-16 lg:py-20">
        <div className="container-gov">
          <NewsList />
        </div>
      </section>
    </>
  );
}
