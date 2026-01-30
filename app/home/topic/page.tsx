import { categories } from "@/data/categories";
import routes from "@/routes/routes";
import Link from "next/link";

function TopicPage() {
  return (
    <div className="w-full h-full pl-28 pt-18 pr-10">
      <h1 className="text-4xl font-bold mb-2">Explore Topics</h1>
      <p className="text-muted-foreground mb-8">
        Browse books by category and subject
      </p>

      <div className="grid grid-cols-1 gap-8">
        {categories.map((category, index) => (
          <div key={`category-${index}`}>
            <h2 className="font-[playfair-display] text-2xl font-semibold mb-4 text-zinc-900">
              {category.title}
            </h2>
            <div className="space-y-2">
              {category.subjects.map((subject, subIndex) => (
                <Link
                  key={`subject-${subIndex}`}
                  href={routes.subjectTopic(subject.slug)}
                  className="block px-3 py-2 rounded-md hover:bg-zinc-100 transition-colors text-zinc-700 hover:text-zinc-900"
                >
                  {subject.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopicPage;
