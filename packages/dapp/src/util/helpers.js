export function convertIpfsUrl(url) {
  if (url.startsWith('ipfs://')) {
    return url.replace(/^ipfs:\/\//, import.meta.env.VITE_IPFS_GATEWAY || 'https://ipfs.io/ipfs/')
  }
  return url
}
