import { gql, useQuery } from "@apollo/client";
import {
    type GridColDef,
    muiGridFilterToGql,
    muiGridSortToGql,
    useBufferedRowCount,
    useDataGridRemote,
    usePersistentColumnState,
} from "@comet/admin";
import { DataGridPro, type GridRowSelectionModel } from "@mui/x-data-grid-pro";
import { useState } from "react";

import {
    type GQLSelectProductFieldGridFragment,
    type GQLSelectProductFieldGridQuery,
    type GQLSelectProductFieldGridQueryVariables,
} from "./SelectProductFieldGrid.generated";

type Props = {
    onSelect?: (product: GQLSelectProductFieldGridFragment | null) => void;
};
export function SelectProductFieldGrid(props: Props) {
    const dataGridProps = { ...useDataGridRemote(), ...usePersistentColumnState("SelectProductFieldGrid") };
    const sortModel = dataGridProps.sortModel;
    const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);

    const columns: GridColDef<GQLSelectProductFieldGridFragment>[] = [
        {
            field: "title",
            headerName: "Title",
            minWidth: 150,
            flex: 1,
        },
        { field: "description", headerName: "Description", flex: 1, minWidth: 150 },
        {
            field: "category",
            headerName: "Category",
            flex: 1,
            minWidth: 100,
            renderCell: (params) => <>{params.row.category?.title}</>,
            //type: "singleSelect",
            //valueOptions: relationsData?.productCategories.nodes.map((i) => ({ value: i.id, label: i.title })),
        },
    ];

    const { data, loading, error } = useQuery<GQLSelectProductFieldGridQuery, GQLSelectProductFieldGridQueryVariables>(productsQuery, {
        variables: {
            ...muiGridFilterToGql(columns, dataGridProps.filterModel),
            offset: dataGridProps.paginationModel.page * dataGridProps.paginationModel.pageSize,
            limit: dataGridProps.paginationModel.pageSize,
            sort: muiGridSortToGql(sortModel, columns),
        },
    });
    if (error) {
        throw error;
    }
    const rows = data?.products.nodes ?? [];
    const rowCount = useBufferedRowCount(data?.products.totalCount);

    return (
        <DataGridPro
            {...dataGridProps}
            rows={rows}
            rowCount={rowCount}
            columns={columns}
            loading={loading}
            checkboxSelection
            disableMultipleRowSelection
            rowSelectionModel={selectionModel}
            disableRowSelectionOnClick={false}
            onRowSelectionModelChange={(selectionModel) => {
                setSelectionModel(selectionModel);
                if (props.onSelect) {
                    const selectedId = selectionModel[0];
                    const selectedProduct = rows.find((row) => row.id === selectedId);
                    props.onSelect(selectedProduct ?? null);
                }
            }}
        />
    );
}

const productsFragment = gql`
    fragment SelectProductFieldGrid on Product {
        id
        title
        description
        category {
            id
            title
        }
    }
`;

const productsQuery = gql`
    query SelectProductFieldGrid($offset: Int, $limit: Int, $sort: [ProductSort!], $filter: ProductFilter, $search: String) {
        products(offset: $offset, limit: $limit, sort: $sort, filter: $filter, search: $search) {
            nodes {
                id
                ...SelectProductFieldGrid
            }
            totalCount
        }
    }
    ${productsFragment}
`;
