import { Button, Field, FinalFormRangeInput } from "@dextinity/admin";
import { styled } from "@mui/material/styles";
import { Form } from "react-final-form";

export default {
    title: "Docs/Components/FinalFormRangeInput",
};

export const Default = {
    render: () => {
        return (
            <Form
                onSubmit={(values) => {
                    // values
                }}
                render={({ handleSubmit, values, form, initialValues }) => (
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <Field component={FinalFormRangeInput} name="price" min={0} max={100} />
                        <div style={{ marginLeft: "40px", minHeight: "220px" }}>
                            <h3 style={{ marginTop: 0 }}>Value</h3>
                            <pre>{JSON.stringify(values, undefined, 2)}</pre>
                            <Button
                                onClick={() => {
                                    form.reset();
                                }}
                            >
                                Reset
                            </Button>
                        </div>
                    </div>
                )}
            />
        );
    },
};

export const WithInitialValues = {
    render: () => {
        return (
            <Form
                onSubmit={(values) => {
                    // values
                }}
                initialValues={{ price: { min: 0, max: 100 } }}
                render={({ handleSubmit, values, form, initialValues }) => <Field component={FinalFormRangeInput} name="price" min={0} max={100} />}
            />
        );
    },
};

export const StartAdornment = {
    render: () => {
        return (
            <Form
                onSubmit={(values) => {
                    // values
                }}
                initialValues={{ price: { min: 0, max: 100 } }}
                render={({ handleSubmit, values, form, initialValues }) => (
                    <Field component={FinalFormRangeInput} name="price" min={0} max={100} startAdornment={<span>€</span>} />
                )}
            />
        );
    },
};

export const EndAdornment = {
    render: () => {
        return (
            <Form
                onSubmit={(values) => {
                    // values
                }}
                initialValues={{ price: { min: 0, max: 100 } }}
                render={({ handleSubmit, values, form, initialValues }) => (
                    <Field component={FinalFormRangeInput} name="price" min={0} max={100} endAdornment={<span>€</span>} />
                )}
            />
        );
    },
};

export const WithDifferentInitialAndRangeValues = {
    render: () => {
        return (
            <Form
                onSubmit={(values) => {
                    // values
                }}
                initialValues={{ price: { min: 50, max: 80 } }}
                render={({ values, form, initialValues }) => <Field component={FinalFormRangeInput} name="price" min={20} max={150} />}
            />
        );
    },
};

export const DifferentSliderThumb = {
    render: () => {
        const Thumb = styled("div")`
            && {
                margin-top: -9px;
                height: 20px;
                width: 20px;

                &:hover {
                    box-shadow: none;
                }

                &:after {
                    border: solid white;
                    border-width: 0 2px 2px 0;
                    transform: rotate(-45deg);
                    display: inline-block;
                    position: relative;
                    padding: 2px;
                    content: "";
                    left: -1px;
                    top: 0;
                }

                &[data-index="1"] {
                    &:after {
                        transform: rotate(135deg);
                        left: 1px;
                    }
                }
            }
        `;

        return (
            <Form
                onSubmit={(values) => {
                    // values
                }}
                render={({ handleSubmit, values, form, initialValues }) => (
                    <Field component={FinalFormRangeInput} name="price" min={0} max={100} sliderProps={{ ThumbComponent: Thumb }} />
                )}
            />
        );
    },
};
