import React, { useEffect, useRef } from 'react';
import Lottie from 'lottie-web';
import styled from '@emotion/styled';

// https://assets10.lottiefiles.com/packages/lf20_fydpgJ.json
// https://assets10.lottiefiles.com/packages/lf20_n2b0ZQ.json
// https://assets10.lottiefiles.com/packages/lf20_2OWTcY.json
// https://assets10.lottiefiles.com/private_files/lf30_iuxli0di.json

const LottieAnimLayout = styled.div`
  width: 100%;
  height: 100%;
`;

interface LottieType {
  src?: string;
}

const LottieAnim: React.FC<LottieType> = ({ src }) => {
  const SkeletonRef = useRef<HTMLDivElement>(null);
  //   ;
  useEffect(() => {
    Lottie.loadAnimation({
      container: SkeletonRef.current!, // the dom element that will contain the animation
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: src,
    });
  }, []);

  return (
    // <div ref={SkeletonRef} style={{ width: '100%', height: '100%' }}></div>
    <LottieAnimLayout
      ref={SkeletonRef}
      //   style={{ width: '100%', height: '100%' }}
    />
  );
};

export { LottieAnim };
