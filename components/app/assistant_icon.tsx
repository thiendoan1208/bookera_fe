import Link from "next/link";

function AssitantIcon({ link, icon }: { link: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-zinc-900 to-zinc-600 rounded-full text-white shadow-lg hover:shadow-xl transition-all">
      <Link href={link} className="flex flex-col items-center w-full">
        {icon}
      </Link>
    </div>
  );
}

export default AssitantIcon;
