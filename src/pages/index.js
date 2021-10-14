import * as React from "react"
import { Helmet } from "react-helmet"

const IndexPage = () => {
  return (
    <>
      <Helmet>
        <html lang="en"/>
        <title>Velislav Gerov</title>
        <meta name="description" content="Full-Stack Engineer" />
      </Helmet>
      <main class="min-h-screen bg-yellow-50 bg-opacity-50 text-gray-900 dark:bg-gray-800 dark:bg-opacity-100 dark:text-white">
        <section class="font-serif p-8 sm:p-16 md:p-24 lg:p-36 xl:p-40 max-w-4xl">
          <h1 class="cursor-pointer transition duration-500 ease-in-out transform hover:-translate-y-2 text-4xl pb-8 font-bold">Hi 👋</h1> 
          <h2 class="text-xl pb-4 font-bold">My name is Velislav Gerov.</h2>
          <p class="pb-4">I am a Full-Stack Engineer, currently looking for an opportunity to grow and make impact inside a tech-first company where problems need to be solved at scale.</p>
          <p class="pb-8">You can check out my <a class="hover:underline font-bold" title="Velislav Gerov's resume" href="velislav_gerov_resume.pdf">résumé</a> and <a class="hover:underline font-bold" title="Velislav Gerov's email" href="mailto:velislav.gerov@gmail.com">get in touch</a> if you'd like. I use <a class="hover:underline font-bold" title="Velislav Gerov's GitHub profile" href="https://github.com/velislavgerov" target="_blank" rel="noreferrer">GitHub</a> for my personal projects, <a class="hover:underline font-bold" title="Velislav Gerov's LinkedIn profile" href="https://www.linkedin.com/in/velislavgerov/" target="_blank" rel="noreferrer">LinkedIn</a> is where I try to look professional. I share some of my thoughts on <a class="hover:underline font-bold" title="Velislav Gerov's Twitter profile" href="https://twitter.com/velislavgerov" target="_blank" rel="noreferrer">Twitter</a> and ocasionally might upload a picture on <a class="hover:underline font-bold" title="Velislav Gerov's Instagram profile" href="https://www.instagram.com/velislavgerov/" target="_blank" rel="noreferrer">Instagram</a>. Hopefully, I will get to write something usefull and publish it to my future Blog.</p>
          <p>(Hey, there <span class="bg-yellow-200 dark:bg-yellow-900">is</span> something here! <a class="hover:underline" href="https://github.com/velislavgerov/velislavgerov.github.io/commit/51706ab4680e78a25ade3d4f60d671a11acdba3d">🌵</a>)</p>
        </section>
      </main>
    </>
  )
}

export default IndexPage
