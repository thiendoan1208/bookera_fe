import { WorksBySubjectResponse } from "@/types/open_library";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { CAROUSEL_CONFIG } from "@/data/carousel_items";
import Link from "next/link";
import routes from "@/routes/routes";

function NoSwitchCarousel({
  data,
  isFetching,
}: {
  data: WorksBySubjectResponse | { works: [] };
  isFetching: boolean;
}) {
  return (
    <div className="ml-1 mb-10">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
        {isFetching
          ? // Show skeleton loaders while fetching
            Array.from({ length: CAROUSEL_CONFIG.DEFAULT_BOOKS_LIMIT }).map(
              (_, index) => (
                <div key={`skeleton-${index}`} className="flex flex-col gap-3">
                  <Skeleton className="w-full aspect-3/4 rounded-xl" />
                  <Skeleton className="w-full h-4" />
                  <Skeleton className="w-3/4 h-3" />
                </div>
              ),
            )
          : data && data.works
            ? // Show actual books when data is loaded
              data.works.map((book, index: number) => (
                <Link
                  href={routes.bookDetails(book.key.split("/").pop() || "")}
                  key={`book-${index}`}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-3/4 overflow-hidden rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 mb-3">
                    <Image
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      src={`${process.env.NEXT_PUBLIC_OPEN_LIBRARY_COVERS_URL}/b/id/${book.cover_id}-L.jpg`}
                      alt={book.title}
                      width={300}
                      height={400}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="space-y-1">
                    <h1 className="text-base font-bold line-clamp-2 leading-tight group-hover:text-zinc-600 transition-colors">
                      {book.title}
                    </h1>
                    <h6 className="text-sm text-zinc-500 truncate">
                      {book.authors.map((author) => author.name).join(", ")}
                    </h6>
                  </div>
                </Link>
              ))
            : null}
      </div>
    </div>
  );
}

export default NoSwitchCarousel;
