import Spline from '@splinetool/react-spline'

export default function SplineObject() {
  return (
    <div className='w-full h-full min-h-screen absolute overflow-hidden'>
      <Spline
        scene='https://prod.spline.design/3xjZG9VvZrpbztn1/scene.splinecode'
        style={{
          position: 'absolute',
          width: '150%',
          height: '150%',
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      />
    </div>
  )
}
