import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
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
  Select,
  Skeleton,
  useDisclosure,
} from '@chakra-ui/react';
import { FC, useEffect, useState } from 'react';
// import IDE from '~/components/IDE';
import { request } from '../../lib/utils/request';
import IDE from '../../components/IDE';
import { paasImporter } from '../../lib/utils/paasImporter';
import { daoStore } from '../../lib/stores/daoStore';
import { modalStore } from '../../lib/stores/modelStore';

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
const EditorSlug = (props: any) => {
  console.log(props);
  const router = useRouter();
  const { slug } = router.query;
  const { isOpen, onOpen, onClose } = useDisclosure();
  // return <h1>Post Slug: {slug}</h1>;

  const [templateVal, setTemplateVal] = useState<string>('');
  const [playgroundId, setPlaygroundId] = useState<string>('');

  const [templateList, setTemplateList] = useState<
    {
      id: number;
      name: string;
      playgroundId: null | string;
    }[]
  >([]);
  const { dao, createDao } = daoStore((state) => state);
  const [loginOpen, setLoginOpen] = useState<boolean>(false);

  const [codes, setCodes] = useState<
    {
      id: number;
      name: string;
      playgroundId: null | string;
    }[]
  >([]);

  const fetchCodes = async () => {
    const responseCodeData = await (await request('/demo/codes')).json();

    setCodes(responseCodeData.data);
  };

  const fetchTemplate = async () => {
    const responseTemplateData = await (
      await request('/demo/templates')
    ).json();
    console.log(responseTemplateData);

    setTemplateList(responseTemplateData.data);

    // console.log(responseCodeData);
  };
  const fetchTickets = async (playgroundId: string) => {
    return await (
      await request(`/demo/tickets?playgroundId=${playgroundId}`)
    ).json();
  };

  const switchPlayground = async (playgroundId: string) => {
    const ticket = (await fetchTickets(playgroundId)).data.ticket;

    const tenantId = '3';
    // const username = qs.get('username') ? qs.get('username')! : 'kuangkuang';
    // const DaoPaaS = await paasImporter();
    // const dao = new DaoPaaS({
    //   // debug: true,
    //   tenantId,
    //   playgroundId,
    //   ticket,
    // });
    // createDao(dao);

    // dao.activePlayground();
  };

  useEffect(() => {
    fetchTemplate();
    fetchCodes();

    // setTimeout(()=> {
    //   // setLoginOpen(true);
    //   modalStore.getState().setOpen(true);
    // }, 3000)
  }, []);

  useEffect(() => {
    if (playgroundId) {
      switchPlayground(playgroundId);
    }
  }, [playgroundId]);
  return (
    <DashBoardSlugLayout className="flex flex-col w-full h-full">
      <header className="flex flex-row items-center justify-center bg-gray-800">
        <Box w="100px">
          <Select
            value={templateVal}
            color="white"
            variant="unstyled"
            placeholder="模板"
            className="cursor-pointer"
            onChange={async (e) => {
              console.log(e);

              setTemplateVal(e.target.value);
              if (e.target.value === 'create') {
                onOpen();
                return;
              }
              const templateInfo = templateList.find(
                (x) => x.name === e.target.value,
              )!;

              await request('/demo/codes/fork', 'POST', {
                name: templateInfo.name,
                templateId: templateInfo.id,
              });

              fetchCodes();

              alert('folk success');

              // router.push(`/dashboard/${e.target.value}`);
            }}
          >
            {templateList &&
              templateList.map((item: any) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
            {/* <option value="create">新建</option> */}
          </Select>
        </Box>
        <Box w="100px">
          <Select
            color="white"
            variant="unstyled"
            placeholder="我的代码"
            className="cursor-pointer"
            onChange={async (e) => {
              setPlaygroundId(e.target.value);
            }}
          >
            {codes &&
              codes.map((item: any) => (
                <option key={item.id} value={item.playgroundId}>
                  {item.name}
                </option>
              ))}
          </Select>
        </Box>
      </header>
      <ContentLayout className="dashboard-content flex flex-1 w-full">
        <IDE />
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
//   let data;
//   const responseTemplateData = await request('http://192.168.2.14:8001/demo/templates');
//   const responseCodeData = await request('http://192.168.2.14:8001/demo/codes');

//   try {
//     data = {
//       templateData: (await responseTemplateData.json()).data,
//       // codeData: (await responseTemplateData.json()).data
//     }
//   } catch (error){
//     console.log(error);
//   }

//   return {
//     props: {
//       data,
//     },
//   };
// };

export default EditorSlug;
