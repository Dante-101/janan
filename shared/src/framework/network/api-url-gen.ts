export class ApiUrlGen {
    static v1(...urlParts: string[]) {
        return ApiUrlGen._url(urlParts.join("/"), 1)
    }

    static v2(...urlParts: string[]) {
        return ApiUrlGen._url(urlParts.join("/"), 2)
    }

    static v3(...urlParts: string[]) {
        return ApiUrlGen._url(urlParts.join("/"), 3)
    }
    
    static v4(...urlParts: string[]) {
        return ApiUrlGen._url(urlParts.join("/"), 4)
    }

    //Don't use unless needed. Use the earlier version
    private static _url(url: string, version: number) {
        if (url.startsWith("/")) url = url.slice(1)
        return `/api/${version}/${url}`
    }
}