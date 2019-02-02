export default class CustomError extends Error {
  public status = 400;
  public name = "CustomError";
  public code = "CustomError";
  public extraData = true;
}
