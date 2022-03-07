import '../styles/globals.css'
import Link from 'next/link'

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <nav className='border-b p-6'>
        <p className='text-4xl font-bold'>Easter Egg</p>
        <div className='flex mt-4'>
          <Link href="/">
            <a className='mr-4 text-green-500 hover:text-green-300'>Home</a>  
          </Link>
          <Link href="/create-item">
            <a className='mr-4 text-green-500 hover:text-green-300'>Sell NFTs</a>  
          </Link>
          <Link href="/my-nfts">
            <a className='mr-4 text-green-500 hover:text-green-300'>My NFTs</a>  
          </Link>
          <Link href="/my-creations">
            <a className='mr-4 text-green-500 hover:text-green-300'>Creator Dashboard</a>  
          </Link>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp
