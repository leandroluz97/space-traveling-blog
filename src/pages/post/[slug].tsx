import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  // TODO
  const router = useRouter();

  //console.log(JSON.stringify(post, null, 2));

  const minutes = post.data.content
    .reduce((a, t) => {
      a = t.body;

      return a;
    }, [])
    .toString()
    .split(' ').length;

  const minutesToRead = Math.round(minutes / 200);

  if (router.isFallback) {
    return <p>Carregando...</p>;
  }

  return (
    <section className={styles.post}>
      <div
        className={styles.post__banner}
        style={{ backgroundImage: `url(${post.data.banner.url})` }}
      ></div>
      <article>
        <h1>{post.data.title}</h1>
        <div className={styles.post__info}>
          <span>
            <FiCalendar /> &nbsp;{post.first_publication_date}
          </span>
          <span>
            <FiUser /> &nbsp;
            {post.data.author}
          </span>
          <span>
            <FiClock /> &nbsp;
            {minutesToRead} min
          </span>
        </div>
        {post.data.content.map((p, i) => (
          <section key={i} className={styles.post__content}>
            <h2>{p.heading}</h2>
            <div dangerouslySetInnerHTML={{ __html: p.body.toString() }}></div>
          </section>
        ))}
      </article>
    </section>
  );
}

export const getStaticPaths = async ({ params }) => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts')
  );

  const paths = posts.results.map(post => ({ params: { slug: post.uid } }));

  return {
    paths,
    fallback: true, // See the "fallback" section below
  };

  // TODO
};

export const getStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post: Post = {
    first_publication_date: format(
      new Date(response.first_publication_date.toString()),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(item => ({
        heading: item.heading,
        body: RichText.asHtml(item.body),
      })),
    },
  };

  return {
    props: { post },
  };
};
