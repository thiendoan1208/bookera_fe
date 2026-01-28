"use client";

import { CometCard } from "@/components/ui/comet-card";
import {
  getWorkDetails,
  getAuthorDetails,
  getWorksBySubject,
} from "@/service/open_lib";
import { useQuery, useQueries } from "@tanstack/react-query";
import Image from "next/image";
import { use } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRandomSubject, slugify } from "@/lib/utils";
import NoSwitchCarousel from "@/components/app/no_switch_carousel";
import Link from "next/link";
import routes from "@/routes/routes";

interface DetailPageProps {
  params: Promise<{
    type: string;
    workId: string;
  }>;
}

function DetailPage({ params }: DetailPageProps) {
  const { type, workId } = use(params);
  const [isDescriptionExpanded, setIsDescriptionExpanded] =
    React.useState(false);

  const bookDetail = useQuery({
    queryKey: ["bookDetail", workId],
    queryFn: () => {
      return getWorkDetails(type, workId);
    },
  });

  const authorQueries = useQueries({
    queries:
      bookDetail.data?.authors?.map((author) => ({
        queryKey: ["author", author.author.key],
        queryFn: () => getAuthorDetails(author.author.key),
        enabled: !!bookDetail.data,
      })) || [],
  });

  const similarBooks = useQuery({
    queryKey: ["similarbooks", workId],
    queryFn: () => {
      if (bookDetail.data?.subjects && bookDetail.data.subjects.length > 0) {
        const subject = slugify(bookDetail.data.subjects[0]);
        return getWorksBySubject(subject);
      } else {
        const rSubject = getRandomSubject();
        return getWorksBySubject(rSubject);
      }
    },
    enabled: !!bookDetail.data,
  });

  return (
    <div className="pl-28 pt-18">
      {/* Image */}

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-10">
        <div className="w-full col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-2">
          <CometCard className="w-full">
            <div className="flex-1">
              <div className="relative mt-2 aspect-3/4 w-full">
                {bookDetail.isLoading ? (
                  <Skeleton className="absolute inset-0 h-full w-full rounded-2xl" />
                ) : (
                  <Image
                    loading="lazy"
                    className="absolute inset-0 h-full w-full rounded-2xl object-cover"
                    alt={bookDetail.data?.title || "Book cover"}
                    src={
                      bookDetail.data?.covers &&
                      bookDetail.data.covers.length > 0
                        ? `${process.env.NEXT_PUBLIC_OPEN_LIBRARY_COVERS_URL}/b/id/${bookDetail.data.covers[0]}-M.jpg`
                        : "/default-fallback-image.png"
                    }
                    style={{
                      boxShadow: "rgba(0, 0, 0, 0.1) 0px 2px 4px 0px",
                      opacity: 1,
                    }}
                    width={300}
                    height={400}
                  />
                )}
              </div>
            </div>
          </CometCard>
          {/* External Links Buttons */}
          {bookDetail.data?.links && bookDetail.data.links.length > 0 && (
            <div className="mt-6 flex flex-col gap-2">
              {bookDetail.data.links.map((link, index) => (
                <Button
                  key={`link-${index}`}
                  variant="default"
                  className="w-full bg-zinc-800 hover:bg-zinc-900 text-white h-auto whitespace-normal text-wrap"
                  asChild
                >
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.title}
                  </a>
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="col-span-2 md:col-span-2 lg:col-span-4 xl:col-span-8 ml-4">
          {bookDetail.isLoading ? (
            <div className="space-y-6">
              {/* Title skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-5 w-1/4" />
              </div>
              {/* Authors skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-5 w-40" />
              </div>
              {/* Description skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              {/* Tags skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20 rounded-full" />
                  <Skeleton className="h-8 w-24 rounded-full" />
                  <Skeleton className="h-8 w-20 rounded-full" />
                  <Skeleton className="h-8 w-28 rounded-full" />
                </div>
              </div>
            </div>
          ) : bookDetail.data ? (
            <div className="mr-10 space-y-2">
              {/* Title */}
              <div className="flex items-center gap-6">
                <h1 className="text-6xl font-extrabold italic text-zinc-800 font-[sacramento]">
                  {bookDetail.data.title}
                </h1>
              </div>

              {/* Authors */}
              {bookDetail.data.authors &&
                bookDetail.data.authors.length > 0 && (
                  <div className="text-zinc-600 text-lg italic font-semibold">
                    <span className="mr-2 font-normal">by</span>
                    {authorQueries.some((q) => q.isLoading)
                      ? "Loading author..."
                      : authorQueries.map((q, index) => (
                          <React.Fragment key={`author-${index}`}>
                            <Link
                              href={routes.searchResult(q.data?.name || "")}
                              className="hover:text-blue-700 transition-colors"
                            >
                              {q.data?.name}
                            </Link>
                            {index < authorQueries.length - 1 && ", "}
                          </React.Fragment>
                        ))}
                  </div>
                )}

              {/* Description */}
              {bookDetail.data.description && (
                <div className="pt-4">
                  <h3 className="text-lg font-bold text-zinc-800 mb-4 flex items-center gap-3 border-l-4 border-black pl-3">
                    Description
                  </h3>
                  <p
                    className={`text-zinc-600 leading-relaxed transition-all ${isDescriptionExpanded ? "" : "line-clamp-5"}`}
                  >
                    {typeof bookDetail.data.description === "string"
                      ? bookDetail.data.description
                      : (bookDetail.data.description as { value: string })
                          .value}
                  </p>
                  {(() => {
                    const descText =
                      typeof bookDetail.data.description === "string"
                        ? bookDetail.data.description
                        : (bookDetail.data.description as { value: string })
                            .value;
                    return descText.length > 500 ? (
                      <button
                        onClick={() =>
                          setIsDescriptionExpanded(!isDescriptionExpanded)
                        }
                        className="mt-3 text-blue-600 hover:text-blue-800 font-semibold text-sm transition-colors cursor-pointer"
                      >
                        {isDescriptionExpanded ? (
                          <span className="flex items-center gap-1">
                            Read less
                            <ChevronUp className="h-4 w-4" />
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            Read more
                            <ChevronDown className="h-4 w-4" />
                          </span>
                        )}
                      </button>
                    ) : null;
                  })()}
                </div>
              )}

              {/* First Sentence */}
              {bookDetail.data.first_sentence && (
                <div>
                  <h3 className="text-lg font-bold text-zinc-800 mb-4 flex items-center gap-3 border-l-4 border-black pl-3">
                    Opening Line
                  </h3>
                  <p className="text-zinc-600 italic">
                    &quot;{bookDetail.data.first_sentence.value}&quot;
                  </p>
                </div>
              )}

              {/* Subjects/Genres */}
              {bookDetail.data.subjects &&
                bookDetail.data.subjects.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-zinc-800 mb-3 flex items-center gap-3 border-l-4 border-black pl-3">
                      Genres & Topics
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {bookDetail.data.subjects
                        .slice(0, 12)
                        .map((subject, index) => (
                          <span
                            key={`subject-${index}`}
                            className="bg-zinc-200 text-zinc-800 px-3 py-1 rounded-full text-sm"
                          >
                            {subject}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

              {/* Subject People */}
              {bookDetail.data.subject_people &&
                bookDetail.data.subject_people.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-zinc-800 mb-4 flex items-center gap-3 border-l-4 border-black pl-3">
                      Characters
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {bookDetail.data.subject_people
                        .slice(0, 8)
                        .map((person, index) => (
                          <span
                            key={`person-${index}`}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                          >
                            {person}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

              {/* Subject Places */}
              {bookDetail.data.subject_places &&
                bookDetail.data.subject_places.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-zinc-800 mb-4 flex items-center gap-3 border-l-4 border-black pl-3">
                      Places
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {bookDetail.data.subject_places
                        .slice(0, 8)
                        .map((place, index) => (
                          <span
                            key={`place-${index}`}
                            className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                          >
                            {place}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

              {(bookDetail.data.first_publish_date ||
                bookDetail.data.dewey_number ||
                bookDetail.data.latest_revision ||
                bookDetail.data.revision ||
                bookDetail.data.created ||
                bookDetail.data.last_modified ||
                (bookDetail.data.excerpts &&
                  bookDetail.data.excerpts.length > 0)) && (
                <div className="mt-6 rounded-lg bg-white/70">
                  <h4 className="text-base font-bold text-zinc-800 mb-3">
                    Additional Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-zinc-700">
                    {bookDetail.data.first_publish_date && (
                      <div className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                        <div>
                          <p className="font-semibold">First Published</p>
                          <p>{bookDetail.data.first_publish_date}</p>
                        </div>
                      </div>
                    )}
                    {Array.isArray(bookDetail.data.dewey_number) &&
                      bookDetail.data.dewey_number.length > 0 && (
                        <div className="flex items-start gap-2">
                          <span className="mt-1 h-2 w-2 rounded-full bg-green-500" />
                          <div>
                            <p className="font-semibold">Dewey Number</p>
                            <p>{bookDetail.data.dewey_number.join(", ")}</p>
                          </div>
                        </div>
                      )}
                    {bookDetail.data.latest_revision && (
                      <div className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                        <div>
                          <p className="font-semibold">Latest Revision</p>
                          <p>{bookDetail.data.latest_revision}</p>
                        </div>
                      </div>
                    )}
                    {bookDetail.data.revision && (
                      <div className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-orange-500" />
                        <div>
                          <p className="font-semibold">Revision</p>
                          <p>{bookDetail.data.revision}</p>
                        </div>
                      </div>
                    )}
                    {bookDetail.data.created?.value && (
                      <div className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-purple-500" />
                        <div>
                          <p className="font-semibold">Created</p>
                          <p>
                            {new Date(
                              bookDetail.data.created.value,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                    {bookDetail.data.last_modified?.value && (
                      <div className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-red-500" />
                        <div>
                          <p className="font-semibold">Last Modified</p>
                          <p>
                            {new Date(
                              bookDetail.data.last_modified.value,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                    {bookDetail.data.excerpts &&
                      bookDetail.data.excerpts.length > 0 && (
                        <div className="flex items-start gap-2 md:col-span-2">
                          <span className="mt-1 h-2 w-2 rounded-full bg-zinc-500" />
                          <div>
                            <p className="font-semibold">Excerpt</p>
                            <p className="text-zinc-600">
                              {bookDetail.data.excerpts[0].excerpt}
                            </p>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-red-500">
              Failed to load book details
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-zinc-200 mr-10">
        <h2 className="text-2xl font-bold text-zinc-800 mb-4 font-[poppins]">
          You Might Also Like
        </h2>
        <NoSwitchCarousel
          data={similarBooks.data}
          isFetching={similarBooks.isFetching}
        />
      </div>
    </div>
  );
}

export default DetailPage;
