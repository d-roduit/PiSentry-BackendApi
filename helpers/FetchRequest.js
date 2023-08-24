export default class FetchRequest {

    static ResponseType = class ResponseTypeEnum {
        static Json = new ResponseTypeEnum("Json");
        static Text = new ResponseTypeEnum("Text");
        static FormData = new ResponseTypeEnum("FormData");
        static Blob = new ResponseTypeEnum("Blob");
        static ArrayBuffer = new ResponseTypeEnum("ArrayBuffer");
        static Clone = new ResponseTypeEnum("Clone");

        constructor(name) {
            this.name = name
        }
    };
    static defaultOptionsObject = {};
    static defaultResponseTypeValue = FetchRequest.ResponseType.Json;
    static defaultSuccessCallback = null;
    static defaultResponseNotOkCallback = null;
    static defaultExceptionCallback = null;

    constructor(url) {
        if (typeof url !== 'string') {
            throw new Error('url parameter must be a string');
        }

        this.url = url;
        this.optionsObject = null;
        this.responseTypeValue = null;
        this.successCallback = null;
        this.responseNotOkCallback = null;
        this.exceptionCallback = null;
    }

    static defaultOptions(options) {
        if (options === null || typeof options !== 'object') {
            throw new Error('defaultOptions parameter must be an object');
        }
        FetchRequest.defaultOptionsObject = options;
        return this;
    }

    static defaultResponseType(responseType) {
        if (!responseType instanceof FetchRequest.ResponseType) {
            throw new Error('defaultResponseType parameter must be of type FetchRequest.ResponseType');
        }
        FetchRequest.defaultResponseTypeValue = responseType;
        return this;
    }

    static defaultSuccess(callback) {
        if (typeof callback !== 'function') {
            throw new Error('defaultSuccessCallback parameter must be a function');
        }
        FetchRequest.defaultSuccessCallback = callback;
        return this;
    }

    static defaultResponseNotOk(callback) {
        if (typeof callback !== 'function') {
            throw new Error('defaultResponseNotOkCallback parameter must be a function');
        }
        FetchRequest.defaultResponseNotOkCallback = callback;
        return this;
    }

    static defaultException(callback) {
        if (typeof callback !== 'function') {
            throw new Error('defaultExceptionCallback parameter must be a function');
        }
        FetchRequest.defaultExceptionCallback = callback;
        return this;
    }

    options(options) {
        if (options === null || typeof options !== 'object') {
            throw new Error('options parameter must be an object');
        }
        this.optionsObject = options;
        return this;
    }

    responseType(responseType) {
        if (!responseType instanceof FetchRequest.ResponseType) {
            throw new Error('responseType parameter must be of type FetchRequest.ResponseType');
        }
        this.responseTypeValue = responseType;
        return this;
    }

    success(callback) {
        if (typeof callback !== 'function') {
            throw new Error('successCallback parameter must be a function');
        }
        this.successCallback = callback;
        return this;
    }

    responseNotOk(callback) {
        if (typeof callback !== 'function') {
            throw new Error('responseNotOkCallback parameter must be a function');
        }
        this.responseNotOkCallback = callback;
        return this;
    }

    exception(callback) {
        if (typeof callback !== 'function') {
            throw new Error('exceptionCallback parameter must be a function');
        }
        this.exceptionCallback = callback;
        return this;
    }

    async make() {
        try {
            const options = this.optionsObject ?? FetchRequest.defaultOptionsObject;
            const response = await fetch(this.url, options);

            if (!response.ok) {
                const responseNotOkCallback = this.responseNotOkCallback ?? FetchRequest.defaultResponseNotOkCallback;
                if (responseNotOkCallback !== null) {
                    responseNotOkCallback(response);
                }
                return;
            }

            let responseData = null;
            switch (this.responseTypeValue ?? FetchRequest.defaultResponseTypeValue) {
                case FetchRequest.ResponseType.Json:
                    responseData = await response.json();
                    break;
                case FetchRequest.ResponseType.Text:
                    responseData = await response.text();
                    break;
                case FetchRequest.ResponseType.FormData:
                    responseData = await response.formData();
                    break;
                case FetchRequest.ResponseType.Blob:
                    responseData = await response.blob();
                    break;
                case FetchRequest.ResponseType.ArrayBuffer:
                    responseData = await response.arrayBuffer();
                    break;
                case FetchRequest.ResponseType.Clone:
                    responseData = await response.clone();
                    break;
                default:
                    responseData = await response.json();
                    break;
            }

            const successCallback = this.successCallback ?? FetchRequest.defaultSuccessCallback;
            if (successCallback !== null) {
                successCallback(responseData);
                return;
            }

            return responseData;
        } catch (err) {
            const exceptionCallback = this.exceptionCallback ?? FetchRequest.defaultExceptionCallback;
            if (exceptionCallback !== null) {
                exceptionCallback(err);
            }
        }
    }
}
