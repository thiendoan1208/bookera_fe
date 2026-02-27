import routes from "@/routes/routes";
import Link from "next/link";

function Logo({ size = "40px" }: { size?: string }) {
  return (
    <div>
      <h1
        className={`font-[sacramento] font-semibold tracking-wide leading-none select-none cursor-pointer`}
      >
        <Link style={{ fontSize: size }} href={routes.home}>
          bookera
        </Link>
      </h1>
    </div>
  );
}

export default Logo;
