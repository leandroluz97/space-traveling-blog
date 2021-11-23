import { GetStaticProps } from 'next';
import Link from 'next/link';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home(props: HomeProps) {
  // TODO

  const { next_page, results } = props.postsPagination;

  const [postPagination, setPostPagination] = useState<PostPagination>({
    next_page: next_page,
    results: results,
  });

  const getMorePost = async () => {
    const fetchPost = await fetch(postPagination.next_page);
    const nextPostPage = await fetchPost.json();

    console.log(nextPostPage);

    let posts: Post[] = nextPostPage.results.map(post => ({
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date.toString()),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    }));

    setPostPagination({
      next_page: nextPostPage.next_page,
      results: [...postPagination.results, ...posts],
    });
  };

  return (
    <div className={styles.home}>
      {postPagination.results.map(post => (
        <div className={styles.post} key={post.uid}>
          <h1>
            <Link href={`/post/${post.uid}`}>
              <a>{post.data.title}</a>
            </Link>
          </h1>
          <p>{post.data.subtitle}</p>
          <div>
            <span>
              <img src="/images/calendar.svg" alt="calendar" />
              <span>
                {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                })}
              </span>
            </span>
            <span>
              <img src="/images/user.svg" alt="calendar" />
              {post.data.author}
            </span>
          </div>
        </div>
      ))}
      {postPagination.next_page && (
        <button className={styles.button} onClick={getMorePost}>
          Carregar mais posts
        </button>
      )}
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query('', { pageSize: 1 });

  //console.log(JSON.stringify(postsResponse, null, 2));

  let posts: Post[] = postsResponse.results.map(post => ({
    uid: post.uid,
    first_publication_date: post.first_publication_date,
    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
    },
  }));

  // TODO

  const postsPagination: PostPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  return {
    props: {
      postsPagination,
    } as HomeProps,
  };
};
