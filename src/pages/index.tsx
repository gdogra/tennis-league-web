import type { NextPage } from 'next'
import Head from 'next/head'
import Layout from '@/components/Layout'

const Home: NextPage = () => (
  <Layout>
    <Head>
      <title>Tennis League</title>
      <meta name="description" content="Tennis league schedule and matches" />
    </Head>
    <h1 className="text-2xl font-bold">Welcome to the Tennis League</h1>
    <p>Upcoming matches and schedule will appear here.</p>
  </Layout>
)

export default Home
