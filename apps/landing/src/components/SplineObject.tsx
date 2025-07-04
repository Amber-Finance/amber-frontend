import Spline from '@splinetool/react-spline'

export default function SplineObject() {
  return (
    <div className='w-full h-full min-h-screen absolute overflow-hidden'>
      <Spline
        scene='https://prod.spline.design/3xjZG9VvZrpbztn1/scene.splinecode'
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '200%',
          height: '200%',
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      />
    </div>
  )
}
