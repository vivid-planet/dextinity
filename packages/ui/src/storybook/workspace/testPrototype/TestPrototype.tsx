import { useState } from "react";

import { Avatar } from "../../../components/avatar/Avatar";
import { Button } from "../../../components/button/Button";
import { EmptyState } from "../../../components/emptyState/EmptyState";
import { FilterBar } from "../../../components/filterBar/FilterBar";
import { FilterChip } from "../../../components/filterChip/FilterChip";
import { Icon } from "../../../components/icon/Icon";
import { ListLayout } from "../../../components/listLayout/ListLayout";
import { PageHeader } from "../../../components/pageHeader/PageHeader";
import type { SideNavGroup } from "../../../components/sideNav/SideNav";
import { StatusIndicator } from "../../../components/statusIndicator/StatusIndicator";
import { PageTypeShell } from "../../pageTypes/PageTypeShell";
import { StoryTable, type StoryTableColumn } from "../../StoryTable";
import { PrototypeApp } from "../PrototypeApp";
import { testPrototype } from "../prototypes";
import styles from "./testPrototype.module.scss";

export const testNavGroups: SideNavGroup[] = [
    { label: "Team", items: [{ id: "employees", label: "Employees", icon: <Icon name="users" />, href: "#employees" }] },
];

interface Employee {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    location: string;
    onLeave: boolean;
}

const departments = ["Design", "Development", "Project management", "Sales"];

const employees: Employee[] = [
    ["Anna Klein", "Senior UX Designer", "Design", "Salzburg"],
    ["Lena Berger", "UI Designer", "Design", "Vienna"],
    ["Max Mustermann", "Head of Design", "Design", "Salzburg", true],
    ["Jonas Huber", "Frontend Developer", "Development", "Salzburg"],
    ["Sophie Wagner", "Backend Developer", "Development", "Vienna"],
    ["David Gruber", "Tech Lead", "Development", "Salzburg"],
    ["Laura Hofer", "DevOps Engineer", "Development", "Remote", true],
    ["Paul Steiner", "Project Manager", "Project management", "Salzburg"],
    ["Julia Moser", "Scrum Master", "Project management", "Vienna"],
    ["Tobias Bauer", "Account Manager", "Sales", "Vienna"],
    ["Sarah Leitner", "Sales Lead", "Sales", "Salzburg"],
    ["Felix Schwarz", "Frontend Developer", "Development", "Remote"],
].map(([name, role, department, location, onLeave]) => ({
    id: String(name).toLowerCase().replace(/\s+/g, "-"),
    name: String(name),
    email: `${String(name).toLowerCase().replace(/\s+/g, ".")}@example.com`,
    role: String(role),
    department: String(department),
    location: String(location),
    onLeave: onLeave === true,
}));

const columns: StoryTableColumn<Employee>[] = [
    {
        key: "name",
        header: "Name",
        render: (employee) => (
            <span className={styles.person}>
                <Avatar name={employee.name} size="small" tooltip={false} />
                <span className={styles.personText}>
                    <span className={styles.name}>{employee.name}</span>
                    <span className={styles.email}>{employee.email}</span>
                </span>
            </span>
        ),
    },
    { key: "role", header: "Role", render: (employee) => employee.role },
    { key: "department", header: "Department", render: (employee) => employee.department },
    { key: "location", header: "Location", render: (employee) => employee.location },
    {
        key: "status",
        header: "Status",
        render: (employee) => (
            <StatusIndicator status={employee.onLeave ? "unpublished" : "published"}>{employee.onLeave ? "On leave" : "Active"}</StatusIndicator>
        ),
    },
];

function EmployeeList() {
    const [search, setSearch] = useState("");
    const [department, setDepartment] = useState<string | null>(null);
    const term = search.trim().toLowerCase();
    const matchesSearch = (employee: Employee) => term === "" || `${employee.name} ${employee.email} ${employee.role}`.toLowerCase().includes(term);
    const rows = employees.filter((employee) => matchesSearch(employee) && (department == null || employee.department === department));

    return (
        <PageTypeShell currentId="employees">
            <ListLayout
                header={
                    <PageHeader
                        title="Employees"
                        subtitle={`${employees.length} people in ${departments.length} departments`}
                        primaryAction={{ label: "Add employee", icon: <Icon name="plus" /> }}
                    />
                }
                toolbar={
                    <FilterBar
                        searchValue={search}
                        onSearchChange={setSearch}
                        labels={{ search: "Search employees", searchPlaceholder: "Search by name, email, or role" }}
                        resultCount={rows.length}
                    >
                        {departments.map((value) => (
                            <FilterChip
                                key={value}
                                selected={department === value}
                                onClick={() => setDepartment(department === value ? null : value)}
                                count={employees.filter((employee) => matchesSearch(employee) && employee.department === value).length}
                            >
                                {value}
                            </FilterChip>
                        ))}
                    </FilterBar>
                }
            >
                <StoryTable
                    aria-label="Employees"
                    columns={columns}
                    rows={rows}
                    getRowId={(employee) => employee.id}
                    getRowLabel={(employee) => employee.name}
                    emptyState={
                        <EmptyState
                            icon={<Icon name="search" />}
                            title="No matching employees"
                            actions={
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    size="small"
                                    onClick={() => {
                                        setSearch("");
                                        setDepartment(null);
                                    }}
                                >
                                    Clear filter
                                </Button>
                            }
                        />
                    }
                />
            </ListLayout>
        </PageTypeShell>
    );
}

function renderPage(pageId: string) {
    return pageId === "employees" ? <EmployeeList /> : undefined;
}

/** A test prototype with one page: the list of employees. */
export function TestPrototype() {
    return <PrototypeApp prototype={testPrototype} navGroups={testNavGroups} renderPage={renderPage} />;
}
