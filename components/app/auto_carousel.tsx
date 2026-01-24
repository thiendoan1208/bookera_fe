"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef, useState, useEffect } from "react";
import type { CarouselApi } from "@/components/ui/carousel";
import Image from "next/image";
import { auto_carousel_images } from "@/routes/auto_carousel_images";

export function AutoCarousel() {
  const plugin = useRef(Autoplay({ delay: 20000 }));
  const [current, setCurrent] = useState(0);
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <div className="h-[75vh]">
      <Carousel
        setApi={setApi}
        className="w-screen h-full relative"
        plugins={[plugin.current]}
      >
        <CarouselContent className="h-full">
          {auto_carousel_images.map((_, index) => (
            <CarouselItem key={index} className="pl-0">
              <div className="h-full">
                <Card className="h-full border-none shadow-none rounded-none py-0">
                  <CardContent className="h-full flex aspect-square items-center justify-center">
                    <Image
                      src={auto_carousel_images[index].src}
                      alt={`Slide ${index + 1}`}
                      width={500}
                      height={500}
                      className="w-full h-full object-cover object-center"
                    />
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <div className="absolute bottom-6 right-1 transform -translate-x-1/2 flex gap-2 z-10">
          {auto_carousel_images.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                api?.scrollTo(index);
              }}
              className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                index === current ? "bg-black scale-125" : "bg-white"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
}
