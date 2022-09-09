import * as React from "react";
import { gql } from 'graphql-request';

import { Loading } from './spinner';
import { useGraphQLRequest } from '@epfl-si/react-graphql-simple';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table';


type Item = { id : number, title : string, description : string };

// https://tanstack.com/table/v8
const columnHelper = createColumnHelper<Item>()

const columns = [
  columnHelper.accessor('id', {
    cell: info => info.getValue(),
    footer: info => info.column.id,
  }),
  columnHelper.accessor('title', {
    cell: info => info.getValue(),
    footer: info => info.column.id,
  }),
  columnHelper.accessor('description', {
    cell: info => info.getValue(),
    footer: info => info.column.id,
  }),
];

export function ItemList() {

  const { loading, data, error } = useGraphQLRequest<{ items: Item[] }>(gql`
{
  items(first: 10) {
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
}`);

  const table = useReactTable({
    data : data?.items?.nodes || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (loading) return <Loading/>;
  if (error) return <p>{error.toString()}</p>;

  // https://tanstack.com/table/v8
  return <table>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          {table.getFooterGroups().map(footerGroup => (
            <tr key={footerGroup.id}>
              {footerGroup.headers.map(header => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.footer,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </tfoot>
      </table>;
}
