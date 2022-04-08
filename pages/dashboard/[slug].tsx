import { useRouter } from 'next/router';
import { AnimatePresence, motion } from 'framer-motion';
import styled from '@emotion/styled';
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import React, { FC, useEffect, useState } from 'react';
// import IDE from '~/components/IDE';
import { request } from '../../lib/utils/request';
import { loadingStore } from '../../lib/stores/loadingStore';
import { PageLoading } from '../../components/PageLoading';


const DashBoardSlugLayout = styled(motion.div)`
  header {
    height: 64px;
  }

  .nav-list {
    li {
      margin-top: 1rem;
      cursor: pointer;
    }
  }
`;

const ContentLayout = styled(motion.div)``;

const ContentPane = styled(motion.div)`
  padding: 10px;
  display: flex;
  flex-direction: column;

  p {
    font-size: 20px;
    color: #fde68a;
  }
`;
const DashBoardSlug = (props: any) => {
  // console.log(props);
  const router = useRouter();
  const { slug } = router.query;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isLoading = loadingStore((state) => state.isLoading);

  const [sceneType, setSceneType] = useState<string>('basic');

  const [templateVal, setTemplateVal] = useState<string>('');

  useEffect(() => {
    loadingStore.getState().setLoading(true);
    setTimeout(() => {
      loadingStore.getState().setLoading(false);
    }, 300);
  }, []);
  return (
    <PageLoading isLoading={isLoading}>
      <AnimatePresence>
        <DashBoardSlugLayout
          layout
          className="flex flex-col w-full h-full"
          initial={{
            x: 1200,
            width: 50,
            height: 50,
            opacity: 0,
            borderRadius: 50,
          }}
          animate={{
            borderRadius: 0,
            x: 0,
            width: '100%',
            height: '100%',
            opacity: 1,
          }}
          transition={{ duration: 0.3 }}
          exit={{ opacity: 0 }}
        >
          {/* <header className="flex flex-row items-center justify-center bg-gray-800">
          <Box w="100px">
            <Select
              value={templateVal}
              color="white"
              variant="unstyled"
              placeholder="template"
              className="cursor-pointer"
              onChange={(e) => {
                console.log(e);

                setTemplateVal(e.target.value);
                if (e.target.value === 'create') {
                  onOpen();
                }
                // router.push(`/dashboard/${e.target.value}`);
              }}
            >
              <option value="create">新建</option>
            </Select>
          </Box>
          <Box w="100px">
            <Select
              color="white"
              variant="unstyled"
              placeholder="code"
              className="cursor-pointer" />
          </Box>
        </header> */}
          <ContentLayout className="dashboard-content flex flex-1 w-full">
            <section className="bg-slate-600 h-full w-1/12">
              <ul className="nav-list text-white text-center">
                <li
                  className={
                    sceneType === 'basic' ? 'text-amber-200' : 'text-white'
                  }
                  onClick={() => setSceneType('basic')}
                >
                  基础应用
                </li>
                <li
                  className={
                    sceneType === 'cooperation'
                      ? 'text-amber-200'
                      : 'text-white'
                  }
                  onClick={() => setSceneType('cooperation')}
                >
                  分享协作
                </li>
                <li
                  className={
                    sceneType === 'follow' ? 'text-amber-200' : 'text-white'
                  }
                  onClick={() => setSceneType('follow')}
                >
                  跟随模式
                </li>
                <li
                  className={
                    sceneType === 'replay' ? 'text-amber-200' : 'text-white'
                  }
                  onClick={() => setSceneType('replay')}
                >
                  回放场景
                </li>
              </ul>
            </section>
            <section className="flex-1 bg-stone-700">
              <ContentPane
                style={{ display: sceneType === 'basic' ? 'flex' : 'none' }}
              >
                <section>
                  <p>
                    基础应用展示了 IDE
                    的基础用法，包括文件树和编辑器的使用，Console 与 Shell
                    的使用及它们与文件树和编辑器的联动。
                  </p>
                </section>
                <section>
                  <Button onClick={() => router.push('/workship/basic')}>
                    点击体验
                  </Button>
                </section>
              </ContentPane>
              <ContentPane
                style={{
                  display: sceneType === 'cooperation' ? 'flex' : 'none',
                }}
              >
                <section>
                  <p>分享协作展示了多人使用 IDE 的场景。</p>
                </section>
                <section>
                  <Button onClick={() => router.push('/workship/cooperation')}>
                    点击体验
                  </Button>
                </section>
              </ContentPane>
              <ContentPane
                style={{ display: sceneType === 'follow' ? 'flex' : 'none' }}
              >
                <section>
                  <p>
                    跟随模式的典型应用场景是考官跟随考生视角，查看考生实时操作。
                  </p>
                </section>
                <section>
                  <Button onClick={() => router.push('/workship/follow')}>
                    点击体验
                  </Button>
                </section>
              </ContentPane>
              <ContentPane
                style={{ display: sceneType === 'replay' ? 'flex' : 'none' }}
              >
                <section>
                  <p>回放场景是针对操作者行为进行字节级的回放。</p>
                </section>
                <section>
                  <Button onClick={() => router.push('/workship/replay')}>
                    点击体验
                  </Button>
                </section>
              </ContentPane>
            </section>
          </ContentLayout>

          <BasicUsage
            isOpen={isOpen}
            onOpen={onOpen}
            onClose={() => {
              setTemplateVal('');
              onClose();
            }}
          ></BasicUsage>
        </DashBoardSlugLayout>
      </AnimatePresence>
    </PageLoading>
  );
};

const BasicUsage: FC<{
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}> = ({ isOpen, onOpen, onClose }) => {
  // const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      {/* <Button onClick={onOpen}>Open Modal</Button> */}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>添加 Template</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel htmlFor="email">Email address</FormLabel>
              <Input id="email" type="email" />
              <FormHelperText>email.</FormHelperText>
            </FormControl>
            {/* <Skeleton w={1 / 3} my={2} height="10px" />
            <Skeleton height="10px" /> */}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant="ghost">Secondary Action</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

// export const getServerSideProps = async () => {
// // DashBoardSlug.getInitialProps = async () => {
//   let data;
//   // const responseTemplateData = await request('http://develop.1024paas.com:8001/demo/templates');
//   const reponseEnv = await request('http://develop.1024paas.com:8001/demo/environments');
//   // const responseCodeData = await request('http://develop.1024paas.com:8001/demo/codes');
//   // console.log((await responseCodeData.json()).data);
//   try {
//     data = {
//       // templateData: (await responseTemplateData.json()).data,
//       reponseEnv: (await reponseEnv.json()),
//       // codeData: (await responseCodeData.json()).data
//     }
//   } catch (error){
//     console.log(error);
//   }
//   // console.log(data);
//   return {
//     props: {
//       data,
//     },
//   };
// };

export default DashBoardSlug;
