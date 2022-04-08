import { FC, useEffect, useRef, useState } from 'react';
import { Drawer } from 'rsuite';

import { MdOutlinePersonOutline } from 'react-icons/md';
import styled from '@emotion/styled';
import ReactMarkdown from 'react-markdown';
import ReactDOM from 'react-dom';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const MarkdownLayout = styled.article`
  position: fixed;
  width: 600px;
  height: 100vh;
  right: 0;
  top: 0;
  padding: 15px;
  z-index: 2000;
`;

export const Markdown: FC<{
  showMarkdown: boolean;
  markdownVal: string;
  setDrawerOpen: (val: boolean) => void;
}> = ({ showMarkdown, markdownVal }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [markdownVal]);

  return ReactDOM.createPortal(
    <MarkdownLayout
      className="markdown-layout overflow-y-auto transition-all bg-white shadow-xl shadow-slate-700/10 ring-1 ring-gray-900/5 md:max-w-3xl md:mx-auto lg:max-w-4xl lg:pt-16 lg:pb-28 prose lg:prose-xl"
      style={{
        transform: showMarkdown ? `translate(0)` : `translate(100%)`,
      }}
      ref={ref}
      // dangerouslySetInnerHTML={{ __html: markdownVal }}
    >
      <ReactMarkdown
        // children={markdownVal}
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {markdownVal}
      </ReactMarkdown>
    </MarkdownLayout>,
    document.body,
  );
};
