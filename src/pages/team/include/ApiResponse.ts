export default class ApiResponse {
  public data: any;
  private errorMessage: string | null = null;

  public static success(data: any): ApiResponse {
    const apiResponse = new ApiResponse();
    apiResponse.data = data;
    return apiResponse;
  }

  public static error(error: any): ApiResponse {
    const apiResponse = new ApiResponse();
    if (error.response) {
      const httpStatus = error.response.status;
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (httpStatus >= 400 && httpStatus <= 499) {
        if (error.response.data) {
          apiResponse.setErrorMessage(error.response.data);
        } else {
          apiResponse.setErrorMessage(error.message, httpStatus);
        }
      } else {
        apiResponse.setErrorMessage(
          `Unexpected error: (${error.message})`,
          httpStatus,
        );
      }
    } else if (error.request) {
      apiResponse.setErrorMessage(
        "Request was made but no response was received",
      );
    } else {
      apiResponse.setErrorMessage(error.message);
    }
    return apiResponse;
  }

  public static customErrorString(errorMessage: string): ApiResponse {
    const apiResponse = new ApiResponse();
    apiResponse.setErrorMessage(errorMessage, "200/custom");
    return apiResponse;
  }

  private setErrorMessage(
    errorMessage: string,
    httpStatus: string | null = null,
  ): void {
    if (errorMessage) {
      this.errorMessage = errorMessage;
    } else {
      this.errorMessage = "Error with empty error message.";
    }
    if (httpStatus !== null) {
      this.errorMessage += ` [${httpStatus}]`;
    }
  }
  public getData(): any {
    return this.data;
  }

  public getErrorMessage(): any {
    return this.errorMessage;
  }

  public isSuccessful(): boolean {
    return this.errorMessage === null;
  }
}
