import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import Link from "next/link";

export default function Home() {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="w-full flex flex-col items-center justify-center space-y-4">
        <TextHoverEffect text="bookera" duration={0.5} />
        <h2 className="font-[inter] text-md md:text-2xl lg:text-3xl leading-3 tracking-widest font-light text-gray-300 animate-[fade-in_3s]">
          THE ERA OF BOOKS
        </h2>
        <div>
          <Link href="/home">
            <button className="text-md md:text-2xl uppercase rounded-full bg-gray-800 text-white px-6 py-4 my-6 hover:bg-gray-700 transition-colors cursor-pointer animate-[fade-in_3s]">
              Let&apos;s Begin
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
