import { Container, Header, StatusIndicator } from "@cloudscape-design/components"

function getStepType(stepNumber: number, indx: number, error?: boolean) {
    if (stepNumber === indx) {
        return error ? "error" : "loading"
    }
    if (stepNumber > indx) {
        return "success"
    }
    return "info"

}

export function ProcessingSteps(props: {steps: string[], stepNumber: number, error?: boolean}) {
	return (

        props.steps.map((step, indx) =>
            <ul key={indx}>
                 <SingleStep stepType={getStepType(props.stepNumber, indx, props.error)} text={step}/>
            </ul>
        )
	);
}

function SingleStep(props: {stepType: "loading" | "info" | "error" | "success", text: string},) {
    return (
        <li>
            <StatusIndicator type={props.stepType}>{props.text}</StatusIndicator>
         </li>
    )
}