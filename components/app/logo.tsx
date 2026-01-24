import routes from "@/routes/routes";
import Link from "next/link";

function Logo() {
  return (
    <div>
      <h1 className="font-[sacramento] text-[40px] font-semibold tracking-wide leading-none select-none cursor-pointer">
        <Link href={routes.home}>bookera</Link>
      </h1>
    </div>
  );
}

export default Logo;
