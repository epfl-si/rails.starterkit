import * as React from "react";
import { gql } from 'graphql-request';
import { useEffect } from "react";
import { useInView } from 'react-intersection-observer';
import { Loading } from './spinner';
import { useInfiniteGraphQLQuery, relayStylePagination } from '@epfl-si/react-graphql-paginated';
import './infinite-scroll.css';

type Item = { id : number, title : string, description : string };

export function InfiniteItemList() {
  const { data,
          error,
          isFetching,
          hasNextPage,
          fetchNextPage,
          isFetchingNextPage
        } = useInfiniteGraphQLQuery<{ items: { nodes: Item[] } }>(gql`
query Items ($cursor : String) {
  items(first: 10, after : $cursor) {
    nodes {
     id
     title
     description
     artist {
        firstName
        lastName
        email
        createdAt
      }
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}`, relayStylePagination());

  const ref = useWhenInView(fetchNextPage);

  // Be sure *not* to destroy 90% of the DOM when we are just fetching
  // the next page, lest the browser scroll all the way back up!
  if (isFetching && !isFetchingNextPage) return <Loading/>;

  if (error) return <p>{error.toString()}</p>;
  return  <>
          {(data?.pages || []).map((page) => (
            // For the same reason as above, React keys are
            // required:
            <React.Fragment key={page.items.nodes[0]?.id}>
              {page.items.nodes.map((item) => (
                <p
                  style={{
                    border: '1px solid gray',
                    borderRadius: '5px',
                    background: `hsla(${item.id * 30}, 60%, 80%, 1)`,
                  }}
                  key={item.id}
                >
                  {item.title}
                </p>
              ))}
            </React.Fragment>
          ))}
          <div>
            <button
              /* When the button is in view, we want to fetch more: */
              ref={ ref }
              onClick={ () => fetchNextPage() } /* For good measure */
              disabled={ !hasNextPage || isFetchingNextPage }
            >
              {isFetchingNextPage
                ? 'Loading more...'
                : hasNextPage
                ? 'Load More'
                : 'Nothing more to load'}
            </button>
          </div>
          <div>
            {isFetching && !isFetchingNextPage
              ? 'Background Updating...'
              : null}
          </div>
        </>;
}

function useWhenInView (callback : () => void) {
  const { ref, inView } = useInView();
  useEffect(() => {
    if (inView) {
      callback()
    }
  }, [inView])
  return ref;
}
