import {
  useDisclosure,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react';
import React, { FC, useState } from 'react';

import { tokenStore } from '../lib/stores/tokenStore';
import { useRouter } from 'next/router';
import { request } from '../lib/utils/request';

type LoginModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export const LoginModal: FC<LoginModalProps> = ({ isOpen, setIsOpen }) => {
  const router = useRouter();
  const [postForm, setPostForm] = useState<{
    name: string;
    phoneNumber: number;
  }>({
    name: '',
    phoneNumber: undefined!,
  });
  const [loading, setLoading] = useState(false);

  const changeBinder = (e: { target: { name: any; value: any } }) => {
    setPostForm({
      ...postForm,
      [e.target.name]: e.target.value,
    });
  };

  const onOpen = () => {
    setIsOpen(true);
  };

  const onClose = () => {
    setIsOpen(false);
  };

  const handleLogin = async () => {
    if (!postForm.name.trim()) {
      alert('用户名不能为空');
      return;
    }

    if (!postForm.phoneNumber) {
      alert('手机号不能为空');
      return;
    }

    if (loading) {
      alert('请求过于频繁，请稍后再试');
      return;
    }

    setLoading(true);

    const response = await (
      await request('/demo/users/login', 'POST', postForm)
    ).json();

    try {
      tokenStore.getState().setToken(`${response.data.token}`);

      router.reload();
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
    onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} autoFocus={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>DaoPaaS，欢迎回来</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form className="row-span-4 row-start-2 text-3xl">
              <div className="pt-10 pr-20">
                <label className="text-sm font-sans font-medium">用户名</label>

                <div className="d42-input relative">
                  <span className="d42 absolute text-stone-600 top-1/2 left-4 transform -translate-y-1/2">
                    &#xeca6;
                  </span>
                  <input
                    type="text"
                    name="name"
                    value={postForm.name}
                    placeholder="请输入用户名"
                    className="w-full text-stone-700 py-3 px-12 border hover: border-gray-500 rounded shadow text-base font-sans"
                    onChange={changeBinder}
                  />
                </div>
              </div>
              <div className="pt-2 pr-20">
                <label className="text-sm font-sans font-medium">手机号</label>
                <div className="d42-input relative">
                  <span className="d42 absolute text-stone-600 top-1/2 left-4 transform -translate-y-1/2">
                    &#xe692;
                  </span>
                  <input
                    type="tel"
                    value={postForm.phoneNumber}
                    name="phoneNumber"
                    placeholder="请输入手机号"
                    className="w-full text-stone-700 py-3 px-12 border hover: border-gray-500 rounded shadow text-base font-sans"
                    onChange={changeBinder}
                  />
                </div>
              </div>
              <div className="text-sm font-sans font-medium w-full pr-20 pt-14 text-center">
                <label className="text-center w-full py-4 rounded-md text-white text-xl">
                  登录
                  <input type="submit" className="hidden" />
                </label>
              </div>
            </form>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              取消
            </Button>
            <Button variant="ghost" onClick={handleLogin}>
              登录
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
