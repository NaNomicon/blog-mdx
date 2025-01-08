import type {Metadata} from "next";

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
            {"I call myself NaN online and this is my website."}
          </p>
          <p>
            {"It is currently under construction and I hope that the next time you visit it, it will be a lot better."}
          </p>
        </div>
      </div>
    </div>
  );
}
