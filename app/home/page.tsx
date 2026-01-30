"use client";
import { useQueries, useQuery } from "@tanstack/react-query";
import { AutoCarousel } from "@/components/app/auto_carousel";
import NoSwitchCarousel from "@/components/app/no_switch_carousel";
import { getWorksBySubject } from "@/service/open_lib";
import { getRandomSubject } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { HOME_SUBJECTS } from "@/data/home_subjects";
import routes from "@/routes/routes";

function HomePage() {
  const trendingQuery = useQuery({
    queryKey: ["worksBySubject", "trending"],
    queryFn: () => {
      const subject = getRandomSubject();
      return getWorksBySubject(subject);
    },
  });

  const queries = useQueries({
    queries: HOME_SUBJECTS.map((subject) => ({
      queryKey: ["worksBySubject", subject],
      queryFn: () => getWorksBySubject(subject),
    })),
  });

  return (
    <>
      <AutoCarousel />
      <div className="pl-28 pt-18 pr-10 space-y-12">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-3xl font-bold text-zinc-800 font-[poppins]">
              Trending Books
            </h1>
          </div>
          {trendingQuery.isFetching && !trendingQuery.data ? (
            <NoSwitchCarousel
              data={{ works: [] }}
              isFetching={trendingQuery.isFetching}
            />
          ) : (
            trendingQuery.data && (
              <NoSwitchCarousel
                data={trendingQuery.data}
                isFetching={trendingQuery.isFetching}
              />
            )
          )}
        </div>
        {queries.map((query, index) => (
          <div key={HOME_SUBJECTS[index]}>
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-3xl font-bold text-zinc-800 font-[poppins]">
                {HOME_SUBJECTS[index].charAt(0).toUpperCase() +
                  HOME_SUBJECTS[index].slice(1)}{" "}
              </h1>
              <div
                onClick={() =>
                  (window.location.href = routes.subjectTopic(
                    HOME_SUBJECTS[index],
                  ))
                }
                className="flex items-center font-semibold text-zinc-500 hover:text-zinc-800 cursor-pointer transition-colors"
              >
                More
                <ChevronRight className="size-5 translate-y-px" />
              </div>
            </div>
            {query.isFetching && !query.data ? (
              <NoSwitchCarousel
                data={{ works: [] }}
                isFetching={query.isFetching}
              />
            ) : (
              query.data && (
                <NoSwitchCarousel
                  data={query.data}
                  isFetching={query.isFetching}
                />
              )
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default HomePage;
