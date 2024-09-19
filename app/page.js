import Link from "next/link";
import ButtonSignin from "@/components/ButtonSignin";

export default function Page() {
  return (
    <>
      <header className="p-4 flex justify-end max-w-7xl mx-auto">
        <ButtonSignin text="Sign in" />
      </header>
      <main>
        <section className="flex flex-col items-left justify-left text-left gap-12 px-8 py-24">
          <h1 className="text-3xl font-extrabold">Genesis Automation ✨</h1>

          <p className="text-lg opacity-80">
            Genesis, your intelligent partner in healthcare automation.
            STOP TYPING, START TREATING...
          </p>

          <a
            className="btn btn-primary"
            href="http://localhost:3000/signin"
            target="_blank"
          >
            Try it now{" "}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M5 10a.75.75 0 01.75-.75h6.638L10.23 7.29a.75.75 0 111.04-1.08l3.5 3.25a.75.75 0 010 1.08l-3.5 3.25a.75.75 0 11-1.04-1.08l2.158-1.96H5.75A.75.75 0 015 10z"
                clipRule="evenodd"
              />
            </svg>
          </a>

          <Link href="/blog" className="link link-hover text-sm">
            Fancy a blog?
          </Link>
        </section>
      </main>
    </>
  );
}
