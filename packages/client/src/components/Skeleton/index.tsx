import styled from '@emotion/styled';
import React, {
  PropsWithChildren,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';
// import SkeletonComponent as  skeleton from 'react-loading-skeleton';
import ContentLoader, { Facebook, Code, List } from 'react-content-loader';
import { Loader, Placeholder } from 'rsuite';
import { CodeRect } from './RenderTypes/code';

const SkeletonLayout = styled.div``;
const Skeleton: React.FC<{
  count?: number;
  type: 'Tree' | 'Editor';
  loading?: boolean;
}> = ({ count, type, loading = false }) => {
  // useEffect(() => {}, []);
  const SkeletonRef = useRef<HTMLDivElement>(null!);
  // useLayoutEffect(() => {
  //   console.log(SkeletonRef.current.clientHeight);
  // });

  const RenderContent = () => {
    switch (type) {
      case 'Editor':
        return CodeRect().map((r, index) => (
          <rect
            key={index}
            x={r.x}
            y={r.y}
            rx={r.rx}
            ry={r.ry}
            width={r.width}
            height={r.height}
          />
        ));
    }
  };

  const { Paragraph } = Placeholder;

  return (
    <SkeletonLayout
      className={`transition duration-700 ease-in-out w-full h-full absolute top-0 z-10 ${
        loading ? 'visible' : 'hidden'
        // loading ? 'visible' : 'hidden'
      }`}
      ref={SkeletonRef}
    >
      <Loader content="loading..." vertical center />
    </SkeletonLayout>
  );
};

export default Skeleton;

// <SkeletonLayout
//   className={`transition duration-700 ease-in-out w-full h-full absolute top-0 z-10 ${
//     loading ? 'opacity-100' : 'opacity-0'
//   }`}
//   ref={SkeletonRef}
// >
{
  /* <Paragraph rows={8}> */
}
{
  /* </Paragraph> */
}
// </SkeletonLayout>
