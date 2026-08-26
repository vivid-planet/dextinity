import {
    Field,
    FilterBar,
    FilterBarPopoverFilter,
    FinalFormInput,
    FinalFormSearchTextField,
    Table,
    TableFilterFinalForm,
    useTableQueryFilter,
} from "@dextinity/admin";
import { faker } from "@faker-js/faker";
import { Box, Typography } from "@mui/material";

interface IFilterValues {
    query: string;
    owner: {
        firstname: string;
        lastname: string;
    };
}

interface IExampleRow {
    id: number;
    model: string;
    brand: string;
    color: string;
    horsepower: number;
    price: string;
    owner: {
        firstname: string;
        lastname: string;
    };
}

interface StoryProps {
    tableData: IExampleRow[];
}

function Story({ tableData }: StoryProps) {
    const filterApi = useTableQueryFilter<Partial<IFilterValues>>({});

    const filteredData = tableData
        .filter(
            (item) =>
                filterApi.current.query === undefined ||
                item.brand.includes(filterApi.current.query) ||
                item.model.includes(filterApi.current.query) ||
                item.color.includes(filterApi.current.query) ||
                item.owner.firstname.includes(filterApi.current.query) ||
                item.owner.lastname.includes(filterApi.current.query),
        )
        .filter(
            (item) =>
                filterApi.current.owner === undefined ||
                filterApi.current.owner.firstname === undefined ||
                item.owner.firstname.includes(filterApi.current.owner.firstname),
        )
        .filter(
            (item) =>
                filterApi.current.owner === undefined ||
                filterApi.current.owner.lastname === undefined ||
                item.owner.lastname.includes(filterApi.current.owner.lastname),
        );

    return (
        <>
            <TableFilterFinalForm filterApi={filterApi}>
                <Typography variant="h5">FilterBar</Typography>
                <Box marginTop={2}>
                    <FilterBar>
                        <Field name="query" component={FinalFormSearchTextField} />
                        <FilterBarPopoverFilter label="Owner">
                            <Field label="Firstname:" name="owner.firstname" type="text" component={FinalFormInput} fullWidth />
                            <Field label="Lastname:" name="owner.lastname" type="text" component={FinalFormInput} fullWidth />
                        </FilterBarPopoverFilter>
                    </FilterBar>
                </Box>
            </TableFilterFinalForm>
            Filters: {JSON.stringify(filterApi.current)}
            <Table
                data={filteredData}
                totalCount={filteredData.length}
                columns={[
                    {
                        name: "brand",
                        header: "Brand",
                    },
                    {
                        name: "model",
                        header: "Model",
                    },
                    {
                        name: "color",
                        header: "Color",
                    },
                    {
                        name: "horsepower",
                        header: "Horsepower",
                    },
                    {
                        name: "price",
                        header: "Price",
                        render: ({ price }) => {
                            return `${price} €`;
                        },
                    },
                    {
                        name: "owner",
                        header: "Owner (Firstname Lastname)",
                        render: ({ owner }) => {
                            return `${owner.firstname} ${owner.lastname}`;
                        },
                    },
                ]}
            />
        </>
    );
}

export default {
    title: "@dextinity/admin/table/filterbar",
};

export const FilterbarWithTextFieldSearch = {
    render: () => {
        const randomTableData = Array.from(Array(30).keys()).map((i): IExampleRow => {
            return {
                id: i,
                model: faker.vehicle.model(),
                brand: faker.vehicle.manufacturer(),
                color: faker.color.human(),
                horsepower: faker.number.int({ min: 50, max: 200 }),
                price: faker.commerce.price({ min: 100, max: 1000, dec: 2 }),
                owner: {
                    firstname: faker.person.firstName(),
                    lastname: faker.person.lastName(),
                },
            };
        });
        return <Story tableData={randomTableData} />;
    },

    name: "Filterbar with Text Field Search",
};
