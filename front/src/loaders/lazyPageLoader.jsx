import { lazy, Suspense } from 'react'

export const lazyPageLoader = (pageName, props) => {
  const LazyLoaded = lazy(() => import(`../pages/${pageName}.jsx`))
  return (
    <Suspense fallback="">
      <LazyLoaded {...props} />
    </Suspense>
  )
}
