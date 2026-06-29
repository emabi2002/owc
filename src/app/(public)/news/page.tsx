import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { NewsList } from "@/components/news/news-list";
import { getNews } from "@/lib/data/content";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "News & Public Notices",
  description:
    "Announcements, awareness notices, labour and employment updates, and public consultation notices from the Office of Workers Compensation.",
};

export default async function NewsPage() {
  const news = await getNews();
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
          <NewsList items={news} />
        </div>
      </section>
    </>
  );
}
