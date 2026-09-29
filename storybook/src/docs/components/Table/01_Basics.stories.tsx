import { Button, Table } from "@dextinity/admin";
import { useState } from "react";

interface Person {
    id: number;
    firstname: string;
    lastname: string;
    job: {
        id: number;
        name: string;
    };
}

export default {
    title: "Docs/Components/Table/Basics",
};

export const BasicTable = () => {
    const data: Person[] = [
        { id: 1, firstname: "Kady", lastname: "Wood", job: { id: 1, name: "Project Manager" } },
        { id: 2, firstname: "Lewis", lastname: "Chan", job: { id: 2, name: "UI/UX Designer" } },
        { id: 3, firstname: "Tom", lastname: "Weaver", job: { id: 3, name: "Frontend Developer" } },
        { id: 4, firstname: "Mia", lastname: "Carroll", job: { id: 4, name: "Backend Developer" } },
    ];

    return (
        <Table
            data={data}
            totalCount={data.length}
            columns={[
                {
                    name: "id",
                    header: "ID",
                },
                {
                    name: "name",
                    header: "Name",
                    render: (row) => (
                        <>
                            {row.firstname} <strong>{row.lastname}</strong>
                        </>
                    ),
                },
                {
                    name: "job.name",
                    header: "Job (Nested)",
                },
            ]}
        />
    );
};

export const TableColumnNameProp = () => {
    const data = [
        { id: 1, firstname: "Kady" },
        { id: 2, firstname: "Lewis" },
    ];

    return (
        <Table
            data={data}
            totalCount={data.length}
            columns={[
                {
                    name: "firstname",
                    header: "First Name",
                },
            ]}
        />
    );
};

export const TableColumnNestedNameProp = () => {
    const data = [
        { id: 1, job: { name: "Project Manager" } },
        { id: 2, job: { name: "UI/UX Designer" } },
    ];

    return (
        <Table
            data={data}
            totalCount={data.length}
            columns={[
                {
                    name: "job.name",
                    header: "Job (Nested)",
                },
            ]}
        />
    );
};

export const TableColumnRenderProp = () => {
    const data = [
        { id: 1, firstname: "Kady", lastname: "Wood" },
        { id: 2, firstname: "Lewis", lastname: "Chan" },
    ];

    return (
        <Table
            data={data}
            totalCount={data.length}
            columns={[
                {
                    name: "name",
                    header: "Name",
                    render: (row) => (
                        <>
                            {row.firstname} <strong>{row.lastname}</strong>
                        </>
                    ),
                },
            ]}
        />
    );
};

export const TableColumnHeaderProp = () => {
    const data = [
        { id: 1, firstname: "Kady", lastname: "Wood" },
        { id: 2, firstname: "Lewis", lastname: "Chan" },
    ];

    return (
        <Table
            data={data}
            totalCount={data.length}
            columns={[
                {
                    name: "id",
                },
                {
                    header: "First Name",
                    name: "firstname",
                },
                {
                    header: <strong>Last Name</strong>,
                    name: "lastname",
                },
            ]}
        />
    );
};

export const TableColumnVisibleProp = () => {
    const data = [
        { id: 1, firstname: "Kady", lastname: "Wood" },
        { id: 2, firstname: "Lewis", lastname: "Chan" },
    ];

    const [idVisible, setIdVisible] = useState(false);

    return (
        <>
            <p>
                <Button onClick={() => setIdVisible((visible) => !visible)}>Show ID Column</Button>
            </p>
            <Table
                data={data}
                totalCount={data.length}
                columns={[
                    {
                        visible: idVisible,
                        header: "ID",
                        name: "id",
                    },
                    {
                        header: "First Name",
                        name: "firstname",
                    },
                    {
                        header: "Last Name",
                        name: "lastname",
                    },
                ]}
            />
        </>
    );
};
