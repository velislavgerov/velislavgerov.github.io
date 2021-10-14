import * as React from "react"
import { Link } from "gatsby"

const NotFoundPage = () => {
  return (
    <main class="min-h-screen bg-yellow-50 bg-opacity-50 text-gray-900 dark:bg-gray-800 dark:bg-opacity-100 dark:text-white">
      <section class="font-serif p-8 sm:p-16 md:p-24 lg:p-36 xl:p-40 max-w-4xl">
      <title>Not found</title>
      <h1 class="text-4xl pb-8 font-bold">Page not found</h1>
      <p class="pb-4">
        Sorry{" "}
        <span role="img" aria-label="Pensive emoji">
          😔
        </span>{" "}
        we couldn’t find what you were looking for.
        <br />
        {process.env.NODE_ENV === "development" ? (
          <>
            <br />
            Try creating a page in <code class="rounded font-mono bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100">src/pages/</code>.
            <br />
          </>
        ) : null}
        <br />
        <Link class="hover:underline font-bold" to="/">Go home</Link>.
      </p>
      </section>
    </main>
  )
}

export default NotFoundPage
