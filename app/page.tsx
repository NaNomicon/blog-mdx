import type {Metadata} from "next";
import Link from "next/link";

// Define the metadata generation function
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Home | NaN",
  };
}

export default function Home() {
  return (
    <div className="max-w-3xl z-10 w-full items-center justify-between">
      <div className="w-full flex justify-center items-center flex-col gap-6">
        <h1 className="text-5xl sm:text-6xl font-black pb-6">
          Hello there!
        </h1>
        <div className="flex flex-col gap-4 text-lg w-full">
          <p>
            {"Hi, I’m NaN—a developer with a passion for learning and exploring new things. I’m always looking for ways to expand my knowledge, try out fresh ideas, and tackle challenges head-on. I started this blog as a way to document what I’ve learned, keep track of my progress, and share insights with others. Whether it’s coding tips, problem-solving, or things I’ve discovered along the way, I hope my posts can help and inspire others on their own journeys."}
          </p>
          <p>
            {"It is currently under construction and I hope that the next time you visit it, it will be a lot better."}
          </p>
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
