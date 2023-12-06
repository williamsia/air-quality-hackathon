import { APIGatewayEvent } from "aws-lambda";

export const handler = async (event: APIGatewayEvent) => {
    try {
        switch (event.httpMethod) {
            default:
                return sendResponse(400, `Unsupported method: ${event.httpMethod}`);
        }
    } catch (error) {
        console.error("Error", error);
        return sendResponse(500, "Error")
    }
}

function sendResponse(statusCode: number, message: any) {
    return {
        statusCode,
        body: JSON.stringify(message),
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
        },
    };

}