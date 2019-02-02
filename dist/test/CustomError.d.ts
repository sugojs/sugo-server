export default class CustomError extends Error {
    status: number;
    name: string;
    code: string;
    extraData: boolean;
}
