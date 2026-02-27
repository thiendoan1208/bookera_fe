"use client";

import { CometCard } from "@/components/ui/comet-card";
import {
  getWorkDetails,
  getAuthorDetails,
  getWorksBySubject,
} from "@/service/open_lib";
import {
  checkSavedItem,
  createSavedItem,
  deleteSavedItemByReference,
} from "@/service/saved_item_service";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import Image from "next/image";
import { use } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
import {
  ChevronDown,
  ChevronUp,
  Bookmark,
  Loader2,
  BookOpen,
  CalendarDays,
  LibraryBig,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRandomSubject, slugify } from "@/lib/utils";
import NoSwitchCarousel from "@/components/app/no_switch_carousel";
import Link from "next/link";
import routes from "@/routes/routes";
import { useUser } from "@/contexts/UserContext";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

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
  const queryClient = useQueryClient();
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();

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

  const savedStatus = useQuery({
    queryKey: ["saved-item-check", "book", workId, user?.id],
    queryFn: () =>
      checkSavedItem({
        item_type: "book",
        work_id: workId,
      }),
    enabled: !!user && !!workId,
  });

  const saveMutation = useMutation({
    mutationFn: createSavedItem,
    onSuccess: () => {
      toast.success("Added to saved list");
      queryClient.invalidateQueries({
        queryKey: ["saved-item-check", "book", workId, user?.id],
      });
      queryClient.invalidateQueries({ queryKey: ["saved-items"] });
    },
    onError: (error: Error) => {
      const axiosError = error as Error & {
        response?: { data?: { message?: string } };
      };
      toast.error(axiosError.response?.data?.message || "Failed to save item");
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: deleteSavedItemByReference,
    onSuccess: () => {
      toast.success("Removed from saved list");
      queryClient.invalidateQueries({
        queryKey: ["saved-item-check", "book", workId, user?.id],
      });
      queryClient.invalidateQueries({ queryKey: ["saved-items"] });
    },
    onError: (error: Error) => {
      const axiosError = error as Error & {
        response?: { data?: { message?: string } };
      };
      toast.error(axiosError.response?.data?.message || "Failed to unsave item");
    },
  });

  const isSaved = savedStatus.data?.data.saved || false;
  const isSaving = saveMutation.isPending || unsaveMutation.isPending;
  const isCheckingSaved = !!user && savedStatus.isLoading;

  const handleToggleSaved = () => {
    if (!bookDetail.data) return;

    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (isSaved) {
      unsaveMutation.mutate({
        item_type: "book",
        work_id: workId,
      });
      return;
    }

    const coverId =
      bookDetail.data.covers && bookDetail.data.covers.length > 0
        ? bookDetail.data.covers[0]
        : null;

    saveMutation.mutate({
      item_type: "book",
      work_id: workId,
      preview_image_url: coverId
        ? `${process.env.NEXT_PUBLIC_OPEN_LIBRARY_COVERS_URL}/b/id/${coverId}-M.jpg`
        : null,
      title: bookDetail.data.title,
      redirect_url: routes.bookDetails(`${type}/${workId}`),
    });
  };

  const descriptionText = bookDetail.data?.description
    ? typeof bookDetail.data.description === "string"
      ? bookDetail.data.description
      : (bookDetail.data.description as { value: string }).value
    : "";

  const authorNames = authorQueries
    .map((query) => query.data?.name)
    .filter((name): name is string => !!name);

  return (
    <div className="pl-28 pt-16 pr-10 pb-12 min-h-screen bg-linear-to-b from-zinc-50 via-white to-zinc-100/60">
      <div className="max-w-375 mx-auto space-y-8">
        <div className="rounded-3xl border border-zinc-200/70 bg-white/80 backdrop-blur-sm shadow-sm p-6 lg:p-8">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
            <div className="xl:col-span-3">
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
                        width={320}
                        height={420}
                        style={{
                          boxShadow: "rgba(0, 0, 0, 0.1) 0px 8px 20px 0px",
                        }}
                      />
                    )}
                  </div>
                </div>
              </CometCard>

              {bookDetail.data?.links && bookDetail.data.links.length > 0 && (
                <div className="mt-4 grid gap-2">
                  {bookDetail.data.links.slice(0, 4).map((link, index) => (
                    <Button
                      key={`link-${index}`}
                      variant="default"
                      className="w-full bg-zinc-900 hover:bg-black text-white h-auto py-2.5 whitespace-normal text-wrap rounded-xl"
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

            <div className="xl:col-span-9">
              {bookDetail.isLoading ? (
                <div className="space-y-5">
                  <Skeleton className="h-14 w-2/3" />
                  <Skeleton className="h-6 w-1/3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <Skeleton className="h-8 w-28 rounded-full" />
                  </div>
                  <Skeleton className="h-36 w-full rounded-2xl" />
                </div>
              ) : bookDetail.data ? (
                <div className="space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <h1 className="text-5xl lg:text-6xl leading-none font-extrabold italic text-zinc-900 font-[sacramento]">
                        {bookDetail.data.title}
                      </h1>
                      {bookDetail.data.authors &&
                        bookDetail.data.authors.length > 0 && (
                          <div className="text-zinc-600 text-base md:text-lg italic font-semibold">
                            <span className="mr-2 font-normal">by</span>
                            {authorQueries.some((query) => query.isLoading)
                              ? "Loading author..."
                              : authorQueries.map((query, index) => (
                                  <React.Fragment key={`author-${index}`}>
                                    <Link
                                      href={routes.searchResult(query.data?.name || "")}
                                      className="hover:text-blue-700 transition-colors"
                                    >
                                      {query.data?.name}
                                    </Link>
                                    {index < authorQueries.length - 1 && ", "}
                                  </React.Fragment>
                                ))}
                          </div>
                        )}
                    </div>

                    <button
                      onClick={handleToggleSaved}
                      className="shrink-0 p-2.5 rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors"
                      aria-label="Save item"
                      disabled={isSaving || isCheckingSaved}
                    >
                      {isSaving || isCheckingSaved ? (
                        <Loader2 className="w-6 h-6 md:w-7 md:h-7 animate-spin text-zinc-500" />
                      ) : (
                        <Bookmark
                          className={`w-6 h-6 md:w-7 md:h-7 transition-colors ${
                            isSaved
                              ? "fill-yellow-400 stroke-yellow-400"
                              : "stroke-zinc-700 hover:stroke-yellow-400"
                          }`}
                        />
                      )}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {bookDetail.data.first_publish_date && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900">
                        <CalendarDays className="size-3.5" />
                        First published: {bookDetail.data.first_publish_date}
                      </span>
                    )}
                    {authorNames.length > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-900">
                        <BookOpen className="size-3.5" />
                        {authorNames.length} author
                        {authorNames.length > 1 ? "s" : ""}
                      </span>
                    )}
                    {bookDetail.data.subjects && bookDetail.data.subjects.length > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-zinc-200 text-zinc-800">
                        <LibraryBig className="size-3.5" />
                        {bookDetail.data.subjects.length} topics
                      </span>
                    )}
                  </div>

                  {bookDetail.data.description && (
                    <div className="rounded-2xl border border-zinc-200 bg-white p-4 md:p-5">
                      <h3 className="text-lg font-bold text-zinc-800 mb-3 flex items-center gap-3 border-l-4 border-black pl-3">
                        Description
                      </h3>
                      <p
                        className={`text-zinc-600 leading-relaxed ${
                          isDescriptionExpanded ? "" : "line-clamp-6"
                        }`}
                      >
                        {descriptionText}
                      </p>
                      {descriptionText.length > 500 ? (
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
                      ) : null}
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {bookDetail.data.first_sentence && (
                      <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                        <h3 className="text-lg font-bold text-zinc-800 mb-3 flex items-center gap-3 border-l-4 border-black pl-3">
                          Opening Line
                        </h3>
                        <p className="text-zinc-600 italic">
                          &quot;{bookDetail.data.first_sentence.value}&quot;
                        </p>
                      </div>
                    )}

                    {(bookDetail.data.first_publish_date ||
                      bookDetail.data.dewey_number ||
                      bookDetail.data.latest_revision ||
                      bookDetail.data.revision ||
                      bookDetail.data.created ||
                      bookDetail.data.last_modified) && (
                      <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                        <h4 className="text-base font-bold text-zinc-800 mb-3">
                          Additional Details
                        </h4>
                        <div className="grid grid-cols-1 gap-2 text-sm text-zinc-700">
                          {bookDetail.data.first_publish_date && (
                            <p>
                              <span className="font-semibold">First Published:</span>{" "}
                              {bookDetail.data.first_publish_date}
                            </p>
                          )}
                          {Array.isArray(bookDetail.data.dewey_number) &&
                            bookDetail.data.dewey_number.length > 0 && (
                              <p>
                                <span className="font-semibold">Dewey Number:</span>{" "}
                                {bookDetail.data.dewey_number.join(", ")}
                              </p>
                            )}
                          {bookDetail.data.latest_revision && (
                            <p>
                              <span className="font-semibold">Latest Revision:</span>{" "}
                              {bookDetail.data.latest_revision}
                            </p>
                          )}
                          {bookDetail.data.revision && (
                            <p>
                              <span className="font-semibold">Revision:</span>{" "}
                              {bookDetail.data.revision}
                            </p>
                          )}
                          {bookDetail.data.created?.value && (
                            <p>
                              <span className="font-semibold">Created:</span>{" "}
                              {new Date(
                                bookDetail.data.created.value,
                              ).toLocaleDateString()}
                            </p>
                          )}
                          {bookDetail.data.last_modified?.value && (
                            <p>
                              <span className="font-semibold">Last Modified:</span>{" "}
                              {new Date(
                                bookDetail.data.last_modified.value,
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {bookDetail.data.subjects && bookDetail.data.subjects.length > 0 && (
                    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                      <h3 className="text-lg font-bold text-zinc-800 mb-3 flex items-center gap-3 border-l-4 border-black pl-3">
                        Genres & Topics
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {bookDetail.data.subjects
                          .slice(0, 16)
                          .map((subject, index) => (
                            <span
                              key={`subject-${index}`}
                              className="bg-zinc-100 hover:bg-zinc-200 transition-colors text-zinc-800 px-3 py-1.5 rounded-full text-xs md:text-sm"
                            >
                              {subject}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  {bookDetail.data.excerpts && bookDetail.data.excerpts.length > 0 && (
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-900 text-zinc-100 p-4">
                      <h3 className="text-base font-bold mb-2">Featured Excerpt</h3>
                      <p className="text-sm leading-relaxed text-zinc-300">
                        {bookDetail.data.excerpts[0].excerpt}
                      </p>
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
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-zinc-800 font-[poppins]">
              You Might Also Like
            </h2>
            <span className="text-xs uppercase tracking-[0.2em] text-zinc-400">
              curated picks
            </span>
          </div>
          <NoSwitchCarousel
            data={similarBooks.data}
            isFetching={similarBooks.isFetching}
          />
        </div>
      </div>
    </div>
  );
}

export default DetailPage;
