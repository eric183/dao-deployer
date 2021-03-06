import type { InferGetServerSidePropsType, NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Router from 'next/router';

// import qs from 'qs';
import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { Spinner } from '@chakra-ui/react';
import styles from '../../styles/Home.module.css';
import { request } from '../../lib/utils/request';
import { tokenStore } from '../../lib/stores/tokenStore';

const IndexLayout = styled(motion.div)`
  background: -webkit-radial-gradient(
      0% 100%,
      ellipse cover,
      rgba(104, 128, 138, 0.4) 10%,
      rgba(138, 114, 76, 0) 40%
    ),
    linear-gradient(
      to bottom,
      rgba(57, 173, 219, 0.25) 0%,
      rgba(42, 60, 87, 0.4) 100%
    ),
    linear-gradient(135deg, #670d10 0%, #092756 100%);
  background-repeat: no-repeat;
  background-size: cover;
  main {
    backdrop-filter: blur(20px);
  }

  .d42-input {
    span {
      top: 50%;
      transform: translateY(-50%);
      margin-left: 0.75rem;
    }
  }
`;

const Home: NextPage = () => {
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
  useEffect(() => {
    if (tokenStore.getState().token) {
      Router.push('/dashboard/index');
    }
  }, []);
  return (
    <IndexLayout className={`${styles.container} flex h-full justify-center`}>
      {/* <motion.section
        className="Shell h-96 min-h-min self-center"
        animate={{ scale: 0.9, borderRadius: 20 }}
        transition={{ duration: 1 }}
      ></motion.section> */}
      {/* pl-24 */}

      {loading ? (
        <Spinner color="red.100" className="absolute right-20 top-20" />
      ) : null}

      <motion.main className="col-span-4 text-white font-sans font-bold min-h-screen">
        <div className="grid grid-rows-6 grid-flow-col min-h-screen items-center justify-items-start">
          <form
            className="row-span-4 row-start-2 text-3xl"
            onSubmit={async (e) => {
              e.preventDefault();

              if (!postForm.name.trim()) {
                alert('?????????????????????');
                return;
              }

              if (!postForm.phoneNumber) {
                alert('?????????????????????');
                return;
              }

              if (loading) {
                alert('????????????????????????????????????');
                return;
              }

              setLoading(true);

              // const response = (await request(
              //   'http://develop.1024paas.com:8001/demo/users/login',
              //   'POST',
              //   postForm,
              // )).json();
              // setTimeout(() => {
              //   setLoading(false);
              //   // Router.push('/dashboard/index');
              // }, 2000);

              const response = await (
                await request('/demo/users/login', 'POST', postForm)
              ).json();

              try {
                tokenStore.getState().setToken(`${response.data.token}`);

                Router.push('/dashboard/index');
              } catch (error) {
                console.log(error);
              }
              setLoading(false);
            }}
          >
            {/* Sign In */}
            DaoPaaS???????????????
            <div className="pt-10 pr-20">
              <label className="text-sm font-sans font-medium">?????????</label>

              <div className="d42-input relative">
                <span className="d42 absolute text-stone-600">&#xeca6;</span>
                <input
                  type="text"
                  name="name"
                  value={postForm.name}
                  placeholder="??????????????????"
                  className="w-full text-stone-700 py-3 px-12 border hover: border-gray-500 rounded shadow text-base font-sans"
                  onChange={changeBinder}
                />
              </div>
            </div>
            <div className="pt-2 pr-20">
              <label className="text-sm font-sans font-medium">?????????</label>
              <div className="d42-input relative">
                <span className="d42 absolute text-stone-600">&#xe692;</span>
                <input
                  type="tel"
                  value={postForm.phoneNumber}
                  name="phoneNumber"
                  placeholder="??????????????????"
                  className="w-full text-stone-700 py-3 px-12 border hover: border-gray-500 rounded shadow text-base font-sans"
                  onChange={changeBinder}
                />
              </div>
            </div>
            <div className="text-sm font-sans font-medium w-full pr-20 pt-14 text-center">
              <label className="text-center w-full py-4 rounded-md text-white text-xl">
                ??????
                <input type="submit" className="hidden" />
              </label>
            </div>
          </form>
          {/* <a
            href=""
            className="text-sm font-sans font-medium text-gray-400 underline"
          >
            Don??t have an account? Sign up
          </a> */}
        </div>
      </motion.main>
    </IndexLayout>
  );
};

export default Home;
