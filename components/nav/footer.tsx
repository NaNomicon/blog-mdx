import Link from "next/link";
import {FaGithub} from "react-icons/fa";

function Footer() {
  return (
    <footer className=" bottom-0 z-40 w-full border-t bg-background p-6 ">
      <div className="sm:px-8 px-4 flex flex-col justify-between items-center h-16 space-y-4 sm:space-y-0">
        <div className="flex gap-6 items-center">
          <Link href="/">Home</Link>
        </div>
        <div className={"flex gap-1 flex-auto items-center"}>
          <text>{"Powered by "}</text>
          <Link href={"https://www.mdxblog.io/"}>MDXBlog</Link>
          <text>{" | "}</text>
          <Link href={"https://github.com/NaN72dev/blog-mdx"}><FaGithub/></Link>
        </div>
        <nav className="flex gap-4 items-center text-sm">
          <div className="">
            <p>
              &copy; {new Date().getFullYear()} NaN
            </p>
          </div>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
