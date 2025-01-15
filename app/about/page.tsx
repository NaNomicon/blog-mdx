import type {Metadata} from "next";
import Link from "next/link";

// Define the metadata generation function
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "About | NaN",
  };
}

export default function About() {
  return (
      <div className="max-w-3xl z-10 w-full items-center justify-between ">
      <div className="w-full flex justify-center items-center flex-col gap-6">
        <h1 className="text-5xl sm:text-6xl font-black pb-6">About</h1>
        <div className="flex flex-col gap-4 text-lg w-full">
          <div className="text-lg">
            {"Heyy there! Thanks for visiting my website. It is currently under construction so I won't " +
                "write too much in this page but I hope that the next time you visit it, it will be a lot better."}
          </div>
          <text className="text-center xl font-black pb-6">
            {"Read my "}
            <Link href={"/blog/"}>
              {"blogs"}
            </Link>
            {" in the meantime?"}
          </text>
        </div>
      </div>
    </div>
  );
}
