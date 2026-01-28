"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getWorksBySubject } from "@/service/open_lib";
import { LoaderCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, use } from "react";
import { Work } from "@/types/open_library";
import { CAROUSEL_SUBJECTS_CONFIG } from "@/data/carousel_items";

interface SubjectPageProps {
  params: Promise<{
    subject: string;
  }>;
}

function SubjectPage({ params }: SubjectPageProps) {
  const { subject } = use(params);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["worksBySubject", subject],
    queryFn: ({ pageParam = CAROUSEL_SUBJECTS_CONFIG.DEFAULT_OFFSET }) =>
      getWorksBySubject(
        subject,
        CAROUSEL_SUBJECTS_CONFIG.DEFAULT_BOOKS_LIMIT,
        pageParam,
      ),
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce(
        (acc, page) => acc + page.works.length,
        0,
      );
      return totalFetched < lastPage.work_count ? totalFetched : undefined;
    },
    enabled: !!subject,
    initialPageParam: 0,
  });

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allWorks = data?.pages.flatMap((page) => page.works) || [];
  const totalWorks = data?.pages[0]?.work_count || 0;
  const subjectName = data?.pages[0]?.name || subject.replace(/_/g, " ");

  return (
    <div className="min-h-screen bg-white px-8 py-6 pl-28 pt-18">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl text-zinc-800 mb-2 font-bold capitalize">
          {subjectName}
        </h1>
        {totalWorks > 0 && (
          <p className="text-lg text-zinc-600">
            {totalWorks.toLocaleString()} works available
          </p>
        )}
      </div>

      {/* Content */}
      <div>
        {isLoading && (
          <div className="text-center py-12">
            <LoaderCircle className="mx-auto size-8 text-zinc-400 animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-red-500">
            Error loading works
          </div>
        )}

        {allWorks.length === 0 && !isLoading && (
          <div className="text-center py-12 text-zinc-500">
            No works found for this subject
          </div>
        )}

        {allWorks.length > 0 && (
          <>
            {/* Grid Layout */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
              {allWorks.map((work) => (
                <BookCard key={work.key} work={work} />
              ))}
            </div>

            {/* Load More Trigger */}
            <div ref={loadMoreRef} className="py-8">
              {isFetchingNextPage && (
                <div className="text-center">
                  <LoaderCircle className="mx-auto size-6 text-zinc-400 animate-spin" />
                  <p className="text-sm text-zinc-500 mt-2">Loading more...</p>
                </div>
              )}
              {!hasNextPage && allWorks.length > 0 && (
                <p className="text-center text-sm text-zinc-500">
                  No more works
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Book Card Component
function BookCard({ work }: { work: Work }) {
  const coverUrl = work.cover_id
    ? `${process.env.NEXT_PUBLIC_OPEN_LIBRARY_COVERS_URL}/b/id/${work.cover_id}-M.jpg`
    : null;

  return (
    <Link href={`/home${work.key}`} className="group">
      <div className="flex flex-col h-full">
        {/* Cover Image */}
        <div className="relative aspect-2/3 w-full mb-3 overflow-hidden rounded-lg shadow-md group-hover:shadow-xl transition-shadow duration-300">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={work.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-zinc-200 to-zinc-300 flex items-center justify-center">
              <span className="text-zinc-500 text-xs text-center px-2">
                No Cover
              </span>
            </div>
          )}
        </div>

        {/* Book Info */}
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-zinc-900 line-clamp-2 group-hover:text-blue-700 transition-colors">
            {work.title}
          </h3>
          {work.authors && work.authors.length > 0 && (
            <p className="text-xs text-zinc-600 mt-1 line-clamp-1">
              {work.authors.map((author) => author.name).join(", ")}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default SubjectPage;
