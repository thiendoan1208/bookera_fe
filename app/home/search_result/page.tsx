"use client";

import { useSearchParams } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { searchWorks } from "@/service/open_lib";
import { SearchResultDoc } from "@/types/open_library";
import { LoaderCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import routes from "@/routes/routes";

function SearchResultPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["searchBooks", query],
    queryFn: ({ pageParam = 0 }) => searchWorks(query, 10, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce(
        (acc, page) => acc + page.docs.length,
        0,
      );
      return totalFetched < lastPage.numFound ? totalFetched : undefined;
    },
    enabled: !!query,
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

  const allDocs = data?.pages.flatMap((page) => page.docs) || [];
  const totalFound = data?.pages[0]?.numFound || 0;

  return (
    <div className="min-h-screen bg-white pl-28 pt-18 pr-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl text-zinc-700 mb-6 font-semibold">
          Search Books
        </h1>

        {/* Search Result */}
        <div className="mb-4">
          <p className="text-lg text-zinc-800">
            Search results for:{" "}
            <span className="font-semibold text-zinc-900">
              &quot;{query}&quot;
            </span>
          </p>
          {totalFound > 0 && (
            <p className="text-sm text-zinc-600 mt-1">
              Found {totalFound.toLocaleString()} results
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div>
        {isLoading && (
          <div className="text-center py-12 text-zinc-500">
            <LoaderCircle className="mx-auto size-8 text-zinc-400 animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-red-500">
            Error loading results
          </div>
        )}

        {allDocs.length === 0 && !isLoading && (
          <div className="text-center py-12 text-zinc-500">
            No results found
          </div>
        )}

        {allDocs.length > 0 && (
          <>
            <div className="space-y-6">
              {allDocs.map((book) => (
                <BookResult key={book.key} book={book} />
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
              {!hasNextPage && allDocs.length > 0 && (
                <p className="text-center text-sm text-zinc-500">
                  No more results
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Book Result Component
function BookResult({ book }: { book: SearchResultDoc }) {
  const coverUrl = book.cover_i
    ? `${process.env.NEXT_PUBLIC_OPEN_LIBRARY_COVERS_URL}/b/id/${book.cover_i}-M.jpg`
    : null;
  return (
    <div className="flex gap-4 pb-6 border-b border-zinc-200">
      {/* Cover Image */}
      <Link href={`/home${book.key}`} className="shrink-0">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={book.title}
            width={96}
            height={144}
            className="w-24 h-36 object-cover rounded shadow cursor-pointer"
          />
        ) : (
          <div className="w-24 h-36 bg-zinc-200 rounded flex items-center justify-center">
            <span className="text-zinc-400 text-xs">No Cover</span>
          </div>
        )}
      </Link>

      {/* Book Info */}
      <div className="flex-1">
        <h2 className="text-xl text-zinc-900 mb-1 cursor-pointer hover:text-blue-700 transition-colors duration-200">
          <Link href={`/home${book.key}`}>{book.title}</Link>
        </h2>
        <p className="text-sm text-zinc-600 mb-2 flex items-center">
          by{" "}
          {book.author_name?.map((author, i) => (
            <Link href={routes.searchResult(author)} key={i}>
              <span className="ml-1 hover:text-blue-700">{author}</span>
              {i < (book.author_name?.length || 0) - 1 && ", "}
            </Link>
          ))}
        </p>

        <p className="text-xs text-zinc-600">
          First published in {book.first_publish_year || "Unknown"}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 w-32">
        <button className="border border-zinc-300 text-zinc-700 px-4 py-2 rounded text-sm hover:bg-zinc-50">
          Add to List
        </button>
      </div>
    </div>
  );
}

export default SearchResultPage;
