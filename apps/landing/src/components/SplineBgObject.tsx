import Spline from '@splinetool/react-spline'

export default function SplineBgObject() {
  return (
    <div className='w-full h-full min-h-screen absolute overflow-hidden'>
      {/* <Spline
        scene='https://prod.spline.design/3xjZG9VvZrpbztn1/scene.splinecode'
        style={{
          position: 'absolute',
          width: '150%',
          height: '150%',
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      /> */}
      {/* <Spline
        scene='https://prod.spline.design/3uUMkuxszMe6aKTf/scene.splinecode'
        style={{
          top: 0,
          position: 'absolute',
          width: '100%',
          height: '150%',
        }}
      /> */}
      <Spline
        scene='https://prod.spline.design/3dj1YdFC3qcx3zLt/scene.splinecode'
        style={{
          top: 0,
          position: 'absolute',
          width: '100%',
          height: '150%',
        }}
      />
    </div>
  )
}
